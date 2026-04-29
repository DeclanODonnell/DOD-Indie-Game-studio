using AfterHoursServer;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json.Serialization;

var baseUrl = args.FirstOrDefault() ?? "http://127.0.0.1:5050";
var mode = args.Skip(1).FirstOrDefault() ?? "default";
Console.WriteLine($"AFTER HOURS smoke against {baseUrl}");

if (mode.Equals("fast", StringComparison.OrdinalIgnoreCase))
{
    await RunWinnerScenario(baseUrl);
    await RunInactivityScenario(baseUrl);
}
else
{
    await RunFullHumanScenario(baseUrl);
    await RunBotScenario(baseUrl);
}

Console.WriteLine("Smoke run complete.");

static async Task RunFullHumanScenario(string baseUrl)
{
    var clients = Enumerable.Range(1, 4)
        .Select(index => new SmokeClient(baseUrl, $"P{index}", Profile($"P{index}")))
        .ToArray();

    try
    {
        foreach (var client in clients)
        {
            await client.ConnectAsync();
        }

        var create = await clients[0].Connection.InvokeAsync<JoinRoomResult>("CreateRoom", clients[0].Profile);
        if (!create.Ok || string.IsNullOrWhiteSpace(create.RoomCode))
        {
            throw new InvalidOperationException(create.Error ?? "CreateRoom failed.");
        }
        await clients[0].RefreshStateAsync();

        var roomCode = create.RoomCode;
        for (var index = 1; index < clients.Length; index += 1)
        {
            var join = await clients[index].Connection.InvokeAsync<JoinRoomResult>("JoinRoom", roomCode, clients[index].Profile);
            if (!join.Ok)
            {
                throw new InvalidOperationException(join.Error ?? "JoinRoom failed.");
            }
            await clients[index].RefreshStateAsync();
        }

        foreach (var client in clients)
        {
            await client.RefreshStateAsync();
        }

        await WaitForAll(clients, state => state?.Phase == RoomPhase.Lobby && state.Players.Count == 4, "4-player lobby");
        await clients[0].Connection.InvokeAsync<object>("StartGame");
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn, "initial turn");

        await PlayOnActive(clients, desiredCount: 1, preferWild: false);
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn && state.LastClaim is not null && state.PileCount >= 1, "post first play");

        await PlayOnActive(clients, desiredCount: 2, preferWild: false);
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn && state.PileCount >= 3, "post second play");

        var caller = GetActiveClient(clients);
        await caller.Connection.InvokeAsync<object>("CallBluff");
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Reveal, "reveal after call");
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn, "new round after reveal");

        await PlayOnActive(clients, desiredCount: 3, preferWild: false);
        await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn || state?.Phase == RoomPhase.Reveal, "three-card play");

        var wildPlayed = false;
        for (var attempt = 0; attempt < 8 && !wildPlayed; attempt += 1)
        {
            await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn, "turn for wild check");
            var active = GetActiveClient(clients);
            if (active.State?.Hand.Any(card => card.IsWild) == true)
            {
                var wild = active.State.Hand.First(card => card.IsWild);
                await active.Connection.InvokeAsync<object>("PlayCards", new[] { wild.Id }, "A");
                await WaitForAll(clients, state => state?.PileCount >= 1 || state?.Phase == RoomPhase.Reveal, "wild-card play");
                wildPlayed = true;
                break;
            }

            await PlayOnActive(clients, desiredCount: 1, preferWild: false);
        }

        var leavingClient = clients[3];
        var leavingPlayerId = leavingClient.PlayerId!;
        await leavingClient.Connection.StopAsync();
        await WaitForAll(
            clients.Take(3).ToArray(),
            state => state?.Players.Any(player => player.PlayerId == leavingPlayerId && player.IsBot) == true,
            "disconnect replaced by bot");
    }
    finally
    {
        foreach (var client in clients)
        {
            await client.DisposeAsync();
        }
    }
}

static async Task RunBotScenario(string baseUrl)
{
    var host = new SmokeClient(baseUrl, "Solo", Profile("Solo"));
    try
    {
        await host.ConnectAsync();
        var create = await host.Connection.InvokeAsync<JoinRoomResult>("CreateRoom", host.Profile);
        if (!create.Ok || string.IsNullOrWhiteSpace(create.RoomCode))
        {
            throw new InvalidOperationException(create.Error ?? "CreateRoom failed.");
        }

        for (var index = 0; index < 3; index += 1)
        {
            await host.Connection.InvokeAsync<object>("AddBot");
        }

        await host.RefreshStateAsync();
        await WaitFor(() => host.State?.Phase == RoomPhase.Lobby && host.State.Players.Count == 4, TimeSpan.FromSeconds(8), "bot-filled lobby");
        await host.Connection.InvokeAsync<object>("StartGame");
        await WaitFor(() => host.State?.Phase == RoomPhase.Turn, TimeSpan.FromSeconds(12), "bot match start");
    }
    finally
    {
        await host.DisposeAsync();
    }
}

static async Task RunWinnerScenario(string baseUrl)
{
    var clients = Enumerable.Range(1, 4)
        .Select(index => new SmokeClient(baseUrl, $"W{index}", Profile($"W{index}")))
        .ToArray();

    try
    {
        foreach (var client in clients)
        {
            await client.ConnectAsync();
        }

        var create = await clients[0].Connection.InvokeAsync<JoinRoomResult>("CreateRoom", clients[0].Profile);
        if (!create.Ok || string.IsNullOrWhiteSpace(create.RoomCode))
        {
            throw new InvalidOperationException(create.Error ?? "CreateRoom failed.");
        }

        await clients[0].RefreshStateAsync();
        for (var index = 1; index < clients.Length; index += 1)
        {
            var join = await clients[index].Connection.InvokeAsync<JoinRoomResult>("JoinRoom", create.RoomCode, clients[index].Profile);
            if (!join.Ok)
            {
                throw new InvalidOperationException(join.Error ?? "JoinRoom failed.");
            }

            await clients[index].RefreshStateAsync();
        }

        foreach (var client in clients)
        {
            await client.RefreshStateAsync();
        }

        await clients[0].Connection.InvokeAsync<object>("StartGame");

        while (true)
        {
            if (clients.Any(client => client.State?.Phase == RoomPhase.GameOver))
            {
                break;
            }

            await WaitForAll(clients, state => state?.Phase == RoomPhase.Turn, "winner turn", 12);
            var liar = GetActiveClient(clients);
            var bluffCard = liar.State!.Hand.First(card => !card.IsWild);
            await liar.Connection.InvokeAsync<object>("PlayCards", new[] { bluffCard.Id }, "J");

            await WaitFor(() => clients.Any(client => client.State?.Phase == RoomPhase.Turn && client.State.CanCallBluff), TimeSpan.FromSeconds(8), "forced call window");
            var caller = clients.First(client => client.State?.Phase == RoomPhase.Turn && client.State.CanCallBluff);
            await caller.Connection.InvokeAsync<object>("CallBluff");
            await WaitForAll(clients, state => state?.Phase == RoomPhase.Reveal || state?.Phase == RoomPhase.GameOver, "forced reveal", 8);
        }

        foreach (var client in clients.Where(client => client.State?.CanReadyRematch == true))
        {
            await client.Connection.InvokeAsync<object>("ReadyRematch");
        }

        await WaitForAll(clients, state => state?.Phase is RoomPhase.Countdown or RoomPhase.RoundIntro or RoomPhase.Turn, "rematch restart", 12);
    }
    finally
    {
        foreach (var client in clients)
        {
            await client.DisposeAsync();
        }
    }
}

static async Task RunInactivityScenario(string baseUrl)
{
    var host = new SmokeClient(baseUrl, "Idle", Profile("Idle"));
    try
    {
        await host.ConnectAsync();
        var create = await host.Connection.InvokeAsync<JoinRoomResult>("CreateRoom", host.Profile);
        if (!create.Ok)
        {
            throw new InvalidOperationException(create.Error ?? "CreateRoom failed.");
        }

        await host.RefreshStateAsync();
        await WaitFor(() => host.State?.LobbyPromptActive == true, TimeSpan.FromSeconds(8), "lobby inactivity prompt");
        await WaitFor(() => host.RoomClosedReason is not null, TimeSpan.FromSeconds(8), "room auto close");
    }
    finally
    {
        await host.DisposeAsync();
    }
}

static async Task PlayOnActive(SmokeClient[] clients, int desiredCount, bool preferWild)
{
    var active = GetActiveClient(clients);
    var state = active.State ?? throw new InvalidOperationException("Active client has no state.");
    var move = ChooseMove(state, desiredCount, preferWild);
    await active.Connection.InvokeAsync<object>("PlayCards", move.cardIds, move.claimRank);
}

static SmokeClient GetActiveClient(IEnumerable<SmokeClient> clients)
{
    var activePlayerId = clients
        .Select(client => client.State?.ActivePlayerId)
        .FirstOrDefault(id => !string.IsNullOrWhiteSpace(id));

    var active = clients.FirstOrDefault(client => client.PlayerId == activePlayerId)
        ?? clients.FirstOrDefault(client => client.State?.Phase == RoomPhase.Turn && client.State.CanPlayCards);
    return active ?? throw new InvalidOperationException("No active human player found.");
}

static (IReadOnlyList<string> cardIds, string claimRank) ChooseMove(RoomStateView state, int desiredCount, bool preferWild)
{
    var hand = state.Hand.ToList();
    if (hand.Count < desiredCount)
    {
        desiredCount = hand.Count;
    }

    if (preferWild)
    {
        var wild = hand.FirstOrDefault(card => card.IsWild);
        if (wild is not null)
        {
            return (new[] { wild.Id }, "A");
        }
    }

    var groups = hand.Where(card => !card.IsWild).GroupBy(card => card.Rank).OrderByDescending(group => group.Count()).ToList();
    foreach (var group in groups)
    {
        var cards = group.Take(desiredCount).Select(card => card.Id).ToList();
        if (cards.Count == desiredCount)
        {
            return (cards, group.Key);
        }
    }

    return (hand.Take(desiredCount).Select(card => card.Id).ToList(), hand.First().Rank);
}

static async Task WaitForAll(SmokeClient[] clients, Func<RoomStateView?, bool> predicate, string label, int seconds = 20)
{
    await WaitFor(() => clients.All(client => predicate(client.State)), TimeSpan.FromSeconds(seconds), label);
}

static async Task WaitFor(Func<bool> predicate, TimeSpan timeout, string label)
{
    var deadline = DateTime.UtcNow + timeout;
    while (DateTime.UtcNow < deadline)
    {
        if (predicate())
        {
            return;
        }

        await Task.Delay(150);
    }

    throw new TimeoutException($"Timed out waiting for {label}.");
}

static PlayerProfileInput Profile(string nickname) =>
    new(nickname, new AvatarSpec("yellow", "swept", "black", "none", "none"));

file sealed class SmokeClient : IAsyncDisposable
{
    public SmokeClient(string baseUrl, string label, PlayerProfileInput profile)
    {
        Label = label;
        Profile = profile;
        Connection = new HubConnectionBuilder()
            .WithUrl($"{baseUrl}/after-hours-hub")
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            })
            .Build();

        Connection.On<RoomStateView>("StateChanged", state =>
        {
            State = state;
            PlayerId ??= state.Players.FirstOrDefault(player => player.IsSelf)?.PlayerId;
        });
        Connection.On<RoomClosedView>("RoomClosed", roomClosed =>
        {
            RoomClosedReason = roomClosed.Reason;
        });
    }

    public string Label { get; }

    public PlayerProfileInput Profile { get; }

    public HubConnection Connection { get; }

    public RoomStateView? State { get; private set; }

    public string? PlayerId { get; private set; }

    public string? RoomClosedReason { get; private set; }

    public async Task ConnectAsync()
    {
        await Connection.StartAsync();
    }

    public async Task RefreshStateAsync()
    {
        State = await Connection.InvokeAsync<RoomStateView?>("GetState");
        PlayerId ??= State?.Players.FirstOrDefault(player => player.IsSelf)?.PlayerId;
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (Connection.State != HubConnectionState.Disconnected)
            {
                await Connection.DisposeAsync();
            }
        }
        catch
        {
        }
    }
}

using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace AfterHoursServer;

public sealed class RoomManager
{
    private static readonly char[] RoomCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray();

    private readonly ConcurrentDictionary<string, AfterHoursRoom> _rooms = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, (string roomCode, string playerId)> _connections = new(StringComparer.OrdinalIgnoreCase);
    private readonly AfterHoursOptions _options;
    private readonly IHubContext<AfterHoursHub> _hub;
    private readonly Random _random = new();

    public RoomManager(AfterHoursOptions options, IHubContext<AfterHoursHub> hub)
    {
        _options = options;
        _hub = hub;
    }

    public async Task<JoinRoomResult> CreateRoomAsync(string connectionId, PlayerProfileInput profile)
    {
        var roomCode = GenerateRoomCode();
        var room = new AfterHoursRoom(roomCode, _options, _random, BroadcastRoomStateAsync, CloseRoomAsync);
        if (!_rooms.TryAdd(roomCode, room))
        {
            return new JoinRoomResult(false, Error: "Could not create room.");
        }

        var result = await room.CreateHostAsync(connectionId, profile);
        if (!result.ok)
        {
            _rooms.TryRemove(roomCode, out _);
            return new JoinRoomResult(false, Error: result.error);
        }

        var player = room.HumanPlayers().Single();
        _connections[connectionId] = (roomCode, player.PlayerId);
        await BroadcastRoomStateAsync(room);
        return new JoinRoomResult(true, roomCode);
    }

    public async Task<JoinRoomResult> JoinRoomAsync(string connectionId, string roomCode, PlayerProfileInput profile)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
        {
            return new JoinRoomResult(false, Error: "Room code not found.");
        }

        var result = await room.JoinAsync(connectionId, profile);
        if (!result.ok)
        {
            return new JoinRoomResult(false, Error: result.error);
        }

        var player = room.HumanPlayers().Single((entry) => entry.ConnectionId == connectionId);
        _connections[connectionId] = (roomCode, player.PlayerId);
        await BroadcastRoomStateAsync(room);
        return new JoinRoomResult(true, roomCode);
    }

    public async Task<(bool ok, string? error)> AddBotAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var result = await room.AddBotAsync(playerId);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<(bool ok, string? error)> KickPlayerAsync(string connectionId, string targetPlayerId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var targetConnectionId = room.Players.FirstOrDefault(player => player.PlayerId == targetPlayerId)?.ConnectionId;
        var result = await room.KickPlayerAsync(playerId, targetPlayerId);
        if (result.ok && !string.IsNullOrWhiteSpace(targetConnectionId))
        {
            _connections.TryRemove(targetConnectionId, out _);
            await _hub.Clients.Client(targetConnectionId).SendAsync("RoomClosed", new RoomClosedView("You were removed from the room."));
        }

        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<(bool ok, string? error)> StartGameAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var result = await room.StartGameAsync(playerId);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<(bool ok, string? error)> PlayCardsAsync(string connectionId, IReadOnlyList<string> cardIds, string declaredRank)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var result = await room.PlayCardsAsync(playerId, cardIds, declaredRank);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<(bool ok, string? error)> CallBluffAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var result = await room.CallBluffAsync(playerId);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<(bool ok, string? error)> ReadyRematchAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return (false, "Room not found.");
        }

        var result = await room.ReadyRematchAsync(playerId);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task<bool> KeepLobbyAliveAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return false;
        }

        var result = await room.KeepLobbyAliveAsync(playerId);
        await BroadcastRoomStateAsync(room);
        return result;
    }

    public async Task LeaveAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out _);
        if (room is null)
        {
            return;
        }

        _connections.TryRemove(connectionId, out _);
        await room.LeaveAsync(connectionId);
        if (room.Phase != RoomPhase.Closed)
        {
            await BroadcastRoomStateAsync(room);
        }
    }

    public async Task EndRoomAsync(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        if (room is null || playerId is null)
        {
            return;
        }

        var state = room.BuildStateFor(playerId);
        if (!state.IsHost)
        {
            return;
        }

        await room.CloseRoomAsync("Host closed the room.");
    }

    public async Task ToggleSoundAsync(string connectionId, bool enabled)
    {
        var room = GetRoomByConnection(connectionId, out _);
        if (room is null)
        {
            return;
        }

        await room.ToggleSoundAsync(enabled);
        await BroadcastRoomStateAsync(room);
    }

    public RoomStateView? GetState(string connectionId)
    {
        var room = GetRoomByConnection(connectionId, out var playerId);
        return room is null || playerId is null ? null : room.BuildStateFor(playerId);
    }

    public async Task HandleDisconnectAsync(string connectionId)
    {
        await LeaveAsync(connectionId);
    }

    private AfterHoursRoom? GetRoomByConnection(string connectionId, out string? playerId)
    {
        playerId = null;
        if (!_connections.TryGetValue(connectionId, out var mapping))
        {
            return null;
        }

        playerId = mapping.playerId;
        return _rooms.TryGetValue(mapping.roomCode, out var room) ? room : null;
    }

    private async Task BroadcastRoomStateAsync(AfterHoursRoom room)
    {
        foreach (var player in room.HumanPlayers())
        {
            if (player.ConnectionId is null)
            {
                continue;
            }

            var state = room.BuildStateFor(player.PlayerId);
            await _hub.Clients.Client(player.ConnectionId).SendAsync("StateChanged", state);
        }
    }

    private async Task CloseRoomAsync(AfterHoursRoom room, string reason)
    {
        _rooms.TryRemove(room.RoomCode, out _);
        foreach (var player in room.HumanPlayers())
        {
            if (player.ConnectionId is null)
            {
                continue;
            }

            _connections.TryRemove(player.ConnectionId, out _);
            await _hub.Clients.Client(player.ConnectionId).SendAsync("RoomClosed", new RoomClosedView(reason));
        }
    }

    private string GenerateRoomCode()
    {
        while (true)
        {
            var code = new string(Enumerable.Range(0, 5)
                .Select(_ => RoomCodeAlphabet[_random.Next(RoomCodeAlphabet.Length)])
                .ToArray());
            if (!_rooms.ContainsKey(code))
            {
                return code;
            }
        }
    }
}

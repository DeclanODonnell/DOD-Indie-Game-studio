namespace AfterHoursServer;

internal sealed partial class AfterHoursRoom
{
    private static readonly string[] ClaimRanks =
    [
        "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "K", "J"
    ];

    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly Random _random;
    private readonly AfterHoursOptions _options;
    private readonly Func<AfterHoursRoom, Task> _stateChanged;
    private readonly Func<AfterHoursRoom, string, Task> _roomClosed;

    private readonly List<PlayerState> _players = [];
    private readonly List<EventLogEntry> _log = [];

    private CancellationTokenSource? _lobbyCts;
    private CancellationTokenSource? _phaseCts;
    private CancellationTokenSource? _botCts;
    private CancellationTokenSource? _rematchCts;

    private PlayedBundle? _lastPlay;
    private RevealView? _reveal;
    private WinnerView? _winner;
    private string? _activePlayerId;
    private bool _showRoundInfo;
    private bool _finalReveal;
    private int _roundNumber;
    private int _pileCount;
    private DateTimeOffset? _countdownEndsAt;
    private DateTimeOffset? _turnEndsAt;
    private DateTimeOffset? _lobbyPromptEndsAt;
    private bool _lobbyPromptActive;

    public AfterHoursRoom(
        string roomCode,
        AfterHoursOptions options,
        Random random,
        Func<AfterHoursRoom, Task> stateChanged,
        Func<AfterHoursRoom, string, Task> roomClosed)
    {
        RoomCode = roomCode;
        _options = options;
        _random = random;
        _stateChanged = stateChanged;
        _roomClosed = roomClosed;
    }

    public string RoomCode { get; }

    public RoomPhase Phase { get; private set; } = RoomPhase.Lobby;

    public bool SoundEnabled { get; private set; } = true;

    public IReadOnlyList<PlayerState> Players => _players;

    public IEnumerable<PlayerState> HumanPlayers() =>
        _players.Where((player) => !player.IsBot && player.ConnectionId is not null).ToList();

    public async Task<(bool ok, string? error)> CreateHostAsync(string connectionId, PlayerProfileInput profile)
    {
        await _gate.WaitAsync();
        try
        {
            if (_players.Count > 0)
            {
                return (false, "Room already created.");
            }

            _players.Add(CreateHumanPlayer(profile, connectionId, true));
            PushLog($"{profile.Nickname} opened room {RoomCode}.", "system");
            ResetLobbyTimerUnsafe();
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> JoinAsync(string connectionId, PlayerProfileInput profile)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Lobby)
            {
                return (false, "This room is already in a match.");
            }

            if (_players.Count >= _options.MaxPlayers)
            {
                return (false, "Room is full.");
            }

            _players.Add(CreateHumanPlayer(profile, connectionId, false));
            PushLog($"{profile.Nickname} joined the lobby.", "join");
            ResetLobbyTimerUnsafe();
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> AddBotAsync(string requesterId)
    {
        await _gate.WaitAsync();
        try
        {
            var requester = GetPlayerById(requesterId);
            if (requester is null || !requester.IsHost || Phase != RoomPhase.Lobby)
            {
                return (false, "Only the host can add bots in the lobby.");
            }

            if (_players.Count >= _options.MaxPlayers)
            {
                return (false, "All seats are filled.");
            }

            var bot = CreateBotPlayer();
            _players.Add(bot);
            PushLog($"{bot.Nickname} filled a seat.", "bot");
            ResetLobbyTimerUnsafe();
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> KickPlayerAsync(string requesterId, string targetPlayerId)
    {
        await _gate.WaitAsync();
        try
        {
            var requester = GetPlayerById(requesterId);
            var target = GetPlayerById(targetPlayerId);
            if (requester is null || target is null || !requester.IsHost)
            {
                return (false, "Kick unavailable.");
            }

            if (requester.PlayerId == target.PlayerId)
            {
                return (false, "Host cannot kick themselves.");
            }

            if (Phase != RoomPhase.Lobby && !target.IsBot)
            {
                return (false, "Only bots can be removed once the game starts.");
            }

            _players.Remove(target);
            PushLog($"{target.Nickname} was removed from the room.", "warn");
            if (target.IsHost)
            {
                PromoteNewHostUnsafe();
            }

            ResetLobbyTimerUnsafe();
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> StartGameAsync(string requesterId)
    {
        await _gate.WaitAsync();
        try
        {
            var requester = GetPlayerById(requesterId);
            if (requester is null || !requester.IsHost || Phase != RoomPhase.Lobby)
            {
                return (false, "Only the host can start.");
            }

            if (_players.Count != _options.MaxPlayers)
            {
                return (false, "Fill all four seats first.");
            }

            CancelLobbyTimerUnsafe();
            ResetMatchStateUnsafe();
            Phase = RoomPhase.Countdown;
            _countdownEndsAt = DateTimeOffset.UtcNow.Add(_options.StartCountdownDuration);
            PushLog("Round one loading. Shuffle up.", "system");

            ReplacePhaseTimer(async (token) =>
            {
                await Task.Delay(_options.StartCountdownDuration, token);
                await BeginRoundAsync(true);
            });

            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> PlayCardsAsync(string requesterId, IReadOnlyList<string> cardIds, string declaredRank)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Turn)
            {
                return (false, "No live turn.");
            }

            if (_activePlayerId != requesterId)
            {
                return (false, "Not your turn.");
            }

            var player = GetPlayerById(requesterId);
            if (player is null || player.Eliminated)
            {
                return (false, "Player unavailable.");
            }

            if (cardIds.Count is < 1 or > 3)
            {
                return (false, "Play one to three cards.");
            }

            declaredRank = NormalizeRank(declaredRank);
            if (!ClaimRanks.Contains(declaredRank))
            {
                return (false, "Invalid claim.");
            }

            var cards = player.Hand.Where((card) => cardIds.Contains(card.Id)).ToList();
            if (cards.Count != cardIds.Count)
            {
                return (false, "Card selection invalid.");
            }

            CancelTurnUnsafe();

            foreach (var card in cards)
            {
                player.Hand.Remove(card);
            }

            _lastPlay = new PlayedBundle
            {
                PlayerId = player.PlayerId,
                Nickname = player.Nickname,
                Cards = cards,
                DeclaredRank = declaredRank,
                DeclaredCount = cards.Count,
                PlayedAt = DateTimeOffset.UtcNow
            };

            _pileCount += cards.Count;
            PushLog($"{player.Nickname} played {cards.Count} card{(cards.Count == 1 ? string.Empty : "s")} and claimed {cards.Count} {declaredRank}.", "play");

            if (player.Hand.Count == 0)
            {
                await ResolveEmptyHandUnsafe(player);
                return (true, null);
            }

            AdvanceTurnUnsafe();
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> CallBluffAsync(string requesterId)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Turn || _lastPlay is null)
            {
                return (false, "Nothing to call.");
            }

            if (_activePlayerId != requesterId)
            {
                return (false, "Only the current player can call.");
            }

            if (_lastPlay.PlayerId == requesterId)
            {
                return (false, "You cannot call your own play.");
            }

            var caller = GetPlayerById(requesterId);
            if (caller is null || caller.Eliminated)
            {
                return (false, "Caller unavailable.");
            }

            CancelTurnUnsafe();
            await ResolveBluffUnsafe(caller);
            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<(bool ok, string? error)> ReadyRematchAsync(string requesterId)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.GameOver)
            {
                return (false, "Rematch unavailable.");
            }

            var player = GetPlayerById(requesterId);
            if (player is null)
            {
                return (false, "Player unavailable.");
            }

            player.ReadyForRematch = true;
            PushLog($"{player.Nickname} is ready for a rematch.", "system");
            if (AllParticipantsReadyUnsafe())
            {
                ResetMatchStateUnsafe();
                Phase = RoomPhase.Countdown;
                _countdownEndsAt = DateTimeOffset.UtcNow.Add(_options.StartCountdownDuration);
                ReplacePhaseTimer(async (token) =>
                {
                    await Task.Delay(_options.StartCountdownDuration, token);
                    await BeginRoundAsync(true);
                });
            }

            return (true, null);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<bool> KeepLobbyAliveAsync(string requesterId)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Lobby)
            {
                return false;
            }

            var player = GetPlayerById(requesterId);
            if (player is null)
            {
                return false;
            }

            ResetLobbyTimerUnsafe();
            PushLog($"{player.Nickname} kept the room alive.", "system");
            return true;
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task LeaveAsync(string connectionId)
    {
        string? closureReason = null;

        await _gate.WaitAsync();
        try
        {
            var player = _players.FirstOrDefault((entry) => entry.ConnectionId == connectionId);
            if (player is null)
            {
                return;
            }

            if (Phase == RoomPhase.Lobby)
            {
                _players.Remove(player);
                PushLog($"{player.Nickname} left the lobby.", "leave");
                if (player.IsHost)
                {
                    PromoteNewHostUnsafe();
                }

                if (_players.Count == 0 || !_players.Any((entry) => !entry.IsBot))
                {
                    closureReason = "Room closed.";
                }
                else
                {
                    ResetLobbyTimerUnsafe();
                }
            }
            else if (Phase is RoomPhase.Turn or RoomPhase.Reveal or RoomPhase.RoundIntro or RoomPhase.Countdown or RoomPhase.GameOver)
            {
                player.IsBot = true;
                player.ConnectionId = null;
                player.Connected = false;
                player.Nickname = CreateUniqueBotNameUnsafe();
                player.Avatar = CreateRandomAvatar();
                PushLog($"{player.Nickname} took over an empty seat.", "bot");
                if (player.IsHost)
                {
                    PromoteNewHostUnsafe();
                }

                if (Phase == RoomPhase.Turn && _activePlayerId == player.PlayerId)
                {
                    ScheduleBotTurnUnsafe();
                }
                else if (Phase == RoomPhase.GameOver)
                {
                    player.ReadyForRematch = true;
                }

                if (!_players.Any((entry) => !entry.IsBot && entry.ConnectionId is not null))
                {
                    closureReason = "Room closed.";
                }
            }
        }
        finally
        {
            _gate.Release();
        }

        if (closureReason is not null)
        {
            await CloseRoomAsync(closureReason);
        }
    }

    public async Task ToggleSoundAsync(bool enabled)
    {
        await _gate.WaitAsync();
        try
        {
            SoundEnabled = enabled;
        }
        finally
        {
            _gate.Release();
        }
    }

    public RoomStateView BuildStateFor(string playerId)
    {
        var viewer = GetPlayerById(playerId);
        var activePlayers = _players.Where((player) => player.IsActive).ToList();
        var visibleSeatCount = Math.Max(activePlayers.Count, 1);
        var compactSeatPositions = activePlayers
            .Where((player) => player.TablePosition >= 0)
            .OrderBy((player) => player.TablePosition)
            .Select((player, index) => (player.PlayerId, index))
            .ToDictionary((entry) => entry.PlayerId, (entry) => entry.index);
        var hand = viewer?.Hand
            .OrderBy((card) => card.SortKey)
            .ThenBy((card) => card.Suit)
            .Select((card) => card.ToView())
            .ToList() ?? [];

        var players = _players
            .Select((player) => new PlayerSeatView(
                player.PlayerId,
                player.Nickname,
                player.Avatar,
                player.IsBot,
                player.IsHost,
                playerId == player.PlayerId,
                player.ConnectionId is not null || player.IsBot,
                player.Eliminated,
                _activePlayerId == player.PlayerId && Phase == RoomPhase.Turn,
                player.Lives,
                player.Hand.Count,
                compactSeatPositions.GetValueOrDefault(player.PlayerId, player.TablePosition),
                visibleSeatCount,
                player.ReadyForRematch))
            .ToList();

        return new RoomStateView(
            RoomCode,
            Phase,
            viewer?.IsHost ?? false,
            SoundEnabled,
            _lobbyPromptActive,
            _lobbyPromptEndsAt,
            _countdownEndsAt,
            _turnEndsAt,
            _roundNumber,
            _pileCount,
            _activePlayerId,
            GetPlayerById(_activePlayerId)?.Nickname,
            Phase == RoomPhase.Lobby && viewer?.IsHost == true && _players.Count == _options.MaxPlayers,
            Phase == RoomPhase.Lobby && viewer?.IsHost == true && _players.Count < _options.MaxPlayers,
            Phase == RoomPhase.Turn && _lastPlay is not null && _activePlayerId == playerId && _lastPlay.PlayerId != playerId,
            Phase == RoomPhase.Turn && _activePlayerId == playerId,
            Phase == RoomPhase.GameOver && viewer is not null && !viewer.ReadyForRematch,
            _finalReveal,
            _finalReveal,
            BuildStatusText(viewer),
            BuildPromptText(),
            BuildTableMessage(),
            BuildRoomMessage(),
            players,
            hand,
            BuildClaimView(),
            _reveal,
            _showRoundInfo ? BuildRoundInfo() : null,
            _winner,
            _log.TakeLast(14).Select((entry) => entry.ToView()).ToList());
    }

    public async Task CloseRoomAsync(string reason)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase == RoomPhase.Closed)
            {
                return;
            }

            Phase = RoomPhase.Closed;
            CancelAllTimersUnsafe();
        }
        finally
        {
            _gate.Release();
        }

        await _roomClosed(this, reason);
    }
}

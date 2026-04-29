namespace AfterHoursServer;

internal sealed partial class AfterHoursRoom
{
    private string BuildStatusText(PlayerState? viewer) =>
        Phase switch
        {
            RoomPhase.Lobby => viewer?.IsHost == true ? "Waiting for all four seats." : "Waiting for the host to start.",
            RoomPhase.Countdown => "Cards are about to hit the table.",
            RoomPhase.RoundIntro => "New round briefing.",
            RoomPhase.Turn when _activePlayerId == viewer?.PlayerId => "Your turn. Play 1 to 3 cards or call bluff.",
            RoomPhase.Turn => $"{GetPlayerById(_activePlayerId)?.Nickname ?? "A player"} is up.",
            RoomPhase.Reveal => _reveal?.Message ?? "Reveal in progress.",
            RoomPhase.GameOver => _winner is null ? "Match over." : $"{_winner.Nickname} won.",
            _ => "Room closed."
        };

    private string BuildPromptText()
    {
        if (_lobbyPromptActive && _lobbyPromptEndsAt is not null)
        {
            return "Are you still here? Keep the room alive before the timer runs out.";
        }

        return "No chat in v1. Read the table and trust your nerve.";
    }

    private string BuildTableMessage() =>
        Phase switch
        {
            RoomPhase.Lobby => "Fill all four seats to start.",
            RoomPhase.Countdown => "Shuffling seats and dealing hidden hands.",
            RoomPhase.RoundIntro => "Each suit has 12 cards. Two wild Jacks can stand in for any claim.",
            RoomPhase.Turn when _lastPlay is null => "Open the round with a claim.",
            RoomPhase.Turn => "Keep the bluff rolling or call it now.",
            RoomPhase.Reveal => _reveal?.Message ?? "Truth is on the table.",
            RoomPhase.GameOver => "Ready up for the next game.",
            _ => "Room closed."
        };

    private string BuildRoomMessage() =>
        Phase == RoomPhase.Lobby
            ? $"Private room {RoomCode}. Host can add bots or start once all four seats are filled."
            : $"Room {RoomCode} · Hidden hands stay server-side.";

    private LastClaimView? BuildClaimView()
    {
        if (_lastPlay is null)
        {
            return null;
        }

        return new LastClaimView(
            _lastPlay.PlayerId,
            _lastPlay.Nickname,
            _lastPlay.DeclaredRank,
            _lastPlay.DeclaredCount,
            _pileCount);
    }

    private RoundInfoView? BuildRoundInfo()
    {
        if (!_showRoundInfo)
        {
            return null;
        }

        return new RoundInfoView(
            "Round briefing",
            "Each suit carries 12 cards. Two wild Jacks can stand in for any rank when the reveal lands.",
            "Watch the table, not just your hand.");
    }

    private void PushLog(string text, string tone)
    {
        _log.Add(new EventLogEntry
        {
            Id = Guid.NewGuid().ToString("N"),
            Text = text,
            Tone = tone,
            CreatedAt = DateTimeOffset.UtcNow
        });

        while (_log.Count > 30)
        {
            _log.RemoveAt(0);
        }
    }

    private PlayerState? GetPlayerById(string? playerId) =>
        playerId is null ? null : _players.FirstOrDefault((player) => player.PlayerId == playerId);

    private void PromoteNewHostUnsafe()
    {
        foreach (var player in _players)
        {
            player.IsHost = false;
        }

        var nextHost = _players.FirstOrDefault((player) => !player.IsBot) ?? _players.FirstOrDefault();
        if (nextHost is not null)
        {
            nextHost.IsHost = true;
        }
    }

    private PlayerState CreateHumanPlayer(PlayerProfileInput profile, string connectionId, bool isHost) =>
        new()
        {
            PlayerId = Guid.NewGuid().ToString("N"),
            Nickname = SanitizeNickname(profile.Nickname),
            Avatar = profile.Avatar,
            ConnectionId = connectionId,
            IsHost = isHost,
            IsBot = false,
            Lives = _options.StartingLives,
            Connected = true
        };

    private PlayerState CreateBotPlayer() =>
        new()
        {
            PlayerId = Guid.NewGuid().ToString("N"),
            Nickname = CreateUniqueBotNameUnsafe(),
            Avatar = CreateRandomAvatar(),
            IsBot = true,
            IsHost = false,
            Lives = _options.StartingLives,
            Connected = true
        };

    private string CreateUniqueBotNameUnsafe()
    {
        var used = _players.Select((player) => player.Nickname).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var name in BotNames.OrderBy(_ => _random.Next()))
        {
            if (!used.Contains(name))
            {
                return name;
            }
        }

        return $"BOT_{_random.Next(100, 999)}";
    }

    private AvatarSpec CreateRandomAvatar() =>
        new(
            AvatarColors[_random.Next(AvatarColors.Length)],
            AvatarHair[_random.Next(AvatarHair.Length)],
            AvatarHairColors[_random.Next(AvatarHairColors.Length)],
            "none",
            AvatarGlasses[_random.Next(AvatarGlasses.Length)]
        );

    private static string SanitizeNickname(string nickname)
    {
        nickname = nickname.Trim();
        if (string.IsNullOrWhiteSpace(nickname))
        {
            return "Player";
        }

        return nickname.Length > 16 ? nickname[..16] : nickname;
    }

    private void ResetLobbyTimerUnsafe()
    {
        _lobbyPromptActive = false;
        _lobbyPromptEndsAt = null;
        CancelLobbyTimerUnsafe();
        _lobbyCts = ReplaceCts(_lobbyCts);
        var token = _lobbyCts.Token;

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(_options.LobbyIdleDuration, token);
                await _gate.WaitAsync(token);
                try
                {
                    if (Phase != RoomPhase.Lobby)
                    {
                        return;
                    }

                    _lobbyPromptActive = true;
                    _lobbyPromptEndsAt = DateTimeOffset.UtcNow.Add(_options.LobbyPromptDuration);
                }
                finally
                {
                    _gate.Release();
                }

                await _stateChanged(this);

                await Task.Delay(_options.LobbyPromptDuration, token);
                await CloseRoomAsync("Lobby closed for inactivity.");
            }
            catch (OperationCanceledException)
            {
            }
        }, token);
    }

    private void ReplacePhaseTimer(Func<CancellationToken, Task> action)
    {
        _phaseCts = ReplaceCts(_phaseCts);
        var token = _phaseCts.Token;
        _ = Task.Run(async () =>
        {
            try
            {
                await action(token);
            }
            catch (OperationCanceledException)
            {
            }
        }, token);
    }

    private static CancellationTokenSource ReplaceCts(CancellationTokenSource? current)
    {
        current?.Cancel();
        current?.Dispose();
        return new CancellationTokenSource();
    }

    private void CancelLobbyTimerUnsafe()
    {
        _lobbyCts?.Cancel();
        _lobbyCts?.Dispose();
        _lobbyCts = null;
    }

    private void CancelTurnUnsafe()
    {
        _phaseCts?.Cancel();
        _phaseCts?.Dispose();
        _phaseCts = null;
        _turnEndsAt = null;
    }

    private void CancelBotUnsafe()
    {
        _botCts?.Cancel();
        _botCts?.Dispose();
        _botCts = null;
    }

    private void CancelAllTimersUnsafe()
    {
        CancelLobbyTimerUnsafe();
        CancelTurnUnsafe();
        CancelBotUnsafe();
        _rematchCts?.Cancel();
        _rematchCts?.Dispose();
        _rematchCts = null;
    }
}

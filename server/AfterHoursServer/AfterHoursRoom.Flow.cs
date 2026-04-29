namespace AfterHoursServer;

internal sealed partial class AfterHoursRoom
{
    private static readonly string[] Suits = ["H", "D", "C", "S"];
    private static readonly string[] BotNames = ["BOT_MILO", "BOT_NOVA", "BOT_JUNO", "BOT_LUX", "BOT_HEX", "BOT_VERA", "BOT_ASH", "BOT_SAGE"];
    private static readonly string[] AvatarColors = ["yellow", "cyan", "red", "violet", "teal", "amber"];
    private static readonly string[] AvatarHair = ["buzz", "fade", "swept", "curtain", "curls"];
    private static readonly string[] AvatarHairColors = ["black", "brown", "blonde", "ginger", "silver"];
    private static readonly string[] AvatarGlasses = ["none", "shades", "aviator", "round", "laser"];

    private async Task BeginRoundAsync(bool showRoundInfo)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase == RoomPhase.Closed)
            {
                return;
            }

            _showRoundInfo = showRoundInfo;
            _roundNumber += 1;
            _lastPlay = null;
            _reveal = null;
            _pileCount = 0;
            _countdownEndsAt = null;
            _turnEndsAt = null;

            var alive = _players.Where((player) => player.IsActive).ToList();
            if (alive.Count <= 1)
            {
                SetWinnerUnsafe(alive.FirstOrDefault());
                return;
            }

            DealCardsUnsafe(alive);
            AssignTablePositionsUnsafe(alive);
            _activePlayerId = alive[_random.Next(alive.Count)].PlayerId;

            Phase = showRoundInfo ? RoomPhase.RoundIntro : RoomPhase.Turn;
            PushLog($"Round {_roundNumber} dealt. Each suit holds 12 cards, plus 2 wild Jacks.", "system");

            if (showRoundInfo)
            {
                ReplacePhaseTimer(async (token) =>
                {
                    await Task.Delay(_options.RoundIntroDuration, token);
                    await StartTurnFromRoundIntroAsync();
                });
            }
            else
            {
                StartTurnUnsafe();
            }
        }
        finally
        {
            _gate.Release();
        }

        await _stateChanged(this);
    }

    private async Task StartTurnFromRoundIntroAsync()
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.RoundIntro)
            {
                return;
            }

            _showRoundInfo = false;
            StartTurnUnsafe();
        }
        finally
        {
            _gate.Release();
        }

        await _stateChanged(this);
    }

    private void StartTurnUnsafe()
    {
        Phase = RoomPhase.Turn;
        _turnEndsAt = DateTimeOffset.UtcNow.Add(_options.TurnDuration);
        ScheduleTurnTimeoutUnsafe();
        ScheduleBotTurnUnsafe();
    }

    private async Task ResolveEmptyHandUnsafe(PlayerState player)
    {
        var finalPlay = _lastPlay!;
        var truthful = IsClaimTruthful(finalPlay);
        var penalizedPlayer = truthful ? null : player;
        if (penalizedPlayer is not null)
        {
            penalizedPlayer.Lives = Math.Max(0, penalizedPlayer.Lives - 1);
            if (penalizedPlayer.Lives == 0)
            {
                EliminatePlayerUnsafe(penalizedPlayer);
            }
        }

        _reveal = new RevealView(
            "final-hand",
            finalPlay.PlayerId,
            finalPlay.Nickname,
            null,
            null,
            penalizedPlayer?.PlayerId,
            penalizedPlayer?.Nickname,
            truthful,
            finalPlay.DeclaredRank,
            finalPlay.DeclaredCount,
            finalPlay.Cards.Select((card) => card.ToView()).ToList(),
            truthful
                ? $"{finalPlay.Nickname} emptied their hand cleanly and burns the round."
                : $"{finalPlay.Nickname} tried to slip out on a bluff and lost 1 heart.",
            DateTimeOffset.UtcNow.Add(_options.EmptyHandRevealDuration));

        if (penalizedPlayer is not null)
        {
            PushLog($"{penalizedPlayer.Nickname} lost 1 heart on the final reveal.", "hurt");
            if (penalizedPlayer.Eliminated)
            {
                PushLog($"{penalizedPlayer.Nickname} was eliminated.", "out");
            }
        }
        else
        {
            PushLog($"{player.Nickname} emptied their hand and wins the round.", "win");
        }

        Phase = RoomPhase.Reveal;
        _turnEndsAt = null;
        if (_players.Count((entry) => entry.IsActive) <= 1)
        {
            SetWinnerUnsafe(_players.FirstOrDefault((entry) => entry.IsActive));
            return;
        }

        ReplacePhaseTimer(async (token) =>
        {
            await Task.Delay(_options.EmptyHandRevealDuration + _options.PostRevealShuffleDelay, token);
            await BeginRoundAsync(false);
        });
    }

    private async Task ResolveBluffUnsafe(PlayerState caller)
    {
        var play = _lastPlay!;
        var truthful = IsClaimTruthful(play);
        var penalized = truthful ? caller : GetPlayerById(play.PlayerId)!;
        penalized.Lives = Math.Max(0, penalized.Lives - 1);
        if (penalized.Lives == 0)
        {
            EliminatePlayerUnsafe(penalized);
        }

        var message = truthful
            ? $"{caller.Nickname} called bluff. {play.Nickname} was telling the truth."
            : $"{caller.Nickname} called bluff and caught {play.Nickname} lying.";

        _reveal = new RevealView(
            "bluff",
            play.PlayerId,
            play.Nickname,
            caller.PlayerId,
            caller.Nickname,
            penalized.PlayerId,
            penalized.Nickname,
            truthful,
            play.DeclaredRank,
            play.DeclaredCount,
            play.Cards.Select((card) => card.ToView()).ToList(),
            message,
            DateTimeOffset.UtcNow.Add(_options.RevealDuration));

        PushLog($"{penalized.Nickname} lost 1 heart.", "hurt");
        if (penalized.Eliminated)
        {
            PushLog($"{penalized.Nickname} was eliminated.", "out");
        }

        Phase = RoomPhase.Reveal;
        _turnEndsAt = null;
        if (_players.Count((entry) => entry.IsActive) <= 1)
        {
            SetWinnerUnsafe(_players.FirstOrDefault((entry) => entry.IsActive));
            return;
        }

        ReplacePhaseTimer(async (token) =>
        {
            await Task.Delay(_options.RevealDuration + _options.PostRevealShuffleDelay, token);
            await BeginRoundAsync(false);
        });
    }

    private void SetWinnerUnsafe(PlayerState? winner)
    {
        CancelTurnUnsafe();
        CancelBotUnsafe();
        Phase = RoomPhase.GameOver;
        _turnEndsAt = null;
        _showRoundInfo = false;
        _winner = winner is null
            ? null
            : new WinnerView(winner.PlayerId, winner.Nickname, winner.Avatar, winner.IsBot);
        _finalReveal = true;
        if (winner is not null)
        {
            PushLog($"{winner.Nickname} won the table.", "win");
        }

        foreach (var player in _players)
        {
            player.ReadyForRematch = player.IsBot;
        }
    }

    private bool AllParticipantsReadyUnsafe() => _players.All((player) => player.ReadyForRematch);

    private void ResetMatchStateUnsafe()
    {
        CancelTurnUnsafe();
        CancelBotUnsafe();
        CancelLobbyTimerUnsafe();
        _winner = null;
        _reveal = null;
        _lastPlay = null;
        _pileCount = 0;
        _roundNumber = 0;
        _showRoundInfo = false;
        _finalReveal = false;
        _countdownEndsAt = null;
        _turnEndsAt = null;
        foreach (var player in _players)
        {
            player.Lives = _options.StartingLives;
            player.Eliminated = false;
            player.ReadyForRematch = false;
            player.TablePosition = -1;
            player.Hand.Clear();
        }
    }

    private void DealCardsUnsafe(List<PlayerState> alive)
    {
        var deck = BuildDeck()
            .OrderBy(_ => _random.Next())
            .ToList();

        foreach (var player in alive)
        {
            player.Hand.Clear();
        }

        var index = 0;
        while (deck.Count > 0)
        {
            alive[index % alive.Count].Hand.Add(deck[0]);
            deck.RemoveAt(0);
            index += 1;
        }
    }

    private List<CardState> BuildDeck()
    {
        var deck = new List<CardState>();
        var ranks = new[] { "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "K" };
        foreach (var suit in Suits)
        {
            for (var i = 0; i < ranks.Length; i += 1)
            {
                deck.Add(new CardState
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Rank = ranks[i],
                    Suit = suit,
                    IsWild = false,
                    SortKey = i
                });
            }
        }

        deck.Add(new CardState
        {
            Id = Guid.NewGuid().ToString("N"),
            Rank = "J",
            Suit = null,
            IsWild = true,
            SortKey = 99
        });
        deck.Add(new CardState
        {
            Id = Guid.NewGuid().ToString("N"),
            Rank = "J",
            Suit = null,
            IsWild = true,
            SortKey = 99
        });

        return deck;
    }

    private static string NormalizeRank(string declaredRank) => declaredRank.Trim().ToUpperInvariant();

    private bool IsClaimTruthful(PlayedBundle play) => play.Cards.All((card) => card.IsWild || card.Rank == play.DeclaredRank);

    private void AdvanceTurnUnsafe()
    {
        var alive = _players.Where((player) => player.IsActive).OrderBy((player) => player.TablePosition).ToList();
        if (alive.Count <= 1)
        {
            SetWinnerUnsafe(alive.FirstOrDefault());
            return;
        }

        var currentIndex = alive.FindIndex((player) => player.PlayerId == _activePlayerId);
        var next = alive[(currentIndex + 1 + alive.Count) % alive.Count];
        _activePlayerId = next.PlayerId;
        StartTurnUnsafe();
    }

    private void AssignTablePositionsUnsafe(List<PlayerState> alive)
    {
        var ordered = alive.All((player) => player.TablePosition >= 0)
            ? alive.OrderBy((player) => player.TablePosition).ToList()
            : alive.OrderBy(_ => _random.Next()).ToList();

        for (var i = 0; i < ordered.Count; i += 1)
        {
            ordered[i].TablePosition = i;
        }

        foreach (var eliminated in _players.Where((player) => !player.IsActive))
        {
            eliminated.TablePosition = -1;
        }
    }

    private static void EliminatePlayerUnsafe(PlayerState player)
    {
        player.Eliminated = true;
        player.Hand.Clear();
    }

    private void ScheduleTurnTimeoutUnsafe()
    {
        ReplacePhaseTimer(async (token) =>
        {
            await Task.Delay(_options.TurnDuration, token);
            await HandleTurnTimeoutAsync();
        });
    }

    private async Task HandleTurnTimeoutAsync()
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Turn || _activePlayerId is null)
            {
                return;
            }

            var player = GetPlayerById(_activePlayerId);
            if (player is null)
            {
                return;
            }

            player.Lives = Math.Max(0, player.Lives - 1);
            if (player.Lives == 0)
            {
                EliminatePlayerUnsafe(player);
            }

            PushLog($"{player.Nickname} timed out and lost 1 heart.", "hurt");
            if (player.Eliminated)
            {
                PushLog($"{player.Nickname} was eliminated.", "out");
            }

            _reveal = new RevealView(
                "timeout",
                player.PlayerId,
                player.Nickname,
                null,
                null,
                player.PlayerId,
                player.Nickname,
                false,
                _lastPlay?.DeclaredRank ?? "—",
                _lastPlay?.DeclaredCount ?? 0,
                _lastPlay?.Cards.Select((card) => card.ToView()).ToList() ?? [],
                $"{player.Nickname} ran out the clock.",
                DateTimeOffset.UtcNow.Add(_options.RevealDuration));

            Phase = RoomPhase.Reveal;
            _turnEndsAt = null;
            if (_players.Count((entry) => entry.IsActive) <= 1)
            {
                SetWinnerUnsafe(_players.FirstOrDefault((entry) => entry.IsActive));
                return;
            }

            ReplacePhaseTimer(async (token) =>
            {
                await Task.Delay(_options.RevealDuration + _options.PostRevealShuffleDelay, token);
                await BeginRoundAsync(false);
            });
        }
        finally
        {
            _gate.Release();
        }

        await _stateChanged(this);
    }

    private void ScheduleBotTurnUnsafe()
    {
        CancelBotUnsafe();
        var player = GetPlayerById(_activePlayerId);
        if (player is null || !player.IsBot || Phase != RoomPhase.Turn)
        {
            return;
        }

        _botCts = ReplaceCts(_botCts);
        var token = _botCts.Token;
        var delayMs = _random.Next((int)_options.BotActionMinDelay.TotalMilliseconds, (int)_options.BotActionMaxDelay.TotalMilliseconds);
        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(delayMs, token);
                await RunBotTurnAsync(player.PlayerId);
            }
            catch (OperationCanceledException)
            {
            }
        }, token);
    }

    private async Task RunBotTurnAsync(string botPlayerId)
    {
        await _gate.WaitAsync();
        try
        {
            if (Phase != RoomPhase.Turn || _activePlayerId != botPlayerId)
            {
                return;
            }

            var bot = GetPlayerById(botPlayerId);
            if (bot is null || !bot.IsBot || bot.Eliminated)
            {
                return;
            }

            if (_lastPlay is not null && _lastPlay.PlayerId != botPlayerId && ShouldBotCallBluff(bot, _lastPlay))
            {
                CancelTurnUnsafe();
                await ResolveBluffUnsafe(bot);
                return;
            }

            var move = BuildBotMove(bot);
            CancelTurnUnsafe();
            foreach (var card in move.cards)
            {
                bot.Hand.Remove(card);
            }

            _lastPlay = new PlayedBundle
            {
                PlayerId = bot.PlayerId,
                Nickname = bot.Nickname,
                Cards = move.cards,
                DeclaredRank = move.claimRank,
                DeclaredCount = move.cards.Count,
                PlayedAt = DateTimeOffset.UtcNow
            };
            _pileCount += move.cards.Count;
            PushLog($"{bot.Nickname} played {move.cards.Count} card{(move.cards.Count == 1 ? string.Empty : "s")}.", "play");

            if (bot.Hand.Count == 0)
            {
                await ResolveEmptyHandUnsafe(bot);
                return;
            }

            AdvanceTurnUnsafe();
        }
        finally
        {
            _gate.Release();
        }

        await _stateChanged(this);
    }

    private bool ShouldBotCallBluff(PlayerState bot, PlayedBundle play)
    {
        var matching = bot.Hand.Count((card) => card.Rank == play.DeclaredRank || card.IsWild);
        var suspicion = 0.18;
        if (play.DeclaredCount == 3)
        {
            suspicion += 0.16;
        }

        if (matching >= 3)
        {
            suspicion += 0.18;
        }

        if (bot.Lives == 1)
        {
            suspicion -= 0.06;
        }

        return _random.NextDouble() < suspicion;
    }

    private (List<CardState> cards, string claimRank) BuildBotMove(PlayerState bot)
    {
        var desiredCount = Math.Min(bot.Hand.Count, _random.Next(1, 4));
        var honestRanks = bot.Hand
            .Where((card) => !card.IsWild)
            .GroupBy((card) => card.Rank)
            .OrderByDescending((group) => group.Count())
            .ToList();

        var playHonest = honestRanks.Count > 0 && _random.NextDouble() < 0.62;
        if (playHonest)
        {
            var choice = honestRanks.First();
            var cards = choice.Take(desiredCount).ToList();
            var extras = bot.Hand.Where((card) => card.IsWild).Take(Math.Max(0, desiredCount - cards.Count)).ToList();
            cards.AddRange(extras);
            return (cards, choice.Key);
        }

        var bluffCards = bot.Hand
            .OrderBy(_ => _random.Next())
            .Take(desiredCount)
            .ToList();

        var claimRank = ClaimRanks[_random.Next(ClaimRanks.Length - 1)];
        return (bluffCards, claimRank);
    }
}

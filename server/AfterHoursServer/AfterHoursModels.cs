using System.Collections.ObjectModel;

namespace AfterHoursServer;

public enum RoomPhase
{
    Lobby,
    Countdown,
    RoundIntro,
    Turn,
    Reveal,
    GameOver,
    Closed
}

public sealed record AvatarSpec(
    string Color,
    string Hair,
    string HairColor,
    string Hat,
    string Glasses
);

public sealed record PlayerProfileInput(
    string Nickname,
    AvatarSpec Avatar
);

public sealed record JoinRoomResult(
    bool Ok,
    string? RoomCode = null,
    string? Error = null
);

public sealed record CardView(
    string Id,
    string Rank,
    string? Suit,
    bool IsWild,
    string Label
);

public sealed record LastClaimView(
    string PlayerId,
    string Nickname,
    string DeclaredRank,
    int CardCount,
    int PileCount
);

public sealed record RevealView(
    string Type,
    string TriggeredByPlayerId,
    string TriggeredByNickname,
    string? ChallengerPlayerId,
    string? ChallengerNickname,
    string? PenalizedPlayerId,
    string? PenalizedNickname,
    bool ClaimHeld,
    string DeclaredRank,
    int DeclaredCount,
    IReadOnlyList<CardView> Cards,
    string Message,
    DateTimeOffset EndsAt
);

public sealed record RoundInfoView(
    string Title,
    string Copy,
    string Footer
);

public sealed record WinnerView(
    string PlayerId,
    string Nickname,
    AvatarSpec Avatar,
    bool IsBot
);

public sealed record EventLogView(
    string Id,
    string Text,
    string Tone,
    DateTimeOffset CreatedAt
);

public sealed record PlayerSeatView(
    string PlayerId,
    string Nickname,
    AvatarSpec Avatar,
    bool IsBot,
    bool IsHost,
    bool IsSelf,
    bool Connected,
    bool Eliminated,
    bool IsActiveTurn,
    int Lives,
    int CardCount,
    int TablePosition,
    int VisibleSeatCount,
    bool ReadyForRematch
);

public sealed record RoomStateView(
    string RoomCode,
    RoomPhase Phase,
    bool IsHost,
    bool SoundEnabled,
    bool LobbyPromptActive,
    DateTimeOffset? LobbyPromptEndsAt,
    DateTimeOffset? CountdownEndsAt,
    DateTimeOffset? TurnEndsAt,
    int RoundNumber,
    int PileCount,
    string? ActivePlayerId,
    string? ActivePlayerNickname,
    bool CanStart,
    bool CanAddBot,
    bool CanCallBluff,
    bool CanPlayCards,
    bool CanReadyRematch,
    bool IsFinalReveal,
    bool MatchComplete,
    string StatusText,
    string PromptText,
    string TableMessage,
    string RoomMessage,
    IReadOnlyList<PlayerSeatView> Players,
    IReadOnlyList<CardView> Hand,
    LastClaimView? LastClaim,
    RevealView? Reveal,
    RoundInfoView? RoundInfo,
    WinnerView? Winner,
    IReadOnlyList<EventLogView> EventLog
);

public sealed record RoomClosedView(
    string Reason
);

internal sealed class CardState
{
    public required string Id { get; init; }

    public required string Rank { get; init; }

    public string? Suit { get; init; }

    public bool IsWild { get; init; }

    public int SortKey { get; init; }

    public CardView ToView() => new(Id, Rank, Suit, IsWild, IsWild ? "Jack*" : $"{Rank}{Suit}");
}

internal sealed class PlayerState
{
    public required string PlayerId { get; init; }

    public required string Nickname { get; set; }

    public required AvatarSpec Avatar { get; set; }

    public bool IsBot { get; set; }

    public bool IsHost { get; set; }

    public string? ConnectionId { get; set; }

    public bool Connected { get; set; } = true;

    public int Lives { get; set; }

    public List<CardState> Hand { get; } = [];

    public bool Eliminated { get; set; }

    public bool ReadyForRematch { get; set; }

    public int TablePosition { get; set; } = -1;

    public bool IsActive => !Eliminated && Lives > 0;
}

internal sealed class PlayedBundle
{
    public required string PlayerId { get; init; }

    public required string Nickname { get; init; }

    public required List<CardState> Cards { get; init; }

    public required string DeclaredRank { get; init; }

    public required int DeclaredCount { get; init; }

    public required DateTimeOffset PlayedAt { get; init; }
}

internal sealed class EventLogEntry
{
    public required string Id { get; init; }

    public required string Text { get; init; }

    public required string Tone { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public EventLogView ToView() => new(Id, Text, Tone, CreatedAt);
}

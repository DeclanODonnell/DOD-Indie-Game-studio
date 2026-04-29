namespace AfterHoursServer;

public sealed class AfterHoursOptions
{
    public TimeSpan LobbyIdleDuration { get; init; } = TimeSpan.FromMinutes(15);

    public TimeSpan LobbyPromptDuration { get; init; } = TimeSpan.FromSeconds(60);

    public TimeSpan StartCountdownDuration { get; init; } = TimeSpan.FromSeconds(3);

    public TimeSpan RoundIntroDuration { get; init; } = TimeSpan.FromSeconds(4);

    public TimeSpan RevealDuration { get; init; } = TimeSpan.FromSeconds(2.8);

    public TimeSpan EmptyHandRevealDuration { get; init; } = TimeSpan.FromSeconds(2.2);

    public TimeSpan PostRevealShuffleDelay { get; init; } = TimeSpan.FromSeconds(1.1);

    public TimeSpan BotActionMinDelay { get; init; } = TimeSpan.FromMilliseconds(1100);

    public TimeSpan BotActionMaxDelay { get; init; } = TimeSpan.FromMilliseconds(2200);

    public TimeSpan BotRematchDelay { get; init; } = TimeSpan.FromMilliseconds(1400);

    public TimeSpan TurnDuration { get; init; } = TimeSpan.FromSeconds(30);

    public int StartingLives { get; init; } = 3;

    public int MaxPlayers { get; init; } = 4;
}

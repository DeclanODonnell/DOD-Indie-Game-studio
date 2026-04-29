using Microsoft.AspNetCore.SignalR;

namespace AfterHoursServer;

public sealed class AfterHoursHub : Hub
{
    private readonly RoomManager _roomManager;

    public AfterHoursHub(RoomManager roomManager)
    {
        _roomManager = roomManager;
    }

    public Task<JoinRoomResult> CreateRoom(PlayerProfileInput profile) =>
        _roomManager.CreateRoomAsync(Context.ConnectionId, profile);

    public Task<JoinRoomResult> JoinRoom(string roomCode, PlayerProfileInput profile) =>
        _roomManager.JoinRoomAsync(Context.ConnectionId, roomCode, profile);

    public Task<(bool ok, string? error)> AddBot() =>
        _roomManager.AddBotAsync(Context.ConnectionId);

    public Task<(bool ok, string? error)> KickPlayer(string targetPlayerId) =>
        _roomManager.KickPlayerAsync(Context.ConnectionId, targetPlayerId);

    public Task<(bool ok, string? error)> StartGame() =>
        _roomManager.StartGameAsync(Context.ConnectionId);

    public Task<(bool ok, string? error)> PlayCards(IReadOnlyList<string> cardIds, string declaredRank) =>
        _roomManager.PlayCardsAsync(Context.ConnectionId, cardIds, declaredRank);

    public Task<(bool ok, string? error)> CallBluff() =>
        _roomManager.CallBluffAsync(Context.ConnectionId);

    public Task<(bool ok, string? error)> ReadyRematch() =>
        _roomManager.ReadyRematchAsync(Context.ConnectionId);

    public Task<bool> KeepLobbyAlive() =>
        _roomManager.KeepLobbyAliveAsync(Context.ConnectionId);

    public Task LeaveRoom() =>
        _roomManager.LeaveAsync(Context.ConnectionId);

    public Task EndRoom() =>
        _roomManager.EndRoomAsync(Context.ConnectionId);

    public Task ToggleSound(bool enabled) =>
        _roomManager.ToggleSoundAsync(Context.ConnectionId, enabled);

    public RoomStateView? GetState() =>
        _roomManager.GetState(Context.ConnectionId);

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _roomManager.HandleDisconnectAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}

# 🕹️ DOD Web Arcade

A collection of browser games I designed and built from scratch in vanilla JavaScript, HTML5 and CSS. There are no game engines and no frameworks. It also has a real-time multiplayer game server written in **C# / ASP.NET Core with SignalR**.

Part of [DOD Web Studio](https://dodwebstudio.com).

---

## 🎮 Games

| Game | Type |
|---|---|
| **Neon Trails** | Arcade action |
| **Dead Rush Stickman** | Endless runner |
| **Animal Clicker** | Incremental / idle game with unlockable characters |
| **Pulse Recall** | Memory and pattern game |
| **Reaction Lab** | Reaction-time tester |
| **Signal Sudoku** | Puzzle |
| **Snake** | Classic remake |
| **Pong** | Classic remake |
| **After Hours** | Online multiplayer party game (in development) |
| **Hoop Rush** | Concept prototype |

## 🛠️ Tech

- **Front end:** vanilla JavaScript (ES6+), HTML5 Canvas & DOM, CSS3, plus a shared mini-arcade stylesheet and fullscreen helper
- **Multiplayer server:** C# · ASP.NET Core · SignalR hub, with room management, game-flow state and a smoke-test project
- **Structure:** each game is self-contained in `games/<name>/`, with `index.html`, `script.js` and `style.css`

```
├── index.html            # Arcade hub
├── games/                # One folder per game
├── concepts/             # Prototypes
├── credits/
└── server/
    ├── AfterHoursServer/ # ASP.NET Core + SignalR multiplayer server
    └── AfterHoursSmoke/  # Smoke tests for the server
```

## ▶️ Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

Multiplayer server (needs the .NET SDK):

```bash
cd server/AfterHoursServer
dotnet run
```

---

Built by **Declan O'Donnell**: [dodwebstudio.com](https://dodwebstudio.com) · [LinkedIn](https://www.linkedin.com/in/declan-o-donnell-592832357/)

const STORAGE_KEY = "afterHoursProfile";
const claimRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "K", "J"];
const avatarChoices = {
  colors: ["yellow", "cyan", "red", "violet", "teal", "amber"],
  hair: ["buzz", "fade", "swept", "curtain", "curls"],
  hairColors: ["black", "brown", "blonde", "ginger", "silver"],
  glasses: ["none", "shades", "aviator", "round", "laser"]
};

const colorMap = {
  yellow: "#ffd400",
  cyan: "#55dbff",
  red: "#ff6e78",
  violet: "#a793ff",
  teal: "#41f0c8",
  amber: "#ffab45"
};

const hairColorMap = {
  black: "#111111",
  brown: "#5d331d",
  blonde: "#f4de7c",
  ginger: "#b65321",
  silver: "#d7dde8"
};

const suitMap = {
  H: { symbol: "\u2665", color: "#d63d51" },
  D: { symbol: "\u2666", color: "#d63d51" },
  C: { symbol: "\u2663", color: "#101010" },
  S: { symbol: "\u2660", color: "#101010" }
};

const seatLayouts = {
  1: [[50, 20]],
  2: [[28, 48], [72, 48]],
  3: [[50, 18], [78, 66], [22, 66]],
  4: [[50, 16], [84, 50], [50, 84], [16, 50]]
};

const dom = {
  setupScreen: document.querySelector("#setupScreen"),
  lobbyScreen: document.querySelector("#lobbyScreen"),
  tableScreen: document.querySelector("#tableScreen"),
  nicknameInput: document.querySelector("#nicknameInput"),
  joinCodeInput: document.querySelector("#joinCodeInput"),
  avatarPreview: document.querySelector("#avatarPreview"),
  colorOptions: document.querySelector("#colorOptions"),
  hairOptions: document.querySelector("#hairOptions"),
  hairColorOptions: document.querySelector("#hairColorOptions"),
  glassesOptions: document.querySelector("#glassesOptions"),
  createRoomButton: document.querySelector("#createRoomButton"),
  joinRoomButton: document.querySelector("#joinRoomButton"),
  connectionNote: document.querySelector("#connectionNote"),
  roomCodeChip: document.querySelector("#roomCodeChip"),
  soundToggle: document.querySelector("#soundToggle"),
  lobbyHeading: document.querySelector("#lobbyHeading"),
  lobbyCopy: document.querySelector("#lobbyCopy"),
  lobbyRoomCode: document.querySelector("#lobbyRoomCode"),
  hostControls: document.querySelector("#hostControls"),
  addBotButton: document.querySelector("#addBotButton"),
  startGameButton: document.querySelector("#startGameButton"),
  endRoomButton: document.querySelector("#endRoomButton"),
  lobbySeats: document.querySelector("#lobbySeats"),
  lobbyPromptBanner: document.querySelector("#lobbyPromptBanner"),
  lobbyPromptCopy: document.querySelector("#lobbyPromptCopy"),
  keepLobbyAliveButton: document.querySelector("#keepLobbyAliveButton"),
  tableHeading: document.querySelector("#tableHeading"),
  tableStatusChip: document.querySelector("#tableStatusChip"),
  turnTimerChip: document.querySelector("#turnTimerChip"),
  seatLayer: document.querySelector("#seatLayer"),
  eliminationLayer: document.querySelector("#eliminationLayer"),
  pileStack: document.querySelector("#pileStack"),
  claimBanner: document.querySelector("#claimBanner"),
  tableMessage: document.querySelector("#tableMessage"),
  countdownOverlay: document.querySelector("#countdownOverlay"),
  countdownValue: document.querySelector("#countdownValue"),
  roundInfoOverlay: document.querySelector("#roundInfoOverlay"),
  roundInfoTitle: document.querySelector("#roundInfoTitle"),
  roundInfoCopy: document.querySelector("#roundInfoCopy"),
  roundInfoFooter: document.querySelector("#roundInfoFooter"),
  revealOverlay: document.querySelector("#revealOverlay"),
  revealTitle: document.querySelector("#revealTitle"),
  revealCopy: document.querySelector("#revealCopy"),
  revealCards: document.querySelector("#revealCards"),
  winnerOverlay: document.querySelector("#winnerOverlay"),
  winnerAvatar: document.querySelector("#winnerAvatar"),
  winnerTitle: document.querySelector("#winnerTitle"),
  winnerCopy: document.querySelector("#winnerCopy"),
  readyRematchButton: document.querySelector("#readyRematchButton"),
  winnerEndRoomButton: document.querySelector("#winnerEndRoomButton"),
  handHeading: document.querySelector("#handHeading"),
  handStatus: document.querySelector("#handStatus"),
  claimRankSelect: document.querySelector("#claimRankSelect"),
  playCardsButton: document.querySelector("#playCardsButton"),
  callBluffButton: document.querySelector("#callBluffButton"),
  handRow: document.querySelector("#handRow"),
  eventLog: document.querySelector("#eventLog"),
  afterHoursStatus: document.querySelector("#afterHoursStatus")
};

const appState = {
  connection: null,
  connectionUrl: null,
  roomState: null,
  selectedCards: new Set(),
  profile: loadProfile(),
  ghosts: [],
  timerId: null,
  audioContext: null,
  audioUnlocked: false
};

init();

function init() {
  seedProfileForm();
  renderAvatarControlGroup(dom.colorOptions, avatarChoices.colors, appState.profile.avatar.color, "color");
  renderAvatarControlGroup(dom.hairOptions, avatarChoices.hair, appState.profile.avatar.hair, "hair");
  renderAvatarControlGroup(dom.hairColorOptions, avatarChoices.hairColors, appState.profile.avatar.hairColor, "hairColor");
  renderAvatarControlGroup(dom.glassesOptions, avatarChoices.glasses, appState.profile.avatar.glasses, "glasses");
  renderAvatarPreview();
  populateClaimRanks();
  bindEvents();
  startTicker();
  setSetupNote("Enter a nickname, style the avatar, then create or join a private room.");
  render();
  probeRoomServer();
}

function bindEvents() {
  dom.nicknameInput.addEventListener("input", () => {
    appState.profile.nickname = dom.nicknameInput.value;
    persistProfile();
  });

  dom.joinCodeInput.addEventListener("input", () => {
    dom.joinCodeInput.value = dom.joinCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  });

  dom.createRoomButton.addEventListener("click", () => handleCreateRoom());
  dom.joinRoomButton.addEventListener("click", () => handleJoinRoom());
  dom.addBotButton.addEventListener("click", () => invokeHub("AddBot"));
  dom.startGameButton.addEventListener("click", () => invokeHub("StartGame"));
  dom.endRoomButton.addEventListener("click", () => invokeHub("EndRoom"));
  dom.keepLobbyAliveButton.addEventListener("click", () => invokeHub("KeepLobbyAlive"));
  dom.readyRematchButton.addEventListener("click", () => invokeHub("ReadyRematch"));
  dom.winnerEndRoomButton.addEventListener("click", () => invokeHub("EndRoom"));
  dom.playCardsButton.addEventListener("click", () => handlePlayCards());
  dom.callBluffButton.addEventListener("click", () => invokeHub("CallBluff"));
  dom.soundToggle.addEventListener("click", () => toggleSound());

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
  });
}

function startTicker() {
  appState.timerId = window.setInterval(() => {
    renderDynamicTimers();
  }, 120);
}

function getHubCandidates() {
  const urls = [];
  if (window.location.protocol.startsWith("http")) {
    urls.push(new URL("/after-hours-hub", window.location.origin).toString());
  }

  urls.push("http://127.0.0.1:5050/after-hours-hub");
  urls.push("http://localhost:5050/after-hours-hub");

  return [...new Set(urls)];
}

function getHealthCandidates() {
  return getHubCandidates().map((url) => {
    const endpoint = new URL(url);
    endpoint.pathname = "/health";
    endpoint.search = "";
    endpoint.hash = "";
    return endpoint.toString();
  });
}

async function probeRoomServer() {
  const defaultNote = "Enter a nickname, style the avatar, then create or join a private room.";

  for (const url of getHealthCandidates()) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 1800);

    try {
      const response = await fetch(url, { method: "GET", cache: "no-store", signal: controller.signal });
      if (response.ok) {
        setSetupNote(`Room server ready at ${new URL(url).host}. ${defaultNote}`);
        return;
      }
    } catch {
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  setSetupNote("Room server offline. Run start-after-hours-server.bat, then refresh or press Create Room again.");
}

function createHubConnection(url) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url)
    .build();

  connection.on("StateChanged", handleRoomState);
  connection.on("RoomClosed", handleRoomClosed);
  return connection;
}

async function ensureConnection() {
  if (appState.connection && appState.connection.state === signalR.HubConnectionState.Connected) {
    return true;
  }

  if (!window.signalR) {
    setSetupNote("Realtime client failed to load.");
    return false;
  }

  const candidateUrls = appState.connectionUrl
    ? [appState.connectionUrl, ...getHubCandidates().filter((url) => url !== appState.connectionUrl)]
    : getHubCandidates();

  if (appState.connection) {
    try {
      await appState.connection.stop();
    } catch {
    }
    appState.connection = null;
  }

  for (const url of candidateUrls) {
    const connection = createHubConnection(url);
    try {
      await connection.start();
      appState.connection = connection;
      appState.connectionUrl = url;
      setSetupNote(`Connected to room server at ${new URL(url).host}.`);
      return true;
    } catch (error) {
      console.error(error);
      try {
        await connection.stop();
      } catch {
      }
    }
  }

  setSetupNote("Connection failed. Run start-after-hours-server.bat to launch the local AFTER HOURS room server, then try again.");
  return false;
}

async function handleCreateRoom() {
  if (!(await ensureConnection())) {
    return;
  }

  const profile = getProfileFromForm();
  if (!profile) {
    return;
  }

  try {
    const result = await appState.connection.invoke("CreateRoom", profile);
    if (!result.ok) {
      setSetupNote(result.error ?? "Could not create room.");
    } else {
      setSetupNote(`Room ${result.roomCode} created.`);
    }
  } catch (error) {
    console.error(error);
    setSetupNote("Room server dropped the request. Make sure start-after-hours-server.bat is running, then try again.");
  }
}

async function handleJoinRoom() {
  if (!(await ensureConnection())) {
    return;
  }

  const profile = getProfileFromForm();
  if (!profile) {
    return;
  }

  const roomCode = dom.joinCodeInput.value.trim().toUpperCase();
  if (roomCode.length < 5) {
    setSetupNote("Enter a valid 5-character room code.");
    return;
  }

  try {
    const result = await appState.connection.invoke("JoinRoom", roomCode, profile);
    if (!result.ok) {
      setSetupNote(result.error ?? "Could not join room.");
    } else {
      setSetupNote(`Joined room ${result.roomCode}.`);
    }
  } catch (error) {
    console.error(error);
    setSetupNote("Room server dropped the request. Make sure start-after-hours-server.bat is running, then try again.");
  }
}

function getProfileFromForm() {
  const nickname = dom.nicknameInput.value.trim();
  if (!nickname) {
    setSetupNote("Enter a nickname first.");
    return null;
  }

  const profile = {
    nickname,
    avatar: structuredClone(appState.profile.avatar)
  };
  appState.profile.nickname = nickname;
  persistProfile();
  return profile;
}

function handleRoomState(nextState) {
  if (appState.roomState) {
    if (nextState.phase === "Reveal" && appState.roomState.phase !== "Reveal") {
      playRevealSound();
    }

    if ((nextState.phase === "Countdown" && appState.roomState.phase !== "Countdown") ||
        (nextState.phase === "RoundIntro" && appState.roomState.phase !== "RoundIntro")) {
      playShuffleSound();
    }

    if (nextState.pileCount > appState.roomState.pileCount) {
      playCardPlaceSound();
    }

    detectEliminationGhosts(appState.roomState, nextState);
  }

  appState.roomState = nextState;
  syncSelectionWithHand();
  render();
}

function handleRoomClosed(payload) {
  appState.roomState = null;
  appState.selectedCards.clear();
  appState.ghosts = [];
  setSetupNote(payload.reason || "Room closed.");
  render();
}

function detectEliminationGhosts(previousState, nextState) {
  const previousMap = new Map(previousState.players.map((player) => [player.playerId, player]));
  nextState.players.forEach((player) => {
    const previous = previousMap.get(player.playerId);
    if (previous && !previous.eliminated && player.eliminated) {
      appState.ghosts.push({
        playerId: player.playerId,
        nickname: player.nickname,
        avatar: player.avatar,
        position: previous.tablePosition,
        count: previous.visibleSeatCount,
        expiresAt: Date.now() + 1350
      });
    }
  });
}

function syncSelectionWithHand() {
  if (!appState.roomState) {
    appState.selectedCards.clear();
    return;
  }

  const valid = new Set(appState.roomState.hand.map((card) => card.id));
  for (const cardId of [...appState.selectedCards]) {
    if (!valid.has(cardId)) {
      appState.selectedCards.delete(cardId);
    }
  }
}

function render() {
  const state = appState.roomState;
  const inRoom = Boolean(state);
  const isLobby = inRoom && state.phase === "Lobby";

  dom.setupScreen.hidden = inRoom;
  dom.lobbyScreen.hidden = !isLobby;
  dom.tableScreen.hidden = !inRoom || isLobby;

  dom.roomCodeChip.hidden = !inRoom;
  dom.roomCodeChip.textContent = inRoom ? `Room ${state.roomCode}` : "";
  dom.soundToggle.textContent = state ? (state.soundEnabled ? "Sound On" : "Sound Off") : "Sound On";

  if (!state) {
    renderAvatarPreview();
    dom.afterHoursStatus.textContent = "Setup ready.";
    return;
  }

  if (isLobby) {
    renderLobby(state);
  } else {
    renderTable(state);
  }
}

function renderLobby(state) {
  dom.lobbyHeading.textContent = `Room ${state.roomCode}`;
  dom.lobbyCopy.textContent = state.roomMessage;
  dom.lobbyRoomCode.textContent = state.roomCode;
  dom.hostControls.hidden = !state.isHost;
  dom.startGameButton.disabled = !state.canStart;
  dom.addBotButton.disabled = !state.canAddBot;

  dom.lobbyPromptBanner.hidden = !state.lobbyPromptActive;
  dom.lobbyPromptCopy.textContent = state.promptText;

  const seats = [];
  for (let index = 0; index < 4; index += 1) {
    const player = state.players[index];
    if (!player) {
      seats.push(`
        <div class="lobby-seat">
          <div class="seat-player">
            <div class="avatar-shell"></div>
            <div class="seat-copy">
              <strong class="seat-name">Empty seat</strong>
              <span class="seat-meta">Waiting for player or bot.</span>
            </div>
          </div>
        </div>
      `);
      continue;
    }

    const action = state.isHost && !player.isSelf
      ? `<button class="action-button action-button-ghost" data-kick="${player.playerId}" type="button">${player.isBot ? "Remove" : "Kick"}</button>`
      : "";

    seats.push(`
      <div class="lobby-seat">
        <div class="seat-player">
          <div class="avatar-shell">${avatarMarkup(player.avatar)}</div>
          <div class="seat-copy">
            <strong class="seat-name">${escapeHtml(player.nickname)}</strong>
            <span class="seat-meta">${player.isHost ? "Host" : player.isBot ? "Bot" : "Player"}</span>
          </div>
        </div>
        ${action}
      </div>
    `);
  }

  dom.lobbySeats.innerHTML = seats.join("");
  dom.lobbySeats.querySelectorAll("[data-kick]").forEach((button) => {
    button.addEventListener("click", () => invokeHub("KickPlayer", button.getAttribute("data-kick")));
  });

  dom.afterHoursStatus.textContent = state.statusText;
}

function renderTable(state) {
  dom.tableHeading.textContent = state.activePlayerNickname ? `${state.activePlayerNickname} is on the spot.` : "Cards are live.";
  dom.tableStatusChip.textContent = state.statusText;
  dom.turnTimerChip.textContent = formatRemaining(state.turnEndsAt);
  dom.tableMessage.textContent = state.tableMessage;
  dom.handStatus.textContent = state.statusText;
  dom.handHeading.textContent = state.canPlayCards ? "Pick 1 to 3 cards." : state.activePlayerId ? `${state.activePlayerNickname} controls the turn.` : "Waiting for the round.";

  dom.pileStack.dataset.count = String(Math.max(1, state.pileCount));
  dom.claimBanner.textContent = state.lastClaim
    ? `${state.lastClaim.nickname} claims ${state.lastClaim.cardCount} ${state.lastClaim.declaredRank}`
    : "No claim on the table yet.";

  renderSeats(state.players);
  renderGhosts();
  renderHand(state);
  renderEventLog(state.eventLog);
  renderCountdown(state);
  renderRoundInfo(state);
  renderReveal(state);
  renderWinner(state);

  dom.playCardsButton.disabled = !state.canPlayCards || appState.selectedCards.size === 0 || appState.selectedCards.size > 3;
  dom.callBluffButton.disabled = !state.canCallBluff;
  dom.callBluffButton.hidden = !state.canCallBluff;
  updatePlayButtonLabel();

  dom.afterHoursStatus.textContent = state.statusText;
}

function renderSeats(players) {
  const activePlayers = players.filter((player) => !player.eliminated && player.tablePosition >= 0);
  const html = activePlayers.map((player) => {
    const position = getSeatPosition(player.visibleSeatCount, player.tablePosition);
    const hearts = renderHearts(player.lives);
    return `
      <article class="table-seat${player.isActiveTurn ? " is-active" : ""}${player.isSelf ? " is-self" : ""}${player.isBot ? " is-bot" : ""}" style="left:${position[0]}%; top:${position[1]}%">
        <div class="seat-top">
          <div class="seat-player">
            <div class="avatar-shell">${avatarMarkup(player.avatar)}</div>
            <div class="seat-copy">
              <strong class="seat-name">${escapeHtml(player.nickname)}</strong>
              <span class="seat-meta">${player.isHost ? "Host" : player.isBot ? "Bot" : "Player"}</span>
            </div>
          </div>
          <div class="seat-status">${hearts}</div>
        </div>
        <div class="seat-bottom">
          <span class="card-count">${player.cardCount} card${player.cardCount === 1 ? "" : "s"}</span>
          <div class="card-back" aria-hidden="true"></div>
        </div>
      </article>
    `;
  }).join("");

  dom.seatLayer.innerHTML = html;
}

function renderGhosts() {
  const now = Date.now();
  appState.ghosts = appState.ghosts.filter((ghost) => ghost.expiresAt > now);
  dom.eliminationLayer.innerHTML = appState.ghosts.map((ghost) => {
    const position = getSeatPosition(ghost.count, ghost.position);
    return `
      <article class="ghost-seat" style="left:${position[0]}%; top:${position[1]}%">
        <div class="seat-top">
          <div class="seat-player">
            <div class="avatar-shell">${avatarMarkup(ghost.avatar)}</div>
            <div class="seat-copy">
              <strong class="seat-name">${escapeHtml(ghost.nickname)}</strong>
              <span class="seat-meta">Eliminated</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderHand(state) {
  dom.claimRankSelect.disabled = !state.canPlayCards;
  dom.handRow.innerHTML = state.hand.map((card) => {
    const selected = appState.selectedCards.has(card.id);
    return `
      <button class="card-button${selected ? " is-selected" : ""}" type="button" data-card-id="${card.id}" ${state.canPlayCards ? "" : "disabled"}>
        ${card.isWild ? renderWildCard(card) : renderFaceCard(card)}
      </button>
    `;
  }).join("");

  dom.handRow.querySelectorAll("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => toggleCardSelection(button.getAttribute("data-card-id")));
  });
}

function renderEventLog(entries) {
  dom.eventLog.innerHTML = entries.slice().reverse().map((entry) => `
    <article class="log-entry" data-tone="${entry.tone}">
      <time>${new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
      <p>${escapeHtml(entry.text)}</p>
    </article>
  `).join("");
}

function renderCountdown(state) {
  const show = state.phase === "Countdown";
  dom.countdownOverlay.hidden = !show;
  if (!show) {
    return;
  }

  dom.countdownValue.textContent = formatRemaining(state.countdownEndsAt, true);
}

function renderRoundInfo(state) {
  const info = state.roundInfo;
  dom.roundInfoOverlay.hidden = !info;
  if (!info) {
    return;
  }

  dom.roundInfoTitle.textContent = info.title;
  dom.roundInfoCopy.textContent = info.copy;
  dom.roundInfoFooter.textContent = info.footer;
}

function renderReveal(state) {
  const reveal = state.reveal;
  dom.revealOverlay.hidden = !reveal;
  if (!reveal) {
    return;
  }

  dom.revealTitle.textContent = reveal.claimHeld ? "Claim holds." : "Bluff caught.";
  dom.revealCopy.textContent = reveal.message;
  dom.revealCards.innerHTML = reveal.cards.map((card) => card.isWild ? renderWildCard(card) : renderFaceCard(card)).join("");
}

function renderWinner(state) {
  const winner = state.winner;
  dom.winnerOverlay.hidden = !winner;
  if (!winner) {
    return;
  }

  dom.winnerAvatar.innerHTML = avatarMarkup(winner.avatar, true);
  dom.winnerTitle.textContent = winner.nickname;
  dom.winnerCopy.textContent = "Ready up if you want another round in the same room.";
  dom.readyRematchButton.disabled = !state.canReadyRematch;
}

function updatePlayButtonLabel() {
  const count = appState.selectedCards.size;
  const rank = dom.claimRankSelect.value;
  dom.playCardsButton.textContent = count > 0 ? `Play ${count} as ${rank}` : "Play Cards";
}

function toggleCardSelection(cardId) {
  if (!cardId) {
    return;
  }

  if (appState.selectedCards.has(cardId)) {
    appState.selectedCards.delete(cardId);
  } else if (appState.selectedCards.size < 3) {
    appState.selectedCards.add(cardId);
  }

  updatePlayButtonLabel();
  renderHand(appState.roomState);
}

async function handlePlayCards() {
  if (!appState.roomState || appState.selectedCards.size === 0) {
    return;
  }

  const cards = [...appState.selectedCards];
  const rank = dom.claimRankSelect.value;
  const result = await invokeHub("PlayCards", cards, rank);
  if (result?.ok === false) {
    dom.handStatus.textContent = result.error || "Play failed.";
    return;
  }

  appState.selectedCards.clear();
  updatePlayButtonLabel();
}

function renderDynamicTimers() {
  if (!appState.roomState) {
    return;
  }

  const state = appState.roomState;
  dom.turnTimerChip.textContent = formatRemaining(state.turnEndsAt);
  if (state.phase === "Countdown") {
    dom.countdownValue.textContent = formatRemaining(state.countdownEndsAt, true);
  }

  if (state.lobbyPromptActive) {
    const remain = formatRemaining(state.lobbyPromptEndsAt);
    dom.lobbyPromptCopy.textContent = `Keep the room alive before it closes. ${remain} left.`;
  }
}

function formatRemaining(deadline, wholeSeconds = false) {
  if (!deadline) {
    return "--";
  }

  const remaining = Math.max(0, new Date(deadline).getTime() - Date.now());
  if (wholeSeconds) {
    return String(Math.max(1, Math.ceil(remaining / 1000)));
  }

  return `${Math.max(0, Math.ceil(remaining / 1000))}s`;
}

async function toggleSound() {
  const enabled = !(appState.roomState?.soundEnabled ?? true);
  await invokeHub("ToggleSound", enabled);
}

async function invokeHub(method, ...args) {
  if (!(await ensureConnection())) {
    return null;
  }

  try {
    return await appState.connection.invoke(method, ...args);
  } catch (error) {
    console.error(error);
    setSetupNote("Action failed. Check the local server.");
    return null;
  }
}

function renderAvatarControlGroup(container, values, selectedValue, type) {
  container.innerHTML = values.map((value) => {
    if (type === "color" || type === "hairColor") {
      const swatchColor = type === "color" ? colorMap[value] : hairColorMap[value];
      return `<button class="option-button swatch-button${selectedValue === value ? " is-selected" : ""}" type="button" data-type="${type}" data-value="${value}" aria-label="${capitalize(value)}"><span style="background:${swatchColor}"></span></button>`;
    }

    const label = type === "glasses"
      ? { none: "None", shades: "Shades", aviator: "Aviators", round: "Round", laser: "Laser" }[value]
      : type === "hair"
        ? { buzz: "Buzz", fade: "Fade", swept: "Swept", curtain: "Curtains", curls: "Curls" }[value]
        : capitalize(value);
    return `<button class="option-button${selectedValue === value ? " is-selected" : ""}" type="button" data-type="${type}" data-value="${value}">${label}</button>`;
  }).join("");

  container.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-value");
      if (!value) {
        return;
      }

      appState.profile.avatar[type] = value;

      persistProfile();
      renderAvatarControlGroup(container, values, appState.profile.avatar[type], type);
      renderAvatarPreview();
    });
  });
}

function renderAvatarPreview() {
  dom.avatarPreview.innerHTML = avatarMarkup(appState.profile.avatar, true);
}

function seedProfileForm() {
  dom.nicknameInput.value = appState.profile.nickname;
  dom.joinCodeInput.value = "";
}

function loadProfile() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      nickname: "",
      avatar: { color: "yellow", hair: "swept", hairColor: "black", hat: "none", glasses: "none" }
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const hairMap = {
      sidepart: "swept",
      wavy: "swept",
      puff: "curls"
    };
    const hairColor = parsed.avatar?.hairColor === "teal" ? "silver" : parsed.avatar?.hairColor;
    return {
      nickname: parsed.nickname || "",
      avatar: {
        color: parsed.avatar?.color || "yellow",
        hair: hairMap[parsed.avatar?.hair] || parsed.avatar?.hair || "swept",
        hairColor: hairColor || "black",
        hat: "none",
        glasses: typeof parsed.avatar?.glasses === "string"
          ? parsed.avatar.glasses
          : parsed.avatar?.glasses
            ? "shades"
            : "none"
      }
    };
  } catch {
    return {
      nickname: "",
      avatar: { color: "yellow", hair: "swept", hairColor: "black", hat: "none", glasses: "none" }
    };
  }
}

function persistProfile() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.profile));
}

function populateClaimRanks() {
  dom.claimRankSelect.innerHTML = claimRanks.map((rank) => `<option value="${rank}">${rank}</option>`).join("");
  dom.claimRankSelect.addEventListener("change", updatePlayButtonLabel);
}

function setSetupNote(text) {
  dom.connectionNote.textContent = text;
}

function getSeatPosition(count, index) {
  const layout = seatLayouts[count] || seatLayouts[4];
  return layout[index] || layout[0];
}

function renderHearts(lives) {
  return [0, 1, 2].map((index) => `<span class="heart${index >= lives ? " is-empty" : ""}"></span>`).join("");
}

function renderFaceCard(card) {
  const suit = suitMap[card.suit];
  const style = suit ? `style="color:${suit.color}"` : "";
  return `
    <div class="card-face" ${style}>
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit">${suit ? suit.symbol : "★"}</span>
      <span class="card-rank">${card.rank}</span>
    </div>
  `;
}

function renderWildCard() {
  return `
    <div class="card-face" style="background:linear-gradient(180deg, rgba(5,5,5,0.96) 0%, rgba(22,22,22,0.98) 100%); color: var(--yellow);">
      <span class="card-rank">J*</span>
      <span class="card-suit">★</span>
      <span class="card-rank">J*</span>
    </div>
  `;
}

function avatarMarkup(spec, large = false) {
  const bodyColor = colorMap[spec.color] || "#ffd400";
  const hairColor = hairColorMap[spec.hairColor] || "#111111";
  const scale = large ? "0 0 84 84" : "0 0 72 72";

  const hairMarkup = spec.hair === "buzz"
    ? `
      <rect x="20" y="16" width="32" height="7" rx="3" fill="${hairColor}" />
      <rect x="19" y="21" width="5" height="7" rx="2" fill="${hairColor}" opacity="0.78" />
      <rect x="48" y="21" width="5" height="7" rx="2" fill="${hairColor}" opacity="0.78" />
    `
    : spec.hair === "fade"
      ? `
        <path d="M17 24 Q20 10 35 10 Q51 10 55 24 L53 28 Q44 22 36 22 Q28 22 19 28 Z" fill="${hairColor}" />
        <rect x="18" y="24" width="5" height="10" rx="2.5" fill="${hairColor}" opacity="0.5" />
        <rect x="49" y="24" width="5" height="10" rx="2.5" fill="${hairColor}" opacity="0.5" />
      `
      : spec.hair === "swept"
        ? `
          <path d="M17 24 Q20 11 38 10 Q50 11 56 22 L54 27 Q48 23 38 23 Q28 23 20 27 Z" fill="${hairColor}" />
          <path d="M28 16 Q40 9 49 17 Q42 16 35 21 Z" fill="${hairColor}" opacity="0.9" />
        `
        : spec.hair === "curtain"
          ? `
            <path d="M18 24 Q21 10 33 11 L33 29 Q26 26 18 30 Z" fill="${hairColor}" />
            <path d="M54 24 Q51 10 39 11 L39 29 Q46 26 54 30 Z" fill="${hairColor}" />
            <rect x="32" y="11" width="8" height="12" rx="3" fill="${hairColor}" />
          `
          : `
            <circle cx="24" cy="22" r="8" fill="${hairColor}" />
            <circle cx="34" cy="15" r="10" fill="${hairColor}" />
            <circle cx="45" cy="18" r="9" fill="${hairColor}" />
            <circle cx="50" cy="24" r="6" fill="${hairColor}" />
          `;

  const glassesMarkup = spec.glasses === "shades"
    ? `
      <rect x="20" y="29" width="13" height="8" rx="2.5" fill="#121212" opacity="0.96" />
      <rect x="39" y="29" width="13" height="8" rx="2.5" fill="#121212" opacity="0.96" />
      <rect x="33" y="32" width="6" height="2" fill="#121212" />
    `
    : spec.glasses === "aviator"
      ? `
        <path d="M20 30 h12 a5 5 0 0 1 5 5 v1 h-17 z" fill="rgba(140,214,255,0.32)" stroke="#d6b75a" stroke-width="1.8" />
        <path d="M35 36 a5 5 0 0 1 5-6 h12 v6 z" fill="rgba(140,214,255,0.32)" stroke="#d6b75a" stroke-width="1.8" />
        <rect x="33" y="32" width="6" height="2" fill="#d6b75a" />
      `
      : spec.glasses === "round"
        ? `
          <circle cx="27" cy="33" r="5.5" fill="none" stroke="#121212" stroke-width="2" />
          <circle cx="45" cy="33" r="5.5" fill="none" stroke="#121212" stroke-width="2" />
          <rect x="32" y="32" width="8" height="2" fill="#121212" />
        `
        : spec.glasses === "laser"
          ? `
            <rect x="18" y="30" width="36" height="8" rx="4" fill="#ff4d73" opacity="0.88" />
            <rect x="18" y="33" width="36" height="2" rx="1" fill="#fff2f7" opacity="0.88" />
          `
          : "";

  return `
    <svg viewBox="${scale}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="48" width="36" height="20" rx="7" fill="${bodyColor}" stroke="#111" stroke-width="3" />
      <rect x="16" y="45" width="40" height="12" rx="6" fill="${bodyColor}" opacity="0.92" />
      <path d="M20 24 Q20 15 28 14 h16 q8 1 8 10 v17 q0 7-6 7 h-20 q-6 0-6-7 Z" fill="${bodyColor}" stroke="#111" stroke-width="3" />
      <rect x="24" y="54" width="24" height="4" rx="2" fill="rgba(255,255,255,0.16)" />
      ${hairMarkup}
      <circle cx="29" cy="34" r="2.15" fill="#111" />
      <circle cx="43" cy="34" r="2.15" fill="#111" />
      <path d="M30 40 Q36 43 42 40" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" opacity="0.76" />
      ${glassesMarkup}
    </svg>
  `;
}

function playCardPlaceSound() {
  if (!appState.roomState?.soundEnabled) {
    return;
  }

  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = 520;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
}

function playShuffleSound() {
  if (!appState.roomState?.soundEnabled) {
    return;
  }

  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const gain = context.createGain();
  const buffer = context.createBuffer(1, context.sampleRate * 0.22, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100;
  gain.gain.value = 0.035;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
}

function playRevealSound() {
  if (!appState.roomState?.soundEnabled) {
    return;
  }

  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(170, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(82, context.currentTime + 0.28);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.38);
}

function unlockAudio() {
  appState.audioUnlocked = true;
  ensureAudioContext();
}

function ensureAudioContext() {
  if (!appState.audioUnlocked) {
    return null;
  }

  if (!appState.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    appState.audioContext = new AudioContextClass();
  }

  if (appState.audioContext.state === "suspended") {
    appState.audioContext.resume();
  }

  return appState.audioContext;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const pongCanvasWrap = document.querySelector("#pongCanvasWrap");
const pongCanvas = document.querySelector("#pongCanvas");
const pongStatus = document.querySelector("#pong-status");
const pongDifficulty = document.querySelector("#pong-difficulty");
const pongScore = document.querySelector("#pong-score");
const pongRestartButton = document.querySelector("#pong-restart-button");
const pongIntroPanel = document.querySelector("#pongIntroPanel");
const pongResultPanel = document.querySelector("#pongResultPanel");
const pongResultTitle = document.querySelector("#pong-result-title");
const pongResultCopy = document.querySelector("#pong-result-copy");
const pongPlayAgainButton = document.querySelector("#pong-play-again-button");
const pongDifficultyButton = document.querySelector("#pong-difficulty-button");
const pongDifficultyOptions = Array.from(document.querySelectorAll("[data-pong-difficulty]"));

const pongPresets = {
  rookie: {
    label: "Rookie",
    cpuSpeed: 360,
    paddleSpeed: 520,
    ballSpeed: 360,
    paddleHeight: 118
  },
  standard: {
    label: "Standard",
    cpuSpeed: 470,
    paddleSpeed: 580,
    ballSpeed: 410,
    paddleHeight: 106
  },
  expert: {
    label: "Expert",
    cpuSpeed: 620,
    paddleSpeed: 620,
    ballSpeed: 460,
    paddleHeight: 96
  }
};

const pongState = {
  mode: "menu",
  difficultyKey: "standard",
  playerScore: 0,
  cpuScore: 0,
  targetScore: 5,
  width: 0,
  height: 0,
  paddleWidth: 14,
  paddleHeight: pongPresets.standard.paddleHeight,
  sideInset: 34,
  verticalInset: 20,
  centerLineInset: 30,
  boardScale: 1,
  playerY: 0,
  cpuY: 0,
  playerMove: 0,
  serveDelayUntil: 0,
  animationFrame: null,
  resultTimeout: null,
  lastFrameAt: 0,
  context: pongCanvas ? pongCanvas.getContext("2d") : null,
  ball: {
    x: 0,
    y: 0,
    size: 12,
    vx: 0,
    vy: 0,
    speed: pongPresets.standard.ballSpeed
  }
};

function getPongBoardScale(height) {
  return Math.max(0.56, Math.min(1, height / 460));
}

function applyPongBoardMetrics() {
  const preset = pongPresets[pongState.difficultyKey];
  const scale = getPongBoardScale(pongState.height);

  pongState.boardScale = scale;
  pongState.paddleWidth = Math.round(Math.max(8, Math.min(16, 14 * scale)));
  pongState.paddleHeight = Math.round(Math.max(54, Math.min(preset.paddleHeight, preset.paddleHeight * scale)));
  pongState.sideInset = Math.round(Math.max(14, Math.min(34, 34 * scale)));
  pongState.verticalInset = Math.round(Math.max(10, Math.min(20, 20 * scale)));
  pongState.centerLineInset = Math.round(Math.max(14, Math.min(30, 30 * scale)));
  pongState.ball.size = Math.round(Math.max(6, Math.min(12, 12 * scale)));
}

function setPongStatus(text) {
  pongStatus.textContent = text;
}

function syncPongDifficultyButtons() {
  pongDifficultyOptions.forEach((button) => {
    const selected = button.dataset.pongDifficulty === pongState.difficultyKey;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function updatePongRestartButton() {
  if (pongState.mode === "menu") {
    pongRestartButton.textContent = "Start";
  } else if (pongState.mode === "result") {
    pongRestartButton.textContent = "Play Again";
  } else {
    pongRestartButton.textContent = "Restart";
  }
}

function updatePongHud() {
  pongDifficulty.textContent = pongPresets[pongState.difficultyKey].label;
  pongScore.textContent = `${pongState.playerScore} - ${pongState.cpuScore}`;
  updatePongRestartButton();
  syncPongDifficultyButtons();
}

function clearPongTimers() {
  if (pongState.resultTimeout) {
    window.clearTimeout(pongState.resultTimeout);
    pongState.resultTimeout = null;
  }
}

function stopPongAnimation() {
  if (pongState.animationFrame) {
    cancelAnimationFrame(pongState.animationFrame);
    pongState.animationFrame = null;
  }
}

function showPongPanel(panel) {
  panel.hidden = false;
}

function hidePongPanel(panel) {
  panel.hidden = true;
}

function showPongIntroPanel() {
  pongState.mode = "menu";
  hidePongPanel(pongResultPanel);
  showPongPanel(pongIntroPanel);
  setPongStatus("Choose difficulty");
  updatePongHud();
  renderPongGame();
}

function showPongResultPanel(result) {
  pongState.mode = "result";
  hidePongPanel(pongIntroPanel);
  showPongPanel(pongResultPanel);

  if (result === "player") {
    pongResultTitle.textContent = "You Win";
    pongResultCopy.textContent = `You reached ${pongState.targetScore} first.`;
  } else {
    pongResultTitle.textContent = "You Lose";
    pongResultCopy.textContent = `The CPU reached ${pongState.targetScore} first.`;
  }

  updatePongHud();
}

function measurePongBoard() {
  if (!pongCanvasWrap || !pongCanvas || !pongState.context) {
    return;
  }

  const previousWidth = pongState.width;
  const previousHeight = pongState.height;
  const previousPaddleHeight = pongState.paddleHeight;
  const playerCenterRatio = previousHeight ? (pongState.playerY + previousPaddleHeight / 2) / previousHeight : 0.5;
  const cpuCenterRatio = previousHeight ? (pongState.cpuY + previousPaddleHeight / 2) / previousHeight : 0.5;
  const ballXRatio = previousWidth ? pongState.ball.x / previousWidth : 0.5;
  const ballYRatio = previousHeight ? pongState.ball.y / previousHeight : 0.5;

  const rect = pongCanvasWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  pongCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
  pongCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
  pongCanvas.style.width = `${rect.width}px`;
  pongCanvas.style.height = `${rect.height}px`;
  pongState.context.setTransform(dpr, 0, 0, dpr, 0, 0);

  pongState.width = rect.width;
  pongState.height = rect.height;
  applyPongBoardMetrics();

  pongState.playerY = clampPongPaddle((playerCenterRatio * pongState.height) - pongState.paddleHeight / 2);
  pongState.cpuY = clampPongPaddle((cpuCenterRatio * pongState.height) - pongState.paddleHeight / 2);
  pongState.ball.x = pongState.width * ballXRatio;
  pongState.ball.y = pongState.height * ballYRatio;
}

function clampPongPaddle(y) {
  return Math.max(
    pongState.verticalInset,
    Math.min(pongState.height - pongState.paddleHeight - pongState.verticalInset, y)
  );
}

function centerPongBall(direction = 1) {
  const preset = pongPresets[pongState.difficultyKey];
  pongState.ball.speed = preset.ballSpeed;
  pongState.ball.x = pongState.width / 2;
  pongState.ball.y = pongState.height / 2;
  pongState.ball.vx = direction * preset.ballSpeed;
  pongState.ball.vy = (Math.random() * 0.8 - 0.4) * preset.ballSpeed;
}

function resetPongRound(direction = Math.random() > 0.5 ? 1 : -1) {
  pongState.playerY = clampPongPaddle((pongState.height - pongState.paddleHeight) / 2);
  pongState.cpuY = clampPongPaddle((pongState.height - pongState.paddleHeight) / 2);
  centerPongBall(direction);
  pongState.serveDelayUntil = performance.now() + 650;
}

function setPongDifficulty(key) {
  if (!pongPresets[key]) {
    return;
  }

  pongState.difficultyKey = key;
  updatePongHud();
}

function beginPongMatch(key = pongState.difficultyKey, resetScore = false) {
  setPongDifficulty(key);
  clearPongTimers();
  stopPongAnimation();
  hidePongPanel(pongIntroPanel);
  hidePongPanel(pongResultPanel);
  measurePongBoard();

  if (resetScore) {
    pongState.playerScore = 0;
    pongState.cpuScore = 0;
  }

  pongState.mode = "playing";
  pongState.playerMove = 0;
  pongState.lastFrameAt = 0;
  resetPongRound();
  setPongStatus("Serve");
  updatePongHud();
  renderPongGame();
  pongState.animationFrame = requestAnimationFrame(animatePongGame);

  if (pongCanvasWrap) {
    pongCanvasWrap.focus({ preventScroll: true });
  }
}

function finishPongMatch(result) {
  clearPongTimers();
  stopPongAnimation();
  pongState.mode = "settling";
  setPongStatus(result === "player" ? "You win" : "You lose");
  updatePongHud();
  renderPongGame();

  pongState.resultTimeout = window.setTimeout(() => {
    showPongResultPanel(result);
  }, 140);
}

function scorePongPoint(result) {
  if (result === "player") {
    pongState.playerScore += 1;
  } else {
    pongState.cpuScore += 1;
  }

  updatePongHud();

  if (pongState.playerScore >= pongState.targetScore) {
    finishPongMatch("player");
    return;
  }

  if (pongState.cpuScore >= pongState.targetScore) {
    finishPongMatch("cpu");
    return;
  }

  setPongStatus("Serve");
  resetPongRound(result === "player" ? -1 : 1);
}

function updatePongPlayer(deltaSeconds) {
  const preset = pongPresets[pongState.difficultyKey];
  const nextY = pongState.playerY + pongState.playerMove * preset.paddleSpeed * deltaSeconds;
  pongState.playerY = clampPongPaddle(nextY);
}

function updatePongCpu(deltaSeconds) {
  const preset = pongPresets[pongState.difficultyKey];
  const paddleCenter = pongState.cpuY + pongState.paddleHeight / 2;
  const targetY = pongState.ball.vx > 0 ? pongState.ball.y : pongState.height / 2;
  const delta = targetY - paddleCenter;
  const maxMove = preset.cpuSpeed * deltaSeconds;

  if (Math.abs(delta) <= maxMove) {
    pongState.cpuY = clampPongPaddle(pongState.cpuY + delta);
    return;
  }

  pongState.cpuY = clampPongPaddle(pongState.cpuY + Math.sign(delta) * maxMove);
}

function bounceOffPaddle(isPlayer) {
  const paddleY = isPlayer ? pongState.playerY : pongState.cpuY;
  const paddleCenter = paddleY + pongState.paddleHeight / 2;
  const offset = (pongState.ball.y - paddleCenter) / (pongState.paddleHeight / 2);
  const speed = Math.min(860, Math.hypot(pongState.ball.vx, pongState.ball.vy) * 1.04);

  pongState.ball.speed = speed;
  pongState.ball.vx = (isPlayer ? 1 : -1) * speed;
  pongState.ball.vy = speed * 0.72 * offset;
}

function updatePongBall(deltaSeconds) {
  if (performance.now() < pongState.serveDelayUntil) {
    return;
  }

  setPongStatus("Live");

  pongState.ball.x += pongState.ball.vx * deltaSeconds;
  pongState.ball.y += pongState.ball.vy * deltaSeconds;

  if (pongState.ball.y - pongState.ball.size <= 0) {
    pongState.ball.y = pongState.ball.size;
    pongState.ball.vy *= -1;
  }

  if (pongState.ball.y + pongState.ball.size >= pongState.height) {
    pongState.ball.y = pongState.height - pongState.ball.size;
    pongState.ball.vy *= -1;
  }

  const playerX = pongState.sideInset;
  const cpuX = pongState.width - pongState.sideInset - pongState.paddleWidth;

  const touchesPlayer = (
    pongState.ball.vx < 0 &&
    pongState.ball.x - pongState.ball.size <= playerX + pongState.paddleWidth &&
    pongState.ball.x - pongState.ball.size >= playerX &&
    pongState.ball.y >= pongState.playerY &&
    pongState.ball.y <= pongState.playerY + pongState.paddleHeight
  );

  const touchesCpu = (
    pongState.ball.vx > 0 &&
    pongState.ball.x + pongState.ball.size >= cpuX &&
    pongState.ball.x + pongState.ball.size <= cpuX + pongState.paddleWidth &&
    pongState.ball.y >= pongState.cpuY &&
    pongState.ball.y <= pongState.cpuY + pongState.paddleHeight
  );

  if (touchesPlayer) {
    pongState.ball.x = playerX + pongState.paddleWidth + pongState.ball.size;
    bounceOffPaddle(true);
  }

  if (touchesCpu) {
    pongState.ball.x = cpuX - pongState.ball.size;
    bounceOffPaddle(false);
  }

  if (pongState.ball.x + pongState.ball.size < 0) {
    scorePongPoint("cpu");
    return;
  }

  if (pongState.ball.x - pongState.ball.size > pongState.width) {
    scorePongPoint("player");
  }
}

function renderPongGame() {
  if (!pongState.context || !pongCanvas) {
    return;
  }

  const ctx = pongState.context;
  const width = pongState.width;
  const height = pongState.height;
  const playerX = pongState.sideInset;
  const cpuX = width - pongState.sideInset - pongState.paddleWidth;

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(8, 8, 8, 0.98)");
  background.addColorStop(1, "rgba(2, 2, 2, 0.98)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(width * 0.72, height * 0.18, 0, width * 0.72, height * 0.18, width * 0.42);
  halo.addColorStop(0, "rgba(255, 212, 0, 0.16)");
  halo.addColorStop(1, "rgba(255, 212, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 212, 0, 0.08)";
  ctx.lineWidth = Math.max(1, 2 * pongState.boardScale);
  ctx.setLineDash([
    Math.max(5, Math.round(10 * pongState.boardScale)),
    Math.max(9, Math.round(18 * pongState.boardScale))
  ]);
  ctx.beginPath();
  ctx.moveTo(width / 2, pongState.centerLineInset);
  ctx.lineTo(width / 2, height - pongState.centerLineInset);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 212, 0, 0.92)";
  ctx.fillRect(playerX, pongState.playerY, pongState.paddleWidth, pongState.paddleHeight);

  ctx.fillStyle = "rgba(255, 240, 109, 0.82)";
  ctx.fillRect(cpuX, pongState.cpuY, pongState.paddleWidth, pongState.paddleHeight);

  ctx.fillStyle = "rgba(255, 240, 109, 0.96)";
  ctx.beginPath();
  ctx.arc(pongState.ball.x, pongState.ball.y, pongState.ball.size, 0, Math.PI * 2);
  ctx.fill();
}

function animatePongGame(now) {
  if (pongState.mode !== "playing") {
    return;
  }

  if (!pongState.lastFrameAt) {
    pongState.lastFrameAt = now;
  }

  const deltaSeconds = Math.min((now - pongState.lastFrameAt) / 1000, 0.03);
  pongState.lastFrameAt = now;

  updatePongPlayer(deltaSeconds);
  updatePongCpu(deltaSeconds);
  updatePongBall(deltaSeconds);
  renderPongGame();

  if (pongState.mode === "playing") {
    pongState.animationFrame = requestAnimationFrame(animatePongGame);
  }
}

function restartPongGame() {
  beginPongMatch(pongState.difficultyKey, true);
}

function syncPongPlayerMove() {
  const move = (pongState.moveDown ? 1 : 0) - (pongState.moveUp ? 1 : 0);
  pongState.playerMove = move;
}

function handlePongKeydown(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    pongState.moveUp = true;
    syncPongPlayerMove();
    return;
  }

  if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    pongState.moveDown = true;
    syncPongPlayerMove();
    return;
  }

  if ((key === "enter" || key === " ") && pongState.mode !== "playing") {
    event.preventDefault();
    restartPongGame();
  }
}

function handlePongKeyup(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    pongState.moveUp = false;
    syncPongPlayerMove();
    return;
  }

  if (key === "arrowdown" || key === "s") {
    pongState.moveDown = false;
    syncPongPlayerMove();
  }
}

function movePaddleToClientY(clientY) {
  if (!pongCanvasWrap) {
    return;
  }

  const rect = pongCanvasWrap.getBoundingClientRect();
  const nextY = clientY - rect.top - pongState.paddleHeight / 2;
  pongState.playerY = clampPongPaddle(nextY);
}

function handlePongMouseMove(event) {
  if (pongState.mode !== "playing") {
    return;
  }

  movePaddleToClientY(event.clientY);
}

function handlePongTouchMove(event) {
  if (pongState.mode !== "playing") {
    return;
  }

  const touch = event.changedTouches[0];
  if (!touch) {
    return;
  }

  event.preventDefault();
  movePaddleToClientY(touch.clientY);
}

function initPong() {
  updatePongHud();
  measurePongBoard();
  pongState.moveUp = false;
  pongState.moveDown = false;
  showPongIntroPanel();

  pongDifficultyOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const difficultyKey = button.dataset.pongDifficulty;
      if (!difficultyKey) {
        return;
      }

      beginPongMatch(difficultyKey, true);
    });
  });

  pongRestartButton.addEventListener("click", restartPongGame);
  pongPlayAgainButton.addEventListener("click", () => beginPongMatch(pongState.difficultyKey, true));
  pongDifficultyButton.addEventListener("click", () => {
    pongState.playerScore = 0;
    pongState.cpuScore = 0;
    clearPongTimers();
    stopPongAnimation();
    showPongIntroPanel();
  });

  document.addEventListener("keydown", handlePongKeydown);
  document.addEventListener("keyup", handlePongKeyup);

  if (pongCanvasWrap) {
    pongCanvasWrap.addEventListener("mousemove", handlePongMouseMove);
    pongCanvasWrap.addEventListener("touchmove", handlePongTouchMove, { passive: false });
  }

  window.addEventListener("resize", () => {
    measurePongBoard();
    renderPongGame();
  });
}

initPong();

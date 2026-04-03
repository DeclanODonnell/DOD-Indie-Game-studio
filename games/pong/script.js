const pongCanvasWrap = document.querySelector("#pongCanvasWrap");
const pongCanvas = document.querySelector("#pongCanvas");
const pongStatus = document.querySelector("#pong-status");
const pongDifficulty = document.querySelector("#pong-difficulty");
const pongScore = document.querySelector("#pong-score");
const pongRestartButton = document.querySelector("#pong-restart-button");
const pongIntroPanel = document.querySelector("#pongIntroPanel");
const pongCountdownPanel = document.querySelector("#pongCountdownPanel");
const pongCountdownValue = document.querySelector("#pongCountdownValue");
const pongResultPanel = document.querySelector("#pongResultPanel");
const pongResultTitle = document.querySelector("#pong-result-title");
const pongResultCopy = document.querySelector("#pong-result-copy");
const pongPlayAgainButton = document.querySelector("#pong-play-again-button");
const pongDifficultyButton = document.querySelector("#pong-difficulty-button");
const pongDifficultyOptions = Array.from(document.querySelectorAll("[data-pong-difficulty]"));

const pongPresets = {
  rookie: {
    label: "Rookie",
    cpuSpeed: 300,
    paddleSpeed: 540,
    ballSpeed: 330,
    paddleHeight: 124,
    reactionDelay: 240,
    prediction: 0.18,
    aimError: 120,
    deadZone: 18
  },
  standard: {
    label: "Standard",
    cpuSpeed: 470,
    paddleSpeed: 580,
    ballSpeed: 410,
    paddleHeight: 106,
    reactionDelay: 110,
    prediction: 0.58,
    aimError: 42,
    deadZone: 10
  },
  expert: {
    label: "Expert",
    cpuSpeed: 720,
    paddleSpeed: 620,
    ballSpeed: 500,
    paddleHeight: 92,
    reactionDelay: 36,
    prediction: 0.96,
    aimError: 8,
    deadZone: 4
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
  cpuTargetY: 0,
  cpuDecisionAt: 0,
  playerMove: 0,
  serveDelayUntil: 0,
  animationFrame: null,
  resultTimeout: null,
  countdownTimer: null,
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

  if (pongState.countdownTimer) {
    window.clearTimeout(pongState.countdownTimer);
    pongState.countdownTimer = null;
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
  hidePongPanel(pongCountdownPanel);
  hidePongPanel(pongResultPanel);
  showPongPanel(pongIntroPanel);
  setPongStatus("Choose difficulty");
  updatePongHud();
  renderPongGame();
}

function showPongResultPanel(result) {
  pongState.mode = "result";
  hidePongPanel(pongCountdownPanel);
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
  pongState.cpuTargetY = pongState.cpuY;
  pongState.cpuDecisionAt = 0;
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
  hidePongPanel(pongCountdownPanel);
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
  updatePongHud();
  renderPongGame();

  if (pongCanvasWrap) {
    pongCanvasWrap.focus({ preventScroll: true });
  }

  startPongCountdown();
}

function startPongCountdown(step = 3) {
  pongState.mode = "countdown";

  if (!pongCountdownPanel || !pongCountdownValue) {
    pongState.mode = "playing";
    setPongStatus("Live");
    updatePongHud();
    renderPongGame();
    pongState.animationFrame = requestAnimationFrame(animatePongGame);
    return;
  }

  pongCountdownValue.textContent = String(step);
  pongCountdownValue.dataset.text = String(step);
  setPongStatus(`Starting in ${step}`);
  showPongPanel(pongCountdownPanel);

  pongState.countdownTimer = window.setTimeout(() => {
    if (step > 1) {
      startPongCountdown(step - 1);
      return;
    }

    hidePongPanel(pongCountdownPanel);
    pongState.countdownTimer = null;
    pongState.mode = "playing";
    setPongStatus("Live");
    updatePongHud();
    renderPongGame();
    pongState.animationFrame = requestAnimationFrame(animatePongGame);
  }, 760);
}

function finishPongMatch(result) {
  clearPongTimers();
  stopPongAnimation();
  pongState.mode = "settling";
  hidePongPanel(pongCountdownPanel);
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

  resetPongRound(result === "player" ? -1 : 1);
  startPongCountdown();
}

function updatePongPlayer(deltaSeconds) {
  const preset = pongPresets[pongState.difficultyKey];
  const nextY = pongState.playerY + pongState.playerMove * preset.paddleSpeed * deltaSeconds;
  pongState.playerY = clampPongPaddle(nextY);
}

function predictPongBounceY(startY, velocityY, travelSeconds) {
  if (travelSeconds <= 0) {
    return startY;
  }

  let projectedY = startY + velocityY * travelSeconds;
  const minY = pongState.ball.size;
  const maxY = pongState.height - pongState.ball.size;
  const span = maxY - minY;

  if (span <= 0) {
    return startY;
  }

  while (projectedY < minY || projectedY > maxY) {
    if (projectedY < minY) {
      projectedY = minY + (minY - projectedY);
    } else if (projectedY > maxY) {
      projectedY = maxY - (projectedY - maxY);
    }
  }

  return projectedY;
}

function updatePongCpu(deltaSeconds) {
  const preset = pongPresets[pongState.difficultyKey];
  const now = performance.now();
  const paddleCenter = pongState.cpuY + pongState.paddleHeight / 2;
  const cpuFrontX = pongState.width - pongState.sideInset - pongState.paddleWidth;

  if (now >= pongState.cpuDecisionAt) {
    let targetCenter = pongState.height / 2;

    if (pongState.ball.vx > 0) {
      const distanceToCpu = Math.max(0, cpuFrontX - pongState.ball.x);
      const travelSeconds = distanceToCpu / Math.max(1, pongState.ball.vx);
      const predictedY = predictPongBounceY(pongState.ball.y, pongState.ball.vy, travelSeconds);
      const blendedY = pongState.ball.y + (predictedY - pongState.ball.y) * preset.prediction;
      const error = (Math.random() * 2 - 1) * preset.aimError;
      targetCenter = blendedY + error;
    }

    pongState.cpuTargetY = clampPongPaddle(targetCenter - pongState.paddleHeight / 2);
    pongState.cpuDecisionAt = now + preset.reactionDelay;
  }

  const targetCenter = pongState.cpuTargetY + pongState.paddleHeight / 2;
  const delta = targetCenter - paddleCenter;
  const maxMove = preset.cpuSpeed * deltaSeconds;

  if (Math.abs(delta) <= preset.deadZone) {
    return;
  }

  if (Math.abs(delta) <= maxMove) {
    pongState.cpuY = clampPongPaddle(pongState.cpuY + delta);
    return;
  }

  pongState.cpuY = clampPongPaddle(pongState.cpuY + Math.sign(delta) * maxMove);
}

function bounceOffPaddle(isPlayer, contactY = pongState.ball.y) {
  const paddleY = isPlayer ? pongState.playerY : pongState.cpuY;
  const paddleCenter = paddleY + pongState.paddleHeight / 2;
  const offset = Math.max(-1, Math.min(1, (contactY - paddleCenter) / (pongState.paddleHeight / 2)));
  const speed = Math.min(860, Math.hypot(pongState.ball.vx, pongState.ball.vy) * 1.04);

  pongState.ball.speed = speed;
  pongState.ball.vx = (isPlayer ? 1 : -1) * speed;
  pongState.ball.vy = speed * 0.72 * offset;
}

function resolvePongPaddleCollision(previousX, previousY) {
  const playerX = pongState.sideInset;
  const cpuX = pongState.width - pongState.sideInset - pongState.paddleWidth;
  const previousLeft = previousX - pongState.ball.size;
  const currentLeft = pongState.ball.x - pongState.ball.size;
  const previousRight = previousX + pongState.ball.size;
  const currentRight = pongState.ball.x + pongState.ball.size;

  if (pongState.ball.vx < 0 && previousLeft >= playerX + pongState.paddleWidth && currentLeft <= playerX + pongState.paddleWidth) {
    const travel = currentLeft - previousLeft;
    const ratio = travel === 0 ? 1 : (playerX + pongState.paddleWidth - previousLeft) / travel;
    const impactY = previousY + (pongState.ball.y - previousY) * ratio;
    const overlapsPaddle = impactY + pongState.ball.size >= pongState.playerY && impactY - pongState.ball.size <= pongState.playerY + pongState.paddleHeight;

    if (overlapsPaddle) {
      pongState.ball.x = playerX + pongState.paddleWidth + pongState.ball.size;
      pongState.ball.y = impactY;
      bounceOffPaddle(true, impactY);
      return true;
    }
  }

  if (pongState.ball.vx > 0 && previousRight <= cpuX && currentRight >= cpuX) {
    const travel = currentRight - previousRight;
    const ratio = travel === 0 ? 1 : (cpuX - previousRight) / travel;
    const impactY = previousY + (pongState.ball.y - previousY) * ratio;
    const overlapsPaddle = impactY + pongState.ball.size >= pongState.cpuY && impactY - pongState.ball.size <= pongState.cpuY + pongState.paddleHeight;

    if (overlapsPaddle) {
      pongState.ball.x = cpuX - pongState.ball.size;
      pongState.ball.y = impactY;
      bounceOffPaddle(false, impactY);
      return true;
    }
  }

  return false;
}

function updatePongBall(deltaSeconds) {
  if (performance.now() < pongState.serveDelayUntil) {
    return;
  }

  setPongStatus("Live");

  const previousX = pongState.ball.x;
  const previousY = pongState.ball.y;
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

  resolvePongPaddleCollision(previousX, previousY);

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

  window.addEventListener("blur", () => {
    pongState.moveUp = false;
    pongState.moveDown = false;
    syncPongPlayerMove();
  });
}

initPong();

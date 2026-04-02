const snakeCanvasWrap = document.querySelector("#snakeCanvasWrap");
const snakeCanvas = document.querySelector("#snakeCanvas");
const snakeStatus = document.querySelector("#snake-status");
const snakeScore = document.querySelector("#snake-score");
const snakeBest = document.querySelector("#snake-best");
const snakeRestartButton = document.querySelector("#snake-restart-button");
const snakeIntroPanel = document.querySelector("#snakeIntroPanel");
const snakeResultPanel = document.querySelector("#snakeResultPanel");
const snakeResultTitle = document.querySelector("#snake-result-title");
const snakeResultCopy = document.querySelector("#snake-result-copy");
const snakePlayAgainButton = document.querySelector("#snake-play-again-button");
const snakeSpeedButton = document.querySelector("#snake-speed-button");
const snakeSpeedOptions = Array.from(document.querySelectorAll("[data-snake-speed]"));

const snakeDirectionMap = {
  up: { x: 0, y: -1, name: "up" },
  down: { x: 0, y: 1, name: "down" },
  left: { x: -1, y: 0, name: "left" },
  right: { x: 1, y: 0, name: "right" }
};

const snakePresets = {
  calm: { label: "Calm", interval: 145 },
  standard: { label: "Standard", interval: 110 },
  rush: { label: "Rush", interval: 82 }
};

const snakeBestStorageKey = "dod_snake_best";

const snakeState = {
  mode: "menu",
  speedKey: "standard",
  boardSize: 22,
  snake: [],
  direction: snakeDirectionMap.right,
  queuedDirection: null,
  food: null,
  score: 0,
  best: 0,
  width: 0,
  height: 0,
  cell: 0,
  offsetX: 0,
  offsetY: 0,
  lastStepAt: 0,
  animationFrame: null,
  resultTimeout: null,
  swipeStart: null,
  context: snakeCanvas ? snakeCanvas.getContext("2d") : null
};

function loadBestScore() {
  try {
    const raw = window.localStorage.getItem(snakeBestStorageKey);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch (error) {
    return 0;
  }
}

function saveBestScore() {
  try {
    window.localStorage.setItem(snakeBestStorageKey, String(snakeState.best));
  } catch (error) {
    // Ignore storage failures.
  }
}

function setSnakeStatus(text) {
  snakeStatus.textContent = text;
}

function syncSnakeSpeedButtons() {
  snakeSpeedOptions.forEach((button) => {
    const selected = button.dataset.snakeSpeed === snakeState.speedKey;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function updateSnakeRestartButton() {
  if (snakeState.mode === "menu") {
    snakeRestartButton.textContent = "Start";
  } else if (snakeState.mode === "result") {
    snakeRestartButton.textContent = "Play Again";
  } else {
    snakeRestartButton.textContent = "Restart";
  }
}

function updateSnakeHud() {
  snakeScore.textContent = String(snakeState.score);
  snakeBest.textContent = String(snakeState.best);
  updateSnakeRestartButton();
  syncSnakeSpeedButtons();
}

function clearSnakeTimers() {
  if (snakeState.resultTimeout) {
    window.clearTimeout(snakeState.resultTimeout);
    snakeState.resultTimeout = null;
  }
}

function stopSnakeAnimation() {
  if (snakeState.animationFrame) {
    cancelAnimationFrame(snakeState.animationFrame);
    snakeState.animationFrame = null;
  }
}

function showSnakePanel(panel) {
  panel.hidden = false;
}

function hideSnakePanel(panel) {
  panel.hidden = true;
}

function showSnakeIntroPanel() {
  snakeState.mode = "menu";
  hideSnakePanel(snakeResultPanel);
  showSnakePanel(snakeIntroPanel);
  setSnakeStatus("Choose speed");
  updateSnakeHud();
  renderSnakeGame();
}

function showSnakeResultPanel(reason) {
  snakeState.mode = "result";
  hideSnakePanel(snakeIntroPanel);
  showSnakePanel(snakeResultPanel);

  if (reason === "clear") {
    snakeResultTitle.textContent = "Board Cleared";
    snakeResultCopy.textContent = `You filled the grid with a score of ${snakeState.score}.`;
  } else if (reason === "self") {
    snakeResultTitle.textContent = "Game Over";
    snakeResultCopy.textContent = `You ran into yourself. Final score: ${snakeState.score}.`;
  } else {
    snakeResultTitle.textContent = "Game Over";
    snakeResultCopy.textContent = `You hit the wall. Final score: ${snakeState.score}.`;
  }

  updateSnakeHud();
}

function measureSnakeBoard() {
  if (!snakeCanvasWrap || !snakeCanvas || !snakeState.context) {
    return;
  }

  const rect = snakeCanvasWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  snakeCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
  snakeCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
  snakeCanvas.style.width = `${rect.width}px`;
  snakeCanvas.style.height = `${rect.height}px`;
  snakeState.context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const size = Math.min(rect.width, rect.height);
  const padding = 20;
  const cell = Math.floor((size - padding * 2) / snakeState.boardSize);
  const boardPixels = cell * snakeState.boardSize;

  snakeState.width = rect.width;
  snakeState.height = rect.height;
  snakeState.cell = cell;
  snakeState.offsetX = Math.floor((rect.width - boardPixels) / 2);
  snakeState.offsetY = Math.floor((rect.height - boardPixels) / 2);
}

function createStartingSnake() {
  const center = Math.floor(snakeState.boardSize / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
    { x: center - 3, y: center }
  ];
}

function spawnFood() {
  const occupied = new Set(snakeState.snake.map((segment) => `${segment.x}:${segment.y}`));
  const available = [];

  for (let x = 0; x < snakeState.boardSize; x += 1) {
    for (let y = 0; y < snakeState.boardSize; y += 1) {
      const key = `${x}:${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

function resetSnakeGame() {
  measureSnakeBoard();
  snakeState.score = 0;
  snakeState.direction = snakeDirectionMap.right;
  snakeState.queuedDirection = null;
  snakeState.snake = createStartingSnake();
  snakeState.food = spawnFood();
  snakeState.lastStepAt = 0;
  snakeState.mode = "playing";
  setSnakeStatus("Live");
  updateSnakeHud();
}

function setSnakeSpeed(key) {
  if (!snakePresets[key]) {
    return;
  }

  snakeState.speedKey = key;
  updateSnakeHud();
}

function queueSnakeTurn(name) {
  if (snakeState.mode !== "playing") {
    return;
  }

  const direction = snakeDirectionMap[name];
  if (!direction) {
    return;
  }

  const reference = snakeState.queuedDirection || snakeState.direction;
  if (direction === reference || (direction.x === -reference.x && direction.y === -reference.y)) {
    return;
  }

  snakeState.queuedDirection = direction;
}

function beginSnakeGame(key = snakeState.speedKey) {
  setSnakeSpeed(key);
  clearSnakeTimers();
  stopSnakeAnimation();
  hideSnakePanel(snakeIntroPanel);
  hideSnakePanel(snakeResultPanel);
  resetSnakeGame();
  renderSnakeGame();
  snakeState.animationFrame = requestAnimationFrame(animateSnakeGame);

  if (snakeCanvasWrap) {
    snakeCanvasWrap.focus({ preventScroll: true });
  }
}

function finishSnakeGame(reason) {
  clearSnakeTimers();
  stopSnakeAnimation();
  snakeState.mode = "settling";

  if (snakeState.score > snakeState.best) {
    snakeState.best = snakeState.score;
    saveBestScore();
  }

  if (reason === "clear") {
    setSnakeStatus("Cleared");
  } else {
    setSnakeStatus("Game over");
  }

  updateSnakeHud();
  renderSnakeGame();

  snakeState.resultTimeout = window.setTimeout(() => {
    showSnakeResultPanel(reason);
  }, 100);
}

function stepSnakeGame() {
  if (!snakeState.food) {
    finishSnakeGame("clear");
    return;
  }

  if (snakeState.queuedDirection) {
    snakeState.direction = snakeState.queuedDirection;
    snakeState.queuedDirection = null;
  }

  const head = snakeState.snake[0];
  const nextHead = {
    x: head.x + snakeState.direction.x,
    y: head.y + snakeState.direction.y
  };

  const hitsWall = (
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= snakeState.boardSize ||
    nextHead.y >= snakeState.boardSize
  );

  if (hitsWall) {
    finishSnakeGame("wall");
    return;
  }

  const grows = snakeState.food && nextHead.x === snakeState.food.x && nextHead.y === snakeState.food.y;
  const bodyToCheck = grows ? snakeState.snake : snakeState.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitsSelf) {
    finishSnakeGame("self");
    return;
  }

  snakeState.snake.unshift(nextHead);

  if (grows) {
    snakeState.score += 1;
    if (snakeState.score > snakeState.best) {
      snakeState.best = snakeState.score;
      saveBestScore();
    }
    snakeState.food = spawnFood();
    updateSnakeHud();

    if (!snakeState.food) {
      finishSnakeGame("clear");
      return;
    }
  } else {
    snakeState.snake.pop();
  }
}

function drawSnakeCell(ctx, x, y, inset, color) {
  const size = snakeState.cell - inset * 2;
  const left = snakeState.offsetX + x * snakeState.cell + inset;
  const top = snakeState.offsetY + y * snakeState.cell + inset;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(left, top, size, size, Math.max(size * 0.2, 3));
  ctx.fill();
}

function renderSnakeGame() {
  if (!snakeState.context || !snakeCanvas) {
    return;
  }

  const ctx = snakeState.context;
  const width = snakeState.width;
  const height = snakeState.height;
  const boardPixels = snakeState.cell * snakeState.boardSize;

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(8, 8, 8, 0.98)");
  background.addColorStop(1, "rgba(2, 2, 2, 0.98)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(width * 0.7, height * 0.18, 0, width * 0.7, height * 0.18, width * 0.4);
  halo.addColorStop(0, "rgba(255, 212, 0, 0.16)");
  halo.addColorStop(1, "rgba(255, 212, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  const left = snakeState.offsetX;
  const top = snakeState.offsetY;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 212, 0, 0.14)";
  ctx.strokeRect(left + 0.5, top + 0.5, boardPixels, boardPixels);

  ctx.strokeStyle = "rgba(255, 212, 0, 0.06)";
  for (let index = 1; index < snakeState.boardSize; index += 1) {
    const x = left + index * snakeState.cell + 0.5;
    const y = top + index * snakeState.cell + 0.5;

    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + boardPixels);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + boardPixels, y);
    ctx.stroke();
  }
  ctx.restore();

  if (snakeState.food) {
    drawSnakeCell(ctx, snakeState.food.x, snakeState.food.y, snakeState.cell * 0.24, "rgba(255, 240, 109, 0.96)");
  }

  snakeState.snake.forEach((segment, index) => {
    const color = index === 0 ? "rgba(255, 212, 0, 0.98)" : "rgba(255, 212, 0, 0.72)";
    const inset = index === 0 ? snakeState.cell * 0.14 : snakeState.cell * 0.18;
    drawSnakeCell(ctx, segment.x, segment.y, inset, color);
  });
}

function animateSnakeGame(now) {
  if (snakeState.mode !== "playing") {
    return;
  }

  if (!snakeState.lastStepAt) {
    snakeState.lastStepAt = now;
  }

  const interval = snakePresets[snakeState.speedKey].interval;
  let elapsed = now - snakeState.lastStepAt;

  while (elapsed >= interval && snakeState.mode === "playing") {
    snakeState.lastStepAt += interval;
    stepSnakeGame();
    elapsed = now - snakeState.lastStepAt;
  }

  renderSnakeGame();

  if (snakeState.mode === "playing") {
    snakeState.animationFrame = requestAnimationFrame(animateSnakeGame);
  }
}

function restartSnakeGame() {
  if (snakeState.mode === "menu") {
    beginSnakeGame(snakeState.speedKey);
    return;
  }

  beginSnakeGame(snakeState.speedKey);
}

function handleSnakeKeydown(event) {
  const key = event.key.toLowerCase();

  if (snakeState.mode === "playing" && (key === "arrowup" || key === "w")) {
    event.preventDefault();
    queueSnakeTurn("up");
    return;
  }

  if (snakeState.mode === "playing" && (key === "arrowdown" || key === "s")) {
    event.preventDefault();
    queueSnakeTurn("down");
    return;
  }

  if (snakeState.mode === "playing" && (key === "arrowleft" || key === "a")) {
    event.preventDefault();
    queueSnakeTurn("left");
    return;
  }

  if (snakeState.mode === "playing" && (key === "arrowright" || key === "d")) {
    event.preventDefault();
    queueSnakeTurn("right");
    return;
  }

  if ((key === "enter" || key === " ") && snakeState.mode !== "playing") {
    event.preventDefault();
    restartSnakeGame();
  }
}

function handleSnakeTouchStart(event) {
  if (snakeState.mode !== "playing") {
    return;
  }

  const touch = event.changedTouches[0];
  snakeState.swipeStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function handleSnakeTouchEnd(event) {
  if (snakeState.mode !== "playing" || !snakeState.swipeStart) {
    return;
  }

  const touch = event.changedTouches[0];
  if (!touch) {
    snakeState.swipeStart = null;
    return;
  }

  const deltaX = touch.clientX - snakeState.swipeStart.x;
  const deltaY = touch.clientY - snakeState.swipeStart.y;
  snakeState.swipeStart = null;

  if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    queueSnakeTurn(deltaX > 0 ? "right" : "left");
  } else {
    queueSnakeTurn(deltaY > 0 ? "down" : "up");
  }
}

function initSnake() {
  snakeState.best = loadBestScore();
  updateSnakeHud();
  measureSnakeBoard();
  showSnakeIntroPanel();

  snakeSpeedOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const speedKey = button.dataset.snakeSpeed;
      if (!speedKey) {
        return;
      }

      beginSnakeGame(speedKey);
    });
  });

  snakeRestartButton.addEventListener("click", restartSnakeGame);
  snakePlayAgainButton.addEventListener("click", () => beginSnakeGame(snakeState.speedKey));
  snakeSpeedButton.addEventListener("click", () => {
    clearSnakeTimers();
    stopSnakeAnimation();
    showSnakeIntroPanel();
  });

  document.addEventListener("keydown", handleSnakeKeydown);

  if (snakeCanvasWrap) {
    snakeCanvasWrap.addEventListener("touchstart", handleSnakeTouchStart, { passive: true });
    snakeCanvasWrap.addEventListener("touchend", handleSnakeTouchEnd, { passive: true });
  }

  window.addEventListener("resize", () => {
    measureSnakeBoard();
    renderSnakeGame();
  });
}

initSnake();

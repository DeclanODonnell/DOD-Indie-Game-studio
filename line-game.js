const lineCanvasWrap = document.querySelector("#lineCanvasWrap");
const lineCanvas = document.querySelector("#lineCanvas");
const lineStatus = document.querySelector("#line-status");
const lineDifficulty = document.querySelector("#line-difficulty");
const lineScore = document.querySelector("#line-score");
const lineRestartButton = document.querySelector("#line-restart-button");
const lineIntroPanel = document.querySelector("#lineIntroPanel");
const lineResultPanel = document.querySelector("#lineResultPanel");
const lineResultEyebrow = document.querySelector("#line-result-eyebrow");
const lineResultTitle = document.querySelector("#line-result-title");
const lineResultCopy = document.querySelector("#line-result-copy");
const linePlayAgainButton = document.querySelector("#line-play-again-button");
const lineDifficultyButton = document.querySelector("#line-difficulty-button");
const lineDifficultyOptions = Array.from(document.querySelectorAll("[data-line-difficulty]"));

const directionMap = {
  up: { x: 0, y: -1, name: "up" },
  down: { x: 0, y: 1, name: "down" },
  left: { x: -1, y: 0, name: "left" },
  right: { x: 1, y: 0, name: "right" }
};

const presets = {
  rookie: {
    label: "Rookie",
    tickInterval: 116,
    botRandomness: 0.34,
    openWeight: 5.2,
    areaWeight: 0.014,
    wallWeight: 1.05,
    pursuitWeight: 0.03,
    stabilityBonus: 0.8,
    deadEndPenalty: 4,
    headOnPenalty: 8,
    lookAheadDepth: 0
  },
  standard: {
    label: "Standard",
    tickInterval: 94,
    botRandomness: 0.12,
    openWeight: 6.1,
    areaWeight: 0.028,
    wallWeight: 1.35,
    pursuitWeight: 0.07,
    stabilityBonus: 1.2,
    deadEndPenalty: 8,
    headOnPenalty: 18,
    lookAheadDepth: 1
  },
  expert: {
    label: "Expert",
    tickInterval: 78,
    botRandomness: 0.02,
    openWeight: 7.1,
    areaWeight: 0.04,
    wallWeight: 1.6,
    pursuitWeight: 0.12,
    stabilityBonus: 1.6,
    deadEndPenalty: 12,
    headOnPenalty: 28,
    lookAheadDepth: 2
  }
};

const state = {
  mode: "menu",
  difficultyKey: "standard",
  playerWins: 0,
  botWins: 0,
  board: { width: 0, height: 0, cols: 0, rows: 0, cell: 0, offsetX: 0, offsetY: 0 },
  player: null,
  bot: null,
  occupied: new Set(),
  lastStepAt: 0,
  animationFrame: null,
  resultTimeout: null,
  swipeStart: null,
  context: lineCanvas ? lineCanvas.getContext("2d") : null
};

function cellKey(x, y) {
  return `${x}:${y}`;
}

function sameCell(first, second) {
  return Boolean(first && second && first.x === second.x && first.y === second.y);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function rotateLeft(direction) {
  if (direction === directionMap.up) return directionMap.left;
  if (direction === directionMap.left) return directionMap.down;
  if (direction === directionMap.down) return directionMap.right;
  return directionMap.up;
}

function rotateRight(direction) {
  if (direction === directionMap.up) return directionMap.right;
  if (direction === directionMap.right) return directionMap.down;
  if (direction === directionMap.down) return directionMap.left;
  return directionMap.up;
}

function isOppositeDirection(first, second) {
  return Boolean(first && second && first.x === -second.x && first.y === -second.y);
}

function getPreset() {
  return presets[state.difficultyKey] || presets.standard;
}

function setStatus(text) {
  lineStatus.textContent = text;
}

function syncDifficultyButtons() {
  lineDifficultyOptions.forEach((button) => {
    const selected = button.dataset.lineDifficulty === state.difficultyKey;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function updateRestartButton() {
  if (state.mode === "menu") {
    lineRestartButton.textContent = "Start";
  } else if (state.mode === "result") {
    lineRestartButton.textContent = "Play Again";
  } else {
    lineRestartButton.textContent = "Restart";
  }
}

function updateHud() {
  lineDifficulty.textContent = getPreset().label;
  lineScore.textContent = `${state.playerWins} - ${state.botWins}`;
  updateRestartButton();
  syncDifficultyButtons();
}

function clearTimers() {
  if (state.resultTimeout) {
    window.clearTimeout(state.resultTimeout);
    state.resultTimeout = null;
  }
}

function stopAnimation() {
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
}

function showPanel(panel) {
  panel.hidden = false;
}

function hidePanel(panel) {
  panel.hidden = true;
}

function showIntroPanel() {
  state.mode = "menu";
  hidePanel(lineResultPanel);
  showPanel(lineIntroPanel);
  setStatus("Select difficulty");
  updateHud();
  renderGame(1);
}

function showResultPanel(result) {
  state.mode = "result";
  hidePanel(lineIntroPanel);
  showPanel(lineResultPanel);

  if (result === "player") {
    lineResultEyebrow.textContent = "Round complete";
    lineResultTitle.textContent = "You Win";
    lineResultCopy.textContent = "The yellow line held firm and the blue CPU wiped out first.";
  } else if (result === "bot") {
    lineResultEyebrow.textContent = "Round complete";
    lineResultTitle.textContent = "You Lose";
    lineResultCopy.textContent = "The blue CPU closed the space first.";
  } else {
    lineResultEyebrow.textContent = "Round complete";
    lineResultTitle.textContent = "Tie";
    lineResultCopy.textContent = "Head-on collision. Both lines hit at the same moment.";
  }

  updateHud();
}

function measureBoard() {
  if (!lineCanvasWrap || !lineCanvas || !state.context) {
    return;
  }

  const rect = lineCanvasWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  lineCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
  lineCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
  lineCanvas.style.width = `${rect.width}px`;
  lineCanvas.style.height = `${rect.height}px`;
  state.context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cell = Math.max(window.innerWidth < 640 ? 10 : 12, Math.floor(Math.min(rect.width / 34, rect.height / 44)));
  const cols = Math.max(24, Math.floor(rect.width / cell));
  const rows = Math.max(28, Math.floor(rect.height / cell));

  state.board = {
    width: rect.width,
    height: rect.height,
    cols,
    rows,
    cell,
    offsetX: Math.floor((rect.width - cols * cell) / 2),
    offsetY: Math.floor((rect.height - rows * cell) / 2)
  };
}

function createCycle(type) {
  const { cols, rows } = state.board;
  const isPlayer = type === "player";
  const x = isPlayer ? Math.floor(cols * 0.22) : Math.floor(cols * 0.78);
  const y = Math.floor(rows * 0.5);
  const direction = isPlayer ? directionMap.right : directionMap.left;

  return {
    type,
    x,
    y,
    prevX: x,
    prevY: y,
    direction,
    turnQueue: [],
    color: isPlayer ? "#ffe600" : "#32caff",
    glow: isPlayer ? "rgba(255, 230, 0, 0.42)" : "rgba(50, 202, 255, 0.4)",
    trail: [{ x, y }]
  };
}

function prepareBackdrop() {
  measureBoard();
  state.player = null;
  state.bot = null;
  state.occupied = new Set();
  state.lastStepAt = 0;
  renderGame(1);
}

function resetBoard(resetScore = false) {
  measureBoard();

  if (resetScore) {
    state.playerWins = 0;
    state.botWins = 0;
  }

  state.player = createCycle("player");
  state.bot = createCycle("bot");
  state.occupied = new Set([
    cellKey(state.player.x, state.player.y),
    cellKey(state.bot.x, state.bot.y)
  ]);
  state.lastStepAt = 0;
  state.mode = "playing";
  setStatus("Grid live");
  updateHud();
}

function getNextPosition(cycle, direction = cycle.direction) {
  return {
    x: cycle.x + direction.x,
    y: cycle.y + direction.y
  };
}

function isBlocked(position, blockedSet = state.occupied) {
  const { cols, rows } = state.board;

  if (position.x < 0 || position.y < 0 || position.x >= cols || position.y >= rows) {
    return true;
  }

  return blockedSet.has(cellKey(position.x, position.y));
}

function getDirectionOptions(direction) {
  return [direction, rotateLeft(direction), rotateRight(direction)];
}

function countOpenDirections(position, direction, blockedSet) {
  return getDirectionOptions(direction).reduce((total, candidateDirection) => {
    const next = {
      x: position.x + candidateDirection.x,
      y: position.y + candidateDirection.y
    };

    return total + (isBlocked(next, blockedSet) ? 0 : 1);
  }, 0);
}

function measureReachableArea(start, blockedSet) {
  if (isBlocked(start, blockedSet)) {
    return 0;
  }

  const visited = new Set();
  const queue = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const key = cellKey(current.x, current.y);

    if (visited.has(key) || blockedSet.has(key)) {
      continue;
    }

    visited.add(key);

    [directionMap.up, directionMap.right, directionMap.down, directionMap.left].forEach((direction) => {
      const next = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };

      if (!isBlocked(next, blockedSet) && !visited.has(cellKey(next.x, next.y))) {
        queue.push(next);
      }
    });
  }

  return visited.size;
}

function scoreRoute(position, direction, blockedSet, depth, preset) {
  const next = {
    x: position.x + direction.x,
    y: position.y + direction.y
  };

  if (isBlocked(next, blockedSet)) {
    return -99999;
  }

  const nextBlockedSet = new Set(blockedSet);
  nextBlockedSet.add(cellKey(next.x, next.y));

  const openDirections = countOpenDirections(next, direction, nextBlockedSet);
  const area = measureReachableArea(next, nextBlockedSet);
  const wallDistance = Math.min(
    next.x,
    state.board.cols - 1 - next.x,
    next.y,
    state.board.rows - 1 - next.y
  );

  let score = openDirections * preset.openWeight
    + area * preset.areaWeight
    + wallDistance * preset.wallWeight
    + preset.stabilityBonus;

  if (openDirections <= 1) {
    score -= preset.deadEndPenalty;
  }

  if (depth > 0) {
    const futureScores = getDirectionOptions(direction)
      .map((nextDirection) => scoreRoute(next, nextDirection, nextBlockedSet, depth - 1, preset))
      .filter((value) => value > -99999);

    if (futureScores.length) {
      score += Math.max(...futureScores) * 0.35;
    }
  }

  return score;
}

function pickBotDirection() {
  const preset = getPreset();
  const projectedPlayerDirection = state.player.turnQueue[0] && !isOppositeDirection(state.player.turnQueue[0], state.player.direction)
    ? state.player.turnQueue[0]
    : state.player.direction;
  const projectedPlayerNext = getNextPosition(state.player, projectedPlayerDirection);

  const rankedDirections = getDirectionOptions(state.bot.direction)
    .map((direction) => {
      const next = getNextPosition(state.bot, direction);

      if (isBlocked(next)) {
        return null;
      }

      const sameFutureCell = sameCell(next, projectedPlayerNext);
      const crossedPaths = next.x === state.player.x
        && next.y === state.player.y
        && projectedPlayerNext.x === state.bot.x
        && projectedPlayerNext.y === state.bot.y;

      const blockedSet = new Set(state.occupied);
      blockedSet.add(cellKey(next.x, next.y));
      if (!sameFutureCell && !crossedPaths && !isBlocked(projectedPlayerNext)) {
        blockedSet.add(cellKey(projectedPlayerNext.x, projectedPlayerNext.y));
      }

      const openDirections = countOpenDirections(next, direction, blockedSet);
      const area = measureReachableArea(next, blockedSet);
      const wallDistance = Math.min(
        next.x,
        state.board.cols - 1 - next.x,
        next.y,
        state.board.rows - 1 - next.y
      );
      const playerDistance = Math.abs(state.player.x - next.x) + Math.abs(state.player.y - next.y);

      let score = openDirections * preset.openWeight
        + area * preset.areaWeight
        + wallDistance * preset.wallWeight
        - playerDistance * preset.pursuitWeight
        + (direction === state.bot.direction ? preset.stabilityBonus : 0);

      if (openDirections <= 1) {
        score -= preset.deadEndPenalty;
      }

      if (sameFutureCell || crossedPaths) {
        score -= preset.headOnPenalty;
      }

      if (preset.lookAheadDepth > 0) {
        score += scoreRoute(next, direction, blockedSet, preset.lookAheadDepth, preset);
      }

      return { direction, score };
    })
    .filter(Boolean)
    .sort((first, second) => second.score - first.score);

  if (!rankedDirections.length) {
    return state.bot.direction;
  }

  if (Math.random() < preset.botRandomness && rankedDirections.length > 1) {
    return pickRandom(rankedDirections.slice(0, Math.min(2, rankedDirections.length))).direction;
  }

  return rankedDirections[0].direction;
}

function setDifficulty(key) {
  if (!presets[key]) {
    return;
  }

  state.difficultyKey = key;
  updateHud();
}

function beginMatch(key = state.difficultyKey, resetScore = false) {
  setDifficulty(key);
  clearTimers();
  stopAnimation();
  hidePanel(lineIntroPanel);
  hidePanel(lineResultPanel);
  resetBoard(resetScore);
  renderGame(0);
  state.animationFrame = requestAnimationFrame(animateGame);

  if (lineCanvasWrap) {
    lineCanvasWrap.focus({ preventScroll: true });
  }
}

function queueTurn(name) {
  if (state.mode !== "playing" || !state.player) {
    return;
  }

  const direction = directionMap[name];
  if (!direction) {
    return;
  }

  const referenceDirection = state.player.turnQueue.length
    ? state.player.turnQueue[state.player.turnQueue.length - 1]
    : state.player.direction;

  if (direction === referenceDirection || isOppositeDirection(direction, referenceDirection)) {
    return;
  }

  if (state.player.turnQueue.length >= 3) {
    state.player.turnQueue.shift();
  }

  state.player.turnQueue.push(direction);
}

function consumeQueuedTurn(cycle) {
  while (cycle.turnQueue.length) {
    const nextDirection = cycle.turnQueue.shift();
    if (!isOppositeDirection(nextDirection, cycle.direction)) {
      return nextDirection;
    }
  }

  return null;
}

function moveCycle(cycle, nextPosition) {
  cycle.prevX = cycle.x;
  cycle.prevY = cycle.y;
  cycle.x = nextPosition.x;
  cycle.y = nextPosition.y;
  cycle.trail.push({ x: cycle.x, y: cycle.y });
  state.occupied.add(cellKey(cycle.x, cycle.y));
}

function finishRound(result) {
  clearTimers();
  stopAnimation();
  state.mode = "settling";

  if (state.player?.turnQueue) {
    state.player.turnQueue.length = 0;
  }

  if (result === "player") {
    state.playerWins += 1;
    setStatus("You win");
  } else if (result === "bot") {
    state.botWins += 1;
    setStatus("You lose");
  } else {
    setStatus("Tie");
  }

  updateHud();
  renderGame(1);

  state.resultTimeout = window.setTimeout(() => {
    showResultPanel(result);
  }, 120);
}

function stepGame() {
  if (!state.player || !state.bot) {
    return;
  }

  const queuedPlayerDirection = consumeQueuedTurn(state.player);
  if (queuedPlayerDirection) {
    state.player.direction = queuedPlayerDirection;
  }

  const botDirection = pickBotDirection();
  if (!isOppositeDirection(botDirection, state.bot.direction)) {
    state.bot.direction = botDirection;
  }

  const playerNext = getNextPosition(state.player);
  const botNext = getNextPosition(state.bot);
  const sharedCell = sameCell(playerNext, botNext);
  const crossedPaths = playerNext.x === state.bot.x
    && playerNext.y === state.bot.y
    && botNext.x === state.player.x
    && botNext.y === state.player.y;

  const playerCrash = sharedCell || crossedPaths || isBlocked(playerNext);
  const botCrash = sharedCell || crossedPaths || isBlocked(botNext);

  if (playerCrash && botCrash) {
    finishRound("draw");
    return;
  }

  if (playerCrash) {
    finishRound("bot");
    return;
  }

  if (botCrash) {
    finishRound("player");
    return;
  }

  moveCycle(state.player, playerNext);
  moveCycle(state.bot, botNext);
}

function getRenderPoints(cycle, progress = 1) {
  const trail = cycle.trail.map((segment) => ({ x: segment.x, y: segment.y }));

  if (trail.length > 1) {
    const anchor = trail[trail.length - 2];
    const target = trail[trail.length - 1];
    trail[trail.length - 1] = {
      x: anchor.x + (target.x - anchor.x) * progress,
      y: anchor.y + (target.y - anchor.y) * progress
    };
  }

  return trail;
}

function drawPath(ctx, points, lineWidth) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function renderCycle(ctx, cycle, progress = 1) {
  const { cell, offsetX, offsetY } = state.board;
  const points = getRenderPoints(cycle, progress).map((segment) => ({
    x: offsetX + (segment.x + 0.5) * cell,
    y: offsetY + (segment.y + 0.5) * cell
  }));

  const head = points[points.length - 1];
  const glowWidth = Math.max(cell * 0.76, 8);
  const coreWidth = Math.max(cell * 0.42, 4);

  ctx.save();
  ctx.shadowBlur = Math.max(cell * 1.6, 20);
  ctx.shadowColor = cycle.glow;
  ctx.strokeStyle = cycle.type === "player" ? "rgba(255, 230, 0, 0.34)" : "rgba(50, 202, 255, 0.34)";
  drawPath(ctx, points, glowWidth);

  ctx.shadowBlur = Math.max(cell, 14);
  ctx.fillStyle = cycle.color;
  ctx.strokeStyle = cycle.color;
  drawPath(ctx, points, coreWidth);
  ctx.beginPath();
  ctx.arc(head.x, head.y, Math.max(cell * 0.28, 4), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderGame(progress = 1) {
  if (!state.context || !lineCanvas) {
    return;
  }

  const ctx = state.context;
  const { width, height, cell, cols, rows, offsetX, offsetY } = state.board;

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(7, 9, 15, 0.98)");
  background.addColorStop(1, "rgba(2, 3, 6, 0.98)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const goldHalo = ctx.createRadialGradient(width * 0.82, height * 0.16, 0, width * 0.82, height * 0.16, width * 0.42);
  goldHalo.addColorStop(0, "rgba(255, 230, 0, 0.16)");
  goldHalo.addColorStop(1, "rgba(255, 230, 0, 0)");
  ctx.fillStyle = goldHalo;
  ctx.fillRect(0, 0, width, height);

  const blueHalo = ctx.createRadialGradient(width * 0.18, height * 0.88, 0, width * 0.18, height * 0.88, width * 0.42);
  blueHalo.addColorStop(0, "rgba(50, 202, 255, 0.14)");
  blueHalo.addColorStop(1, "rgba(50, 202, 255, 0)");
  ctx.fillStyle = blueHalo;
  ctx.fillRect(0, 0, width, height);

  const laneLeft = offsetX + cell * 0.5;
  const laneTop = offsetY + cell * 0.5;
  const laneRight = offsetX + (cols - 0.5) * cell;
  const laneBottom = offsetY + (rows - 0.5) * cell;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.strokeRect(
    laneLeft + 0.5,
    laneTop + 0.5,
    Math.max(laneRight - laneLeft, 1),
    Math.max(laneBottom - laneTop, 1)
  );

  ctx.strokeStyle = "rgba(255, 230, 0, 0.08)";
  for (let column = 0; column < cols; column += 1) {
    const x = offsetX + (column + 0.5) * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, laneTop);
    ctx.lineTo(x, laneBottom);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(50, 202, 255, 0.06)";
  for (let row = 0; row < rows; row += 1) {
    const y = offsetY + (row + 0.5) * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(laneLeft, y);
    ctx.lineTo(laneRight, y);
    ctx.stroke();
  }
  ctx.restore();

  if (!state.player || !state.bot) {
    return;
  }

  renderCycle(ctx, state.player, progress);
  renderCycle(ctx, state.bot, progress);
}

function animateGame(now) {
  if (state.mode !== "playing") {
    return;
  }

  if (!state.lastStepAt) {
    state.lastStepAt = now;
  }

  let elapsed = now - state.lastStepAt;
  while (elapsed >= getPreset().tickInterval && state.mode === "playing") {
    state.lastStepAt += getPreset().tickInterval;
    stepGame();
    elapsed = now - state.lastStepAt;
  }

  const progress = state.mode === "playing"
    ? Math.min((now - state.lastStepAt) / getPreset().tickInterval, 1)
    : 1;
  renderGame(progress);

  if (state.mode === "playing") {
    state.animationFrame = requestAnimationFrame(animateGame);
  }
}

function restartGame() {
  if (state.mode === "menu") {
    beginMatch(state.difficultyKey, true);
    return;
  }

  beginMatch(state.difficultyKey, false);
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (state.mode === "playing" && (key === "arrowup" || key === "w")) {
    event.preventDefault();
    queueTurn("up");
    return;
  }

  if (state.mode === "playing" && (key === "arrowdown" || key === "s")) {
    event.preventDefault();
    queueTurn("down");
    return;
  }

  if (state.mode === "playing" && (key === "arrowleft" || key === "a")) {
    event.preventDefault();
    queueTurn("left");
    return;
  }

  if (state.mode === "playing" && (key === "arrowright" || key === "d")) {
    event.preventDefault();
    queueTurn("right");
  }
}

function handleTouchStart(event) {
  if (state.mode !== "playing") {
    return;
  }

  const touch = event.changedTouches[0];
  state.swipeStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function handleTouchEnd(event) {
  if (state.mode !== "playing" || !state.swipeStart) {
    return;
  }

  const touch = event.changedTouches[0];
  if (!touch) {
    state.swipeStart = null;
    return;
  }

  const deltaX = touch.clientX - state.swipeStart.x;
  const deltaY = touch.clientY - state.swipeStart.y;
  state.swipeStart = null;

  if (Math.abs(deltaX) < 24 && Math.abs(deltaY) < 24) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    queueTurn(deltaX > 0 ? "right" : "left");
  } else {
    queueTurn(deltaY > 0 ? "down" : "up");
  }
}

function init() {
  updateHud();
  prepareBackdrop();
  showIntroPanel();

  lineDifficultyOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const difficultyKey = button.dataset.lineDifficulty;
      if (!difficultyKey) {
        return;
      }

      beginMatch(difficultyKey, true);
    });
  });

  lineRestartButton.addEventListener("click", restartGame);
  linePlayAgainButton.addEventListener("click", () => beginMatch(state.difficultyKey, false));
  lineDifficultyButton.addEventListener("click", () => {
    state.playerWins = 0;
    state.botWins = 0;
    clearTimers();
    stopAnimation();
    prepareBackdrop();
    showIntroPanel();
  });

  document.addEventListener("keydown", handleKeydown);

  if (lineCanvasWrap) {
    lineCanvasWrap.addEventListener("touchstart", handleTouchStart, { passive: true });
    lineCanvasWrap.addEventListener("touchend", handleTouchEnd, { passive: true });
  }

  window.addEventListener("resize", () => {
    measureBoard();
    renderGame(1);
  });
}

init();

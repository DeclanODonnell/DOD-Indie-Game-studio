const SIZE = 9;
const BOX_SIZE = 3;
const MAX_LIVES = 3;

const DIFFICULTIES = {
  rookie: {
    key: "rookie",
    label: "Rookie",
    clues: 44
  },
  cipher: {
    key: "cipher",
    label: "Cipher",
    clues: 34
  },
  impossible: {
    key: "impossible",
    label: "Impossible",
    clues: 26
  }
};

const hasTouchUi =
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(any-pointer: coarse)").matches ||
  navigator.maxTouchPoints > 0 ||
  "ontouchstart" in window;

document.body.classList.toggle("has-touch-ui", hasTouchUi);

const boardElement = document.querySelector("#board");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const newGameButton = document.querySelector("#new-game-button");
const notesButton = document.querySelector("#notes-button");
const eraseButton = document.querySelector("#erase-button");
const numberPad = document.querySelector("#number-pad");
const modeValue = document.querySelector("#mode-value");
const timerValue = document.querySelector("#timer-value");
const progressValue = document.querySelector("#progress-value");
const livesValue = document.querySelector("#lives-value");
const stateValue = document.querySelector("#state-value");
const selectionValue = document.querySelector("#selection-value");
const messageValue = document.querySelector("#message-value");

const cellRefs = [];

let solution = createMatrix(() => 0);
let board = createMatrix(() => 0);
let givens = createMatrix(() => false);
let notes = createMatrix(() => new Set());
let selectedCell = null;
let currentModeKey = "rookie";
let notesMode = false;
let gameComplete = false;
let gameFailed = false;
let isGenerating = false;
let checkedErrors = new Set();
let checkedErrorTimerId = null;
let timerId = null;
let startTime = 0;
let livesRemaining = MAX_LIVES;

function createMatrix(factory) {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => factory(row, col))
  );
}

function cloneBoard(source) {
  return source.map((row) => row.slice());
}

function keyForCell(row, col) {
  return `${row}-${col}`;
}

function shuffle(items) {
  const copy = items.slice();

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function sameBox(firstRow, firstCol, secondRow, secondCol) {
  return (
    Math.floor(firstRow / BOX_SIZE) === Math.floor(secondRow / BOX_SIZE) &&
    Math.floor(firstCol / BOX_SIZE) === Math.floor(secondCol / BOX_SIZE)
  );
}

function countFilledCells(targetBoard) {
  let total = 0;

  targetBoard.forEach((row) => {
    row.forEach((value) => {
      if (value !== 0) {
        total += 1;
      }
    });
  });

  return total;
}

function getCandidates(targetBoard, row, col) {
  if (targetBoard[row][col] !== 0) {
    return [];
  }

  const blocked = new Set();

  for (let index = 0; index < SIZE; index += 1) {
    blocked.add(targetBoard[row][index]);
    blocked.add(targetBoard[index][col]);
  }

  const rowStart = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const colStart = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
    for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
      blocked.add(targetBoard[rowStart + rowOffset][colStart + colOffset]);
    }
  }

  const candidates = [];

  for (let value = 1; value <= SIZE; value += 1) {
    if (!blocked.has(value)) {
      candidates.push(value);
    }
  }

  return candidates;
}

function findBestEmptyCell(targetBoard) {
  let bestCell = null;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (targetBoard[row][col] !== 0) {
        continue;
      }

      const candidates = getCandidates(targetBoard, row, col);

      if (candidates.length === 0) {
        return { row, col, candidates };
      }

      if (!bestCell || candidates.length < bestCell.candidates.length) {
        bestCell = { row, col, candidates };
      }

      if (bestCell && bestCell.candidates.length === 1) {
        return bestCell;
      }
    }
  }

  return bestCell;
}

function fillSolvedBoard(targetBoard) {
  const nextCell = findBestEmptyCell(targetBoard);

  if (!nextCell) {
    return true;
  }

  const choices = shuffle(nextCell.candidates);

  for (const value of choices) {
    targetBoard[nextCell.row][nextCell.col] = value;

    if (fillSolvedBoard(targetBoard)) {
      return true;
    }

    targetBoard[nextCell.row][nextCell.col] = 0;
  }

  targetBoard[nextCell.row][nextCell.col] = 0;
  return false;
}

function countSolutions(targetBoard, limit = 2) {
  const nextCell = findBestEmptyCell(targetBoard);

  if (!nextCell) {
    return 1;
  }

  if (nextCell.candidates.length === 0) {
    return 0;
  }

  let solutions = 0;

  for (const value of nextCell.candidates) {
    targetBoard[nextCell.row][nextCell.col] = value;
    solutions += countSolutions(targetBoard, limit - solutions);

    if (solutions >= limit) {
      targetBoard[nextCell.row][nextCell.col] = 0;
      return solutions;
    }
  }

  targetBoard[nextCell.row][nextCell.col] = 0;
  return solutions;
}

function carvePuzzleFromSolution(sourceBoard, targetClues) {
  const puzzle = cloneBoard(sourceBoard);
  const positions = shuffle(Array.from({ length: SIZE * SIZE }, (_, index) => index));

  for (const position of positions) {
    if (countFilledCells(puzzle) <= targetClues) {
      break;
    }

    const row = Math.floor(position / SIZE);
    const col = position % SIZE;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const testBoard = cloneBoard(puzzle);
    if (countSolutions(testBoard, 2) !== 1) {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}

function generatePuzzle(modeKey) {
  const difficulty = DIFFICULTIES[modeKey];
  let bestCandidate = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const solvedBoard = createMatrix(() => 0);
    fillSolvedBoard(solvedBoard);

    const puzzleBoard = carvePuzzleFromSolution(solvedBoard, difficulty.clues);
    const clueCount = countFilledCells(puzzleBoard);
    const candidate = {
      solution: solvedBoard,
      puzzle: puzzleBoard,
      clueCount
    };

    if (!bestCandidate || candidate.clueCount < bestCandidate.clueCount) {
      bestCandidate = candidate;
    }

    if (clueCount <= difficulty.clues) {
      break;
    }
  }

  return bestCandidate;
}

function findConflicts(targetBoard) {
  const conflicts = new Set();

  function markGroup(cells) {
    const seen = new Map();

    cells.forEach(([row, col]) => {
      const value = targetBoard[row][col];
      if (value === 0) {
        return;
      }

      if (!seen.has(value)) {
        seen.set(value, []);
      }

      seen.get(value).push(keyForCell(row, col));
    });

    seen.forEach((keys) => {
      if (keys.length > 1) {
        keys.forEach((cellKey) => conflicts.add(cellKey));
      }
    });
  }

  for (let index = 0; index < SIZE; index += 1) {
    const rowCells = [];
    const colCells = [];

    for (let inner = 0; inner < SIZE; inner += 1) {
      rowCells.push([index, inner]);
      colCells.push([inner, index]);
    }

    markGroup(rowCells);
    markGroup(colCells);
  }

  for (let boxRow = 0; boxRow < SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < SIZE; boxCol += BOX_SIZE) {
      const boxCells = [];

      for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
        for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
          boxCells.push([boxRow + rowOffset, boxCol + colOffset]);
        }
      }

      markGroup(boxCells);
    }
  }

  return conflicts;
}

function boardMatchesSolution() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }

  return true;
}

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function updateTimer() {
  if (!startTime) {
    timerValue.textContent = "00:00";
    return;
  }

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerValue.textContent = formatElapsed(elapsedSeconds);
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  updateTimer();
  timerId = window.setInterval(updateTimer, 1000);
}

function setMessage(text) {
  messageValue.textContent = text;
}

function setNotesMode(active) {
  notesMode = active;
  notesButton.classList.toggle("is-active", active);
  notesButton.setAttribute("aria-pressed", String(active));
  notesButton.textContent = `Notes: ${active ? "On" : "Off"}`;
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === currentModeKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function describeSelection() {
  if (!selectedCell) {
    selectionValue.textContent = "Select a square to begin.";
    return;
  }

  const { row, col } = selectedCell;
  const currentValue = board[row][col];
  const currentLabel = currentValue === 0 ? "empty" : currentValue;
  selectionValue.textContent = `Row ${row + 1}, column ${col + 1}, current value: ${currentLabel}.`;
}

function updateStatus(conflicts) {
  const difficulty = DIFFICULTIES[currentModeKey];
  modeValue.textContent = difficulty.label;
  progressValue.textContent = `${countFilledCells(board)} / 81`;
  livesValue.textContent = `${livesRemaining} / ${MAX_LIVES}`;

  if (isGenerating) {
    stateValue.textContent = "Generating";
  } else if (gameComplete) {
    stateValue.textContent = "Cleared";
  } else if (gameFailed) {
    stateValue.textContent = "Failed";
  } else if (checkedErrors.size > 0) {
    stateValue.textContent = "Life lost";
  } else if (conflicts.size > 0) {
    stateValue.textContent = "Conflict";
  } else if (notesMode) {
    stateValue.textContent = "Notes on";
  } else {
    stateValue.textContent = "Stable";
  }

  describeSelection();
}

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < SIZE; row += 1) {
    cellRefs[row] = [];

    for (let col = 0; col < SIZE; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "sudoku-cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute("role", "gridcell");

      const value = document.createElement("span");
      value.className = "cell-value";

      const noteGrid = document.createElement("div");
      noteGrid.className = "cell-notes";
      const noteRefs = [];

      for (let note = 1; note <= SIZE; note += 1) {
        const noteValue = document.createElement("span");
        noteGrid.appendChild(noteValue);
        noteRefs.push(noteValue);
      }

      cell.append(value, noteGrid);
      cell.addEventListener("click", () => selectCell(row, col));
      fragment.appendChild(cell);
      cellRefs[row][col] = { cell, value, noteRefs };
    }
  }

  boardElement.appendChild(fragment);
}

function renderBoard(conflicts) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      const cellState = cellRefs[row][col];
      const cellKey = keyForCell(row, col);
      const selected =
        selectedCell && row === selectedCell.row && col === selectedCell.col;
      const related =
        selectedCell &&
        !selected &&
        (
          row === selectedCell.row ||
          col === selectedCell.col ||
          sameBox(row, col, selectedCell.row, selectedCell.col)
        );

      cellState.value.textContent = value === 0 ? "" : String(value);
      cellState.cell.classList.toggle("is-given", givens[row][col]);
      cellState.cell.classList.toggle("is-selected", Boolean(selected));
      cellState.cell.classList.toggle("is-related", Boolean(related));
      cellState.cell.classList.toggle("has-conflict", conflicts.has(cellKey));
      cellState.cell.classList.toggle("is-checked-error", checkedErrors.has(cellKey));
      cellState.cell.classList.toggle("is-complete", gameComplete);
      cellState.cell.disabled = isGenerating || gameComplete || gameFailed;

      if (value !== 0) {
        cellState.noteRefs.forEach((noteRef) => {
          noteRef.textContent = "";
        });
      } else {
        cellState.noteRefs.forEach((noteRef, index) => {
          noteRef.textContent = notes[row][col].has(index + 1) ? String(index + 1) : "";
        });
      }

      const ariaValue = value === 0 ? "empty" : String(value);
      cellState.cell.setAttribute(
        "aria-label",
        `Row ${row + 1} column ${col + 1}, ${givens[row][col] ? "given" : "editable"}, ${ariaValue}`
      );
    }
  }
}

function renderAll() {
  const conflicts = findConflicts(board);
  renderBoard(conflicts);
  updateStatus(conflicts);
}

function findFirstEditableCell() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!givens[row][col]) {
        return { row, col };
      }
    }
  }

  return null;
}

function selectCell(row, col) {
  if (isGenerating || gameComplete || gameFailed) {
    return;
  }

  selectedCell = { row, col };
  renderAll();
}

function clearCheckedErrors() {
  if (checkedErrorTimerId) {
    window.clearTimeout(checkedErrorTimerId);
    checkedErrorTimerId = null;
  }

  checkedErrors = new Set();
}

function markCheckedError(cellKey, persist = false) {
  clearCheckedErrors();
  checkedErrors = new Set([cellKey]);

  if (persist) {
    return;
  }

  checkedErrorTimerId = window.setTimeout(() => {
    checkedErrors = new Set();
    checkedErrorTimerId = null;
    renderAll();
  }, 650);
}

function completeGame() {
  gameComplete = true;
  clearCheckedErrors();
  stopTimer();
  renderAll();
  selectionValue.textContent = "Grid cleared. Start a new puzzle whenever you want.";
  setMessage(`${DIFFICULTIES[currentModeKey].label} board cleared in ${timerValue.textContent}.`);
}

function failGame() {
  gameFailed = true;
  stopTimer();
  renderAll();
  selectionValue.textContent = "No lives left. Start a new puzzle to try again.";
  setMessage(`${DIFFICULTIES[currentModeKey].label} signal lost after ${timerValue.textContent}.`);
}

function handleNumberInput(value) {
  if (!selectedCell || isGenerating || gameComplete || gameFailed) {
    return;
  }

  const { row, col } = selectedCell;
  const previousValue = board[row][col];

  if (givens[row][col]) {
    setMessage("That square is locked.");
    return;
  }

  clearCheckedErrors();

  if (notesMode && board[row][col] === 0) {
    if (notes[row][col].has(value)) {
      notes[row][col].delete(value);
    } else {
      notes[row][col].add(value);
    }

    renderAll();
    setMessage(`Updated notes for row ${row + 1}, column ${col + 1}.`);
    return;
  }

  if (value !== solution[row][col]) {
    board[row][col] = previousValue;
    notes[row][col].clear();
    livesRemaining = Math.max(0, livesRemaining - 1);
    markCheckedError(keyForCell(row, col), livesRemaining === 0);
    renderAll();

    if (livesRemaining === 0) {
      failGame();
    } else {
      setMessage(`Wrong number. ${livesRemaining} ${livesRemaining === 1 ? "life" : "lives"} left.`);
    }
    return;
  }

  board[row][col] = value;
  notes[row][col].clear();
  renderAll();

  if (boardMatchesSolution()) {
    completeGame();
  } else {
    setMessage(`Placed ${value} at row ${row + 1}, column ${col + 1}.`);
  }
}

function eraseSelectedCell() {
  if (!selectedCell || isGenerating || gameComplete || gameFailed) {
    return;
  }

  const { row, col } = selectedCell;

  if (givens[row][col]) {
    setMessage("That square is locked.");
    return;
  }

  clearCheckedErrors();
  board[row][col] = 0;
  notes[row][col].clear();
  renderAll();
  setMessage(`Cleared row ${row + 1}, column ${col + 1}.`);
}

function moveSelection(rowDelta, colDelta) {
  if (isGenerating || gameComplete || gameFailed) {
    return;
  }

  if (!selectedCell) {
    selectedCell = findFirstEditableCell();
    renderAll();
    return;
  }

  const nextRow = Math.max(0, Math.min(SIZE - 1, selectedCell.row + rowDelta));
  const nextCol = Math.max(0, Math.min(SIZE - 1, selectedCell.col + colDelta));
  selectedCell = { row: nextRow, col: nextCol };
  renderAll();
}

function requestNewGame(modeKey = currentModeKey) {
  currentModeKey = modeKey;
  updateModeButtons();
  setNotesMode(false);
  stopTimer();

  board = createMatrix(() => 0);
  solution = createMatrix(() => 0);
  givens = createMatrix(() => false);
  notes = createMatrix(() => new Set());
  selectedCell = null;
  gameComplete = false;
  gameFailed = false;
  isGenerating = true;
  livesRemaining = MAX_LIVES;
  clearCheckedErrors();

  timerValue.textContent = "00:00";
  stateValue.textContent = "Generating";
  selectionValue.textContent = `${DIFFICULTIES[currentModeKey].label} grid loading...`;
  setMessage(`Generating ${DIFFICULTIES[currentModeKey].label.toLowerCase()} puzzle...`);
  renderAll();

  window.setTimeout(() => {
    const puzzle = generatePuzzle(currentModeKey);
    solution = puzzle.solution;
    board = cloneBoard(puzzle.puzzle);
    givens = createMatrix((row, col) => board[row][col] !== 0);
    notes = createMatrix(() => new Set());
    selectedCell = findFirstEditableCell();
    startTime = Date.now();
    isGenerating = false;
    startTimer();
    renderAll();
    setMessage(`${DIFFICULTIES[currentModeKey].label} puzzle loaded.`);
  }, 30);
}

function handleKeydown(event) {
  if (event.key >= "1" && event.key <= "9") {
    event.preventDefault();
    handleNumberInput(Number(event.key));
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    event.preventDefault();
    eraseSelectedCell();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1, 0);
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1, 0);
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveSelection(0, -1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveSelection(0, 1);
    return;
  }

  if (event.key.toLowerCase() === "n") {
    event.preventDefault();
    setNotesMode(!notesMode);
    renderAll();
  }
}

function initModeSwitcher() {
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      requestNewGame(button.dataset.mode);
    });
  });
}

function initActionButtons() {
  newGameButton.addEventListener("click", () => requestNewGame(currentModeKey));
  eraseButton.addEventListener("click", eraseSelectedCell);
  notesButton.addEventListener("click", () => {
    setNotesMode(!notesMode);
    renderAll();
  });

  numberPad.addEventListener("click", (event) => {
    const target = event.target.closest("button");

    if (!target) {
      return;
    }

    if (target.dataset.action === "erase") {
      eraseSelectedCell();
      return;
    }

    const value = Number(target.dataset.value);
    if (Number.isInteger(value) && value >= 1 && value <= 9) {
      handleNumberInput(value);
    }
  });
}

function initRevealAnimations() {
  const sections = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  sections.forEach((section) => observer.observe(section));
}

buildBoard();
initModeSwitcher();
initActionButtons();
initRevealAnimations();
document.addEventListener("keydown", handleKeydown);
requestNewGame(currentModeKey);

const reactionStartButton = document.querySelector("#reaction-start-button");
const reactionIntroStart = document.querySelector("#reaction-intro-start");
const reactionPlayAgain = document.querySelector("#reaction-play-again");
const reactionTarget = document.querySelector("#reaction-target");
const reactionTitle = document.querySelector("#reaction-title");
const reactionCopy = document.querySelector("#reaction-copy");
const reactionStatus = document.querySelector("#reaction-status");
const reactionBestValue = document.querySelector("#reaction-best");
const reactionAttemptsValue = document.querySelector("#reaction-attempts");
const reactionAttemptLabel = document.querySelector("#reaction-attempt-label");
const reactionIntroPanel = document.querySelector("#reaction-intro-panel");
const reactionResultPanel = document.querySelector("#reaction-result-panel");
const reactionResultTitle = document.querySelector("#reaction-result-title");
const reactionResultCopy = document.querySelector("#reaction-result-copy");

const reactionBestStorageKey = "dod_reaction_lab_best";

const reactionState = {
  mode: "menu",
  waitTimer: null,
  last: null,
  best: loadReactionBest(),
  attempts: 0,
  falseStarts: 0,
  readyAt: 0
};

function loadReactionBest() {
  try {
    const raw = window.localStorage.getItem(reactionBestStorageKey);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveReactionBest() {
  try {
    if (reactionState.best !== null) {
      window.localStorage.setItem(reactionBestStorageKey, String(reactionState.best));
    }
  } catch (error) {
    // Ignore storage failures.
  }
}

function clearReactionTimer() {
  if (reactionState.waitTimer) {
    window.clearTimeout(reactionState.waitTimer);
    reactionState.waitTimer = null;
  }
}

function formatReactionSeconds(value) {
  return value === null ? "--" : `${(value / 1000).toFixed(3)} s`;
}

function setReactionStatus(text) {
  reactionStatus.textContent = text;
}

function updateReactionHud() {
  reactionBestValue.textContent = formatReactionSeconds(reactionState.best);
  reactionAttemptsValue.textContent = String(reactionState.attempts);
  reactionAttemptLabel.textContent = `Attempts: ${reactionState.attempts}`;
  reactionStartButton.textContent = reactionState.mode === "menu" ? "Start" : "Restart";
}

function setReactionVisualMode(mode) {
  reactionTarget.classList.remove("is-idle", "is-waiting", "is-ready", "is-hit", "is-error");
  reactionTarget.classList.add(mode);
}

function showReactionIntro() {
  reactionIntroPanel.hidden = false;
}

function hideReactionIntro() {
  reactionIntroPanel.hidden = true;
}

function showReactionResult() {
  reactionResultPanel.hidden = false;
}

function hideReactionResult() {
  reactionResultPanel.hidden = true;
}

function scheduleReactionReady() {
  clearReactionTimer();
  const delay = 1400 + Math.random() * 2200;
  reactionState.waitTimer = window.setTimeout(() => {
    reactionState.waitTimer = null;
    reactionState.mode = "ready";
    reactionState.readyAt = performance.now();
    reactionTitle.textContent = "NOW";
    reactionCopy.textContent = "Hit the chamber before the signal dies.";
    setReactionVisualMode("is-ready");
    setReactionStatus("Live signal. Click now.");
    updateReactionHud();
  }, delay);
}

function beginReactionRun() {
  clearReactionTimer();
  hideReactionIntro();
  hideReactionResult();
  reactionState.mode = "waiting";
  reactionState.last = null;
  reactionState.readyAt = 0;
  reactionState.attempts += 1;
  reactionTitle.textContent = "Hold";
  reactionCopy.textContent = "Wait for the green flash. Early clicks fail immediately.";
  setReactionVisualMode("is-waiting");
  setReactionStatus("Waiting for the live signal.");
  updateReactionHud();
  scheduleReactionReady();
}

function finishReactionResult(title, copy, mode) {
  clearReactionTimer();
  reactionState.mode = mode;
  reactionResultTitle.textContent = title;
  reactionResultCopy.textContent = copy;
  showReactionResult();
  updateReactionHud();
}

function handleReactionPress() {
  if (reactionState.mode === "menu") {
    beginReactionRun();
    return;
  }

  if (reactionState.mode === "waiting") {
    reactionState.falseStarts += 1;
    reactionState.last = null;
    reactionTitle.textContent = "False Start";
    reactionCopy.textContent = "You fired before the live cue.";
    setReactionVisualMode("is-error");
    setReactionStatus("Too soon. False start.");
    finishReactionResult("Too Soon.", "You clicked before the chamber turned live. Let the delay breathe next run.", "early");
    return;
  }

  if (reactionState.mode !== "ready") {
    return;
  }

  reactionState.last = performance.now() - reactionState.readyAt;
  if (reactionState.best === null || reactionState.last < reactionState.best) {
    reactionState.best = reactionState.last;
    saveReactionBest();
  }

  reactionTitle.textContent = formatReactionSeconds(reactionState.last);
  reactionCopy.textContent = "Clean hit. Reset and chase a faster time.";
  setReactionVisualMode("is-hit");
  setReactionStatus(`Reaction locked in at ${(reactionState.last / 1000).toFixed(3)} seconds.`);
  finishReactionResult(formatReactionSeconds(reactionState.last), "Reaction logged. Hit run again and try to shave it down.", "result");
}

reactionStartButton?.addEventListener("click", beginReactionRun);
reactionIntroStart?.addEventListener("click", beginReactionRun);
reactionPlayAgain?.addEventListener("click", beginReactionRun);
reactionTarget?.addEventListener("click", handleReactionPress);
window.addEventListener("beforeunload", clearReactionTimer);

setReactionVisualMode("is-idle");
updateReactionHud();
setReactionStatus("Reaction Lab ready.");

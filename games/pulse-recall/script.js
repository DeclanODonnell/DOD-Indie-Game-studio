const pulseStartButton = document.querySelector("#pulse-start-button");
const pulseIntroStart = document.querySelector("#pulse-intro-start");
const pulsePlayAgain = document.querySelector("#pulse-play-again");
const pulseIntroPanel = document.querySelector("#pulse-intro-panel");
const pulseResultPanel = document.querySelector("#pulse-result-panel");
const pulseResultTitle = document.querySelector("#pulse-result-title");
const pulseResultCopy = document.querySelector("#pulse-result-copy");
const pulseStatus = document.querySelector("#pulse-status");
const pulseScoreValue = document.querySelector("#pulse-score");
const pulseBestValue = document.querySelector("#pulse-best");
const pulseRoundLabel = document.querySelector("#pulse-round-label");
const pulseGrid = document.querySelector("#pulse-grid");
const pulsePads = Array.from(document.querySelectorAll("[data-pulse-pad]"));

const pulseBestStorageKey = "dod_pulse_recall_best";

const pulseState = {
  mode: "menu",
  sequence: [],
  inputIndex: 0,
  score: 0,
  best: loadPulseBest(),
  timers: []
};

function loadPulseBest() {
  try {
    const raw = window.localStorage.getItem(pulseBestStorageKey);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch (error) {
    return 0;
  }
}

function savePulseBest() {
  try {
    window.localStorage.setItem(pulseBestStorageKey, String(pulseState.best));
  } catch (error) {
    // Ignore storage failures.
  }
}

function queuePulseTimer(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  pulseState.timers.push(timer);
  return timer;
}

function clearPulseTimers() {
  pulseState.timers.forEach((timer) => window.clearTimeout(timer));
  pulseState.timers = [];
}

function setPulseStatus(text) {
  pulseStatus.textContent = text;
}

function updatePulseHud() {
  const round = pulseState.sequence.length;
  pulseScoreValue.textContent = String(pulseState.score);
  pulseBestValue.textContent = String(pulseState.best);
  pulseRoundLabel.textContent = `Round ${round}`;
  pulseStartButton.textContent = pulseState.mode === "menu" ? "Start" : "Restart";
}

function setPulseGridLocked(locked) {
  pulseGrid.classList.toggle("is-locked", locked);
  pulsePads.forEach((pad) => {
    pad.disabled = locked;
  });
}

function clearPadStates() {
  pulsePads.forEach((pad) => {
    pad.classList.remove("is-active", "is-player", "is-error");
  });
}

function flashPad(index, className, duration = 260) {
  const pad = pulsePads[index];
  if (!pad) {
    return;
  }

  pad.classList.add(className);
  queuePulseTimer(() => {
    pad.classList.remove(className);
  }, duration);
}

function randomPadIndex() {
  return Math.floor(Math.random() * pulsePads.length);
}

function resetPulseRun() {
  clearPulseTimers();
  clearPadStates();
  pulseState.sequence = [];
  pulseState.inputIndex = 0;
  pulseState.score = 0;
  pulseState.mode = "menu";
  hidePulseResult();
  showPulseIntro();
  setPulseGridLocked(true);
  setPulseStatus("Ready to start.");
  updatePulseHud();
}

function showPulseIntro() {
  pulseIntroPanel.hidden = false;
}

function hidePulseIntro() {
  pulseIntroPanel.hidden = true;
}

function showPulseResult() {
  pulseResultPanel.hidden = false;
}

function hidePulseResult() {
  pulseResultPanel.hidden = true;
}

function beginPulseRun() {
  clearPulseTimers();
  clearPadStates();
  pulseState.sequence = [];
  pulseState.inputIndex = 0;
  pulseState.score = 0;
  hidePulseIntro();
  hidePulseResult();
  setPulseGridLocked(true);
  nextPulseRound();
}

function nextPulseRound() {
  pulseState.inputIndex = 0;
  pulseState.sequence.push(randomPadIndex());
  pulseState.mode = "playback";
  setPulseStatus("Watch the sequence.");
  updatePulseHud();
  playPulseSequence();
}

function playPulseSequence() {
  clearPadStates();
  setPulseGridLocked(true);

  const introDelay = 350;
  const stepDuration = 520;
  const activeDuration = 280;
  let delay = introDelay;

  pulseState.sequence.forEach((padIndex) => {
    queuePulseTimer(() => {
      flashPad(padIndex, "is-active", activeDuration);
    }, delay);
    delay += stepDuration;
  });

  queuePulseTimer(() => {
    pulseState.mode = "input";
    pulseState.inputIndex = 0;
    setPulseGridLocked(false);
    setPulseStatus("Repeat the pattern.");
    updatePulseHud();
  }, delay + 40);
}

function handlePulseSuccess() {
  pulseState.score = pulseState.sequence.length;
  if (pulseState.score > pulseState.best) {
    pulseState.best = pulseState.score;
    savePulseBest();
  }
  pulseState.mode = "locked";
  setPulseGridLocked(true);
  setPulseStatus("Correct. Next round loading.");
  updatePulseHud();
  queuePulseTimer(() => {
    nextPulseRound();
  }, 720);
}

function handlePulseFailure(index) {
  pulseState.mode = "result";
  setPulseGridLocked(true);
  clearPadStates();
  flashPad(index, "is-error", 2000);
  setPulseStatus("Wrong pad. Sequence broken.");
  updatePulseHud();

  pulseResultTitle.textContent = "Sequence lost.";
  pulseResultCopy.textContent = `You cleared ${pulseState.score} ${pulseState.score === 1 ? "round" : "rounds"} before missing the pattern.`;

  queuePulseTimer(() => {
    showPulseResult();
  }, 2000);
}

function pressPulsePad(index) {
  if (pulseState.mode !== "input") {
    return;
  }

  const expected = pulseState.sequence[pulseState.inputIndex];

  if (index !== expected) {
    handlePulseFailure(index);
    return;
  }

  flashPad(index, "is-player", 220);
  pulseState.inputIndex += 1;
  updatePulseHud();

  if (pulseState.inputIndex >= pulseState.sequence.length) {
    handlePulseSuccess();
  }
}

pulsePads.forEach((pad) => {
  pad.addEventListener("click", () => {
    pressPulsePad(Number(pad.dataset.pulsePad));
  });
});

pulseStartButton?.addEventListener("click", beginPulseRun);
pulseIntroStart?.addEventListener("click", beginPulseRun);
pulsePlayAgain?.addEventListener("click", beginPulseRun);

window.addEventListener("beforeunload", clearPulseTimers);

setPulseGridLocked(true);
updatePulseHud();
setPulseStatus("Ready to start.");

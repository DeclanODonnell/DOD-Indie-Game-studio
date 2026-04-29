const STAGES = [
  { index: 0, label: "Stage 1", title: "Choose Your Character", copy: "Pick one starter and build it from Worker to God form before Stage 2 opens.", choices: ["ant", "fly", "bee"] },
  { index: 1, label: "Stage 2", title: "Choose Your Stage 2 Animal", copy: "Stage 2 resets the run, but your permanent boost is stronger. Pick one animal and climb every rank again.", choices: ["dog", "cat", "koala"] },
  { index: 2, label: "Stage 3", title: "Choose Your Final Animal", copy: "This is the last revealed stage. Pick one final animal, push it into God form, and see what wakes after the end.", choices: ["shark", "bear", "ape"] }
];

const RANKS = [
  { id: "worker", label: "Worker", nextLabel: "Enforcer", thresholds: [700, 5200, 42000], clickMultiplier: 1, passiveMultiplier: 1, growthMin: 1, growthMax: 1.18 },
  { id: "enforcer", label: "Enforcer", nextLabel: "Queen", thresholds: [4800, 34000, 250000], clickMultiplier: 1.75, passiveMultiplier: 1.6, growthMin: 1.08, growthMax: 1.28 },
  { id: "queen", label: "Queen", nextLabel: "Cyber", thresholds: [26000, 180000, 1200000], clickMultiplier: 2.7, passiveMultiplier: 2.45, growthMin: 1.14, growthMax: 1.34 },
  { id: "cyber", label: "Cyber", nextLabel: "God", thresholds: [125000, 850000, 5200000], clickMultiplier: 4.2, passiveMultiplier: 3.8, growthMin: 1.2, growthMax: 1.42 },
  { id: "god", label: "God", nextLabel: null, thresholds: [580000, 4100000, 22000000], clickMultiplier: 6.2, passiveMultiplier: 5.8, growthMin: 1.28, growthMax: 1.52 }
];

const STAGE_BONUSES = [1, 1.75, 2.5];
const CELESTIAL_THRESHOLD = 88000000;
const CELESTIAL_BONUS = 3.75;
const STORAGE_KEY = "dod-animal-clicker-save-v2";
const HELPER_BLUEPRINTS = [
  { baseCost: 24, baseIncome: 0.45, growth: 1.32 },
  { baseCost: 120, baseIncome: 2.6, growth: 1.34 },
  { baseCost: 620, baseIncome: 13, growth: 1.36 },
  { baseCost: 2900, baseIncome: 58, growth: 1.38 }
];
const UPGRADE_BLUEPRINTS = [
  { effect: "clickMultiplier", amount: 1.8, stageAmount: 0.06, baseCosts: [90, 110, 150], blurb: "Clicks hit much harder." },
  { effect: "passiveMultiplier", amount: 1.5, stageAmount: 0.02, baseCosts: [340, 420, 560], blurb: "Passive income ramps up faster." },
  { effect: "helperMultiplier", amount: 1.45, stageAmount: 0.03, baseCosts: [1400, 1650, 2200], blurb: "Helpers produce far more resources." },
  { effect: "progressMultiplier", amount: 1.35, stageAmount: 0.015, baseCosts: [5200, 6300, 8400], blurb: "Rank progress fills faster." },
  { effect: "stageMultiplier", amount: 1.25, stageAmount: 0.035, baseCosts: [22000, 26000, 34000], blurb: "The current stage boost scales harder." }
];

const SPECIES = {
  ant: {
    stage: 0, name: "Ant", resource: "Sugar", description: "Build your colony and gather sugar.", clickBase: 1, helperScale: 1, costScale: 1,
    colors: { primary: "#ffd14b", secondary: "#ff8c31", strong: "#fff1b0" },
    helperNames: ["Tiny Worker", "Gatherer Ant", "Soldier Ant", "Colony Drone"],
    upgradeNames: ["Stronger Mandibles", "Colony Expansion", "Tunnel Network", "Royal Command", "Neural Colony Core"]
  },
  fly: {
    stage: 0, name: "Fly", resource: "Filth", description: "Land on filth and grow your swarm.", clickBase: 1, helperScale: 1, costScale: 1,
    colors: { primary: "#a7ff57", secondary: "#68d957", strong: "#e5ffc7" },
    helperNames: ["Buzz Fly", "Filth Scout", "Swarm Fly", "Rot Gatherer"],
    upgradeNames: ["Sticky Feet", "Rot Detection", "Swarm Growth", "Toxic Wings", "Corrupted Filth Reactor"]
  },
  bee: {
    stage: 0, name: "Bee", resource: "Pollen", description: "Collect pollen and power your hive.", clickBase: 1, helperScale: 1, costScale: 1,
    colors: { primary: "#ffe05e", secondary: "#ffb347", strong: "#fff5c2" },
    helperNames: ["Tiny Bee", "Worker Bee", "Nectar Carrier", "Guard Drone"],
    upgradeNames: ["Golden Nectar", "Efficient Flight", "Hive Mind", "Honey Reserve", "Royal Bloom Engine"]
  },
  dog: {
    stage: 1, name: "Dog", resource: "Bones", description: "Run a hungry pack and dig up bones.", clickBase: 1.65, helperScale: 2.4, costScale: 1.8,
    colors: { primary: "#ffb15a", secondary: "#ff7b3d", strong: "#ffe2bf" },
    helperNames: ["Yard Pup", "Pack Runner", "Bone Hound", "Alpha Dog"],
    upgradeNames: ["Heavy Jaws", "Pack Instinct", "Bone Routes", "Guard Howl", "Alpha Signal"]
  },
  cat: {
    stage: 1, name: "Cat", resource: "Fish", description: "Claw through fish stashes and nap power.", clickBase: 1.65, helperScale: 2.4, costScale: 1.8,
    colors: { primary: "#f6a4c7", secondary: "#ff6aa8", strong: "#ffd7eb" },
    helperNames: ["Alley Kitten", "Fish Sneak", "Nap Keeper", "Night Stalker"],
    upgradeNames: ["Sharp Claws", "Fish Cache", "Silent Paws", "Nine-Life Reflex", "Moonlit Engine"]
  },
  koala: {
    stage: 1, name: "Koala", resource: "Leaves", description: "Climb the canopy and stock eucalyptus.", clickBase: 1.65, helperScale: 2.4, costScale: 1.8,
    colors: { primary: "#c0c2e0", secondary: "#8b92c8", strong: "#eef0ff" },
    helperNames: ["Sleepy Joey", "Branch Hopper", "Leaf Carrier", "Dream Keeper"],
    upgradeNames: ["Fresh Leaves", "Sleep Cycle", "Branch Network", "Dream Drift", "Eucalyptus Reactor"]
  },
  shark: {
    stage: 2, name: "Shark", resource: "Fins", description: "Hunt the deep and stack fins.", clickBase: 2.7, helperScale: 5.6, costScale: 3.25,
    colors: { primary: "#7bf2ff", secondary: "#0087d9", strong: "#d8fdff" },
    helperNames: ["Pup Shark", "Reef Cutter", "Tide Hunter", "Apex Fin"],
    upgradeNames: ["Serrated Bite", "Deep Current", "Hunter School", "Predator Rush", "Titan Fin Core"]
  },
  bear: {
    stage: 2, name: "Polar Bear", resource: "Fish", description: "Own the ice shelf and drag in frozen fish hauls.", clickBase: 2.7, helperScale: 5.6, costScale: 3.25,
    colors: { primary: "#eef7ff", secondary: "#92b8d7", strong: "#ffffff" },
    helperNames: ["Ice Cub", "Floe Runner", "Seal Scout", "Aurora Alpha"],
    upgradeNames: ["Frozen Paws", "Glacier Hunger", "Ice Pack", "Whiteout Rush", "Arctic Core"]
  },
  ape: {
    stage: 2, name: "Ape", resource: "Totems", description: "Build jungle power with a heavy brown troop bruiser.", clickBase: 2.7, helperScale: 5.6, costScale: 3.25,
    colors: { primary: "#b8885d", secondary: "#6e4327", strong: "#f2dcc8" },
    helperNames: ["Young Ape", "Troop Scout", "Vine Runner", "Primal Alpha"],
    upgradeNames: ["Heavy Fists", "Vine Routes", "Troop Order", "Jungle Rhythm", "Stone Crown Core"]
  },
  celestial: {
    stage: 3, name: "Celestial", resource: "Stars", description: "The hidden final silhouette beyond every god form.", clickBase: 5.8, helperScale: 8.2, costScale: 4.4,
    colors: { primary: "#0d1018", secondary: "#1a2231", strong: "#cde7ff" },
    helperNames: ["Star Wisp", "Astral Echo", "Void Seraph", "Comet Herald"],
    upgradeNames: ["Stellar Touch", "Gravity Thread", "Astral Chorus", "Nebula Engine", "Cosmic Bloom"]
  }
};

const DOM = {
  body: document.body,
  selectionOverlay: document.querySelector("#selectionOverlay"),
  selectionEyebrow: document.querySelector("#selectionEyebrow"),
  selectionTitle: document.querySelector("#selectionTitle"),
  selectionCopy: document.querySelector("#selectionCopy"),
  selectionGrid: document.querySelector("#selectionGrid"),
  stageValue: document.querySelector("#stageValue"),
  resourceLabelValue: document.querySelector("#resourceLabelValue"),
  resourceTotalValue: document.querySelector("#resourceTotalValue"),
  resourcePerSecondValue: document.querySelector("#resourcePerSecondValue"),
  formEyebrow: document.querySelector("#formEyebrow"),
  formTitle: document.querySelector("#formTitle"),
  creatureDisplay: document.querySelector("#creatureDisplay"),
  helperLayer: document.querySelector("#helperLayer"),
  floatingLayer: document.querySelector("#floatingLayer"),
  mainCreatureWrap: document.querySelector("#mainCreatureWrap"),
  mainCreatureMount: document.querySelector("#mainCreatureMount"),
  mainResourceChip: document.querySelector("#mainResourceChip"),
  mainCreatureLabel: document.querySelector("#mainCreatureLabel"),
  mainRankChip: document.querySelector("#mainRankChip"),
  mainCreatureButton: document.querySelector("#mainCreatureButton"),
  evolutionCard: document.querySelector("#evolutionCard"),
  shopStatusValue: document.querySelector("#shopStatusValue"),
  nextTargetValue: document.querySelector("#nextTargetValue"),
  progressMeterFill: document.querySelector("#progressMeterFill"),
  progressMeterLabel: document.querySelector("#progressMeterLabel"),
  progressStack: document.querySelector("#progressStack"),
  helpersTabButton: document.querySelector("#helpersTabButton"),
  upgradesTabButton: document.querySelector("#upgradesTabButton"),
  shopScroll: document.querySelector(".shop-scroll"),
  helpersList: document.querySelector("#helpersList"),
  upgradesList: document.querySelector("#upgradesList"),
  progressTitle: document.querySelector("#progressTitle"),
  progressActionRow: document.querySelector("#progressActionRow"),
  primaryActionButton: document.querySelector("#primaryActionButton"),
  muteButton: document.querySelector("#muteButton"),
  toastStack: document.querySelector("#toastStack")
};

const state = {
  mode: "select",
  stageIndex: 0,
  unlockedStageIndex: 0,
  stageCompleted: Array(STAGES.length).fill(false),
  chosenAnimals: Array(STAGES.length).fill(null),
  prestigeMultiplier: STAGE_BONUSES[0],
  speciesId: null,
  rankIndex: 0,
  resources: 0,
  rankProgress: 0,
  celestialUnlocked: false,
  celestialComplete: false,
  helperCounts: Array(HELPER_BLUEPRINTS.length).fill(0),
  ownedUpgrades: [],
  activeTab: "helpers",
  mute: false,
  uiDirty: true,
  saveDirty: false,
  lastFrameAt: performance.now(),
  lastRenderAt: 0,
  lastSaveAt: 0
};

const audioState = { context: null };
const renderCache = { selection: "", main: "", helpers: "", helpersList: "", upgradesList: "", theme: "" };

function markDirty() {
  state.uiDirty = true;
  state.saveDirty = true;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const absolute = Math.abs(value);
  if (absolute < 1000) {
    return absolute >= 100
      ? Math.floor(value).toLocaleString("en-GB")
      : value.toFixed(value >= 10 ? 1 : 2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  }
  const units = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
  ];
  const unit = units.find((entry) => absolute >= entry.value) || units[units.length - 1];
  const scaled = value / unit.value;
  const rounded = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
  return `${rounded.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}${unit.suffix}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const numeric = Number.parseInt(full, 16);
  return { r: (numeric >> 16) & 255, g: (numeric >> 8) & 255, b: numeric & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getStage() {
  return STAGES[state.stageIndex];
}

function getStageBonus() {
  return state.prestigeMultiplier || 1;
}

function getSpecies(speciesId = state.speciesId) {
  return speciesId ? SPECIES[speciesId] || null : null;
}

function isCelestialSpecies(speciesId = state.speciesId) {
  return speciesId === "celestial";
}

function hasCompletedMainJourney() {
  return state.stageCompleted.every(Boolean);
}

function getRank(rankIndex = state.rankIndex) {
  return RANKS[rankIndex] || RANKS[0];
}

function getNextRank() {
  if (isCelestialSpecies()) {
    return null;
  }
  return RANKS[state.rankIndex + 1] || null;
}

function getThreshold() {
  if (isCelestialSpecies()) {
    return CELESTIAL_THRESHOLD;
  }
  return getRank().thresholds[state.stageIndex];
}

function getProgressRatio() {
  return clamp(state.resources / getThreshold(), 0, 1);
}

function isFinalRank(rankIndex = state.rankIndex) {
  if (isCelestialSpecies()) {
    return true;
  }
  return rankIndex === RANKS.length - 1;
}

function isCurrentRankComplete() {
  return Boolean(getSpecies()) && state.resources >= getThreshold();
}

function getCurrentProgressValue() {
  return Math.min(state.resources, getThreshold());
}

function getFormName(speciesId = state.speciesId, rankIndex = state.rankIndex) {
  const species = getSpecies(speciesId);
  if (speciesId === "celestial") {
    return "CELESTIAL";
  }
  const rank = getRank(rankIndex);
  return species ? `${rank.label} ${species.name}` : `${rank.label} Animal`;
}

function getSelectionCopy() {
  return state.stageIndex === 0
    ? getStage().copy
    : `${getStage().copy} Base boost for this stage: x${getStageBonus().toFixed(2)}.`;
}

function getThemeSpecies() {
  return getSpecies() || getSpecies(getStage().choices[0]);
}

function saveState() {
  try {
    const payload = {
      stageIndex: state.stageIndex,
      unlockedStageIndex: state.unlockedStageIndex,
      stageCompleted: state.stageCompleted,
      chosenAnimals: state.chosenAnimals,
      prestigeMultiplier: state.prestigeMultiplier,
      speciesId: state.speciesId,
      rankIndex: state.rankIndex,
      resources: state.resources,
      rankProgress: state.rankProgress,
      celestialUnlocked: state.celestialUnlocked,
      celestialComplete: state.celestialComplete,
      helperCounts: state.helperCounts,
      ownedUpgrades: state.ownedUpgrades,
      activeTab: state.activeTab,
      mute: state.mute
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    state.saveDirty = false;
  } catch {
    state.saveDirty = false;
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw);
    state.stageIndex = clamp(Number(saved.stageIndex) || 0, 0, STAGES.length - 1);
    state.unlockedStageIndex = clamp(Number(saved.unlockedStageIndex) || 0, 0, STAGES.length - 1);
    state.stageCompleted = Array.isArray(saved.stageCompleted)
      ? STAGES.map((_, index) => Boolean(saved.stageCompleted[index]))
      : Array(STAGES.length).fill(false);
    state.chosenAnimals = Array.isArray(saved.chosenAnimals)
      ? STAGES.map((_, index) => SPECIES[saved.chosenAnimals[index]] ? saved.chosenAnimals[index] : null)
      : Array(STAGES.length).fill(null);
    state.prestigeMultiplier = Number(saved.prestigeMultiplier) || STAGE_BONUSES[state.stageIndex];
    state.speciesId = SPECIES[saved.speciesId] ? saved.speciesId : null;
    state.rankIndex = clamp(Number(saved.rankIndex) || 0, 0, RANKS.length - 1);
    state.resources = Math.max(0, Number(saved.resources) || 0);
    state.rankProgress = state.resources;
    state.celestialUnlocked = Boolean(saved.celestialUnlocked);
    state.celestialComplete = Boolean(saved.celestialComplete);
    state.helperCounts = Array.isArray(saved.helperCounts)
      ? HELPER_BLUEPRINTS.map((_, index) => Math.max(0, Number(saved.helperCounts[index]) || 0))
      : Array(HELPER_BLUEPRINTS.length).fill(0);
    state.ownedUpgrades = Array.isArray(saved.ownedUpgrades)
      ? saved.ownedUpgrades.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value >= 0 && value < UPGRADE_BLUEPRINTS.length)
      : [];
    state.activeTab = saved.activeTab === "upgrades" ? "upgrades" : "helpers";
    state.mute = Boolean(saved.mute);
    if (state.celestialComplete) {
      state.celestialUnlocked = true;
      state.speciesId = "celestial";
      state.mode = "play";
    } else if (state.celestialUnlocked) {
      state.speciesId = "celestial";
      state.mode = "play";
    } else if (state.speciesId) {
      state.mode = "play";
    } else {
      state.mode = "select";
    }
    const highestCompletedStage = state.stageCompleted.reduce((max, complete, index) => (complete ? index : max), -1);
    state.unlockedStageIndex = clamp(Math.max(state.unlockedStageIndex, highestCompletedStage + 1), 0, STAGES.length - 1);
    if (hasCompletedMainJourney() && !state.celestialUnlocked && !state.celestialComplete) {
      state.celestialUnlocked = true;
      state.speciesId = "celestial";
      state.mode = "play";
      state.rankIndex = 0;
      state.resources = 0;
      state.rankProgress = 0;
      state.helperCounts = Array(HELPER_BLUEPRINTS.length).fill(0);
      state.ownedUpgrades = [];
      state.activeTab = "helpers";
      state.prestigeMultiplier = CELESTIAL_BONUS;
    }
    if (!state.speciesId && state.mode === "play") {
      state.mode = "select";
    }
    state.rankProgress = state.resources;
    state.saveDirty = false;
  } catch {
    // ignore corrupted save and boot fresh
  }
}

function getUpgradeSnapshot() {
  const snapshot = {
    clickMultiplier: 1,
    passiveMultiplier: 1,
    helperMultiplier: 1,
    progressMultiplier: 1,
    stageMultiplier: 1
  };

  state.ownedUpgrades.forEach((index) => {
    const upgrade = UPGRADE_BLUEPRINTS[index];
    if (!upgrade) {
      return;
    }
    snapshot[upgrade.effect] *= upgrade.amount + state.stageIndex * upgrade.stageAmount;
  });

  return snapshot;
}

function getClickValue(snapshot = getUpgradeSnapshot()) {
  const species = getSpecies();
  if (!species) {
    return 0;
  }
  return species.clickBase * getRank().clickMultiplier * getStageBonus() * snapshot.stageMultiplier * snapshot.clickMultiplier;
}

function getHelperCost(index) {
  const species = getSpecies();
  if (!species) {
    return 0;
  }
  const helper = HELPER_BLUEPRINTS[index];
  const growth = helper.growth + state.stageIndex * 0.03 + state.rankIndex * 0.01;
  const multiplier = species.costScale * (1 + state.rankIndex * 0.32);
  return Math.floor(helper.baseCost * multiplier * Math.pow(growth, state.helperCounts[index]));
}

function getHelperIncome(index, snapshot = getUpgradeSnapshot()) {
  const species = getSpecies();
  if (!species) {
    return 0;
  }
  const helper = HELPER_BLUEPRINTS[index];
  return helper.baseIncome * species.helperScale * getRank().passiveMultiplier * getStageBonus() * snapshot.stageMultiplier * snapshot.passiveMultiplier * snapshot.helperMultiplier;
}

function getPassivePerSecond(snapshot = getUpgradeSnapshot()) {
  if (!getSpecies()) {
    return 0;
  }
  return HELPER_BLUEPRINTS.reduce((total, helper, index) => total + getHelperIncome(index, snapshot) * state.helperCounts[index], 0);
}

function getUpgradeCost(index) {
  const species = getSpecies();
  if (!species) {
    return 0;
  }
  return Math.floor(UPGRADE_BLUEPRINTS[index].baseCosts[state.stageIndex] * species.costScale * (1 + state.stageIndex * 0.14));
}

function canAfford(cost) {
  return state.resources >= cost;
}

function addGain(amount, progressMultiplier = 1) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const effectiveGain = amount * progressMultiplier;
  state.resources += effectiveGain;
  state.rankProgress = state.resources;
  syncStageCompletion();
  markDirty();
}

function canRankUp() {
  if (isCelestialSpecies()) {
    return false;
  }
  return Boolean(getSpecies()) && !isFinalRank() && isCurrentRankComplete();
}

function canAdvanceStage() {
  if (isCelestialSpecies()) {
    return false;
  }
  return Boolean(getSpecies()) && state.stageIndex < STAGES.length - 1 && state.stageCompleted[state.stageIndex];
}

function isFinalStageComplete() {
  return state.celestialComplete;
}

function resetRunProgress() {
  state.resources = 0;
  state.rankIndex = 0;
  state.rankProgress = 0;
  state.helperCounts = Array(HELPER_BLUEPRINTS.length).fill(0);
  state.ownedUpgrades = [];
  state.activeTab = "helpers";
  DOM.floatingLayer.replaceChildren();
  renderCache.main = "";
  renderCache.helpers = "";
  renderCache.helpersList = "";
  renderCache.upgradesList = "";
  markDirty();
}

function unlockCelestial() {
  state.celestialUnlocked = true;
  state.speciesId = "celestial";
  state.mode = "play";
  state.prestigeMultiplier = CELESTIAL_BONUS;
  resetRunProgress();
  playRankSound();
  queueToast("A hidden signal answers. CELESTIAL stirs.");
}

function completeCelestial() {
  if (state.celestialComplete) {
    return;
  }
  state.celestialComplete = true;
  state.resources = getThreshold();
  state.rankProgress = state.resources;
  playRankSound();
  queueToast("CELESTIAL complete. Evolution finished.");
  markDirty();
}

function syncStageCompletion() {
  const species = getSpecies();
  if (!species || !isCurrentRankComplete()) {
    return;
  }
  if (isCelestialSpecies()) {
    completeCelestial();
    return;
  }
  if (!isFinalRank() || state.stageCompleted[state.stageIndex]) {
    return;
  }
  state.stageCompleted[state.stageIndex] = true;
  if (state.stageIndex < STAGES.length - 1) {
    state.unlockedStageIndex = Math.max(state.unlockedStageIndex, state.stageIndex + 1);
    advanceStage();
    return;
  }
  if (hasCompletedMainJourney() && !state.celestialUnlocked) {
    unlockCelestial();
    return;
  }
  playRankSound();
  queueToast(`God ${species.name} complete. Stage 3 cleared.`);
}

function applyTheme() {
  const species = getThemeSpecies();
  const signature = `${species.name}:${state.stageIndex}:${Number(isCelestialSpecies())}`;
  if (renderCache.theme === signature) {
    return;
  }
  const rgb = hexToRgb(species.colors.primary);
  document.documentElement.style.setProperty("--accent", species.colors.primary);
  document.documentElement.style.setProperty("--accent-secondary", species.colors.secondary);
  document.documentElement.style.setProperty("--accent-strong", species.colors.strong);
  document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  DOM.creatureDisplay.classList.toggle("is-celestial", isCelestialSpecies());
  renderCache.theme = signature;
}

function ensureAudio() {
  if (state.mute) {
    return null;
  }
  if (!audioState.context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioState.context = new AudioContextClass();
  }
  if (audioState.context.state === "suspended") {
    audioState.context.resume().catch(() => {});
  }
  return audioState.context;
}

function playTone({ frequency, slideTo, duration = 0.12, gain = 0.03, type = "square" }) {
  const context = ensureAudio();
  if (!context) {
    return;
  }
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startAt = context.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 40), startAt + duration);
  }
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}

function playClickSound() {
  playTone({ frequency: 420, slideTo: 620, duration: 0.07, gain: 0.018, type: "triangle" });
}

function playShopSound() {
  playTone({ frequency: 520, slideTo: 780, duration: 0.12, gain: 0.024, type: "square" });
}

function playRankSound() {
  playTone({ frequency: 260, slideTo: 420, duration: 0.18, gain: 0.026, type: "sawtooth" });
  window.setTimeout(() => {
    playTone({ frequency: 420, slideTo: 900, duration: 0.16, gain: 0.026, type: "triangle" });
  }, 60);
}

function queueToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  DOM.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function getScenePoint(event) {
  const rect = DOM.creatureDisplay.getBoundingClientRect();
  if (!rect.width) {
    return { x: "50%", y: "50%" };
  }
  const clientX = "clientX" in event ? event.clientX : rect.left + rect.width / 2;
  const clientY = "clientY" in event ? event.clientY : rect.top + rect.height / 2;
  const x = clamp(((clientX - rect.left) / rect.width) * 100, 12, 88);
  const y = clamp(((clientY - rect.top) / rect.height) * 100, 14, 82);
  return { x: `${x}%`, y: `${y}%` };
}

function spawnFloat(text, x, y) {
  const entry = document.createElement("span");
  entry.className = "float-gain";
  entry.textContent = text;
  entry.style.setProperty("--x", x);
  entry.style.setProperty("--y", y);
  DOM.floatingLayer.appendChild(entry);
  window.setTimeout(() => entry.remove(), 900);
}

function spawnCelestialBurst(x, y) {
  ["-18px", "0px", "18px"].forEach((dx, index) => {
    const star = document.createElement("span");
    star.className = "float-star";
    star.textContent = "★";
    star.style.setProperty("--x", x);
    star.style.setProperty("--y", y);
    star.style.setProperty("--dx", dx);
    star.style.setProperty("--dy", `${index === 1 ? "-14px" : "0px"}`);
    DOM.floatingLayer.appendChild(star);
    window.setTimeout(() => star.remove(), 920);
  });
}

function getSpeciesArt(speciesId, palette) {
  switch (speciesId) {
    case "ant":
      return {
        head: { x: 120, y: 76, w: 60, h: 46 },
        body: { x: 120, y: 146, w: 94, h: 110 },
        markup: `<g fill="none" stroke="${palette.stroke}" stroke-width="6" stroke-linecap="square">
            <path class="antenna antenna-left" d="M104 54 L92 36 L82 24" />
            <path class="antenna antenna-right" d="M136 54 L148 36 L158 24" />
            <path class="leg" d="M92 114 L52 94" /><path class="leg" d="M148 114 L188 94" />
            <path class="leg" d="M90 138 L42 138" /><path class="leg" d="M150 138 L198 138" />
            <path class="leg" d="M94 164 L54 182" /><path class="leg" d="M146 164 L186 182" />
          </g>
          <rect x="90" y="54" width="60" height="44" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="82" y="102" width="76" height="48" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="72" y="148" width="96" height="60" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="eye eye-left" x="100" y="66" width="12" height="12" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="128" y="66" width="12" height="12" fill="${palette.stroke}" />
          <rect class="cheek" x="94" y="82" width="12" height="6" fill="${rgba("#ffddb8", 0.45)}" />
          <rect class="cheek" x="134" y="82" width="12" height="6" fill="${rgba("#ffddb8", 0.45)}" />
          <rect class="mouth" x="110" y="82" width="20" height="6" fill="${rgba("#fff3bf", 0.48)}" />
          <rect x="96" y="114" width="48" height="8" fill="${rgba("#ffffff", 0.16)}" />
          <rect x="90" y="164" width="58" height="10" fill="${rgba("#ffffff", 0.14)}" />`
      };
    case "fly":
      return {
        head: { x: 120, y: 78, w: 52, h: 44 },
        body: { x: 120, y: 138, w: 72, h: 102 },
        markup: `<ellipse class="wing wing-left" cx="78" cy="96" rx="34" ry="24" fill="${rgba("#d9fcff", 0.8)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="4" />
          <ellipse class="wing wing-right" cx="162" cy="96" rx="34" ry="24" fill="${rgba("#d9fcff", 0.8)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="4" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="5" stroke-linecap="square">
            <path class="leg" d="M98 126 L66 144" /><path class="leg" d="M142 126 L174 144" />
            <path class="leg" d="M96 154 L64 172" /><path class="leg" d="M144 154 L176 172" />
          </g>
          <rect x="94" y="58" width="52" height="40" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="90" y="102" width="60" height="50" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="102" y="152" width="36" height="34" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-left" x="98" y="64" width="12" height="14" fill="${rgba("#fff7d6", 0.9)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="eye eye-right" x="130" y="64" width="12" height="14" fill="${rgba("#fff7d6", 0.9)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="pupil" x="102" y="68" width="4" height="6" fill="${palette.stroke}" />
          <rect class="pupil" x="134" y="68" width="4" height="6" fill="${palette.stroke}" />
          <rect class="mouth" x="110" y="82" width="20" height="4" fill="${rgba("#ffffff", 0.4)}" />`
      };
    case "bee":
      return {
        head: { x: 120, y: 78, w: 50, h: 42 },
        body: { x: 120, y: 138, w: 78, h: 104 },
        markup: `<ellipse class="wing wing-left" cx="82" cy="94" rx="32" ry="22" fill="${rgba("#fff8d4", 0.84)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="4" />
          <ellipse class="wing wing-right" cx="158" cy="94" rx="32" ry="22" fill="${rgba("#fff8d4", 0.84)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="4" />
          <rect x="96" y="58" width="48" height="40" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="102" width="68" height="60" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="88" y="114" width="64" height="10" fill="${palette.stroke}" />
          <rect x="88" y="132" width="64" height="10" fill="${palette.stroke}" />
          <rect x="88" y="150" width="64" height="10" fill="${palette.stroke}" />
          <polygon class="tail" points="114,166 126,166 120,198" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="eye eye-left" x="102" y="68" width="10" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="128" y="68" width="10" height="10" fill="${palette.stroke}" />
          <rect class="mouth" x="110" y="82" width="20" height="4" fill="${rgba("#fff5cc", 0.48)}" />`
      };
    case "dog":
      return {
        head: { x: 120, y: 92, w: 70, h: 60 },
        body: { x: 120, y: 154, w: 118, h: 88 },
        markup: `<g fill="none" stroke="${palette.stroke}" stroke-width="8" stroke-linecap="square">
            <path class="tail tail-right" d="M174 146 L200 124 L196 96" />
            <path class="leg" d="M94 170 L94 202" /><path class="leg" d="M146 170 L146 202" />
            <path class="leg" d="M76 166 L76 198" /><path class="leg" d="M164 166 L164 198" />
          </g>
          <rect class="arm arm-left" x="70" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="152" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="84" y="118" width="72" height="56" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="92" y="58" width="58" height="54" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <polygon class="ear ear-left" points="94,56 70,92 96,94" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="ear ear-right" points="148,56 172,92 146,94" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-left" x="102" y="72" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="72" width="8" height="10" fill="${palette.stroke}" />
          <rect x="104" y="84" width="34" height="18" fill="${rgba("#fff0c9", 0.82)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect x="116" y="86" width="10" height="8" fill="${palette.stroke}" />
          <rect class="mouth" x="112" y="100" width="18" height="4" fill="${rgba("#ffffff", 0.34)}" />
          <rect x="96" y="132" width="48" height="10" fill="${rgba("#ffffff", 0.12)}" />`
      };
    case "cat":
      return {
        head: { x: 120, y: 90, w: 66, h: 60 },
        body: { x: 120, y: 152, w: 108, h: 82 },
        markup: `<g fill="none" stroke="${palette.stroke}" stroke-width="7" stroke-linecap="square">
            <path class="tail tail-right" d="M166 150 L192 124 L184 86" />
            <path d="M104 96 L74 100" /><path d="M136 96 L166 100" />
            <path d="M104 106 L74 112" /><path d="M136 106 L166 112" />
          </g>
          <rect class="arm arm-left" x="74" y="126" width="16" height="40" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="150" y="126" width="16" height="40" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="88" y="120" width="64" height="54" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="90" y="58" width="60" height="54" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <polygon class="ear ear-left" points="92,56 70,88 98,88" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="ear ear-right" points="148,56 170,88 142,88" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-left" x="102" y="72" width="8" height="12" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="72" width="8" height="12" fill="${palette.stroke}" />
          <rect x="108" y="88" width="24" height="16" fill="${rgba("#ffe7f3", 0.62)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect x="116" y="90" width="8" height="6" fill="${palette.stroke}" />
          <rect class="mouth" x="114" y="102" width="12" height="4" fill="${rgba("#ffffff", 0.3)}" />
          <rect x="96" y="132" width="48" height="10" fill="${rgba("#ffffff", 0.1)}" />`
      };
    case "koala":
      return {
        head: { x: 120, y: 94, w: 74, h: 68 },
        body: { x: 120, y: 154, w: 108, h: 88 },
        markup: `<circle class="ear ear-left" cx="90" cy="70" r="22" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <circle class="ear ear-right" cx="150" cy="70" r="22" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-left" x="72" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="150" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="120" width="68" height="58" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="88" y="60" width="64" height="62" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="eye eye-left" x="102" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect x="108" y="90" width="24" height="18" fill="${palette.stroke}" />
          <rect class="mouth" x="114" y="112" width="12" height="4" fill="${rgba("#ffffff", 0.24)}" />
          <rect x="96" y="132" width="48" height="10" fill="${rgba("#ffffff", 0.12)}" />`
      };
    case "shark":
      return {
        head: { x: 186, y: 118, w: 54, h: 38 },
        body: { x: 116, y: 122, w: 164, h: 72 },
        markup: `<path d="M34 122 L70 92 H150 L194 98 L222 118 L194 138 L150 152 H70 Z" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="tail tail-left" points="34,122 6,98 16,122 6,146" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="fin fin-top" points="106,92 126,46 148,92" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="fin fin-bottom" points="110,140 136,160 108,154" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M150 100 L202 104 L224 118 L202 142 L150 144 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M156 108 L196 112 L212 118 L196 128 L156 132 Z" fill="${rgba("#ffffff", 0.16)}" stroke="none" />
          <rect class="eye eye-right" x="182" y="108" width="10" height="10" fill="${palette.stroke}" />
          <path d="M162 112 L172 122" stroke="${palette.stroke}" stroke-width="4" fill="none" stroke-linecap="square" />
          <path class="mouth" d="M188 128 Q202 132 216 126" stroke="${palette.stroke}" stroke-width="4" fill="none" stroke-linecap="square" />
          <path d="M196 128 L202 134 L208 128" stroke="${rgba("#ffffff", 0.62)}" stroke-width="3" fill="none" />
          <path d="M92 114 H144" stroke="${rgba("#ffffff", 0.14)}" stroke-width="5" stroke-linecap="square" />`
      };
    case "bear":
      return {
        head: { x: 120, y: 90, w: 74, h: 66 },
        body: { x: 120, y: 154, w: 120, h: 90 },
        markup: `<circle class="ear ear-left" cx="92" cy="66" r="15" fill="${rgba("#ffffff", 0.96)}" stroke="${palette.stroke}" stroke-width="5" />
          <circle class="ear ear-right" cx="148" cy="66" r="15" fill="${rgba("#ffffff", 0.96)}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="82" y="120" width="76" height="58" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="arm arm-left" x="64" y="124" width="20" height="46" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="156" y="124" width="20" height="46" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="56" width="68" height="64" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="eye eye-left" x="102" y="76" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="76" width="8" height="10" fill="${palette.stroke}" />
          <rect x="104" y="88" width="32" height="20" fill="${rgba("#d8eefc", 0.96)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect x="116" y="92" width="8" height="8" fill="${palette.stroke}" />
          <rect class="mouth" x="112" y="108" width="16" height="4" fill="${rgba("#ffffff", 0.28)}" />
          <rect x="96" y="130" width="48" height="10" fill="${rgba("#ffffff", 0.18)}" />`
      };
    case "ape":
      return {
        head: { x: 120, y: 88, w: 78, h: 64 },
        body: { x: 120, y: 154, w: 116, h: 92 },
        markup: `<circle class="ear ear-left" cx="94" cy="68" r="12" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle class="ear ear-right" cx="146" cy="68" r="12" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="82" y="122" width="76" height="60" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="arm arm-left" x="46" y="108" width="32" height="84" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="162" y="108" width="32" height="84" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="56" width="68" height="60" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="94" y="68" width="52" height="16" fill="${rgba("#4b2b16", 0.52)}" stroke="none" />
          <rect x="100" y="90" width="40" height="24" fill="${rgba("#e7c8ab", 0.94)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="eye eye-left" x="102" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect x="112" y="92" width="4" height="8" fill="${palette.stroke}" />
          <rect x="124" y="92" width="4" height="8" fill="${palette.stroke}" />
          <rect class="mouth" x="108" y="108" width="24" height="4" fill="${rgba("#ffffff", 0.24)}" />
          <rect x="96" y="134" width="48" height="10" fill="${rgba("#ffffff", 0.12)}" />`
      };
    case "celestial":
      return {
        head: { x: 120, y: 90, w: 82, h: 72 },
        body: { x: 120, y: 150, w: 118, h: 100 },
        markup: `<g class="celestial-aura-wrap">
            <ellipse class="celestial-aura" cx="120" cy="122" rx="82" ry="72" fill="${rgba("#8ec5ff", 0.08)}" />
            <ellipse class="celestial-aura celestial-aura--inner" cx="120" cy="126" rx="62" ry="50" fill="${rgba("#dff2ff", 0.08)}" />
            <polygon class="celestial-star" points="56,74 60,82 70,84 62,90 64,100 56,95 48,100 50,90 42,84 52,82" fill="${rgba("#fff7cc", 0.9)}" />
            <polygon class="celestial-star" points="180,68 184,76 194,78 186,84 188,94 180,89 172,94 174,84 166,78 176,76" fill="${rgba("#fff7cc", 0.84)}" />
            <polygon class="celestial-star" points="168,164 172,172 182,174 174,180 176,190 168,185 160,190 162,180 154,174 164,172" fill="${rgba("#fff7cc", 0.78)}" />
          </g>
          <path class="celestial-silhouette" d="M70 170 L58 144 L72 120 L90 112 L90 88 L110 62 L130 62 L150 88 L150 110 L172 122 L186 144 L176 174 L144 190 H94 Z"
            fill="#05070d" stroke="${rgba("#cfe6ff", 0.12)}" stroke-width="5" />
          <path class="celestial-silhouette" d="M92 88 L82 70 L94 52 L108 62" fill="#05070d" stroke="${rgba("#cfe6ff", 0.1)}" stroke-width="5" />
          <path class="celestial-silhouette" d="M148 88 L158 70 L146 52 L132 62" fill="#05070d" stroke="${rgba("#cfe6ff", 0.1)}" stroke-width="5" />
          <rect class="celestial-eye" x="102" y="98" width="10" height="6" fill="${rgba("#dff5ff", 0.7)}" />
          <rect class="celestial-eye" x="128" y="98" width="10" height="6" fill="${rgba("#dff5ff", 0.7)}" />
          <path d="M104 116 H136" stroke="${rgba("#dff5ff", 0.22)}" stroke-width="4" stroke-linecap="square" />`
      };
    default:
      return getSpeciesArt("ant", palette);
  }
}

function getRankDecoration(speciesId, rankIndex, art, palette) {
  const headLeft = art.head.x - art.head.w / 2;
  const headRight = art.head.x + art.head.w / 2;
  const headTop = art.head.y - art.head.h / 2;
  const bodyLeft = art.body.x - art.body.w / 2;
  const bodyRight = art.body.x + art.body.w / 2;
  const bodyTop = art.body.y - art.body.h / 2;
  const bodyBottom = art.body.y + art.body.h / 2;
  const stageTwoPet = speciesId === "dog" || speciesId === "cat" || speciesId === "koala";
  const shark = speciesId === "shark";
  const fly = speciesId === "fly";
  const bee = speciesId === "bee";
  const dog = speciesId === "dog";
  const cat = speciesId === "cat";
  const koala = speciesId === "koala";
  const bear = speciesId === "bear";
  const ape = speciesId === "ape";
  const muscleY = stageTwoPet ? art.body.y - 12 : art.body.y - 18;
  const muscleHeight = stageTwoPet ? 46 : 40;
  const muscleWidth = stageTwoPet ? 30 : 28;
  const leftMuscleX = stageTwoPet ? bodyLeft - 16 : bodyLeft - 22;
  const rightMuscleX = stageTwoPet ? bodyRight - 14 : bodyRight - 6;
  let back = "";
  let front = "";

  if (rankIndex === 1) {
    if (shark) {
      back = `<polygon class="muscle arm-left" points="${bodyLeft + 34},${art.body.y + 6} ${bodyLeft + 58},${art.body.y + 24} ${bodyLeft + 40},${art.body.y + 34} ${bodyLeft + 18},${art.body.y + 16}"
        fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <polygon class="muscle arm-right" points="${bodyLeft + 82},${art.body.y + 4} ${bodyLeft + 108},${art.body.y + 22} ${bodyLeft + 86},${art.body.y + 34} ${bodyLeft + 62},${art.body.y + 14}"
        fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
      front = `<rect class="headband" x="${headLeft + 10}" y="${headTop + 1}" width="${Math.max(20, art.head.w - 20)}" height="8" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
        <polygon class="headband-tail" points="${headRight - 4},${headTop + 5} ${headRight + 8},${headTop + 2} ${headRight + 4},${headTop + 13}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
    } else if (fly) {
      back = `<rect class="muscle arm-left" x="${leftMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="muscle arm-right" x="${rightMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
      front = `<rect class="headband" x="${headLeft + 4}" y="${headTop + 2}" width="${Math.max(30, art.head.w - 8)}" height="9" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
        <polygon class="headband-tail" points="${headRight - 4},${headTop + 7} ${headRight + 12},${headTop + 3} ${headRight + 8},${headTop + 17}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
    } else if (bee) {
      back = `<rect class="muscle arm-left" x="${leftMuscleX}" y="${muscleY + 2}" width="${muscleWidth}" height="${muscleHeight - 6}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="muscle arm-right" x="${rightMuscleX}" y="${muscleY + 2}" width="${muscleWidth}" height="${muscleHeight - 6}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
      front = `<rect class="headband" x="${headLeft + 2}" y="${headTop - 1}" width="${Math.max(30, art.head.w - 4)}" height="10" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
        <polygon class="headband-tail" points="${headRight - 4},${headTop + 4} ${headRight + 10},${headTop} ${headRight + 6},${headTop + 14}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
    } else if (dog) {
      back = `<rect class="muscle arm-left" x="${leftMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="muscle arm-right" x="${rightMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
      front = `<rect class="headband" x="${headLeft + 4}" y="${headTop - 2}" width="${Math.max(32, art.head.w - 8)}" height="10" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
        <polygon class="headband-tail" points="${headRight - 6},${headTop + 4} ${headRight + 14},${headTop - 1} ${headRight + 10},${headTop + 16}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
    } else {
      back = `<rect class="muscle arm-left" x="${leftMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="muscle arm-right" x="${rightMuscleX}" y="${muscleY}" width="${muscleWidth}" height="${muscleHeight}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
      front = `<rect class="headband" x="${headLeft + 2}" y="${headTop + 6}" width="${Math.max(32, art.head.w - 4)}" height="12" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
        <polygon class="headband-tail" points="${headRight - 4},${headTop + 12} ${headRight + 14},${headTop + 4} ${headRight + 10},${headTop + 22}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
    }
  }

  if (rankIndex === 2) {
    back = "";
    if (shark) {
      front = `<polygon class="crown" points="${art.head.x - 34},${headTop + 4} ${art.head.x - 24},${headTop - 14} ${art.head.x - 14},${headTop + 1} ${art.head.x - 4},${headTop - 14} ${art.head.x + 8},${headTop + 4}"
        fill="#ffd96b" stroke="${palette.stroke}" stroke-width="4" stroke-linejoin="round" />
        <rect class="crown-glint" x="${art.head.x - 22}" y="${headTop - 6}" width="8" height="20" fill="${rgba("#fffdf0", 0.68)}" stroke="none" transform="rotate(18 ${art.head.x - 18} ${headTop + 4})" />`;
    } else {
      front = `<polygon class="crown" points="${art.head.x - 24},${headTop + 6} ${art.head.x - 12},${headTop - 16} ${art.head.x},${headTop + 2} ${art.head.x + 12},${headTop - 16} ${art.head.x + 24},${headTop + 6}"
        fill="#ffd96b" stroke="${palette.stroke}" stroke-width="4" stroke-linejoin="round" />
        <rect class="crown-glint" x="${art.head.x - 8}" y="${headTop - 6}" width="8" height="22" fill="${rgba("#fffdf0", 0.68)}" stroke="none" transform="rotate(18 ${art.head.x - 4} ${headTop + 5})" />`;
    }
  }

  if (rankIndex === 3) {
    const bodyInset = stageTwoPet ? 8 : 10;
    const bodyPlateHeight = stageTwoPet ? Math.max(34, art.body.h - 14) : Math.max(28, art.body.h - 18);
    const headInset = stageTwoPet ? 6 : 8;
    const headPlateY = stageTwoPet ? headTop + 12 : headTop + 10;
    if (shark) {
      front = `<path class="cyber-plate" d="M${bodyLeft + 36} ${bodyTop + 18} H${bodyRight - 92} L${bodyRight - 74} ${bodyTop + 28} H${bodyLeft + 56} Z"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.76)}" stroke-width="4" />
        <path class="cyber-plate" d="M${bodyLeft + 76} ${bodyBottom - 24} H${bodyLeft + 112} L${bodyLeft + 126} ${bodyBottom - 12} H${bodyLeft + 88} Z"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <path class="cyber-plate" d="M${headLeft + 12} ${headTop + 10} H${headRight - 20} L${headRight - 6} ${headTop + 18} L${headRight - 16} ${headTop + 32} H${headLeft + 20} Z"
        fill="${rgba("#9fb4ca", 0.26)}" stroke="${rgba("#ffffff", 0.76)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 20}" y="${art.head.y - 8}" width="${Math.max(12, art.head.w - 36)}" height="8"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <path class="cyber-plate" d="M${headLeft + 22} ${art.head.y + 8} H${headRight - 18} L${headRight - 10} ${art.head.y + 16} H${headLeft + 30} Z"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <path d="M${bodyLeft + 88} ${art.body.y - 2} H${bodyLeft + 122}" stroke="#47ecff" stroke-width="4" stroke-linecap="square" />
        <polygon class="cyber-plate" points="14,122 0,110 8,122 0,134" fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <circle class="cyber-core" cx="${bodyLeft + 104}" cy="${art.body.y}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (dog) {
      front = `<rect class="cyber-plate" x="${bodyLeft + 18}" y="${bodyTop + 18}" width="${Math.max(30, art.body.w - 36)}" height="${Math.max(28, art.body.h - 34)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.76)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyLeft + 30}" y="${bodyTop + 10}" width="${Math.max(30, art.body.w - 60)}" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headLeft + 10},${headTop + 12} ${headRight - 18},${headTop + 12} ${headRight - 8},${headTop + 22} ${headRight - 20},${headTop + 34} ${headLeft + 18},${headTop + 34}"
        fill="${rgba("#9fb4ca", 0.26)}" stroke="${rgba("#ffffff", 0.74)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headLeft + 10},${headTop + 12} ${headLeft + 2},${headTop - 6} ${headLeft + 20},${headTop + 10}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headRight - 10},${headTop + 12} ${headRight - 2},${headTop - 6} ${headRight - 20},${headTop + 10}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 18}" y="${art.head.y - 8}" width="${Math.max(20, art.head.w - 36)}" height="8"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 24}" y="${art.head.y + 8}" width="${Math.max(22, art.head.w - 40)}" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y + 2}" r="8" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (cat) {
      front = `<rect class="cyber-plate" x="${bodyLeft + 16}" y="${bodyTop + 18}" width="${Math.max(28, art.body.w - 32)}" height="${Math.max(28, art.body.h - 30)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.74)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headLeft + 10},${headTop + 14} ${headRight - 10},${headTop + 14} ${headRight - 14},${headTop + 34} ${headLeft + 14},${headTop + 34}"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headLeft + 10},${headTop + 14} ${headLeft + 2},${headTop - 10} ${headLeft + 18},${headTop + 12}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <polygon class="cyber-plate" points="${headRight - 10},${headTop + 14} ${headRight - 2},${headTop - 10} ${headRight - 18},${headTop + 12}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 14}" y="${art.head.y - 8}" width="${Math.max(20, art.head.w - 28)}" height="8"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${art.body.x - 18}" y="${bodyTop + 22}" width="36" height="8"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <path d="M${headLeft + 18} ${art.head.y + 10} H${headLeft + 30}" stroke="#47ecff" stroke-width="4" stroke-linecap="square" />
        <path d="M${headRight - 30} ${art.head.y + 10} H${headRight - 18}" stroke="#47ecff" stroke-width="4" stroke-linecap="square" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y + 2}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (koala) {
      front = `<rect class="cyber-plate" x="${bodyLeft + 12}" y="${bodyTop + 16}" width="${Math.max(34, art.body.w - 24)}" height="${Math.max(32, art.body.h - 26)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.74)}" stroke-width="4" />
        <circle class="cyber-plate" cx="90" cy="70" r="12" fill="${rgba("#9fb4ca", 0.28)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <circle class="cyber-plate" cx="150" cy="70" r="12" fill="${rgba("#9fb4ca", 0.28)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 12}" y="${headTop + 16}" width="${Math.max(26, art.head.w - 24)}" height="${Math.max(24, art.head.h - 30)}"
        fill="${rgba("#9fb4ca", 0.26)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 18}" y="${art.head.y - 8}" width="${Math.max(16, art.head.w - 36)}" height="10"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 24}" y="${art.head.y + 8}" width="${Math.max(14, art.head.w - 48)}" height="12"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${art.body.x - 16}" y="${bodyTop + 24}" width="32" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (bear) {
      front = `<rect class="cyber-plate" x="${bodyLeft + 10}" y="${bodyTop + 14}" width="${Math.max(36, art.body.w - 20)}" height="${Math.max(34, art.body.h - 24)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.76)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyLeft + 8}" y="${bodyTop + 16}" width="20" height="18"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyRight - 28}" y="${bodyTop + 16}" width="20" height="18"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyLeft + 26}" y="${bodyTop + 8}" width="${Math.max(26, art.body.w - 52)}" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 10}" y="${headTop + 12}" width="${Math.max(28, art.head.w - 20)}" height="${Math.max(24, art.head.h - 24)}"
        fill="${rgba("#9fb4ca", 0.26)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 16}" y="${art.head.y - 8}" width="${Math.max(20, art.head.w - 32)}" height="10"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 22}" y="${art.head.y + 10}" width="${Math.max(16, art.head.w - 44)}" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y}" r="8" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (ape) {
      front = `<rect class="cyber-plate" x="${bodyLeft + 14}" y="${bodyTop + 16}" width="${Math.max(34, art.body.w - 28)}" height="${Math.max(34, art.body.h - 24)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.76)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyLeft - 2}" y="${bodyTop + 20}" width="18" height="${Math.max(30, art.body.h - 22)}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyRight - 16}" y="${bodyTop + 20}" width="18" height="${Math.max(30, art.body.h - 22)}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + 12}" y="${headTop + 14}" width="${Math.max(28, art.head.w - 24)}" height="${Math.max(24, art.head.h - 24)}"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 16}" y="${art.head.y - 8}" width="${Math.max(20, art.head.w - 32)}" height="10"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${art.body.x - 22}" y="${art.body.y - 4}" width="44" height="10"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y + 10}" r="8" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else if (fly) {
      front = `<rect class="cyber-plate" x="${headLeft + 2}" y="${headTop + 4}" width="${Math.max(38, art.head.w - 4)}" height="18"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + 6}" y="${headTop + 8}" width="${Math.max(30, art.head.w - 12)}" height="10"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <rect class="cyber-plate" x="${bodyLeft + 8}" y="${bodyTop + 8}" width="${Math.max(40, art.body.w - 16)}" height="${Math.max(34, art.body.h - 28)}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="${art.body.x - 12}" y="${bodyBottom - 12}" width="24" height="18"
        fill="${rgba("#9fb4ca", 0.24)}" stroke="${rgba("#ffffff", 0.72)}" stroke-width="4" />
        <rect class="cyber-plate" x="58" y="86" width="22" height="12" fill="${rgba("#9fb4ca", 0.2)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="3" />
        <rect class="cyber-plate" x="160" y="86" width="22" height="12" fill="${rgba("#9fb4ca", 0.2)}" stroke="${rgba("#ffffff", 0.62)}" stroke-width="3" />
        <path d="M80 92 H94" stroke="#47ecff" stroke-width="4" stroke-linecap="square" />
        <path d="M146 92 H160" stroke="#47ecff" stroke-width="4" stroke-linecap="square" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else {
      front = `<rect class="cyber-plate" x="${bodyLeft + bodyInset}" y="${bodyTop + 10}" width="${Math.max(30, art.body.w - bodyInset * 2)}" height="${bodyPlateHeight}"
        fill="${palette.metal}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <rect class="cyber-plate" x="${headLeft + headInset}" y="${headPlateY}" width="${Math.max(28, art.head.w - headInset * 2)}" height="${Math.max(22, art.head.h - 18)}"
        fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
        <rect class="visor" x="${headLeft + headInset}" y="${art.head.y - 8}" width="${Math.max(24, art.head.w - headInset * 2)}" height="16"
        fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
        <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
    }
  }

  if (rankIndex === 4) {
    if (shark) {
      back = `<ellipse class="aura" cx="${art.body.x + 10}" cy="${art.body.y - 8}" rx="${Math.max(70, art.body.w * 0.92)}" ry="${Math.max(34, art.body.h * 0.48)}"
        fill="${rgba(palette.primary, 0.18)}" />
        <ellipse class="aura" cx="${art.body.x + 6}" cy="${art.body.y - 10}" rx="${Math.max(54, art.body.w * 0.7)}" ry="${Math.max(20, art.body.h * 0.28)}"
        fill="${rgba("#ffffff", 0.12)}" />
        <rect class="sparkle" x="${art.body.x - 44}" y="${art.body.y - 54}" width="8" height="8" fill="#fff7cc" />
        <rect class="sparkle" x="${art.body.x + 40}" y="${art.body.y - 34}" width="8" height="8" fill="#fff7cc" />`;
      front = `<ellipse class="halo" cx="${art.head.x - 12}" cy="${headTop - 18}" rx="${Math.max(18, art.head.w * 0.34)}" ry="6" fill="none" stroke="#fff4b8" stroke-width="5" />
        <polygon class="crown" points="${art.head.x - 28},${headTop + 1} ${art.head.x - 18},${headTop - 14} ${art.head.x - 8},${headTop - 2} ${art.head.x + 2},${headTop - 14} ${art.head.x + 12},${headTop + 1}"
        fill="#ffe99c" stroke="${palette.stroke}" stroke-width="4" stroke-linejoin="round" />
        <circle class="sparkle" cx="${art.head.x - 2}" cy="${headTop - 24}" r="5" fill="#ffffff" stroke="${palette.stroke}" stroke-width="3" />`;
    } else {
      back = `<ellipse class="aura" cx="${art.body.x}" cy="${art.body.y - 14}" rx="${Math.max(48, art.body.w * 0.72)}" ry="${Math.max(44, art.body.h * 0.62)}"
        fill="${rgba(palette.primary, 0.18)}" />
        <ellipse class="aura" cx="${art.body.x}" cy="${art.body.y - 14}" rx="${Math.max(34, art.body.w * 0.52)}" ry="${Math.max(28, art.body.h * 0.42)}"
        fill="${rgba("#ffffff", 0.12)}" />
        <rect class="sparkle" x="${art.body.x - 44}" y="${art.body.y - 54}" width="8" height="8" fill="#fff7cc" />
        <rect class="sparkle" x="${art.body.x + 36}" y="${art.body.y - 38}" width="8" height="8" fill="#fff7cc" />`;
      front = `<ellipse class="halo" cx="${art.head.x}" cy="${headTop - 10}" rx="${Math.max(20, art.head.w * 0.44)}" ry="8" fill="none" stroke="#fff4b8" stroke-width="5" />
        <polygon class="crown" points="${art.head.x - 20},${headTop + 4} ${art.head.x - 10},${headTop - 12} ${art.head.x},${headTop + 1} ${art.head.x + 10},${headTop - 12} ${art.head.x + 20},${headTop + 4}"
        fill="#ffe99c" stroke="${palette.stroke}" stroke-width="4" stroke-linejoin="round" />
        <circle class="sparkle" cx="${art.head.x}" cy="${headTop - 22}" r="5" fill="#ffffff" stroke="${palette.stroke}" stroke-width="3" />`;
    }
  }

  return { back, front };
}

function buildCreatureSvg(speciesId, rankIndex) {
  const species = getSpecies(speciesId);
  const palette = {
    primary: species.colors.primary,
    secondary: species.colors.secondary,
    stroke: "#120d09",
    wing: rgba("#ffffff", 0.78),
    metal: "rgba(164, 191, 218, 0.62)"
  };
  const art = getSpeciesArt(speciesId, palette);
  const decoration = getRankDecoration(speciesId, rankIndex, art, palette);

  return `<svg class="creature-svg creature-svg--${speciesId}" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" shape-rendering="crispEdges">
      <ellipse cx="120" cy="212" rx="56" ry="12" fill="rgba(0, 0, 0, 0.28)" />
      ${decoration.back}
      <g class="creature-base">${art.markup}</g>
      ${decoration.front}
    </svg>`;
}

function buildCreatureMarkup(speciesId, rankIndex, variant, size) {
  return `<div class="creature-graphic is-${variant}" style="width:${size}px;height:${size}px;">${buildCreatureSvg(speciesId, rankIndex)}</div>`;
}

function getMainCreatureSize() {
  return clamp(280 + state.stageIndex * 14 + state.rankIndex * 12, 260, 340);
}

function getMainCreatureScale() {
  const rank = getRank();
  return rank.growthMin + (rank.growthMax - rank.growthMin) * getProgressRatio();
}

function getHelperEntries() {
  const total = state.helperCounts.reduce((sum, count) => sum + count, 0);
  if (!total) {
    return [];
  }
  const maxVisible = total <= 18 ? total : Math.min(32, 18 + Math.ceil(Math.sqrt(total - 18) * 3));
  const groupSize = Math.max(1, Math.ceil(total / maxVisible));
  const entries = [];
  let remaining = total;
  while (remaining > 0) {
    const count = Math.min(groupSize, remaining);
    entries.push({ count });
    remaining -= count;
  }
  return entries;
}

function renderSelection() {
  const stage = getStage();
  const signature = `${state.mode}:${state.stageIndex}`;
  DOM.body.classList.toggle("is-selecting", state.mode === "select");
  DOM.selectionOverlay.hidden = state.mode !== "select";
  DOM.selectionEyebrow.textContent = `${stage.label} chamber / base boost x${getStageBonus().toFixed(2)}`;
  DOM.selectionTitle.textContent = stage.title;
  DOM.selectionCopy.textContent = getSelectionCopy();
  if (renderCache.selection === signature) {
    return;
  }
  DOM.selectionGrid.innerHTML = stage.choices.map((speciesId) => {
    const species = getSpecies(speciesId);
    return `<button class="selection-card" type="button" data-select-species="${speciesId}">
        <div class="selection-preview">${buildCreatureMarkup(speciesId, 0, "picker", 152)}</div>
        <div class="selection-name">Worker ${species.name}</div>
        <p class="selection-desc">${species.description}</p>
        <p class="selection-desc">Resource: ${species.resource}</p>
      </button>`;
  }).join("");
  renderCache.selection = signature;
}

function renderHud(snapshot) {
  const species = getSpecies();
  const celestial = isCelestialSpecies();
  DOM.stageValue.textContent = celestial ? "Secret" : getStage().label;
  DOM.resourceLabelValue.textContent = species ? `${species.resource} Total` : "Choose Animal";
  DOM.resourceTotalValue.textContent = formatNumber(state.resources);
  DOM.resourcePerSecondValue.textContent = `${formatNumber(getPassivePerSecond(snapshot))} / sec`;
  if (!species) {
    DOM.formEyebrow.textContent = `${getStage().label} / selection`;
    DOM.formTitle.textContent = `Choose ${getStage().label} Animal`;
  } else if (celestial) {
    DOM.formEyebrow.textContent = state.celestialComplete ? "FINAL SIGNAL / EVOLUTION COMPLETE" : "FINAL SIGNAL / HIDDEN ASCENT";
    DOM.formTitle.textContent = "CELESTIAL";
  } else {
    DOM.formEyebrow.textContent = `${getStage().label} / ${getRank().label} rank`;
    DOM.formTitle.textContent = getFormName();
  }
  DOM.muteButton.textContent = state.mute ? "SFX OFF" : "SFX ON";
  DOM.muteButton.setAttribute("aria-pressed", String(!state.mute));
}

function renderMainCreature() {
  const species = getSpecies();
  if (!species) {
    DOM.mainCreatureWrap.style.visibility = "hidden";
    DOM.mainCreatureMount.replaceChildren();
    DOM.mainResourceChip.textContent = "RESOURCE";
    DOM.mainCreatureButton.disabled = true;
    return;
  }
  const signature = `${species.name}:${state.rankIndex}`;
  const size = getMainCreatureSize();
  const scale = getMainCreatureScale();
  DOM.mainCreatureWrap.style.visibility = "visible";
  DOM.mainCreatureLabel.textContent = isCelestialSpecies() ? "CELESTIAL" : species.name.toUpperCase();
  DOM.mainRankChip.textContent = isCelestialSpecies() ? "CELESTIAL" : getRank().label.toUpperCase();
  DOM.mainResourceChip.textContent = species.resource.toUpperCase();
  DOM.mainCreatureButton.disabled = state.mode !== "play";
  DOM.mainCreatureButton.setAttribute("aria-label", `Collect ${species.resource}`);
  if (renderCache.main !== signature || !DOM.mainCreatureMount.querySelector(".creature-graphic")) {
    DOM.mainCreatureMount.innerHTML = buildCreatureMarkup(state.speciesId, state.rankIndex, "main", size);
    renderCache.main = signature;
  }
  const graphic = DOM.mainCreatureMount.querySelector(".creature-graphic");
  if (graphic) {
    graphic.style.width = `${size}px`;
    graphic.style.height = `${size}px`;
    graphic.style.transform = `scale(${scale.toFixed(3)})`;
  }
}

function renderHelpers() {
  const species = getSpecies();
  if (!species) {
    DOM.helperLayer.replaceChildren();
    renderCache.helpers = "";
    return;
  }
  const entries = getHelperEntries();
  if (!entries.length) {
    DOM.helperLayer.replaceChildren();
    renderCache.helpers = "empty";
    return;
  }
  const width = DOM.creatureDisplay.clientWidth || 720;
  const height = DOM.creatureDisplay.clientHeight || 360;
  const signature = `${species.name}:${state.rankIndex}:${state.helperCounts.join("-")}:${width}x${height}`;
  if (renderCache.helpers === signature) {
    return;
  }
  const baseRadiusX = clamp(width * 0.23, 92, 170);
  const baseRadiusY = clamp(height * 0.2, 70, 128);
  const ringStepX = clamp(width * 0.055, 20, 36);
  const ringStepY = clamp(height * 0.05, 16, 30);
  const helperSize = clamp(36 - entries.length * 0.55, 18, 32);
  DOM.helperLayer.innerHTML = entries.map((entry, index) => {
    const ring = Math.floor(Math.sqrt(index / 8) * 2);
    const slots = 10 + ring * 6;
    const slot = index % slots;
    const angle = (slot / slots) * Math.PI * 2 + ring * 0.22;
    const x = Math.cos(angle) * (baseRadiusX + ring * ringStepX);
    const y = Math.sin(angle) * (baseRadiusY + ring * ringStepY);
    return `<div class="helper-node" style="left:calc(50% + ${x.toFixed(1)}px); top:calc(50% + ${y.toFixed(1)}px); --helper-size:${helperSize}px; animation-delay:${(index % 9) * 0.12}s;">
        ${buildCreatureMarkup(state.speciesId, state.rankIndex, "helper", helperSize)}
        ${entry.count > 1 ? `<span class="helper-count">x${entry.count}</span>` : ""}
      </div>`;
  }).join("");
  renderCache.helpers = signature;
}

function getHelperCopy(species, index) {
  const resource = species.resource.toLowerCase();
  const patterns = [
    `Brings home the first ${resource} scraps.`,
    `Finds cleaner ${resource} routes.`,
    `Keeps passive ${resource} rolling fast.`,
    `Turns the whole ${species.name.toLowerCase()} engine into a machine.`
  ];
  return patterns[index] || `Builds more ${resource} every second.`;
}

function preserveShopScroll(renderList) {
  const scroller = DOM.shopScroll;
  if (!scroller) {
    renderList();
    return;
  }
  const previousTop = scroller.scrollTop;
  renderList();
  scroller.scrollTop = previousTop;
}

function getUpgradeLabel(index) {
  const upgrade = UPGRADE_BLUEPRINTS[index];
  const amount = upgrade.amount + state.stageIndex * upgrade.stageAmount;
  switch (upgrade.effect) {
    case "clickMultiplier":
      return `Click x${amount.toFixed(2)}`;
    case "passiveMultiplier":
      return `Passive x${amount.toFixed(2)}`;
    case "helperMultiplier":
      return `Helpers x${amount.toFixed(2)}`;
    case "progressMultiplier":
      return `Progress x${amount.toFixed(2)}`;
    case "stageMultiplier":
      return `Stage x${amount.toFixed(2)}`;
    default:
      return "Upgrade online";
  }
}

function renderHelpersList(snapshot) {
  const species = getSpecies();
  if (!species) {
    DOM.helpersList.innerHTML = `<div class="empty-state">Pick an animal to unlock the helper roster.</div>`;
    renderCache.helpersList = "empty";
    return;
  }
  const affordability = HELPER_BLUEPRINTS.map((helper, index) => (canAfford(getHelperCost(index)) ? "1" : "0")).join("");
  const signature = [
    species.name,
    state.stageIndex,
    state.rankIndex,
    state.helperCounts.join("-"),
    affordability,
    snapshot.passiveMultiplier.toFixed(3),
    snapshot.helperMultiplier.toFixed(3),
    snapshot.stageMultiplier.toFixed(3)
  ].join(":");
  if (renderCache.helpersList === signature) {
    return;
  }
  preserveShopScroll(() => {
    DOM.helpersList.innerHTML = HELPER_BLUEPRINTS.map((helper, index) => {
      const cost = getHelperCost(index);
      const output = getHelperIncome(index, snapshot);
      const owned = state.helperCounts[index];
      const affordable = canAfford(cost);
      return `<article class="shop-item ${affordable ? "is-affordable" : ""}">
          <div class="shop-top">
            <div>
              <h3>${species.helperNames[index]}</h3>
              <p class="shop-copy">${getHelperCopy(species, index)}</p>
            </div>
            <span class="owned-pill">x${owned}</span>
          </div>
          <div class="shop-bottom">
            <div class="shop-meta">
              <span>${formatNumber(output)} ${species.resource}/sec each</span>
              <span>Cost: ${formatNumber(cost)}</span>
            </div>
            <button class="shop-buy" type="button" data-buy-helper="${index}" ${affordable ? "" : "disabled"}>BUY</button>
          </div>
        </article>`;
    }).join("");
  });
  renderCache.helpersList = signature;
}

function renderUpgradesList() {
  const species = getSpecies();
  if (!species) {
    DOM.upgradesList.innerHTML = `<div class="empty-state">Pick an animal to unlock themed upgrades.</div>`;
    renderCache.upgradesList = "empty";
    return;
  }
  const affordability = UPGRADE_BLUEPRINTS.map((upgrade, index) => (canAfford(getUpgradeCost(index)) ? "1" : "0")).join("");
  const signature = `${species.name}:${state.stageIndex}:${state.ownedUpgrades.join("|")}:${affordability}`;
  if (renderCache.upgradesList === signature) {
    return;
  }
  preserveShopScroll(() => {
    DOM.upgradesList.innerHTML = UPGRADE_BLUEPRINTS.map((upgrade, index) => {
      const cost = getUpgradeCost(index);
      const owned = state.ownedUpgrades.includes(index);
      const affordable = canAfford(cost);
      return `<article class="shop-item ${affordable && !owned ? "is-affordable" : ""} ${owned ? "is-owned" : ""}">
          <div class="shop-top">
            <div>
              <h3>${species.upgradeNames[index]}</h3>
              <p class="shop-copy">${upgrade.blurb}</p>
            </div>
            <span class="owned-pill">${owned ? "OWNED" : "NEW"}</span>
          </div>
          <div class="shop-bottom">
            <div class="shop-meta">
              <span>Cost: ${formatNumber(cost)}</span>
              <span>${getUpgradeLabel(index)}</span>
            </div>
            <button class="shop-buy ${owned ? "is-owned" : ""}" type="button" data-buy-upgrade="${index}" ${owned || !affordable ? "disabled" : ""}>
              ${owned ? "OWNED" : "BUY"}
            </button>
          </div>
        </article>`;
    }).join("");
  });
  renderCache.upgradesList = signature;
}

function renderShop(snapshot) {
  const species = getSpecies();
  const helperTotal = state.helperCounts.reduce((sum, count) => sum + count, 0);
  DOM.shopStatusValue.textContent = species
    ? isCelestialSpecies()
      ? state.celestialComplete
        ? `Final form awake / ${formatNumber(helperTotal)} helpers`
        : `Hidden ascent / ${formatNumber(helperTotal)} helpers`
      : `${formatNumber(helperTotal)} helpers / ${state.ownedUpgrades.length} upgrades`
    : "Build helpers and upgrades";
  DOM.nextTargetValue.textContent = species
    ? isCelestialSpecies()
      ? state.celestialComplete
        ? "Evolution Complete"
        : "Next: CELESTIAL"
      : `Next: ${getNextRank() ? `${getNextRank().label} ${species.name}` : state.stageIndex < STAGES.length - 1 ? `${STAGES[state.stageIndex + 1].label} unlock` : "Final clear"}`
    : "Next: choose animal";
  renderHelpersList(snapshot);
  renderUpgradesList();
  const helpersActive = state.activeTab === "helpers";
  DOM.helpersTabButton.classList.toggle("is-active", helpersActive);
  DOM.upgradesTabButton.classList.toggle("is-active", !helpersActive);
  DOM.helpersTabButton.setAttribute("aria-selected", String(helpersActive));
  DOM.upgradesTabButton.setAttribute("aria-selected", String(!helpersActive));
  DOM.helpersList.hidden = !helpersActive;
  DOM.upgradesList.hidden = helpersActive;
}

function renderProgress() {
  const species = getSpecies();
  const progressRatio = species ? getProgressRatio() : 0;
  const progressPercent = `${(progressRatio * 100).toFixed(2)}%`;
  const progressStack = DOM.progressStack || document.querySelector("#progressStack");
  const progressActionRow = DOM.progressActionRow || document.querySelector("#progressActionRow");
  const primaryActionButton = DOM.primaryActionButton || document.querySelector("#primaryActionButton");
  const progressMeterFill = DOM.progressMeterFill || document.querySelector("#progressMeterFill");
  const progressMeterLabel = DOM.progressMeterLabel || document.querySelector("#progressMeterLabel");
  if (progressMeterFill) {
    progressMeterFill.style.width = progressPercent;
  }
  if (progressMeterLabel) {
    progressMeterLabel.textContent = species
      ? `${formatNumber(getCurrentProgressValue())} / ${formatNumber(getThreshold())} ${species.resource}`
      : "Pick a stage animal to start the run.";
  }
  const isReady = canRankUp();
  DOM.evolutionCard.hidden = false;
  DOM.evolutionCard.classList.toggle("is-ready", isReady);
  if (progressStack) {
    progressStack.hidden = false;
  }
  if (progressActionRow) {
    progressActionRow.hidden = true;
  }
  if (primaryActionButton) {
    primaryActionButton.hidden = true;
  }
  if (!species) {
    DOM.progressTitle.textContent = `Choose ${getStage().label} Animal`;
    return;
  }
  if (isCelestialSpecies()) {
    DOM.evolutionCard.classList.remove("is-ready");
    if (state.celestialComplete) {
      DOM.evolutionCard.hidden = true;
      return;
    }
    DOM.progressTitle.textContent = "Ascend To CELESTIAL";
    if (progressMeterFill) {
      progressMeterFill.style.width = progressPercent;
    }
    if (progressMeterLabel) {
      progressMeterLabel.textContent = `${formatNumber(getCurrentProgressValue())} / ${formatNumber(getThreshold())} STARS`;
    }
    return;
  }
  if (canRankUp()) {
    const nextRank = getNextRank();
    DOM.progressTitle.textContent = `${nextRank.label} ${species.name} Ready`;
    if (progressStack) {
      progressStack.hidden = true;
    }
    if (progressActionRow) {
      progressActionRow.hidden = false;
    }
    if (primaryActionButton) {
      primaryActionButton.textContent = `Rank Up To ${nextRank.label}`;
      primaryActionButton.hidden = false;
    }
    return;
  }
  const nextRank = getNextRank();
  DOM.progressTitle.textContent = nextRank ? `Grow into ${nextRank.label} ${species.name}` : state.stageIndex < STAGES.length - 1 ? `Complete God ${species.name} to unlock ${STAGES[state.stageIndex + 1].label}` : `Finish God ${species.name}`;
}

function renderAll() {
  applyTheme();
  const snapshot = getUpgradeSnapshot();
  renderSelection();
  renderHud(snapshot);
  renderMainCreature();
  renderHelpers();
  renderShop(snapshot);
  renderProgress();
}

function chooseSpecies(speciesId) {
  const species = getSpecies(speciesId);
  if (state.mode !== "select" || !species || species.stage !== state.stageIndex || state.stageIndex > state.unlockedStageIndex) {
    return;
  }
  state.speciesId = speciesId;
  state.chosenAnimals[state.stageIndex] = speciesId;
  state.stageCompleted[state.stageIndex] = false;
  state.mode = "play";
  resetRunProgress();
  playRankSound();
  queueToast(`${getFormName()} online.`);
  markDirty();
}

function rankUp() {
  if (!canRankUp()) {
    return;
  }
  state.resources = 0;
  state.rankIndex += 1;
  state.rankProgress = 0;
  renderCache.main = "";
  renderCache.helpers = "";
  playRankSound();
  queueToast(`${getFormName()} online.`);
  markDirty();
}

function advanceStage() {
  if (!canAdvanceStage()) {
    return;
  }
  const clearedStageIndex = state.stageIndex;
  const clearedSpecies = getSpecies();
  state.stageIndex += 1;
  state.unlockedStageIndex = state.stageIndex;
  state.prestigeMultiplier = STAGE_BONUSES[state.stageIndex];
  state.speciesId = null;
  state.mode = "select";
  resetRunProgress();
  playRankSound();
  queueToast(`${STAGES[clearedStageIndex].label} cleared with God ${clearedSpecies.name}. ${getStage().label} unlocked at x${getStageBonus().toFixed(2)}.`);
  markDirty();
}

function spendResources(cost) {
  if (!canAfford(cost)) {
    return false;
  }
  state.resources -= cost;
  state.rankProgress = state.resources;
  markDirty();
  return true;
}

function buyHelper(index) {
  if (!getSpecies()) {
    return;
  }
  const cost = getHelperCost(index);
  if (!spendResources(cost)) {
    return;
  }
  state.helperCounts[index] += 1;
  renderCache.helpers = "";
  renderCache.helpersList = "";
  playShopSound();
  markDirty();
}

function buyUpgrade(index) {
  if (!getSpecies() || state.ownedUpgrades.includes(index)) {
    return;
  }
  const cost = getUpgradeCost(index);
  if (!spendResources(cost)) {
    return;
  }
  state.ownedUpgrades.push(index);
  renderCache.helpersList = "";
  renderCache.upgradesList = "";
  playShopSound();
  queueToast(`${getSpecies().upgradeNames[index]} installed.`);
  markDirty();
}

function handlePrimaryAction() {
  if (canRankUp()) {
    rankUp();
  }
}

function handleCreatureClick(event) {
  if (state.mode !== "play" || !getSpecies()) {
    return;
  }
  const snapshot = getUpgradeSnapshot();
  const clickValue = getClickValue(snapshot);
  const point = getScenePoint(event);
  addGain(clickValue, snapshot.progressMultiplier);
  DOM.mainCreatureButton.classList.remove("is-pressing");
  void DOM.mainCreatureButton.offsetWidth;
  DOM.mainCreatureButton.classList.add("is-pressing");
  window.setTimeout(() => DOM.mainCreatureButton.classList.remove("is-pressing"), 260);
  spawnFloat(`${isCelestialSpecies() ? "★" : "+"}${formatNumber(clickValue)}`, point.x, point.y);
  if (isCelestialSpecies()) {
    spawnCelestialBurst(point.x, point.y);
  }
  playClickSound();
}

function toggleMute() {
  state.mute = !state.mute;
  markDirty();
}

function setActiveTab(tab) {
  state.activeTab = tab;
  markDirty();
}

function loop(now) {
  const deltaSeconds = Math.min((now - state.lastFrameAt) / 1000, 0.12);
  state.lastFrameAt = now;
  if (state.mode === "play" && getSpecies()) {
    const snapshot = getUpgradeSnapshot();
    const passiveGain = getPassivePerSecond(snapshot) * deltaSeconds;
    if (passiveGain > 0) {
      addGain(passiveGain, snapshot.progressMultiplier);
    }
  }
  if (state.uiDirty || now - state.lastRenderAt > 140) {
    renderAll();
    state.uiDirty = false;
    state.lastRenderAt = now;
  }
  if (state.saveDirty && now - state.lastSaveAt > 900) {
    saveState();
    state.lastSaveAt = now;
  }
  window.requestAnimationFrame(loop);
}

function bindEvents() {
  DOM.selectionGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-species]");
    if (button) {
      chooseSpecies(button.dataset.selectSpecies);
    }
  });
  DOM.mainCreatureButton.addEventListener("click", handleCreatureClick);
  DOM.mainCreatureButton.addEventListener("pointerdown", ensureAudio);
  DOM.muteButton.addEventListener("click", toggleMute);
  DOM.helpersTabButton.addEventListener("click", () => setActiveTab("helpers"));
  DOM.upgradesTabButton.addEventListener("click", () => setActiveTab("upgrades"));
  DOM.primaryActionButton.addEventListener("click", handlePrimaryAction);
  DOM.helpersList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-helper]");
    if (button) {
      buyHelper(Number(button.dataset.buyHelper));
    }
  });
  DOM.upgradesList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-upgrade]");
    if (button) {
      buyUpgrade(Number(button.dataset.buyUpgrade));
    }
  });
  window.addEventListener("resize", () => {
    renderCache.helpers = "";
    markDirty();
  });
}

function init() {
  loadState();
  bindEvents();
  applyTheme();
  renderAll();
  window.addEventListener("beforeunload", saveState);
  window.requestAnimationFrame(loop);
}

init();

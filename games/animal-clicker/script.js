const STAGES = [
  { index: 0, label: "Stage 1", title: "Choose Your Character", copy: "Pick one starter and build it from Worker to God form before Stage 2 opens.", choices: ["ant", "fly", "bee"] },
  { index: 1, label: "Stage 2", title: "Choose Your Stage 2 Animal", copy: "Stage 2 resets the run, but your permanent boost is stronger. Pick one animal and climb every rank again.", choices: ["dog", "cat", "koala"] },
  { index: 2, label: "Stage 3", title: "Choose Your Final Animal", copy: "This is the last stage for now. Pick one final animal and push it all the way into God form.", choices: ["shark", "bear", "ape"] }
];

const RANKS = [
  { id: "worker", label: "Worker", nextLabel: "Enforcer", thresholds: [700, 5200, 42000], clickMultiplier: 1, passiveMultiplier: 1, growthMin: 1, growthMax: 1.18 },
  { id: "enforcer", label: "Enforcer", nextLabel: "Queen", thresholds: [4800, 34000, 250000], clickMultiplier: 1.75, passiveMultiplier: 1.6, growthMin: 1.08, growthMax: 1.28 },
  { id: "queen", label: "Queen", nextLabel: "Cyber", thresholds: [26000, 180000, 1200000], clickMultiplier: 2.7, passiveMultiplier: 2.45, growthMin: 1.14, growthMax: 1.34 },
  { id: "cyber", label: "Cyber", nextLabel: "God", thresholds: [125000, 850000, 5200000], clickMultiplier: 4.2, passiveMultiplier: 3.8, growthMin: 1.2, growthMax: 1.42 },
  { id: "god", label: "God", nextLabel: null, thresholds: [580000, 4100000, 22000000], clickMultiplier: 6.2, passiveMultiplier: 5.8, growthMin: 1.28, growthMax: 1.52 }
];

const STAGE_BONUSES = [1, 1.75, 2.5];
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
    stage: 2, name: "Bear", resource: "Claws", description: "Maul the forest and bank brute force.", clickBase: 2.7, helperScale: 5.6, costScale: 3.25,
    colors: { primary: "#d9a06c", secondary: "#7d4a23", strong: "#ffe0c0" },
    helperNames: ["Forest Cub", "River Forager", "Cave Bruiser", "Mountain Alpha"],
    upgradeNames: ["Iron Paws", "Forest Roar", "Cub Guard", "Cave Fury", "Titan Roar Engine"]
  },
  ape: {
    stage: 2, name: "Ape", resource: "Totems", description: "Build jungle power with a full troop.", clickBase: 2.7, helperScale: 5.6, costScale: 3.25,
    colors: { primary: "#a6ff73", secondary: "#4c8a2b", strong: "#e6ffcc" },
    helperNames: ["Young Ape", "Troop Scout", "Vine Runner", "Primal Alpha"],
    upgradeNames: ["Heavy Fists", "Vine Routes", "Troop Order", "Jungle Rhythm", "Stone Crown Core"]
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
  helperCounts: Array(HELPER_BLUEPRINTS.length).fill(0),
  ownedUpgrades: [],
  activeTab: "helpers",
  mute: false,
  uiDirty: true,
  lastFrameAt: performance.now(),
  lastRenderAt: 0
};

const audioState = { context: null };
const renderCache = { selection: "", main: "", helpers: "", helpersList: "", upgradesList: "", theme: "" };

function markDirty() {
  state.uiDirty = true;
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

function getRank(rankIndex = state.rankIndex) {
  return RANKS[rankIndex] || RANKS[0];
}

function getNextRank() {
  return RANKS[state.rankIndex + 1] || null;
}

function getThreshold() {
  return getRank().thresholds[state.stageIndex];
}

function getProgressRatio() {
  return clamp(state.resources / getThreshold(), 0, 1);
}

function isFinalRank(rankIndex = state.rankIndex) {
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
  return Boolean(getSpecies()) && !isFinalRank() && isCurrentRankComplete();
}

function canAdvanceStage() {
  return Boolean(getSpecies()) && state.stageIndex < STAGES.length - 1 && state.stageCompleted[state.stageIndex];
}

function isFinalStageComplete() {
  return state.stageIndex === STAGES.length - 1 && state.stageCompleted[state.stageIndex];
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

function syncStageCompletion() {
  const species = getSpecies();
  if (!species || !isFinalRank() || !isCurrentRankComplete() || state.stageCompleted[state.stageIndex]) {
    return;
  }
  state.stageCompleted[state.stageIndex] = true;
  if (state.stageIndex < STAGES.length - 1) {
    state.unlockedStageIndex = Math.max(state.unlockedStageIndex, state.stageIndex + 1);
    advanceStage();
    return;
  }
  playRankSound();
  queueToast(`God ${species.name} complete. Stage 3 cleared.`);
}

function applyTheme() {
  const species = getThemeSpecies();
  const signature = `${species.name}:${state.stageIndex}`;
  if (renderCache.theme === signature) {
    return;
  }
  const rgb = hexToRgb(species.colors.primary);
  document.documentElement.style.setProperty("--accent", species.colors.primary);
  document.documentElement.style.setProperty("--accent-secondary", species.colors.secondary);
  document.documentElement.style.setProperty("--accent-strong", species.colors.strong);
  document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
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
          <polygon class="tail" points="120,166 108,188 132,188" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="eye eye-left" x="102" y="68" width="10" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="128" y="68" width="10" height="10" fill="${palette.stroke}" />
          <rect class="mouth" x="110" y="82" width="20" height="4" fill="${rgba("#fff5cc", 0.48)}" />`
      };
    case "dog":
      return {
        head: { x: 120, y: 92, w: 68, h: 60 },
        body: { x: 120, y: 154, w: 116, h: 84 },
        markup: `<g fill="none" stroke="${palette.stroke}" stroke-width="8" stroke-linecap="square">
            <path class="tail tail-right" d="M172 146 L194 126 L192 100" />
            <path class="leg" d="M90 162 L90 194" /><path class="leg" d="M150 162 L150 194" />
            <path class="leg" d="M72 158 L72 192" /><path class="leg" d="M168 158 L168 192" />
          </g>
          <rect x="84" y="120" width="72" height="52" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="92" y="58" width="56" height="52" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <polygon class="ear ear-left" points="94,56 72,90 96,92" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="ear ear-right" points="146,56 168,90 144,92" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-left" x="102" y="72" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="72" width="8" height="10" fill="${palette.stroke}" />
          <rect x="112" y="86" width="16" height="12" fill="${rgba("#fff0c9", 0.78)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="mouth" x="114" y="98" width="12" height="4" fill="${rgba("#ffffff", 0.32)}" />`
      };
    case "cat":
      return {
        head: { x: 120, y: 88, w: 64, h: 58 },
        body: { x: 120, y: 150, w: 104, h: 78 },
        markup: `<g fill="none" stroke="${palette.stroke}" stroke-width="7" stroke-linecap="square">
            <path class="tail tail-right" d="M164 148 L188 122 L180 88" />
            <path d="M104 94 L78 98" /><path d="M136 94 L162 98" />
            <path d="M104 104 L78 110" /><path d="M136 104 L162 110" />
          </g>
          <rect x="88" y="120" width="64" height="52" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="92" y="58" width="56" height="50" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <polygon class="ear ear-left" points="94,56 74,86 98,86" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="ear ear-right" points="146,56 166,86 142,86" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-left" x="102" y="72" width="8" height="12" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="72" width="8" height="12" fill="${palette.stroke}" />
          <rect class="mouth" x="114" y="92" width="12" height="4" fill="${rgba("#ffffff", 0.28)}" />`
      };
    case "koala":
      return {
        head: { x: 120, y: 94, w: 72, h: 66 },
        body: { x: 120, y: 154, w: 104, h: 84 },
        markup: `<circle class="ear ear-left" cx="90" cy="70" r="22" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <circle class="ear ear-right" cx="150" cy="70" r="22" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="120" width="68" height="54" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect x="90" y="60" width="60" height="60" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="eye eye-left" x="102" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect x="110" y="92" width="20" height="16" fill="${palette.stroke}" />
          <rect class="mouth" x="114" y="110" width="12" height="4" fill="${rgba("#ffffff", 0.24)}" />`
      };
    case "shark":
      return {
        head: { x: 98, y: 114, w: 58, h: 44 },
        body: { x: 138, y: 120, w: 136, h: 70 },
        markup: `<path d="M38 120 L78 90 H152 L196 104 L212 120 L196 136 L152 150 H78 Z" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="tail tail-left" points="38,120 10,98 16,120 10,142" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="fin" points="116,88 138,46 158,88" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <polygon class="fin" points="128,132 154,154 126,152" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="eye eye-right" x="82" y="108" width="8" height="8" fill="${palette.stroke}" />
          <path class="mouth" d="M70 126 H114" stroke="${palette.stroke}" stroke-width="4" stroke-linecap="square" />
          <path d="M74 126 L80 132 L86 126 L92 132 L98 126 L104 132 L110 126" stroke="${rgba("#ffffff", 0.62)}" stroke-width="3" fill="none" />`
      };
    case "bear":
      return {
        head: { x: 120, y: 92, w: 70, h: 64 },
        body: { x: 120, y: 154, w: 116, h: 88 },
        markup: `<circle class="ear ear-left" cx="92" cy="64" r="16" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle class="ear ear-right" cx="148" cy="64" r="16" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="86" y="122" width="68" height="56" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="arm arm-left" x="70" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="152" y="126" width="18" height="42" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="90" y="60" width="60" height="60" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="eye eye-left" x="102" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect x="108" y="92" width="24" height="14" fill="${rgba("#fff0c9", 0.68)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="mouth" x="114" y="106" width="12" height="4" fill="${rgba("#ffffff", 0.22)}" />`
      };
    case "ape":
      return {
        head: { x: 120, y: 88, w: 64, h: 60 },
        body: { x: 120, y: 152, w: 108, h: 86 },
        markup: `<rect x="88" y="120" width="64" height="58" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="6" />
          <rect class="arm arm-left" x="64" y="122" width="20" height="56" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect class="arm arm-right" x="156" y="122" width="20" height="56" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <rect x="92" y="58" width="56" height="54" fill="${palette.primary}" stroke="${palette.stroke}" stroke-width="6" />
          <circle class="ear ear-left" cx="92" cy="86" r="10" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <circle class="ear ear-right" cx="148" cy="86" r="10" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="eye eye-left" x="102" y="74" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="74" width="8" height="10" fill="${palette.stroke}" />
          <rect x="106" y="88" width="28" height="18" fill="${rgba("#fff2cc", 0.68)}" stroke="${palette.stroke}" stroke-width="4" />
          <rect class="mouth" x="112" y="102" width="16" height="4" fill="${rgba("#ffffff", 0.22)}" />`
      };
    default:
      return getSpeciesArt("ant", palette);
  }
}

function getRankDecoration(rankIndex, art, palette) {
  const headLeft = art.head.x - art.head.w / 2;
  const headRight = art.head.x + art.head.w / 2;
  const headTop = art.head.y - art.head.h / 2;
  const bodyLeft = art.body.x - art.body.w / 2;
  const bodyRight = art.body.x + art.body.w / 2;
  const bodyTop = art.body.y - art.body.h / 2;
  const bodyBottom = art.body.y + art.body.h / 2;
  let back = "";
  let front = "";

  if (rankIndex === 1) {
    back = `<rect class="muscle arm-left" x="${bodyLeft - 18}" y="${art.body.y - 16}" width="22" height="32" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
      <rect class="muscle arm-right" x="${bodyRight - 4}" y="${art.body.y - 16}" width="22" height="32" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />`;
    front = `<rect class="headband" x="${headLeft + 4}" y="${headTop + 14}" width="${Math.max(28, art.head.w - 8)}" height="12" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" />
      <polygon class="headband-tail" points="${headRight - 2},${headTop + 20} ${headRight + 14},${headTop + 12} ${headRight + 10},${headTop + 28}" fill="#ef4458" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />`;
  }

  if (rankIndex === 2) {
    back = `<path class="hair" d="M${headLeft + 8} ${headTop + 18} Q${art.head.x} ${bodyBottom + 10} ${headRight - 8} ${headTop + 18} Q${art.head.x} ${bodyTop + 42} ${headLeft + 8} ${headTop + 18} Z"
      fill="${rgba(palette.secondary, 0.94)}" stroke="${palette.stroke}" stroke-width="4" />`;
    front = `<polygon class="crown" points="${art.head.x - 24},${headTop + 6} ${art.head.x - 12},${headTop - 16} ${art.head.x},${headTop + 2} ${art.head.x + 12},${headTop - 16} ${art.head.x + 24},${headTop + 6}"
      fill="#ffd96b" stroke="${palette.stroke}" stroke-width="4" stroke-linejoin="round" />`;
  }

  if (rankIndex === 3) {
    front = `<rect class="cyber-plate" x="${bodyLeft + 10}" y="${bodyTop + 10}" width="${Math.max(30, art.body.w - 20)}" height="${Math.max(28, art.body.h - 18)}"
      fill="${palette.metal}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
      <rect class="cyber-plate" x="${headLeft + 8}" y="${headTop + 10}" width="${Math.max(28, art.head.w - 16)}" height="${Math.max(22, art.head.h - 18)}"
      fill="${rgba("#9fb4ca", 0.22)}" stroke="${rgba("#ffffff", 0.7)}" stroke-width="4" />
      <rect class="visor" x="${headLeft + 8}" y="${art.head.y - 8}" width="${Math.max(24, art.head.w - 16)}" height="16"
      fill="#47ecff" stroke="${palette.stroke}" stroke-width="4" />
      <circle class="cyber-core" cx="${art.body.x}" cy="${art.body.y}" r="7" fill="#47ecff" stroke="${palette.stroke}" stroke-width="3" />`;
  }

  if (rankIndex === 4) {
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
  const decoration = getRankDecoration(rankIndex, art, palette);

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
  DOM.stageValue.textContent = getStage().label;
  DOM.resourceLabelValue.textContent = species ? `${species.resource} Total` : "Choose Animal";
  DOM.resourceTotalValue.textContent = formatNumber(state.resources);
  DOM.resourcePerSecondValue.textContent = `${formatNumber(getPassivePerSecond(snapshot))} / sec`;
  DOM.formEyebrow.textContent = species ? `${getStage().label} / ${getRank().label} rank` : `${getStage().label} / selection`;
  DOM.formTitle.textContent = species ? getFormName() : `Choose ${getStage().label} Animal`;
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
  DOM.mainCreatureLabel.textContent = species.name.toUpperCase();
  DOM.mainRankChip.textContent = getRank().label.toUpperCase();
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
    ? `${formatNumber(helperTotal)} helpers / ${state.ownedUpgrades.length} upgrades`
    : "Build helpers and upgrades";
  DOM.nextTargetValue.textContent = species
    ? `Next: ${getNextRank() ? `${getNextRank().label} ${species.name}` : state.stageIndex < STAGES.length - 1 ? `${STAGES[state.stageIndex + 1].label} unlock` : "Final clear"}`
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
  if (isFinalStageComplete()) {
    DOM.progressTitle.textContent = `Final God ${species.name} Reached`;
    DOM.evolutionCard.classList.remove("is-ready");
    if (progressMeterFill) {
      progressMeterFill.style.width = "100%";
    }
    if (progressMeterLabel) {
      progressMeterLabel.textContent = `${formatNumber(getThreshold())} / ${formatNumber(getThreshold())} ${species.resource}`;
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
  spawnFloat(`+${formatNumber(clickValue)}`, point.x, point.y);
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
  bindEvents();
  applyTheme();
  renderAll();
  window.requestAnimationFrame(loop);
}

init();

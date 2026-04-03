const WORLD = { width: 1280, height: 760 };
const TAU = Math.PI * 2;
const MAIN_WAVE_COUNT = 10;
const CAMP_ACCESS_RADIUS = 120;

const DOM = {
  topMuteButton: document.querySelector("#topMuteButton"),
  topPauseButton: document.querySelector("#topPauseButton"),
  canvasShell: document.querySelector("#canvasShell"),
  gameCanvas: document.querySelector("#gameCanvas"),
  healthValue: document.querySelector("#healthValue"),
  armorValue: document.querySelector("#armorValue"),
  ammoValue: document.querySelector("#ammoValue"),
  pointsValue: document.querySelector("#pointsValue"),
  waveValue: document.querySelector("#waveValue"),
  zombiesValue: document.querySelector("#zombiesValue"),
  campfireValue: document.querySelector("#campfireValue"),
  dashValue: document.querySelector("#dashValue"),
  waveBanner: document.querySelector("#waveBanner"),
  bossBanner: document.querySelector("#bossBanner"),
  menuOverlay: document.querySelector("#menuOverlay"),
  playButton: document.querySelector("#playButton"),
  howButton: document.querySelector("#howButton"),
  menuMuteButton: document.querySelector("#menuMuteButton"),
  tutorialOverlay: document.querySelector("#tutorialOverlay"),
  tutorialStartButton: document.querySelector("#tutorialStartButton"),
  tutorialCloseButton: document.querySelector("#tutorialCloseButton"),
  pauseOverlay: document.querySelector("#pauseOverlay"),
  resumeButton: document.querySelector("#resumeButton"),
  restartButton: document.querySelector("#restartButton"),
  pauseMuteButton: document.querySelector("#pauseMuteButton"),
  menuButton: document.querySelector("#menuButton"),
  gameOverOverlay: document.querySelector("#gameOverOverlay"),
  finalScoreValue: document.querySelector("#finalScoreValue"),
  finalWaveValue: document.querySelector("#finalWaveValue"),
  finalKillsValue: document.querySelector("#finalKillsValue"),
  finalHeadshotsValue: document.querySelector("#finalHeadshotsValue"),
  finalBossKillsValue: document.querySelector("#finalBossKillsValue"),
  finalCampfireValue: document.querySelector("#finalCampfireValue"),
  endRestartButton: document.querySelector("#endRestartButton"),
  endMenuButton: document.querySelector("#endMenuButton"),
  touchControls: document.querySelector("#touchControls"),
  movePad: document.querySelector("#movePad"),
  moveThumb: document.querySelector("#moveThumb"),
  aimPad: document.querySelector("#aimPad"),
  aimThumb: document.querySelector("#aimThumb"),
  reloadButton: document.querySelector("#reloadButton"),
  dashButton: document.querySelector("#dashButton"),
  touchPauseButton: document.querySelector("#touchPauseButton"),
  combatStateValue: document.querySelector("#combatStateValue"),
  hintText: document.querySelector("#hintText"),
  effectText: document.querySelector("#effectText"),
  weaponHintValue: document.querySelector("#weaponHintValue"),
  weaponSlots: document.querySelector("#weaponSlots"),
  campAccessValue: document.querySelector("#campAccessValue"),
  mysteryBoxButton: document.querySelector("#mysteryBoxButton"),
  boxResultValue: document.querySelector("#boxResultValue"),
  nextWaveButton: document.querySelector("#nextWaveButton"),
  upgradeHintValue: document.querySelector("#upgradeHintValue"),
  upgradeList: document.querySelector("#upgradeList"),
  dropHintValue: document.querySelector("#dropHintValue"),
  dropList: document.querySelector("#dropList"),
  logList: document.querySelector("#logList")
};

const CTX = DOM.gameCanvas.getContext("2d");
DOM.gameCanvas.width = WORLD.width;
DOM.gameCanvas.height = WORLD.height;

const SESSION = {
  mobile: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
  tutorialSeen: false,
  muted: false
};

const KEYS = Object.create(null);
const SLOT_KEYS = ["fists", "primary", "secondary"];
const weaponSlotButtons = new Map();
const upgradeButtons = new Map();

const WEAPONS = {
  fists: { label: "Fists", kind: "melee", damage: 20, fireRate: 2.6, range: 68, arc: 1.35, knockback: 240, recoil: 0.08, color: "#1a1a1a", slotText: "Fallback melee" },
  knife: { label: "Knife", kind: "melee", damage: 34, fireRate: 3.2, range: 78, arc: 1.1, knockback: 280, recoil: 0.1, color: "#242424", slotText: "Fast melee" },
  bat: { label: "Bat", kind: "melee", damage: 52, fireRate: 1.75, range: 88, arc: 1.25, knockback: 360, recoil: 0.12, color: "#3b2a1a", slotText: "Heavy swing" },
  pistol: { label: "Pistol", kind: "gun", damage: 19, fireRate: 4, mag: 12, reserve: 72, reload: 1.2, spread: 0.045, speed: 1220, life: 0.9, recoil: 0.5, knockback: 170, critBonus: 0.02, color: "#e2bf53", slotText: "Reliable sidearm", casing: true },
  revolver: { label: "Revolver", kind: "gun", damage: 44, fireRate: 2.25, mag: 6, reserve: 42, reload: 1.55, spread: 0.03, speed: 1350, life: 1.1, recoil: 0.8, knockback: 230, critBonus: 0.1, color: "#f5d28a", slotText: "Big crits", rarity: 2, casing: true },
  smg: { label: "SMG", kind: "gun", damage: 11, fireRate: 11.5, mag: 28, reserve: 180, reload: 1.35, spread: 0.085, speed: 1140, life: 0.85, recoil: 0.45, knockback: 110, color: "#f0dc91", slotText: "Fast spray", rarity: 2, casing: true },
  assault: { label: "Assault Rifle", kind: "gun", damage: 18, fireRate: 7.6, mag: 30, reserve: 210, reload: 1.45, spread: 0.06, speed: 1260, life: 1, recoil: 0.6, knockback: 150, color: "#f1d770", slotText: "Balanced rifle", rarity: 3, casing: true },
  shotgun: { label: "Shotgun", kind: "gun", damage: 12, fireRate: 1.25, mag: 8, reserve: 48, reload: 1.85, spread: 0.32, pellets: 8, speed: 1040, life: 0.42, recoil: 1.1, knockback: 250, color: "#ffe2a8", slotText: "Wide blast", rarity: 3, casing: true },
  sniper: { label: "Sniper", kind: "gun", damage: 102, fireRate: 0.9, mag: 5, reserve: 24, reload: 2.2, spread: 0.015, speed: 1500, life: 1.25, recoil: 1.45, knockback: 340, critBonus: 0.16, pierce: 1, color: "#fff4ca", slotText: "Clean headshots", rarity: 4, casing: true },
  lmg: { label: "LMG", kind: "gun", damage: 17, fireRate: 8.8, mag: 60, reserve: 280, reload: 2.75, spread: 0.08, speed: 1180, life: 1, recoil: 0.72, knockback: 150, color: "#f1c966", slotText: "Heavy ammo belt", rarity: 4, casing: true },
  minigun: { label: "Minigun", kind: "gun", damage: 12, fireRate: 14.5, mag: 110, reserve: 330, reload: 3.5, spread: 0.1, speed: 1080, life: 0.85, recoil: 0.9, knockback: 140, color: "#ffe16e", slotText: "Arena shredder", rarity: 5, casing: true },
  rocket: { label: "Rocket Launcher", kind: "gun", damage: 42, fireRate: 0.75, mag: 1, reserve: 10, reload: 2.4, spread: 0.02, speed: 700, life: 0.95, recoil: 1.6, knockback: 320, explosion: 94, color: "#ff8d65", slotText: "Explosive punch", rarity: 5 },
  flamethrower: { label: "Flamethrower", kind: "gun", damage: 6, fireRate: 17, mag: 82, reserve: 240, reload: 2.1, spread: 0.22, speed: 520, life: 0.3, recoil: 0.25, knockback: 80, burn: 2.1, flame: true, color: "#ff8d4d", slotText: "Close range melt", rarity: 5 },
  crossbow: { label: "Crossbow", kind: "gun", damage: 72, fireRate: 1.6, mag: 1, reserve: 22, reload: 1.4, spread: 0.02, speed: 1420, life: 1.15, recoil: 0.68, knockback: 260, pierce: 1, critBonus: 0.08, color: "#e6f6b2", slotText: "Piercing bolts", rarity: 4 }
};

const ENEMY_TYPES = {
  normal: { label: "Zombie", hp: 48, speed: 66, radius: 16, damage: 15, points: 20, color: "#121212", accent: "#b6232f" },
  fast: { label: "Runner", hp: 28, speed: 102, radius: 14, damage: 12, points: 24, color: "#171717", accent: "#ff5e5e" },
  tank: { label: "Tank", hp: 140, speed: 42, radius: 22, damage: 24, points: 38, color: "#201414", accent: "#ba3b3b" },
  exploder: { label: "Exploder", hp: 34, speed: 72, radius: 16, damage: 14, points: 28, explodeRadius: 92, color: "#2c1616", accent: "#ff8157" },
  armored: { label: "Armored", hp: 82, speed: 56, radius: 18, damage: 18, points: 32, armor: 0.3, color: "#202020", accent: "#8f9397" },
  ranged: { label: "Spitter", hp: 42, speed: 54, radius: 16, damage: 12, points: 30, range: 300, fireRate: 1.2, projectileSpeed: 420, color: "#1d1c1a", accent: "#9fd26d" }
};

const BOSS_TYPES = {
  brute: { label: "Brute Warden", hp: 780, speed: 58, radius: 32, damage: 28, points: 240, color: "#2a1111", accent: "#ff6b6b", abilities: ["charge", "slam"], summonType: "tank" },
  spitter: { label: "Spitter Chief", hp: 620, speed: 52, radius: 28, damage: 20, points: 220, color: "#111b11", accent: "#91df79", abilities: ["shoot", "spawn"], summonType: "ranged" },
  reaper: { label: "Reaper King", hp: 700, speed: 66, radius: 30, damage: 24, points: 260, color: "#171018", accent: "#ffa84a", abilities: ["dash", "spawn", "explode"], summonType: "fast" }
};

const MAIN_WAVES = [
  { count: 5, interval: 1.4, reward: 100, weights: { normal: 1 }, openingDelay: 1.2 },
  { count: 7, interval: 1.28, reward: 130, weights: { normal: 1 }, openingDelay: 1.05 },
  { count: 10, interval: 1.16, reward: 165, weights: { normal: 1, fast: 0.2 }, openingDelay: 0.95 },
  { count: 13, interval: 1.06, reward: 205, weights: { normal: 1, fast: 0.32, tank: 0.1 }, openingDelay: 0.9 },
  { count: 16, interval: 0.98, reward: 250, weights: { normal: 1, fast: 0.42, tank: 0.16, exploder: 0.08 }, openingDelay: 0.84 },
  { count: 19, interval: 0.92, reward: 305, weights: { normal: 1, fast: 0.5, tank: 0.22, exploder: 0.12, armored: 0.14 }, bosses: ["brute"], openingDelay: 0.82, bossStart: 10 },
  { count: 23, interval: 0.86, reward: 365, weights: { normal: 0.96, fast: 0.58, tank: 0.27, exploder: 0.16, armored: 0.2, ranged: 0.12 }, openingDelay: 0.78 },
  { count: 27, interval: 0.8, reward: 430, weights: { normal: 0.9, fast: 0.68, tank: 0.32, exploder: 0.2, armored: 0.25, ranged: 0.18 }, bosses: ["spitter"], openingDelay: 0.74, bossStart: 9 },
  { count: 31, interval: 0.74, reward: 510, weights: { normal: 0.82, fast: 0.78, tank: 0.36, exploder: 0.24, armored: 0.32, ranged: 0.24 }, bosses: ["brute"], openingDelay: 0.7, bossStart: 8.5 },
  { count: 36, interval: 0.68, reward: 620, weights: { normal: 0.74, fast: 0.9, tank: 0.42, exploder: 0.3, armored: 0.38, ranged: 0.32 }, bosses: ["spitter", "reaper"], openingDelay: 0.68, bossStart: 8, bossGap: 7 }
];

const UPGRADES = [
  { key: "health", label: "Field Dressing", copy: "+12 max health and a small heal.", baseCost: 120 },
  { key: "armor", label: "Plate Carrier", copy: "+14 max armor and a refill bump.", baseCost: 140 },
  { key: "damage", label: "Hollow Point Kit", copy: "All weapons hit harder.", baseCost: 180 },
  { key: "reload", label: "Drill Reloads", copy: "Shorter reload time.", baseCost: 150 },
  { key: "speed", label: "Combat Boots", copy: "Move quicker around the arena.", baseCost: 160 },
  { key: "dash", label: "Slide Training", copy: "Dash comes back faster.", baseCost: 180 },
  { key: "crit", label: "Headshot Drills", copy: "Higher crit and headshot payoff.", baseCost: 190 },
  { key: "ammo", label: "Extended Mag", copy: "More mag and reserve ammo.", baseCost: 170 }
];

let state = getFreshState();
let lastTime = performance.now();

function getFreshState() {
  return {
    screen: "menu",
    resumeScreen: "intermission",
    wave: 0,
    campPoints: 0,
    score: 0,
    kills: 0,
    headshots: 0,
    bossKills: 0,
    wavePlan: null,
    boxUsesThisStop: 0,
    frenzy: false,
    player: createPlayer(),
    campfire: createCampfire(),
    inventory: { primary: createWeapon("pistol", 0), secondary: null },
    activeSlot: "primary",
    upgrades: { health: 0, armor: 0, damage: 0, reload: 0, speed: 0, dash: 0, crit: 0, ammo: 0 },
    effects: { doublePoints: 0, instaKill: 0, shield: 0, berserk: 0, swift: 0 },
    enemies: [],
    projectiles: [],
    particles: [],
    splats: [],
    drops: [],
    barrels: [],
    doodles: [],
    logs: [],
    mouse: { x: WORLD.width * 0.75, y: WORLD.height * 0.5, down: false, inside: false },
    moveStick: { x: 0, y: 0 },
    aimStick: { x: 1, y: 0, active: false },
    touch: { moveId: null, aimId: null },
    boxResult: "The crate is quiet.",
    uiTimer: 0,
    bannerTimer: 0,
    bossBannerTimer: 0,
    shake: 0,
    hitstop: 0,
    crosshairSpread: 0,
    flashRed: 0,
    flashWhite: 0,
    frenzyBossTimer: 14,
    frenzySpawnTimer: 1.1
  };
}

function createPlayer() {
  return {
    x: WORLD.width / 2 - 120,
    y: WORLD.height / 2 + 60,
    radius: 17,
    health: 100,
    maxHealth: 100,
    armor: 50,
    maxArmor: 50,
    angle: -0.25,
    dashCooldown: 0,
    dashTimer: 0,
    dashX: 0,
    dashY: 0,
    invuln: 0,
    hitFlash: 0
  };
}

function createCampfire() {
  return {
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    radius: 40,
    health: 540,
    maxHealth: 540,
    damageFlash: 0,
    pulseLevel: 0,
    pulseTimer: 2.6,
    broken: false
  };
}

function createWeapon(id, ammoLevel = 0) {
  const def = WEAPONS[id];
  return {
    id,
    ammo: def.mag ? getMagazineSize(def, ammoLevel) : 0,
    reserve: def.reserve ? getReserveSize(def, ammoLevel) : 0,
    cooldown: 0,
    reload: 0
  };
}

function getMagazineSize(def, ammoLevel = state.upgrades.ammo) {
  return def.mag ? Math.max(1, Math.round(def.mag * (1 + ammoLevel * 0.1))) : 0;
}

function getReserveSize(def, ammoLevel = state.upgrades.ammo) {
  return def.reserve ? Math.max(0, Math.round(def.reserve * (1 + ammoLevel * 0.12))) : 0;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function normalize(x, y) {
  const length = Math.hypot(x, y);
  const divisor = length || 1;
  return { x: x / divisor, y: y / divisor, length };
}

function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
  let roll = Math.random() * total;
  for (const [key, amount] of entries) {
    roll -= amount;
    if (roll <= 0) {
      return key;
    }
  }
  return entries[entries.length - 1][0];
}

function formatNumber(value) {
  return Intl.NumberFormat("en-GB", { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(Math.max(0, value));
}

function formatCompact(value) {
  return Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(Math.max(0, value));
}

function getMoveSpeed() {
  const boost = state.effects.swift > 0 ? 0.14 : 0;
  return 220 * (1 + state.upgrades.speed * 0.055 + boost);
}

function getDamageFactor() {
  const berserk = state.effects.berserk > 0 ? 0.18 : 0;
  return 1 + state.upgrades.damage * 0.11 + berserk;
}

function getReloadFactor() {
  const berserk = state.effects.berserk > 0 ? 0.12 : 0;
  return 1 + state.upgrades.reload * 0.08 + berserk;
}

function getCritChance() {
  return 0.04 + state.upgrades.crit * 0.023;
}

function getDashCooldownDuration() {
  return Math.max(1.8, 5.6 - state.upgrades.dash * 0.36);
}

function getCampAccess() {
  return state.screen === "intermission"
    && !state.frenzy
    && !state.campfire.broken
    && distance(state.player.x, state.player.y, state.campfire.x, state.campfire.y) <= CAMP_ACCESS_RADIUS;
}

function getActiveWeaponState() {
  if (state.activeSlot === "fists") {
    return { slot: "fists", weapon: { id: "fists", ammo: 0, reserve: 0, cooldown: 0, reload: 0 } };
  }
  return { slot: state.activeSlot, weapon: state.inventory[state.activeSlot] };
}

function getWeaponDefinition(slotKey = state.activeSlot) {
  if (slotKey === "fists") {
    return WEAPONS.fists;
  }
  const weapon = state.inventory[slotKey];
  return weapon ? WEAPONS[weapon.id] : null;
}

function getAimPoint() {
  const player = state.player;
  if (SESSION.mobile && state.aimStick.active) {
    return { x: player.x + state.aimStick.x * 220, y: player.y + state.aimStick.y * 220 };
  }
  return { x: state.mouse.x, y: state.mouse.y };
}

function createAudioEngine() {
  let ctx = null;
  let master = null;
  let musicInterval = null;
  let musicStep = 0;

  function unlock() {
    if (ctx) {
      return;
    }
    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }
    ctx = new AudioContextRef();
    master = ctx.createGain();
    master.gain.value = SESSION.muted ? 0 : 0.16;
    master.connect(ctx.destination);
  }

  function setMuted(nextMuted) {
    SESSION.muted = nextMuted;
    if (master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(nextMuted ? 0 : 0.16, ctx.currentTime);
    }
    syncMuteButtons();
  }

  function pulse(options = {}) {
    if (!ctx || SESSION.muted) {
      return;
    }

    const { frequency = 220, type = "square", duration = 0.08, volume = 0.08, detune = 0 } = options;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  function hiss(duration = 0.08, volume = 0.04) {
    if (!ctx || SESSION.muted) {
      return;
    }

    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
  }

  function play(name) {
    if (!ctx || SESSION.muted) {
      return;
    }

    switch (name) {
      case "ui":
        pulse({ frequency: 520, duration: 0.06, volume: 0.06 });
        pulse({ frequency: 780, duration: 0.05, volume: 0.03, detune: 8 });
        break;
      case "pistol":
        pulse({ frequency: 150, duration: 0.045, volume: 0.08 });
        hiss(0.04, 0.035);
        break;
      case "heavy":
        pulse({ frequency: 96, duration: 0.08, volume: 0.11 });
        hiss(0.05, 0.04);
        break;
      case "shotgun":
        pulse({ frequency: 90, duration: 0.12, volume: 0.13 });
        hiss(0.08, 0.05);
        break;
      case "flame":
        hiss(0.06, 0.03);
        pulse({ frequency: 260, type: "triangle", duration: 0.04, volume: 0.03 });
        break;
      case "reload":
        pulse({ frequency: 340, duration: 0.05, volume: 0.05 });
        pulse({ frequency: 280, duration: 0.08, volume: 0.04, detune: -20 });
        break;
      case "hit":
        pulse({ frequency: 180, duration: 0.04, volume: 0.05 });
        break;
      case "hurt":
        pulse({ frequency: 100, duration: 0.14, volume: 0.08, type: "sawtooth" });
        break;
      case "dash":
        pulse({ frequency: 720, duration: 0.06, volume: 0.05, type: "triangle" });
        hiss(0.05, 0.03);
        break;
      case "pickup":
        pulse({ frequency: 680, duration: 0.06, volume: 0.05 });
        pulse({ frequency: 920, duration: 0.09, volume: 0.04 });
        break;
      case "boss":
        pulse({ frequency: 84, duration: 0.2, volume: 0.11, type: "sawtooth" });
        hiss(0.12, 0.05);
        break;
      case "box":
        pulse({ frequency: 420, duration: 0.08, volume: 0.05 });
        pulse({ frequency: 530, duration: 0.08, volume: 0.04 });
        break;
      default:
        pulse({ frequency: 260, duration: 0.05, volume: 0.05 });
        break;
    }
  }

  function startMusic() {
    if (!ctx || SESSION.muted || musicInterval) {
      return;
    }
    const pattern = [130, 164, 130, 196, 146, 220, 164, 196];
    musicInterval = window.setInterval(() => {
      if (!ctx || SESSION.muted || state.screen === "menu" || state.screen === "gameover" || state.screen === "paused") {
        return;
      }
      const base = pattern[musicStep % pattern.length];
      pulse({ frequency: base, duration: 0.12, volume: 0.016, type: "triangle" });
      pulse({ frequency: base * 2, duration: 0.07, volume: 0.01, type: "square", detune: 6 });
      musicStep += 1;
    }, 260);
  }

  function stopMusic() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  return { unlock, setMuted, play, startMusic, stopMusic };
}

const AUDIO = createAudioEngine();

function ensureAudio() {
  AUDIO.unlock();
  if (state.screen === "playing" || state.screen === "intermission") {
    AUDIO.startMusic();
  }
}

function syncMuteButtons() {
  const label = SESSION.muted ? "Unmute" : "Mute";
  DOM.topMuteButton.textContent = label;
  DOM.menuMuteButton.textContent = label;
  DOM.pauseMuteButton.textContent = label;
}

function toggleMute() {
  ensureAudio();
  AUDIO.setMuted(!SESSION.muted);
}

function pushLog(title, copy) {
  state.logs.unshift({ title, copy });
  state.logs = state.logs.slice(0, 8);
  renderLogs();
}

function showWaveBanner(text) {
  DOM.waveBanner.textContent = text;
  DOM.waveBanner.hidden = false;
  state.bannerTimer = 2.3;
}

function showBossBanner(text) {
  DOM.bossBanner.textContent = text;
  DOM.bossBanner.hidden = false;
  state.bossBannerTimer = 2.8;
}

function addShake(amount) {
  state.shake = Math.min(18, state.shake + amount);
}

function createDecalsAndBarrels() {
  state.doodles = [];
  state.barrels = [];

  for (let index = 0; index < 18; index += 1) {
    state.doodles.push({
      x: rand(90, WORLD.width - 90),
      y: rand(90, WORLD.height - 90),
      angle: rand(0, TAU),
      size: rand(20, 54),
      kind: pick(["arrow", "grid", "ring", "cross", "note"])
    });
  }

  const barrelSeeds = [
    [190, 150], [1120, 160], [180, 610], [1100, 600], [640, 135], [640, 635], [320, 380], [960, 400]
  ];

  barrelSeeds.forEach(([x, y], index) => {
    if (index > 5 && Math.random() < 0.38) {
      return;
    }

    state.barrels.push({
      x: x + rand(-24, 24),
      y: y + rand(-24, 24),
      radius: 18,
      hp: 42,
      flash: 0,
      exploded: false
    });
  });
}

function recalcPlayerCaps(refill = false) {
  const player = state.player;
  const nextMaxHealth = 100 + state.upgrades.health * 12;
  const nextMaxArmor = 50 + state.upgrades.armor * 14;

  player.maxHealth = nextMaxHealth;
  player.maxArmor = nextMaxArmor;
  player.health = refill ? Math.min(nextMaxHealth, player.health + 12) : Math.min(player.health, nextMaxHealth);
  player.armor = refill ? Math.min(nextMaxArmor, player.armor + 14) : Math.min(player.armor, nextMaxArmor);
}

function syncInventoryCapacities() {
  ["primary", "secondary"].forEach((slot) => {
    const weapon = state.inventory[slot];
    if (!weapon) {
      return;
    }
    const def = WEAPONS[weapon.id];
    if (!def.mag) {
      return;
    }
    weapon.ammo = Math.min(getMagazineSize(def), weapon.ammo + Math.ceil(def.mag * 0.12));
    weapon.reserve = Math.min(getReserveSize(def), weapon.reserve + Math.ceil(def.reserve * 0.1));
  });
}

function createWeaponSlots() {
  SLOT_KEYS.forEach((slotKey) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weapon-slot";
    button.addEventListener("click", () => setActiveSlot(slotKey));
    weaponSlotButtons.set(slotKey, button);
    DOM.weaponSlots.appendChild(button);
  });
}

function createUpgradeButtons() {
  UPGRADES.forEach((upgrade) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-button";
    button.addEventListener("click", () => buyUpgrade(upgrade.key));
    upgradeButtons.set(upgrade.key, button);
    DOM.upgradeList.appendChild(button);
  });
}

function renderWeaponSlots() {
  SLOT_KEYS.forEach((slotKey) => {
    const button = weaponSlotButtons.get(slotKey);
    if (!button) {
      return;
    }

    let slotLabel = "";
    let label = "";
    if (slotKey === "fists") {
      slotLabel = "Melee";
      label = WEAPONS.fists.label;
    } else {
      slotLabel = slotKey === "primary" ? "Primary" : "Secondary";
      const weapon = state.inventory[slotKey];
      if (weapon) {
        label = WEAPONS[weapon.id].label;
      } else {
        label = "Empty";
      }
    }

    button.classList.toggle("is-active", state.activeSlot === slotKey);
    button.disabled = slotKey !== "fists" && !state.inventory[slotKey];
    button.innerHTML = `
      <span class="weapon-slot-label">${slotLabel}</span>
      <strong>${label}</strong>
    `;
  });
}

function getUpgradeCost(upgradeKey) {
  const upgrade = UPGRADES.find((entry) => entry.key === upgradeKey);
  const level = state.upgrades[upgradeKey];
  return Math.floor(upgrade.baseCost * (1.56 ** level) * (1 + Math.max(0, state.wave - 1) * 0.05));
}

function renderUpgradeButtons() {
  UPGRADES.forEach((upgrade) => {
    const button = upgradeButtons.get(upgrade.key);
    const cost = getUpgradeCost(upgrade.key);
    const canAfford = state.campPoints >= cost && getCampAccess();
    const level = state.upgrades[upgrade.key];
    button.classList.toggle("is-affordable", canAfford);
    button.disabled = !getCampAccess() || state.campPoints < cost;
    button.innerHTML = `
      <strong>${upgrade.label} L${level}</strong>
      <small>${upgrade.copy}</small>
      <small>${cost} CP</small>
    `;
  });
}

function renderLogs() {
  if (!DOM.logList) {
    return;
  }

  DOM.logList.replaceChildren(
    ...state.logs.map((entry) => {
      const article = document.createElement("article");
      article.className = "log-entry";
      article.innerHTML = `
        <strong>${entry.title}</strong>
        <p>${entry.copy}</p>
      `;
      return article;
    })
  );
}

function renderDropPills() {
  const pills = [];
  if (state.effects.doublePoints > 0) pills.push({ label: "Double Points", copy: `${state.effects.doublePoints.toFixed(1)}s`, hot: true });
  if (state.effects.instaKill > 0) pills.push({ label: "Insta-Kill", copy: `${state.effects.instaKill.toFixed(1)}s`, hot: true });
  if (state.effects.shield > 0) pills.push({ label: "Shield", copy: `${state.effects.shield.toFixed(1)}s` });
  if (state.effects.berserk > 0) pills.push({ label: "Berserk", copy: `${state.effects.berserk.toFixed(1)}s` });
  if (state.effects.swift > 0) pills.push({ label: "Sprint", copy: `${state.effects.swift.toFixed(1)}s` });
  if (state.drops.length > 0) pills.push({ label: "Pickups", copy: `${state.drops.length} on ground` });
  if (state.frenzy) pills.push({ label: "Frenzy", copy: "Campfire destroyed", hot: true });

  if (!DOM.dropHintValue || !DOM.dropList) {
    return;
  }

  DOM.dropHintValue.textContent = pills.length === 0 ? "No active drops" : `${pills.length} active`;
  DOM.dropList.replaceChildren(
    ...pills.map((entry) => {
      const article = document.createElement("article");
      article.className = `drop-pill${entry.hot ? " is-hot" : ""}`;
      article.innerHTML = `
        <span>${entry.label}</span>
        <strong>${entry.copy}</strong>
      `;
      return article;
    })
  );
}

function updateTopPauseLabel() {
  DOM.topPauseButton.textContent = state.screen === "paused" ? "Resume" : "Pause";
}

function refreshUI() {
  const activeState = getActiveWeaponState();
  const activeDef = getWeaponDefinition();
  const player = state.player;
  const campfire = state.campfire;
  const weaponLabel = activeDef ? activeDef.label : "Empty";
  const ammoText = activeState.weapon && activeDef && activeDef.mag
    ? `${activeState.weapon.ammo} / ${activeState.weapon.reserve}`
    : "Melee";

  DOM.healthValue.textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
  DOM.armorValue.textContent = `${Math.ceil(player.armor)} / ${player.maxArmor}`;
  DOM.ammoValue.textContent = ammoText;
  DOM.pointsValue.textContent = formatCompact(state.campPoints);
  DOM.waveValue.textContent = state.frenzy ? "Frenzy" : `${state.wave}`;
  DOM.zombiesValue.textContent = state.frenzy
    ? `${Math.max(1, state.enemies.length)}+`
    : `${(state.wavePlan ? state.wavePlan.remaining : 0) + state.enemies.length + (state.wavePlan ? state.wavePlan.bosses.length : 0)}`;
  DOM.campfireValue.textContent = campfire.broken ? "Destroyed" : `${Math.max(0, Math.round((campfire.health / campfire.maxHealth) * 100))}%`;
  DOM.dashValue.textContent = player.dashCooldown <= 0 ? "Ready" : `${player.dashCooldown.toFixed(1)}s`;

  if (state.screen === "menu") {
    DOM.combatStateValue.textContent = "Main menu";
    DOM.hintText.textContent = "Press Play to start.";
  } else if (state.screen === "intermission") {
    DOM.combatStateValue.textContent = "Between waves";
    DOM.hintText.textContent = getCampAccess()
      ? "Spend Camp Points, hit the box, then start the next wave."
      : "Return to the campfire to access upgrades and the mystery box.";
  } else if (state.screen === "playing" && state.frenzy) {
    DOM.combatStateValue.textContent = "Frenzy mode";
    DOM.hintText.textContent = "The fire is gone. Bosses now keep coming until you fall.";
  } else if (state.screen === "playing") {
    DOM.combatStateValue.textContent = `Wave ${state.wave} live`;
    DOM.hintText.textContent = "Clear the arena and keep the campfire alive.";
  } else if (state.screen === "paused") {
    DOM.combatStateValue.textContent = "Paused";
    DOM.hintText.textContent = "Resume when you're ready.";
  } else {
    DOM.combatStateValue.textContent = "Run over";
    DOM.hintText.textContent = "Play again or head back to the menu.";
  }

  const activeEffects = [];
  if (state.effects.doublePoints > 0) activeEffects.push("Double Points");
  if (state.effects.instaKill > 0) activeEffects.push("Insta-Kill");
  if (state.effects.shield > 0) activeEffects.push("Shield");
  if (state.effects.berserk > 0) activeEffects.push("Berserk");
  if (state.effects.swift > 0) activeEffects.push("Sprint");
  DOM.effectText.textContent = activeEffects.length ? activeEffects.join(" / ") : "None";

  DOM.weaponHintValue.textContent = "1 / 2 / 3 / Q";
  DOM.campAccessValue.textContent = state.frenzy
    ? "Campfire lost"
    : getCampAccess()
      ? "At the fire"
      : state.screen === "intermission"
        ? "Return to the fire"
        : "Locked in combat";
  DOM.upgradeHintValue.textContent = getCampAccess() ? "Spend Camp Points now" : "Only available at the fire";
  DOM.nextWaveButton.textContent = state.wave < MAIN_WAVE_COUNT ? `Start Wave ${state.wave + 1}` : `Start Overtime ${Math.max(1, state.wave - MAIN_WAVE_COUNT + 1)}`;
  DOM.nextWaveButton.disabled = !(state.screen === "intermission" && getCampAccess());
  DOM.mysteryBoxButton.textContent = `Mystery Box (${getMysteryBoxCost()} CP)`;
  DOM.mysteryBoxButton.disabled = !getCampAccess() || state.campPoints < getMysteryBoxCost();
  DOM.boxResultValue.textContent = state.boxResult;

  renderWeaponSlots();
  renderUpgradeButtons();
  renderDropPills();
  document.body.classList.toggle("is-frenzy", state.frenzy);
  updateTopPauseLabel();
  syncTouchMode();
}

function setActiveSlot(slotKey) {
  if (slotKey !== "fists" && !state.inventory[slotKey]) {
    return;
  }
  if (state.activeSlot === slotKey) {
    return;
  }
  state.activeSlot = slotKey;
  pushLog("Loadout", `Swapped to ${getWeaponDefinition(slotKey).label}.`);
  refreshUI();
}

function cycleWeapon() {
  const available = SLOT_KEYS.filter((slot) => slot === "fists" || state.inventory[slot]);
  const currentIndex = available.indexOf(state.activeSlot);
  const nextIndex = (currentIndex + 1) % available.length;
  setActiveSlot(available[nextIndex]);
}

function buyUpgrade(upgradeKey) {
  if (!getCampAccess()) {
    return;
  }

  const cost = getUpgradeCost(upgradeKey);
  if (state.campPoints < cost) {
    return;
  }

  ensureAudio();
  state.campPoints -= cost;
  state.upgrades[upgradeKey] += 1;

  if (upgradeKey === "health" || upgradeKey === "armor") {
    recalcPlayerCaps(true);
  }
  if (upgradeKey === "ammo") {
    syncInventoryCapacities();
  }

  AUDIO.play("ui");
  pushLog("Upgrade Bought", `${UPGRADES.find((entry) => entry.key === upgradeKey).label} upgraded.`);
  refreshUI();
}

function getMysteryBoxCost() {
  return Math.floor((190 + state.wave * 44) * (1 + state.boxUsesThisStop * 0.18));
}

function getWeaponBoxPool() {
  if (state.wave <= 2) {
    return ["revolver", "smg", "shotgun", "knife"];
  }
  if (state.wave <= 4) {
    return ["revolver", "smg", "shotgun", "assault", "knife", "bat"];
  }
  if (state.wave <= 7) {
    return ["revolver", "smg", "shotgun", "assault", "sniper", "lmg", "crossbow", "bat"];
  }
  return ["assault", "shotgun", "sniper", "lmg", "minigun", "rocket", "flamethrower", "crossbow", "bat"];
}

function assignBoxWeapon(id) {
  const sameSlot = ["primary", "secondary"].find((slot) => state.inventory[slot] && state.inventory[slot].id === id);
  if (sameSlot) {
    const def = WEAPONS[id];
    const weapon = state.inventory[sameSlot];
    weapon.ammo = getMagazineSize(def);
    weapon.reserve = getReserveSize(def);
    state.activeSlot = sameSlot;
    return `${def.label} ammo refilled.`;
  }

  if (!state.inventory.secondary) {
    state.inventory.secondary = createWeapon(id, state.upgrades.ammo);
    state.activeSlot = "secondary";
    return `${WEAPONS[id].label} loaded into secondary slot.`;
  }

  const replaceSlot = state.activeSlot === "fists" ? "secondary" : state.activeSlot;
  state.inventory[replaceSlot] = createWeapon(id, state.upgrades.ammo);
  state.activeSlot = replaceSlot;
  return `${WEAPONS[id].label} dropped into ${replaceSlot}.`;
}

function openMysteryBox() {
  if (!getCampAccess()) {
    return;
  }

  const cost = getMysteryBoxCost();
  if (state.campPoints < cost) {
    return;
  }

  ensureAudio();
  state.campPoints -= cost;
  state.boxUsesThisStop += 1;
  AUDIO.play("box");

  const roll = Math.random();
  let message = "";

  if (roll < 0.42) {
    message = assignBoxWeapon(pick(getWeaponBoxPool()));
  } else if (roll < 0.62) {
    const buff = pick(["doublePoints", "instaKill", "shield", "berserk", "swift"]);
    const durations = { doublePoints: 16, instaKill: 10, shield: 16, berserk: 18, swift: 18 };
    state.effects[buff] = Math.max(state.effects[buff], durations[buff]);
    message = `${buff === "doublePoints" ? "Double Points" : buff === "instaKill" ? "Insta-Kill" : buff === "shield" ? "Shield" : buff === "berserk" ? "Berserk" : "Sprint"} activated.`;
  } else if (roll < 0.79) {
    const campOutcome = pick(["heal", "fortify", "pulse"]);
    if (campOutcome === "heal") {
      state.campfire.health = Math.min(state.campfire.maxHealth, state.campfire.health + 140);
      message = "Campfire patched up with fresh wood.";
    } else if (campOutcome === "fortify") {
      state.campfire.maxHealth += 70;
      state.campfire.health += 70;
      message = "Campfire core reinforced.";
    } else {
      state.campfire.pulseLevel += 1;
      message = "Campfire pulse upgraded. Nearby zombies burn.";
    }
  } else if (roll < 0.9) {
    const supply = pick(["health", "armor", "ammo"]);
    if (supply === "health") {
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 32);
      message = "Med supplies found. Health restored.";
    } else if (supply === "armor") {
      state.player.armor = Math.min(state.player.maxArmor, state.player.armor + 34);
      message = "Armor plates found. Armor restored.";
    } else {
      ["primary", "secondary"].forEach((slot) => {
        const weapon = state.inventory[slot];
        if (!weapon) return;
        const def = WEAPONS[weapon.id];
        weapon.reserve = Math.min(getReserveSize(def), weapon.reserve + Math.ceil(getReserveSize(def) * 0.45));
      });
      message = "Ammo cache packed into the bag.";
    }
  } else if (roll < 0.97) {
    message = "The crate buzzed and gave you absolutely nothing.";
  } else {
    message = "A crate zombie burst out. Next wave live now.";
    state.boxResult = message;
    pushLog("Mystery Box", message);
    startWave(true);
    refreshUI();
    return;
  }

  state.boxResult = message;
  pushLog("Mystery Box", message);
  refreshUI();
}

function getWaveConfig(waveNumber) {
  if (waveNumber <= MAIN_WAVE_COUNT) {
    const config = MAIN_WAVES[waveNumber - 1];
    return {
      wave: waveNumber,
      label: `Wave ${waveNumber}`,
      count: config.count,
      interval: config.interval,
      reward: config.reward,
      weights: { ...config.weights },
      bosses: [...(config.bosses || [])],
      openingDelay: config.openingDelay ?? 0.7,
      bossStart: config.bossStart ?? 8,
      bossGap: config.bossGap ?? 7
    };
  }

  const overtime = waveNumber - MAIN_WAVE_COUNT;
  return {
    wave: waveNumber,
    label: `Overtime ${overtime}`,
    count: 34 + overtime * 3,
    interval: Math.max(0.46, 0.72 - overtime * 0.02),
    reward: 650 + overtime * 60,
    weights: {
      normal: Math.max(0.34, 0.72 - overtime * 0.02),
      fast: 0.92 + overtime * 0.035,
      tank: 0.42 + overtime * 0.03,
      exploder: 0.28 + overtime * 0.03,
      armored: 0.34 + overtime * 0.04,
      ranged: 0.3 + overtime * 0.04
    },
    bosses: overtime % 2 === 0 ? ["reaper"] : [pick(["brute", "spitter"])],
    openingDelay: 0.64,
    bossStart: 8,
    bossGap: 7
  };
}

function startWave(fromBox = false) {
  if (state.screen !== "intermission" || !getCampAccess()) {
    return;
  }

  ensureAudio();
  AUDIO.startMusic();

  const config = getWaveConfig(state.wave + 1);
  state.wave = config.wave;
  state.screen = "playing";
  state.wavePlan = {
    remaining: config.count,
    interval: config.interval,
    reward: config.reward,
    weights: config.weights,
    spawnTimer: config.openingDelay,
    bosses: config.bosses.map((id, index) => ({ id, time: config.bossStart + index * config.bossGap }))
  };
  state.boxUsesThisStop = 0;
  state.boxResult = fromBox ? "Crate disaster. The round started instantly." : `Round ${config.wave} live.`;

  showWaveBanner(config.label);
  pushLog(config.label, fromBox ? "The mystery box forced the next wave." : "Enemy movement confirmed from the perimeter.");
  refreshUI();
}

function endWave() {
  if (state.frenzy) {
    return;
  }

  const campfireBonus = Math.round((state.campfire.health / state.campfire.maxHealth) * 55);
  const waveBonus = state.wavePlan.reward + campfireBonus;
  state.campPoints += waveBonus;
  state.score += waveBonus * 2;
  state.screen = "intermission";
  state.wavePlan = null;
  state.boxUsesThisStop = 0;
  state.player.health = Math.min(state.player.maxHealth, state.player.health + 12);
  state.player.armor = Math.min(state.player.maxArmor, state.player.armor + 8);
  createDecalsAndBarrels();

  pushLog("Wave Cleared", `Wave bonus ${waveBonus} CP. Return to the fire for upgrades.`);
  state.boxResult = `Wave ${state.wave} cleared. Spend your points.`;
  showWaveBanner(state.wave < MAIN_WAVE_COUNT ? "Area Secure" : "Overtime Clear");
  refreshUI();
}

function enterFrenzy() {
  if (state.frenzy) {
    return;
  }

  state.campfire.broken = true;
  state.campfire.health = 0;
  state.frenzy = true;
  state.screen = "playing";
  state.wavePlan = null;
  state.frenzySpawnTimer = 0.45;
  state.frenzyBossTimer = 10;
  state.boxResult = "Campfire destroyed. Frenzy mode engaged.";
  state.flashWhite = 0.3;
  addShake(14);
  showBossBanner("Campfire Down - Frenzy Mode");
  pushLog("Frenzy", "The campfire is gone. Bosses and chaos now keep coming until you die.");
  AUDIO.play("boss");
  refreshUI();
}

function gameOver() {
  state.screen = "gameover";
  DOM.gameOverOverlay.hidden = false;
  DOM.finalScoreValue.textContent = formatNumber(Math.round(state.score));
  DOM.finalWaveValue.textContent = `${state.wave}`;
  DOM.finalKillsValue.textContent = `${state.kills}`;
  DOM.finalHeadshotsValue.textContent = `${state.headshots}`;
  DOM.finalBossKillsValue.textContent = `${state.bossKills}`;
  DOM.finalCampfireValue.textContent = state.campfire.broken ? "Destroyed" : "Standing";
  AUDIO.stopMusic();
  pushLog("Run Over", "The arena finally took you out.");
  refreshUI();
}

function showMainMenu() {
  state = getFreshState();
  createDecalsAndBarrels();
  DOM.menuOverlay.hidden = false;
  DOM.tutorialOverlay.hidden = true;
  DOM.pauseOverlay.hidden = true;
  DOM.gameOverOverlay.hidden = true;
  AUDIO.stopMusic();
  renderLogs();
  renderDropPills();
  refreshUI();
}

function startRun() {
  state = getFreshState();
  createDecalsAndBarrels();
  state.screen = "intermission";
  DOM.menuOverlay.hidden = true;
  DOM.pauseOverlay.hidden = true;
  DOM.gameOverOverlay.hidden = true;
  DOM.tutorialOverlay.hidden = true;
  syncTouchMode();
  refreshUI();
  renderLogs();
  AUDIO.startMusic();
  pushLog("Drop In", "Get to the campfire and launch the first wave.");
}

function openTutorial() {
  DOM.tutorialOverlay.hidden = false;
}

function closeTutorial() {
  DOM.tutorialOverlay.hidden = true;
}

function pauseGame() {
  if (state.screen === "menu" || state.screen === "gameover") {
    return;
  }

  if (state.screen === "paused") {
    state.screen = state.resumeScreen;
    DOM.pauseOverlay.hidden = true;
    AUDIO.startMusic();
  } else {
    state.resumeScreen = state.screen;
    state.screen = "paused";
    DOM.pauseOverlay.hidden = false;
    AUDIO.stopMusic();
  }

  refreshUI();
}

function spawnEnemy(typeKey, boss = false) {
  const base = boss ? BOSS_TYPES[typeKey] : ENEMY_TYPES[typeKey];
  const edge = Math.floor(rand(0, 4));
  const margin = 86;
  let x = WORLD.width / 2;
  let y = WORLD.height / 2;

  if (edge === 0) {
    x = rand(-margin, WORLD.width + margin);
    y = -margin;
  } else if (edge === 1) {
    x = WORLD.width + margin;
    y = rand(-margin, WORLD.height + margin);
  } else if (edge === 2) {
    x = rand(-margin, WORLD.width + margin);
    y = WORLD.height + margin;
  } else {
    x = -margin;
    y = rand(-margin, WORLD.height + margin);
  }

  state.enemies.push({
    x,
    y,
    radius: base.radius,
    health: base.hp,
    maxHealth: base.hp,
    speed: base.speed,
    damage: base.damage,
    color: base.color,
    accent: base.accent,
    points: base.points,
    type: typeKey,
    isBoss: boss,
    armor: base.armor || 0,
    explodeRadius: base.explodeRadius || 0,
    range: base.range || 0,
    fireRate: base.fireRate || 0,
    projectileSpeed: base.projectileSpeed || 0,
    attackCooldown: rand(0.35, 0.8),
    retargetTimer: rand(0.7, 1.8),
    focus: Math.random() < 0.5 ? "campfire" : "player",
    hitFlash: 0,
    burn: 0,
    burnTick: 0.25,
    specialCooldown: rand(3.5, 5.6),
    chargeTimer: 0,
    chargeX: 0,
    chargeY: 0,
    summonType: base.summonType || "normal"
  });

  if (boss) {
    showBossBanner(`${base.label} Incoming`);
    pushLog("Boss Incoming", `${base.label} just hit the perimeter.`);
    AUDIO.play("boss");
  }
}

function updateWaveSpawns(dt) {
  if (state.screen !== "playing") {
    return;
  }

  if (state.frenzy) {
    state.frenzySpawnTimer -= dt;
    state.frenzyBossTimer -= dt;

    if (state.frenzySpawnTimer <= 0) {
      spawnEnemy(weightedPick({ normal: 0.6, fast: 0.9, tank: 0.55, exploder: 0.46, armored: 0.52, ranged: 0.44 }));
      state.frenzySpawnTimer = Math.max(0.28, 0.78 - Math.min(0.28, state.wave * 0.01));
    }

    if (state.frenzyBossTimer <= 0) {
      spawnEnemy(pick(["brute", "spitter", "reaper"]), true);
      state.frenzyBossTimer = rand(13, 18);
    }
    return;
  }

  if (!state.wavePlan) {
    return;
  }

  state.wavePlan.spawnTimer -= dt;
  if (state.wavePlan.remaining > 0 && state.wavePlan.spawnTimer <= 0) {
    spawnEnemy(weightedPick(state.wavePlan.weights));
    state.wavePlan.remaining -= 1;
    state.wavePlan.spawnTimer = state.wavePlan.interval * rand(0.76, 1.24);
  }

  for (let index = state.wavePlan.bosses.length - 1; index >= 0; index -= 1) {
    const boss = state.wavePlan.bosses[index];
    boss.time -= dt;
    if (boss.time <= 0) {
      spawnEnemy(boss.id, true);
      state.wavePlan.bosses.splice(index, 1);
    }
  }

  if (state.wavePlan.remaining <= 0 && state.wavePlan.bosses.length === 0 && state.enemies.length === 0) {
    endWave();
  }
}

function spawnFloatingText(text, x, y, color = "#ffffff", scale = 1) {
  state.particles.push({ kind: "text", text, x, y, vx: rand(-10, 10), vy: -48, life: 0.8, maxLife: 0.8, color, scale });
}

function spawnSparkBurst(x, y, color, count = 8, speed = 120) {
  for (let index = 0; index < count; index += 1) {
    const angle = rand(0, TAU);
    const velocity = rand(speed * 0.35, speed);
    state.particles.push({
      kind: "dot",
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: rand(0.25, 0.7),
      maxLife: 0.7,
      size: rand(2, 4),
      color,
      gravity: 44
    });
  }
}

function createBloodSplat(x, y, amount = 1) {
  for (let index = 0; index < amount; index += 1) {
    state.splats.push({ x: x + rand(-10, 10), y: y + rand(-10, 10), radius: rand(5, 16), life: rand(8, 16) });
  }
}

function createExplosion(x, y, radius, damage, source = "player") {
  addShake(radius * 0.05);
  state.flashWhite = Math.max(state.flashWhite, 0.14);
  spawnSparkBurst(x, y, source === "enemy" ? "#ff7563" : "#ffd26c", 24, 220);
  spawnFloatingText("BOOM", x, y - 24, "#ffb067", 1.1);

  state.enemies.forEach((enemy) => {
    const dist = distance(x, y, enemy.x, enemy.y);
    if (dist <= radius + enemy.radius) {
      const falloff = 1 - clamp(dist / (radius + enemy.radius), 0, 1);
      damageEnemy(enemy, damage * falloff, { x: enemy.x, y: enemy.y, headshot: false, critChance: 0, knockback: 360 * falloff, fire: 0 });
    }
  });

  if (distance(x, y, state.player.x, state.player.y) <= radius + state.player.radius) {
    damagePlayer(damage * 0.5, angleTo(x, y, state.player.x, state.player.y));
  }

  if (!state.campfire.broken && distance(x, y, state.campfire.x, state.campfire.y) <= radius + state.campfire.radius) {
    damageCampfire(damage * 0.34);
  }
}

function applyCampPoints(amount) {
  const total = Math.round(amount * (state.effects.doublePoints > 0 ? 2 : 1));
  state.campPoints += total;
  state.score += total * 2;
  return total;
}

function maybeSpawnDrop(enemy) {
  const chance = enemy.isBoss ? 1 : 0.16;
  if (Math.random() > chance) {
    return;
  }

  state.drops.push({
    id: pick(enemy.isBoss ? ["ammo", "health", "armor", "doublePoints", "instaKill", "shield", "nuke"] : ["ammo", "health", "armor", "doublePoints", "instaKill", "shield", "nuke"]),
    x: enemy.x,
    y: enemy.y,
    radius: 17,
    pulse: rand(0, TAU),
    life: 18
  });
}

function killEnemy(enemy, info = {}) {
  const points = applyCampPoints(enemy.points + (info.headshot ? 8 : 0) + (enemy.isBoss ? 120 : 0));
  state.kills += 1;
  state.score += enemy.isBoss ? 260 : 40;
  if (info.headshot) state.headshots += 1;
  if (enemy.isBoss) state.bossKills += 1;

  spawnFloatingText(`+${points} CP`, enemy.x, enemy.y - 18, "#ffd36f", enemy.isBoss ? 1.2 : 0.92);
  spawnSparkBurst(enemy.x, enemy.y, enemy.accent, enemy.isBoss ? 24 : 12, enemy.isBoss ? 180 : 120);
  createBloodSplat(enemy.x, enemy.y, enemy.isBoss ? 5 : 2);
  maybeSpawnDrop(enemy);
  AUDIO.play("hit");

  if (enemy.explodeRadius) {
    createExplosion(enemy.x, enemy.y, enemy.explodeRadius, enemy.damage + 10, "enemy");
  }

  state.enemies = state.enemies.filter((entry) => entry !== enemy);
}

function damageEnemy(enemy, baseDamage, options = {}) {
  if (!enemy || enemy.health <= 0) {
    return;
  }

  let damage = baseDamage * getDamageFactor();
  let headshot = false;
  let crit = false;

  if (state.effects.instaKill > 0 && !enemy.isBoss) {
    damage = enemy.health + 999;
  }

  const headX = enemy.x;
  const headY = enemy.y - enemy.radius * 1.05;
  if (options.headshot && distance(options.x, options.y, headX, headY) <= enemy.radius * 0.7) {
    damage *= enemy.isBoss ? 1.25 : 1.8;
    headshot = true;
  }

  if (Math.random() < (options.critChance ?? getCritChance())) {
    damage *= 1.45;
    crit = true;
  }

  if (enemy.armor) {
    damage *= 1 - enemy.armor;
  }

  enemy.health -= damage;
  enemy.hitFlash = 0.12;
  if (options.knockback) {
    const push = normalize(enemy.x - options.x, enemy.y - options.y);
    enemy.x += push.x * options.knockback * 0.015;
    enemy.y += push.y * options.knockback * 0.015;
  }
  if (options.fire) {
    enemy.burn = Math.max(enemy.burn, options.fire);
  }

  spawnFloatingText(`${Math.max(1, Math.round(damage))}${headshot ? " HS" : crit ? " CRIT" : ""}`, options.x, options.y - 10, headshot ? "#ffd970" : crit ? "#ffb86c" : "#ffffff", headshot ? 1.1 : 0.9);
  spawnSparkBurst(options.x, options.y, enemy.accent, enemy.isBoss ? 8 : 4, 90);
  state.hitstop = Math.max(state.hitstop, headshot || crit ? 0.035 : 0.02);
  addShake(headshot || enemy.isBoss ? 5 : 2);

  if (enemy.health <= 0) {
    killEnemy(enemy, { headshot });
  }
}

function damagePlayer(amount, sourceAngle = 0) {
  const player = state.player;
  if (player.invuln > 0 || state.screen === "gameover") {
    return;
  }

  let damage = state.effects.shield > 0 ? amount * 0.6 : amount;
  const armorBlock = Math.min(player.armor, damage * 0.65);
  player.armor -= armorBlock;
  damage -= armorBlock;
  player.health -= damage;
  player.hitFlash = 0.2;
  player.invuln = 0.18;
  state.flashRed = Math.max(state.flashRed, 0.22);
  addShake(6);
  AUDIO.play("hurt");

  const push = normalize(Math.cos(sourceAngle), Math.sin(sourceAngle));
  player.x += push.x * 10;
  player.y += push.y * 10;

  if (player.health <= 0) {
    player.health = 0;
    gameOver();
  }
}

function damageCampfire(amount) {
  if (state.campfire.broken) {
    return;
  }
  state.campfire.health -= amount;
  state.campfire.damageFlash = 0.28;
  addShake(4);
  if (state.campfire.health <= 0) {
    enterFrenzy();
  }
}

function startReload() {
  const { slot, weapon } = getActiveWeaponState();
  if (slot === "fists" || !weapon) {
    return;
  }

  const def = WEAPONS[weapon.id];
  if (!def.mag || weapon.reload > 0 || weapon.ammo >= getMagazineSize(def) || weapon.reserve <= 0) {
    return;
  }

  weapon.reload = def.reload / getReloadFactor();
  AUDIO.play("reload");
  pushLog("Reload", `${def.label} reloading.`);
}

function finishReload(weapon) {
  const def = WEAPONS[weapon.id];
  const magSize = getMagazineSize(def);
  const needed = magSize - weapon.ammo;
  const taken = Math.min(needed, weapon.reserve);
  weapon.ammo += taken;
  weapon.reserve -= taken;
}

function updateWeaponTimers(dt) {
  ["primary", "secondary"].forEach((slot) => {
    const weapon = state.inventory[slot];
    if (!weapon) return;
    weapon.cooldown = Math.max(0, weapon.cooldown - dt);
    if (weapon.reload > 0) {
      weapon.reload = Math.max(0, weapon.reload - dt);
      if (weapon.reload === 0) {
        finishReload(weapon);
      }
    }
  });
}

function fireMelee(def) {
  const player = state.player;
  let hitSomething = false;
  for (const enemy of [...state.enemies]) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > def.range + enemy.radius) continue;

    const delta = Math.atan2(dy, dx) - player.angle;
    const wrapped = Math.atan2(Math.sin(delta), Math.cos(delta));
    if (Math.abs(wrapped) > def.arc * 0.5) continue;

    hitSomething = true;
    damageEnemy(enemy, def.damage, { x: enemy.x, y: enemy.y, headshot: false, critChance: getCritChance() * 0.6, knockback: def.knockback });
  }

  spawnSparkBurst(player.x + Math.cos(player.angle) * 48, player.y + Math.sin(player.angle) * 48, "#fff2b8", hitSomething ? 10 : 5, 110);
  AUDIO.play("ui");
  state.crosshairSpread = Math.min(18, state.crosshairSpread + def.recoil * 10);
}

function createProjectile(config) {
  state.projectiles.push({
    owner: config.owner,
    x: config.x,
    y: config.y,
    prevX: config.x,
    prevY: config.y,
    vx: config.vx,
    vy: config.vy,
    life: config.life,
    radius: config.radius || 4,
    damage: config.damage,
    color: config.color,
    explosive: config.explosive || 0,
    pierce: config.pierce || 0,
    knockback: config.knockback || 0,
    headshot: config.headshot ?? true,
    critChance: config.critChance ?? getCritChance(),
    fire: config.fire || 0
  });
}

function fireWeapon() {
  if (state.screen !== "playing") {
    return;
  }

  const player = state.player;
  const { slot, weapon } = getActiveWeaponState();
  const def = getWeaponDefinition();
  if (!def || (slot !== "fists" && !weapon)) {
    return;
  }
  if (slot !== "fists" && weapon.reload > 0) {
    return;
  }
  if (slot !== "fists" && weapon.cooldown > 0) {
    return;
  }

  if (def.kind === "melee") {
    fireMelee(def);
    return;
  }

  if (weapon.ammo <= 0) {
    startReload();
    return;
  }

  weapon.ammo -= 1;
  weapon.cooldown = 1 / def.fireRate;
  state.crosshairSpread = Math.min(26, state.crosshairSpread + def.recoil * 12);
  addShake(def.recoil * 2.4);

  const barrelX = player.x + Math.cos(player.angle) * 28;
  const barrelY = player.y + Math.sin(player.angle) * 28;
  const sound = def.flame ? "flame" : def.explosion ? "heavy" : def.pellets ? "shotgun" : def.damage >= 40 ? "heavy" : "pistol";
  AUDIO.play(sound);

  if (def.casing) {
    spawnSparkBurst(barrelX, barrelY, "#cdb061", 4, 80);
  }
  spawnSparkBurst(barrelX, barrelY, def.color, def.flame ? 4 : 7, def.flame ? 60 : 120);

  const pellets = def.pellets || 1;
  for (let index = 0; index < pellets; index += 1) {
    const spread = (Math.random() - 0.5) * def.spread * (1 + state.crosshairSpread * 0.02);
    const shotAngle = player.angle + spread;
    createProjectile({
      owner: "player",
      x: barrelX,
      y: barrelY,
      vx: Math.cos(shotAngle) * def.speed,
      vy: Math.sin(shotAngle) * def.speed,
      life: def.life,
      damage: def.damage,
      color: def.color,
      explosive: def.explosion,
      pierce: def.pierce,
      knockback: def.knockback,
      critChance: getCritChance() + (def.critBonus || 0),
      fire: def.burn || 0
    });
  }

  if (weapon.ammo <= 0 && weapon.reserve > 0) {
    startReload();
  }
}

function requestDash() {
  const player = state.player;
  if ((state.screen !== "playing" && state.screen !== "intermission") || player.dashCooldown > 0 || player.dashTimer > 0) {
    return;
  }

  let moveX = 0;
  let moveY = 0;
  if (SESSION.mobile && (Math.abs(state.moveStick.x) > 0.1 || Math.abs(state.moveStick.y) > 0.1)) {
    moveX = state.moveStick.x;
    moveY = state.moveStick.y;
  } else {
    moveX = (KEYS.d || KEYS.arrowright ? 1 : 0) - (KEYS.a || KEYS.arrowleft ? 1 : 0);
    moveY = (KEYS.s || KEYS.arrowdown ? 1 : 0) - (KEYS.w || KEYS.arrowup ? 1 : 0);
    if (moveX === 0 && moveY === 0) {
      moveX = Math.cos(player.angle);
      moveY = Math.sin(player.angle);
    }
  }

  const normal = normalize(moveX, moveY);
  player.dashX = normal.x;
  player.dashY = normal.y;
  player.dashTimer = 0.18;
  player.dashCooldown = getDashCooldownDuration();
  player.invuln = 0.24;
  addShake(7);
  spawnSparkBurst(player.x, player.y, "#fff0a5", 12, 170);
  AUDIO.play("dash");
}

function handlePlayerInput(dt) {
  const player = state.player;
  const aimPoint = getAimPoint();
  const aim = normalize(aimPoint.x - player.x, aimPoint.y - player.y);
  if (aim.length > 0.001) {
    player.angle = Math.atan2(aim.y, aim.x);
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);

  if (player.dashTimer > 0) {
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.x += player.dashX * 760 * dt;
    player.y += player.dashY * 760 * dt;
    spawnSparkBurst(player.x, player.y, "#fff2c2", 2, 40);
  } else {
    let moveX = 0;
    let moveY = 0;

    if (SESSION.mobile && (Math.abs(state.moveStick.x) > 0.02 || Math.abs(state.moveStick.y) > 0.02)) {
      moveX = state.moveStick.x;
      moveY = state.moveStick.y;
    } else {
      moveX = (KEYS.d || KEYS.arrowright ? 1 : 0) - (KEYS.a || KEYS.arrowleft ? 1 : 0);
      moveY = (KEYS.s || KEYS.arrowdown ? 1 : 0) - (KEYS.w || KEYS.arrowup ? 1 : 0);
      const normalized = normalize(moveX, moveY);
      moveX = normalized.length > 0.01 ? normalized.x : 0;
      moveY = normalized.length > 0.01 ? normalized.y : 0;
    }

    player.x += moveX * getMoveSpeed() * dt;
    player.y += moveY * getMoveSpeed() * dt;
  }

  player.x = clamp(player.x, 34, WORLD.width - 34);
  player.y = clamp(player.y, 34, WORLD.height - 34);

  if ((state.mouse.down || state.aimStick.active) && state.screen === "playing") {
    fireWeapon();
  }
}

function segmentCircleHit(x1, y1, x2, y2, cx, cy, radius) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = clamp(((cx - x1) * dx + (cy - y1) * dy) / lengthSquared, 0, 1);
  const nearestX = x1 + dx * t;
  const nearestY = y1 + dy * t;
  return distance(nearestX, nearestY, cx, cy) <= radius;
}

function updateProjectiles(dt) {
  for (let index = state.projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = state.projectiles[index];
    projectile.prevX = projectile.x;
    projectile.prevY = projectile.y;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    if (projectile.owner === "player") {
      let consumed = false;

      for (const barrel of state.barrels) {
        if (barrel.exploded) continue;
        if (segmentCircleHit(projectile.prevX, projectile.prevY, projectile.x, projectile.y, barrel.x, barrel.y, barrel.radius)) {
          barrel.hp -= projectile.damage;
          barrel.flash = 0.15;
          if (barrel.hp <= 0) {
            barrel.exploded = true;
            createExplosion(barrel.x, barrel.y, 90, 38, "player");
          }
          consumed = true;
          break;
        }
      }

      if (consumed) {
        state.projectiles.splice(index, 1);
        continue;
      }

      for (const enemy of [...state.enemies]) {
        if (!segmentCircleHit(projectile.prevX, projectile.prevY, projectile.x, projectile.y, enemy.x, enemy.y, enemy.radius)) {
          continue;
        }

        damageEnemy(enemy, projectile.damage, {
          x: projectile.x,
          y: projectile.y,
          headshot: projectile.headshot,
          critChance: projectile.critChance,
          knockback: projectile.knockback,
          fire: projectile.fire
        });

        if (projectile.explosive) {
          createExplosion(projectile.x, projectile.y, projectile.explosive, projectile.damage, "player");
        }

        if (projectile.pierce > 0) {
          projectile.pierce -= 1;
        } else {
          state.projectiles.splice(index, 1);
        }
        consumed = true;
        break;
      }

      if (consumed) {
        continue;
      }
    } else {
      if (segmentCircleHit(projectile.prevX, projectile.prevY, projectile.x, projectile.y, state.player.x, state.player.y, state.player.radius)) {
        damagePlayer(projectile.damage, angleTo(projectile.x, projectile.y, state.player.x, state.player.y));
        state.projectiles.splice(index, 1);
        continue;
      }

      if (!state.campfire.broken && segmentCircleHit(projectile.prevX, projectile.prevY, projectile.x, projectile.y, state.campfire.x, state.campfire.y, state.campfire.radius)) {
        damageCampfire(projectile.damage);
        state.projectiles.splice(index, 1);
        continue;
      }
    }

    if (projectile.life <= 0 || projectile.x < -80 || projectile.x > WORLD.width + 80 || projectile.y < -80 || projectile.y > WORLD.height + 80) {
      if (projectile.explosive) {
        createExplosion(projectile.x, projectile.y, projectile.explosive, projectile.damage, projectile.owner);
      }
      state.projectiles.splice(index, 1);
    }
  }
}

function bossAbility(enemy) {
  const boss = BOSS_TYPES[enemy.type];
  const ability = pick(boss.abilities);
  enemy.specialCooldown = rand(4.6, 7.4);

  if (ability === "charge" || ability === "dash") {
    const target = enemy.focus === "campfire" && !state.campfire.broken ? state.campfire : state.player;
    const direction = normalize(target.x - enemy.x, target.y - enemy.y);
    enemy.chargeX = direction.x;
    enemy.chargeY = direction.y;
    enemy.chargeTimer = ability === "dash" ? 0.4 : 0.52;
    spawnFloatingText("CHARGE", enemy.x, enemy.y - enemy.radius - 18, "#ff9b7d", 0.9);
    return;
  }

  if (ability === "slam") {
    createExplosion(enemy.x, enemy.y, 120, 22, "enemy");
    return;
  }

  if (ability === "spawn") {
    for (let count = 0; count < 3; count += 1) {
      spawnEnemy(enemy.summonType || boss.summonType);
    }
    pushLog("Boss Ability", `${boss.label} called in reinforcements.`);
    return;
  }

  if (ability === "shoot") {
    for (let burst = -1; burst <= 1; burst += 1) {
      const angle = angleTo(enemy.x, enemy.y, state.player.x, state.player.y) + burst * 0.22;
      createProjectile({
        owner: "enemy",
        x: enemy.x + Math.cos(angle) * 12,
        y: enemy.y + Math.sin(angle) * 12,
        vx: Math.cos(angle) * 440,
        vy: Math.sin(angle) * 440,
        life: 1.3,
        damage: 14,
        color: "#7bc462",
        radius: 6,
        headshot: false,
        critChance: 0
      });
    }
    return;
  }

  if (ability === "explode") {
    createExplosion(enemy.x, enemy.y, 100, 18, "enemy");
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.retargetTimer = Math.max(0, enemy.retargetTimer - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

    if (enemy.burn > 0) {
      enemy.burn = Math.max(0, enemy.burn - dt);
      enemy.burnTick -= dt;
      spawnSparkBurst(enemy.x, enemy.y - enemy.radius * 0.2, "#ff8d4d", 1, 24);
      if (enemy.burnTick <= 0) {
        enemy.burnTick = 0.28;
        damageEnemy(enemy, 8, { x: enemy.x, y: enemy.y - enemy.radius * 0.5, headshot: false, critChance: 0, knockback: 0 });
      }
    }

    if (enemy.retargetTimer === 0) {
      enemy.retargetTimer = rand(0.8, 1.7);
      if (!state.campfire.broken) {
        const campDist = distance(enemy.x, enemy.y, state.campfire.x, state.campfire.y);
        const playerDist = distance(enemy.x, enemy.y, state.player.x, state.player.y);
        enemy.focus = campDist * rand(0.82, 1.06) < playerDist ? "campfire" : "player";
      } else {
        enemy.focus = "player";
      }
    }

    if (enemy.isBoss) {
      enemy.specialCooldown = Math.max(0, enemy.specialCooldown - dt);
      if (enemy.specialCooldown === 0) {
        bossAbility(enemy);
      }
    }

    if (enemy.chargeTimer > 0) {
      enemy.chargeTimer = Math.max(0, enemy.chargeTimer - dt);
      enemy.x += enemy.chargeX * enemy.speed * 4.6 * dt;
      enemy.y += enemy.chargeY * enemy.speed * 4.6 * dt;
    } else {
      const target = enemy.focus === "campfire" && !state.campfire.broken ? state.campfire : state.player;
      const toward = normalize(target.x - enemy.x, target.y - enemy.y);
      const dist = toward.length;

      if (enemy.type === "ranged" && dist < enemy.range) {
        enemy.x -= toward.x * enemy.speed * 0.24 * dt;
        enemy.y -= toward.y * enemy.speed * 0.24 * dt;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1 / enemy.fireRate;
          createProjectile({
            owner: "enemy",
            x: enemy.x,
            y: enemy.y,
            vx: toward.x * enemy.projectileSpeed,
            vy: toward.y * enemy.projectileSpeed,
            life: 1.4,
            damage: enemy.damage,
            color: "#8ace68",
            radius: 6,
            headshot: false,
            critChance: 0
          });
        }
      } else {
        enemy.x += toward.x * enemy.speed * dt;
        enemy.y += toward.y * enemy.speed * dt;
      }

      if (dist <= enemy.radius + target.radius + 10 && enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.isBoss ? 0.85 : 0.72;
        if (target === state.player) {
          damagePlayer(enemy.damage, angleTo(enemy.x, enemy.y, state.player.x, state.player.y));
        } else {
          damageCampfire(enemy.damage);
        }
      }
    }

    enemy.x = clamp(enemy.x, -70, WORLD.width + 70);
    enemy.y = clamp(enemy.y, -70, WORLD.height + 70);
  }
}

function updateCampfire(dt) {
  const campfire = state.campfire;
  campfire.damageFlash = Math.max(0, campfire.damageFlash - dt);
  if (campfire.broken) {
    return;
  }

  if (campfire.pulseLevel > 0 && state.screen === "playing") {
    campfire.pulseTimer -= dt;
    if (campfire.pulseTimer <= 0) {
      const radius = 90 + campfire.pulseLevel * 18;
      state.enemies.forEach((enemy) => {
        if (distance(campfire.x, campfire.y, enemy.x, enemy.y) <= radius + enemy.radius) {
          damageEnemy(enemy, 10 + campfire.pulseLevel * 4, { x: enemy.x, y: enemy.y, headshot: false, critChance: 0, knockback: 160 });
        }
      });
      spawnSparkBurst(campfire.x, campfire.y, "#ffb05a", 18, 160);
      campfire.pulseTimer = Math.max(1.7, 2.8 - campfire.pulseLevel * 0.18);
    }
  }
}

function applyDrop(drop) {
  switch (drop.id) {
    case "ammo":
      ["primary", "secondary"].forEach((slot) => {
        const weapon = state.inventory[slot];
        if (!weapon) return;
        const def = WEAPONS[weapon.id];
        weapon.reserve = Math.min(getReserveSize(def), weapon.reserve + Math.ceil(getReserveSize(def) * 0.45));
      });
      pushLog("Drop", "Ammo crate picked up.");
      break;
    case "health":
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 38);
      pushLog("Drop", "Med kit picked up.");
      break;
    case "armor":
      state.player.armor = Math.min(state.player.maxArmor, state.player.armor + 34);
      pushLog("Drop", "Armor patch picked up.");
      break;
    case "doublePoints":
      state.effects.doublePoints = Math.max(state.effects.doublePoints, 16);
      pushLog("Drop", "Double Points activated.");
      break;
    case "instaKill":
      state.effects.instaKill = Math.max(state.effects.instaKill, 10);
      pushLog("Drop", "Insta-Kill activated.");
      break;
    case "shield":
      state.effects.shield = Math.max(state.effects.shield, 14);
      pushLog("Drop", "Shield activated.");
      break;
    case "nuke":
      state.enemies.filter((enemy) => !enemy.isBoss).forEach((enemy) => {
        damageEnemy(enemy, enemy.health + 999, { x: enemy.x, y: enemy.y, headshot: false, critChance: 0, knockback: 0 });
      });
      state.enemies.filter((enemy) => enemy.isBoss).forEach((enemy) => {
        damageEnemy(enemy, enemy.maxHealth * 0.35, { x: enemy.x, y: enemy.y, headshot: false, critChance: 0, knockback: 0 });
      });
      pushLog("Drop", "Nuke detonated.");
      addShake(12);
      break;
    default:
      break;
  }

  AUDIO.play("pickup");
  state.boxResult = `Picked up ${drop.id}.`;
  refreshUI();
}

function updateDrops(dt) {
  for (let index = state.drops.length - 1; index >= 0; index -= 1) {
    const drop = state.drops[index];
    drop.life -= dt;
    drop.pulse += dt * 4.2;

    if (distance(drop.x, drop.y, state.player.x, state.player.y) <= drop.radius + state.player.radius + 6) {
      applyDrop(drop);
      state.drops.splice(index, 1);
      continue;
    }

    if (drop.life <= 0) {
      state.drops.splice(index, 1);
    }
  }
}

function updateEffects(dt) {
  Object.keys(state.effects).forEach((key) => {
    if (state.effects[key] > 0) {
      state.effects[key] = Math.max(0, state.effects[key] - dt);
    }
  });
}

function updateParticles(dt) {
  for (let index = state.particles.length - 1; index >= 0; index -= 1) {
    const particle = state.particles[index];
    particle.life -= dt;
    if (particle.life <= 0) {
      state.particles.splice(index, 1);
      continue;
    }

    if (particle.kind === "text") {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      continue;
    }

    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += (particle.gravity || 0) * dt;
  }

  for (let index = state.splats.length - 1; index >= 0; index -= 1) {
    state.splats[index].life -= dt;
    if (state.splats[index].life <= 0) {
      state.splats.splice(index, 1);
    }
  }
}

function updateTimers(dt) {
  if (state.bannerTimer > 0) {
    state.bannerTimer = Math.max(0, state.bannerTimer - dt);
    if (state.bannerTimer === 0) DOM.waveBanner.hidden = true;
  }
  if (state.bossBannerTimer > 0) {
    state.bossBannerTimer = Math.max(0, state.bossBannerTimer - dt);
    if (state.bossBannerTimer === 0) DOM.bossBanner.hidden = true;
  }

  state.flashRed = Math.max(0, state.flashRed - dt);
  state.flashWhite = Math.max(0, state.flashWhite - dt);
  state.shake = Math.max(0, state.shake - dt * 16);
  state.crosshairSpread = Math.max(0, state.crosshairSpread - dt * 18);
}

function update(dt) {
  updateTimers(dt);
  updateParticles(dt);

  if (state.screen === "menu" || state.screen === "paused" || state.screen === "gameover") {
    return;
  }

  updateEffects(dt);
  updateWeaponTimers(dt);

  if (state.hitstop > 0) {
    state.hitstop = Math.max(0, state.hitstop - dt);
    return;
  }

  handlePlayerInput(dt);
  updateProjectiles(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateCampfire(dt);
  updateWaveSpawns(dt);
}

function drawDoodle(doodle) {
  CTX.save();
  CTX.translate(doodle.x, doodle.y);
  CTX.rotate(doodle.angle);
  CTX.strokeStyle = "rgba(26, 21, 18, 0.22)";
  CTX.lineWidth = 2;
  CTX.beginPath();
  if (doodle.kind === "arrow") {
    CTX.moveTo(-doodle.size, 0);
    CTX.lineTo(doodle.size, 0);
    CTX.lineTo(doodle.size - 12, -12);
    CTX.moveTo(doodle.size, 0);
    CTX.lineTo(doodle.size - 12, 12);
  } else if (doodle.kind === "grid") {
    CTX.rect(-doodle.size * 0.45, -doodle.size * 0.45, doodle.size * 0.9, doodle.size * 0.9);
    CTX.moveTo(-doodle.size * 0.15, -doodle.size * 0.45);
    CTX.lineTo(-doodle.size * 0.15, doodle.size * 0.45);
    CTX.moveTo(doodle.size * 0.15, -doodle.size * 0.45);
    CTX.lineTo(doodle.size * 0.15, doodle.size * 0.45);
    CTX.moveTo(-doodle.size * 0.45, -doodle.size * 0.15);
    CTX.lineTo(doodle.size * 0.45, -doodle.size * 0.15);
    CTX.moveTo(-doodle.size * 0.45, doodle.size * 0.15);
    CTX.lineTo(doodle.size * 0.45, doodle.size * 0.15);
  } else if (doodle.kind === "ring") {
    CTX.arc(0, 0, doodle.size * 0.42, 0, TAU);
  } else if (doodle.kind === "cross") {
    CTX.moveTo(-doodle.size * 0.4, -doodle.size * 0.4);
    CTX.lineTo(doodle.size * 0.4, doodle.size * 0.4);
    CTX.moveTo(doodle.size * 0.4, -doodle.size * 0.4);
    CTX.lineTo(-doodle.size * 0.4, doodle.size * 0.4);
  } else {
    CTX.moveTo(-doodle.size * 0.35, -doodle.size * 0.22);
    CTX.lineTo(0, -doodle.size * 0.38);
    CTX.lineTo(doodle.size * 0.3, -doodle.size * 0.18);
    CTX.lineTo(doodle.size * 0.14, doodle.size * 0.34);
    CTX.lineTo(-doodle.size * 0.22, doodle.size * 0.32);
    CTX.closePath();
  }
  CTX.stroke();
  CTX.restore();
}

function drawBackground() {
  const gradient = CTX.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, "#d9cfb7");
  gradient.addColorStop(1, "#bfb08e");
  CTX.fillStyle = gradient;
  CTX.fillRect(0, 0, WORLD.width, WORLD.height);

  CTX.fillStyle = "rgba(98, 76, 38, 0.05)";
  for (let index = 0; index < 90; index += 1) {
    CTX.fillRect((index * 149) % WORLD.width, (index * 97) % WORLD.height, 2, 2);
  }

  state.doodles.forEach(drawDoodle);
  CTX.strokeStyle = "rgba(34, 28, 23, 0.34)";
  CTX.lineWidth = 8;
  CTX.strokeRect(10, 10, WORLD.width - 20, WORLD.height - 20);
}

function drawBarrels() {
  for (const barrel of state.barrels) {
    if (barrel.exploded) continue;
    CTX.save();
    CTX.translate(barrel.x, barrel.y);
    CTX.fillStyle = barrel.flash > 0 ? "#ff9a6f" : "#c34b3a";
    CTX.fillRect(-16, -20, 32, 40);
    CTX.fillStyle = "#51221a";
    CTX.fillRect(-16, -6, 32, 6);
    CTX.fillRect(-16, 8, 32, 6);
    CTX.restore();
    barrel.flash = Math.max(0, barrel.flash - 0.016);
  }
}

function drawCampfire() {
  const fire = state.campfire;
  CTX.save();
  CTX.translate(fire.x, fire.y);

  CTX.fillStyle = fire.broken ? "rgba(28, 22, 18, 0.38)" : "rgba(255, 164, 77, 0.14)";
  CTX.beginPath();
  CTX.arc(0, 0, 86, 0, TAU);
  CTX.fill();

  if (fire.pulseLevel > 0 && !fire.broken && state.screen === "playing") {
    CTX.strokeStyle = `rgba(255, 178, 89, ${0.18 + fire.pulseLevel * 0.05})`;
    CTX.lineWidth = 3;
    CTX.beginPath();
    CTX.arc(0, 0, 88 + fire.pulseLevel * 18, 0, TAU);
    CTX.stroke();
  }

  CTX.rotate(Math.PI * 0.24);
  CTX.fillStyle = "#65452d";
  CTX.fillRect(-28, -6, 56, 12);
  CTX.rotate(-Math.PI * 0.48);
  CTX.fillRect(-28, -6, 56, 12);
  CTX.rotate(Math.PI * 0.24);

  if (!fire.broken) {
    const wobble = Math.sin(performance.now() * 0.008) * 6;
    CTX.fillStyle = fire.damageFlash > 0 ? "#ffdb8e" : "#ffb45f";
    CTX.beginPath();
    CTX.moveTo(0, -40 - wobble);
    CTX.quadraticCurveTo(24, -10, 0, 20);
    CTX.quadraticCurveTo(-24, -10, 0, -40 - wobble);
    CTX.fill();

    CTX.fillStyle = "#ff6d4d";
    CTX.beginPath();
    CTX.moveTo(0, -26 - wobble * 0.55);
    CTX.quadraticCurveTo(14, -6, 0, 14);
    CTX.quadraticCurveTo(-14, -6, 0, -26 - wobble * 0.55);
    CTX.fill();
  } else {
    CTX.strokeStyle = "rgba(40, 34, 28, 0.68)";
    CTX.lineWidth = 6;
    CTX.beginPath();
    CTX.moveTo(-20, -16);
    CTX.lineTo(20, 16);
    CTX.moveTo(20, -16);
    CTX.lineTo(-20, 16);
    CTX.stroke();
  }

  CTX.restore();
}

function drawWeaponModel(weaponId, options = {}) {
  const {
    radius = 16,
    player = false,
    accent = "#d74a4a",
    fallbackLength = 24
  } = options;

  const grip = player ? "#55674c" : "#3b342d";
  const metal = player ? "#d9d0b0" : "#8e8579";
  const darkMetal = player ? "#2e3538" : "#2a2725";
  const wood = player ? "#8e5e2b" : "#5c4030";
  const tube = player ? "#4d5c4a" : "#3d3a33";
  const glow = player ? accent : "#d4c8b3";
  const scale = radius / 16;

  CTX.save();
  CTX.translate(radius * 0.12, 0);

  switch (weaponId) {
    case "fists":
      CTX.fillStyle = glow;
      CTX.fillRect(radius * 0.02, -7 * scale, 9 * scale, 14 * scale);
      CTX.fillRect(radius * 0.44, -6 * scale, 9 * scale, 12 * scale);
      break;
    case "knife":
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.02, -3 * scale, 8 * scale, 6 * scale);
      CTX.fillStyle = metal;
      CTX.beginPath();
      CTX.moveTo(radius * 0.5, 0);
      CTX.lineTo(radius * 1.52, -4.5 * scale);
      CTX.lineTo(radius * 1.52, 4.5 * scale);
      CTX.closePath();
      CTX.fill();
      break;
    case "bat":
      CTX.fillStyle = wood;
      CTX.fillRect(radius * 0.02, -3 * scale, radius * 1.48, 6 * scale);
      CTX.fillRect(radius * 1.18, -5.5 * scale, radius * 0.56, 11 * scale);
      CTX.fillStyle = "#d7bf84";
      CTX.fillRect(radius * 0.18, -3 * scale, 4 * scale, 6 * scale);
      break;
    case "pistol":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(radius * 0.06, -4 * scale, radius * 0.98, 8 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.24, -5.2 * scale, radius * 0.64, 3 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.22, 1 * scale, 7 * scale, 10 * scale);
      break;
    case "revolver":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(radius * 0.06, -4 * scale, radius * 1.12, 8 * scale);
      CTX.fillStyle = metal;
      CTX.beginPath();
      CTX.arc(radius * 0.62, 0, 4.4 * scale, 0, TAU);
      CTX.fill();
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.2, 1 * scale, 8 * scale, 11 * scale);
      break;
    case "smg":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-2 * scale, -4.2 * scale, radius * 1.42, 8.4 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.12, 1.4 * scale, 7 * scale, 11 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.76, 1.5 * scale, 5 * scale, 10 * scale);
      CTX.fillStyle = tube;
      CTX.fillRect(-6 * scale, -2.8 * scale, 8 * scale, 5.6 * scale);
      break;
    case "assault":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-4 * scale, -4.2 * scale, radius * 1.9, 8.4 * scale);
      CTX.fillStyle = tube;
      CTX.fillRect(-10 * scale, -2.6 * scale, 10 * scale, 5.2 * scale);
      CTX.fillRect(radius * 1.7, -1.4 * scale, radius * 0.42, 2.8 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.72, 1.5 * scale, 6 * scale, 12 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.18, 1 * scale, 7 * scale, 11 * scale);
      break;
    case "shotgun":
      CTX.fillStyle = wood;
      CTX.fillRect(-10 * scale, -3.5 * scale, radius * 1.92, 7 * scale);
      CTX.fillStyle = darkMetal;
      CTX.fillRect(radius * 1.22, -2.3 * scale, radius * 0.78, 4.6 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.44, -1.8 * scale, radius * 0.56, 3.6 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.04, 1 * scale, 7 * scale, 10 * scale);
      break;
    case "sniper":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-10 * scale, -3.4 * scale, radius * 2.34, 6.8 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.34, -7 * scale, radius * 0.74, 3.2 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.1, 1 * scale, 7 * scale, 11 * scale);
      CTX.fillStyle = tube;
      CTX.fillRect(radius * 2.02, -1.2 * scale, radius * 0.36, 2.4 * scale);
      break;
    case "lmg":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-8 * scale, -4.4 * scale, radius * 2.14, 8.8 * scale);
      CTX.fillStyle = tube;
      CTX.fillRect(-14 * scale, -2.8 * scale, 10 * scale, 5.6 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(radius * 0.62, 1 * scale, 8 * scale, 13 * scale);
      CTX.fillRect(radius * 0.88, 6 * scale, radius * 0.42, 5 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.08, 1 * scale, 7 * scale, 11 * scale);
      break;
    case "minigun":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-10 * scale, -5 * scale, radius * 1.22, 10 * scale);
      CTX.fillStyle = tube;
      for (let index = 0; index < 4; index += 1) {
        CTX.fillRect(radius * 0.62 + index * 8 * scale, -5.2 * scale + index * 2.8 * scale, radius * 0.74, 2 * scale);
      }
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.04, 1 * scale, 7 * scale, 12 * scale);
      CTX.fillStyle = metal;
      CTX.fillRect(-2 * scale, 4 * scale, 8 * scale, 6 * scale);
      break;
    case "rocket":
      CTX.fillStyle = darkMetal;
      CTX.fillRect(-6 * scale, -4 * scale, radius * 1.86, 8 * scale);
      CTX.fillStyle = "#ff8b5d";
      CTX.beginPath();
      CTX.moveTo(radius * 1.82, -4.5 * scale);
      CTX.lineTo(radius * 2.24, 0);
      CTX.lineTo(radius * 1.82, 4.5 * scale);
      CTX.closePath();
      CTX.fill();
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.06, 2 * scale, 8 * scale, 9 * scale);
      break;
    case "flamethrower":
      CTX.fillStyle = tube;
      CTX.fillRect(-6 * scale, -3.8 * scale, radius * 1.44, 7.6 * scale);
      CTX.fillStyle = "#ff8b4d";
      CTX.fillRect(radius * 1.26, -2.2 * scale, radius * 0.44, 4.4 * scale);
      CTX.fillStyle = grip;
      CTX.fillRect(radius * 0.12, 1 * scale, 7 * scale, 11 * scale);
      CTX.fillStyle = "#a64b34";
      CTX.fillRect(radius * 0.42, 6 * scale, radius * 0.68, 7 * scale);
      break;
    case "crossbow":
      CTX.fillStyle = wood;
      CTX.fillRect(-6 * scale, -2.5 * scale, radius * 1.52, 5 * scale);
      CTX.strokeStyle = metal;
      CTX.lineWidth = 2.6 * scale;
      CTX.beginPath();
      CTX.moveTo(radius * 1.18, -10 * scale);
      CTX.lineTo(radius * 0.86, 0);
      CTX.lineTo(radius * 1.18, 10 * scale);
      CTX.stroke();
      CTX.strokeStyle = "#d7bf84";
      CTX.lineWidth = 1.4 * scale;
      CTX.beginPath();
      CTX.moveTo(radius * 0.88, -8 * scale);
      CTX.lineTo(radius * 0.88, 8 * scale);
      CTX.stroke();
      break;
    default:
      CTX.fillStyle = player ? "#465e49" : "#2d2a28";
      CTX.fillRect(radius * 0.1, -4, fallbackLength, 8);
      CTX.fillStyle = accent;
      CTX.fillRect(radius * 0.1 + fallbackLength - 4, -2, 6, 4);
      break;
  }

  CTX.restore();
}

function drawStickman(x, y, angle, options = {}) {
  const {
    radius = 16,
    bodyColor = "#111111",
    accent = "#d74a4a",
    boss = false,
    player = false,
    hitFlash = 0,
    weaponLength = 24,
    weaponId = "fists"
  } = options;

  CTX.save();
  CTX.translate(x, y);
  CTX.lineCap = "round";
  CTX.lineJoin = "round";
  CTX.strokeStyle = hitFlash > 0 ? "#fff4d6" : bodyColor;
  CTX.lineWidth = boss ? 7 : 5;

  const bob = boss ? 0 : Math.sin((x + y + performance.now() * 0.01) * 0.02) * 2;
  const headY = -radius * 1.18 + bob;

  CTX.beginPath();
  CTX.moveTo(0, headY + radius * 0.8);
  CTX.lineTo(0, radius * 1.22);
  CTX.moveTo(0, -2);
  CTX.lineTo(-radius * 0.75, radius * 0.34);
  CTX.moveTo(0, -2);
  CTX.lineTo(radius * 0.75, radius * 0.34);
  CTX.moveTo(0, radius * 1.22);
  CTX.lineTo(-radius * 0.7, radius * 2);
  CTX.moveTo(0, radius * 1.22);
  CTX.lineTo(radius * 0.7, radius * 2);
  CTX.stroke();

  CTX.fillStyle = hitFlash > 0 ? "#fff9e7" : bodyColor;
  CTX.beginPath();
  CTX.arc(0, headY, radius * 0.65, 0, TAU);
  CTX.fill();

  CTX.fillStyle = accent;
  CTX.beginPath();
  CTX.arc(radius * 0.18, headY - 1, boss ? 3.5 : 2.6, 0, TAU);
  CTX.arc(-radius * 0.18, headY - 1, boss ? 3.5 : 2.6, 0, TAU);
  CTX.fill();

  if (player) {
    CTX.fillStyle = "#6c8b5f";
    CTX.fillRect(-radius * 0.58, radius * 0.1, radius * 1.16, radius * 0.8);
    CTX.beginPath();
    CTX.arc(0, headY - radius * 0.22, radius * 0.74, Math.PI, TAU, false);
    CTX.fill();
  }

  CTX.rotate(angle);
  drawWeaponModel(weaponId, {
    radius,
    player,
    accent,
    fallbackLength: weaponLength
  });
  CTX.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    CTX.fillStyle = "rgba(0, 0, 0, 0.15)";
    CTX.beginPath();
    CTX.ellipse(enemy.x, enemy.y + enemy.radius * 1.7, enemy.radius * 0.9, enemy.radius * 0.42, 0, 0, TAU);
    CTX.fill();

    drawStickman(enemy.x, enemy.y, angleTo(enemy.x, enemy.y, state.player.x, state.player.y), {
      radius: enemy.radius,
      bodyColor: enemy.color,
      accent: enemy.accent,
      boss: enemy.isBoss,
      hitFlash: enemy.hitFlash,
      weaponLength: enemy.type === "ranged" || enemy.isBoss ? 18 : 10,
      weaponId: enemy.isBoss
        ? enemy.type === "reaper"
          ? "minigun"
          : enemy.type === "spitter"
            ? "assault"
            : "shotgun"
        : enemy.type === "ranged"
          ? "crossbow"
          : enemy.type === "armored"
            ? "bat"
            : "fists"
    });

    if (enemy.isBoss) {
      CTX.fillStyle = "rgba(255, 90, 90, 0.14)";
      CTX.beginPath();
      CTX.arc(enemy.x, enemy.y, enemy.radius * 1.8, 0, TAU);
      CTX.fill();
    }
  }
}

function drawPlayer() {
  const player = state.player;
  CTX.fillStyle = "rgba(0, 0, 0, 0.16)";
  CTX.beginPath();
  CTX.ellipse(player.x, player.y + 30, 24, 10, 0, 0, TAU);
  CTX.fill();

  drawStickman(player.x, player.y, player.angle, {
    radius: player.radius,
    bodyColor: "#0f1010",
    accent: "#f7d878",
    player: true,
    hitFlash: player.hitFlash,
    weaponLength: getWeaponDefinition()?.kind === "gun" ? 28 : 14,
    weaponId: state.activeSlot === "fists" ? "fists" : (state.inventory[state.activeSlot]?.id || "fists")
  });
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    CTX.strokeStyle = projectile.color;
    CTX.lineWidth = projectile.radius;
    CTX.beginPath();
    CTX.moveTo(projectile.prevX, projectile.prevY);
    CTX.lineTo(projectile.x, projectile.y);
    CTX.stroke();
  }
}

function drawDrops() {
  state.drops.forEach((drop) => {
    const pulse = 1 + Math.sin(drop.pulse) * 0.08;
    const colors = { ammo: "#ffd56d", health: "#8de09f", armor: "#8ac4ff", doublePoints: "#ffe58a", instaKill: "#ff8d8d", shield: "#9de6ff", nuke: "#ffac5d" };
    CTX.fillStyle = colors[drop.id] || "#ffffff";
    CTX.beginPath();
    CTX.arc(drop.x, drop.y, drop.radius * pulse, 0, TAU);
    CTX.fill();
    CTX.fillStyle = "rgba(12, 11, 10, 0.7)";
    CTX.font = "bold 15px Chakra Petch";
    CTX.textAlign = "center";
    CTX.fillText(drop.id === "doublePoints" ? "2X" : drop.id === "instaKill" ? "X" : drop.id === "shield" ? "S" : drop.id === "nuke" ? "N" : drop.id === "ammo" ? "A" : drop.id === "health" ? "H" : "R", drop.x, drop.y + 5);
  });
}

function drawParticles() {
  for (const splat of state.splats) {
    CTX.fillStyle = `rgba(164, 24, 32, ${Math.min(0.36, splat.life / 24)})`;
    CTX.beginPath();
    CTX.arc(splat.x, splat.y, splat.radius, 0, TAU);
    CTX.fill();
  }

  for (const particle of state.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    if (particle.kind === "text") {
      CTX.fillStyle = particle.color;
      CTX.globalAlpha = alpha;
      CTX.font = `${Math.round(18 * (particle.scale || 1))}px Chakra Petch`;
      CTX.textAlign = "center";
      CTX.fillText(particle.text, particle.x, particle.y);
      CTX.globalAlpha = 1;
      continue;
    }

    CTX.globalAlpha = alpha;
    CTX.fillStyle = particle.color;
    CTX.beginPath();
    CTX.arc(particle.x, particle.y, particle.size, 0, TAU);
    CTX.fill();
    CTX.globalAlpha = 1;
  }
}

function drawCrosshair() {
  if (state.screen === "menu") return;

  const aimPoint = getAimPoint();
  const spread = 8 + state.crosshairSpread * 0.65;
  CTX.save();
  CTX.translate(aimPoint.x, aimPoint.y);
  CTX.strokeStyle = state.screen === "playing" ? "#111111" : "rgba(17, 17, 17, 0.54)";
  CTX.lineWidth = 2;
  CTX.beginPath();
  CTX.moveTo(-spread - 8, 0);
  CTX.lineTo(-spread, 0);
  CTX.moveTo(spread, 0);
  CTX.lineTo(spread + 8, 0);
  CTX.moveTo(0, -spread - 8);
  CTX.lineTo(0, -spread);
  CTX.moveTo(0, spread);
  CTX.lineTo(0, spread + 8);
  CTX.stroke();
  CTX.restore();
}

function drawOverlays() {
  if (state.flashRed > 0) {
    CTX.fillStyle = `rgba(255, 60, 60, ${state.flashRed})`;
    CTX.fillRect(0, 0, WORLD.width, WORLD.height);
  }
  if (state.flashWhite > 0) {
    CTX.fillStyle = `rgba(255, 255, 255, ${state.flashWhite})`;
    CTX.fillRect(0, 0, WORLD.width, WORLD.height);
  }
  if (state.frenzy) {
    CTX.fillStyle = "rgba(22, 0, 0, 0.18)";
    CTX.fillRect(0, 0, WORLD.width, WORLD.height);
  }
  if (state.screen === "paused") {
    CTX.fillStyle = "rgba(0, 0, 0, 0.22)";
    CTX.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}

function render() {
  CTX.clearRect(0, 0, WORLD.width, WORLD.height);
  drawBackground();

  CTX.save();
  if (state.shake > 0) {
    CTX.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
  }
  drawBarrels();
  drawCampfire();
  drawDrops();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawParticles();
  CTX.restore();

  drawCrosshair();
  drawOverlays();
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  state.uiTimer -= dt;
  if (state.uiTimer <= 0) {
    refreshUI();
    state.uiTimer = 0.08;
  }
  render();
  requestAnimationFrame(loop);
}

function syncTouchMode() {
  const active = SESSION.mobile && (state.screen === "playing" || state.screen === "intermission");
  DOM.touchControls.hidden = !active;
  DOM.touchControls.setAttribute("aria-hidden", active ? "false" : "true");
}

function worldPointFromClient(clientX, clientY) {
  const rect = DOM.gameCanvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * WORLD.width,
    y: ((clientY - rect.top) / rect.height) * WORLD.height
  };
}

function updateThumb(thumb, pad, vectorX, vectorY) {
  const radius = pad.clientWidth * 0.24;
  thumb.style.transform = `translate(calc(-50% + ${vectorX * radius}px), calc(-50% + ${vectorY * radius}px))`;
}

function resetTouchPad(thumb) {
  thumb.style.transform = "translate(-50%, -50%)";
}

function attachTouchPad(pad, thumb, key) {
  const handleTouch = (touch, active = true) => {
    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const vector = normalize(touch.clientX - centerX, touch.clientY - centerY);
    const scale = Math.min(1, vector.length / (rect.width * 0.42));
    const valueX = vector.x * scale;
    const valueY = vector.y * scale;

    if (key === "move") {
      state.moveStick.x = valueX;
      state.moveStick.y = valueY;
    } else {
      state.aimStick.x = valueX;
      state.aimStick.y = valueY;
      state.aimStick.active = active;
      state.mouse.down = active;
    }

    updateThumb(thumb, pad, valueX, valueY);
  };

  pad.addEventListener("touchstart", (event) => {
    ensureAudio();
    const touch = event.changedTouches[0];
    if (key === "move") {
      state.touch.moveId = touch.identifier;
    } else {
      state.touch.aimId = touch.identifier;
    }
    handleTouch(touch, true);
  }, { passive: true });

  pad.addEventListener("touchmove", (event) => {
    const touchId = key === "move" ? state.touch.moveId : state.touch.aimId;
    const touch = [...event.changedTouches].find((entry) => entry.identifier === touchId);
    if (!touch) return;
    handleTouch(touch, true);
  }, { passive: true });

  pad.addEventListener("touchend", (event) => {
    const touchId = key === "move" ? state.touch.moveId : state.touch.aimId;
    const touch = [...event.changedTouches].find((entry) => entry.identifier === touchId);
    if (!touch) return;

    if (key === "move") {
      state.touch.moveId = null;
      state.moveStick.x = 0;
      state.moveStick.y = 0;
    } else {
      state.touch.aimId = null;
      state.aimStick.active = false;
      state.mouse.down = false;
    }
    resetTouchPad(thumb);
  }, { passive: true });

  pad.addEventListener("touchcancel", () => {
    if (key === "move") {
      state.touch.moveId = null;
      state.moveStick.x = 0;
      state.moveStick.y = 0;
    } else {
      state.touch.aimId = null;
      state.aimStick.active = false;
      state.mouse.down = false;
    }
    resetTouchPad(thumb);
  }, { passive: true });
}

function bindEvents() {
  DOM.playButton.addEventListener("click", () => {
    ensureAudio();
    startRun();
  });
  DOM.howButton.addEventListener("click", openTutorial);
  DOM.menuMuteButton.addEventListener("click", toggleMute);
  DOM.topMuteButton.addEventListener("click", toggleMute);
  DOM.pauseMuteButton.addEventListener("click", toggleMute);
  DOM.tutorialStartButton.addEventListener("click", () => {
    ensureAudio();
    SESSION.tutorialSeen = true;
    startRun();
  });
  DOM.tutorialCloseButton.addEventListener("click", closeTutorial);
  DOM.resumeButton.addEventListener("click", pauseGame);
  DOM.restartButton.addEventListener("click", () => {
    ensureAudio();
    startRun();
  });
  DOM.menuButton.addEventListener("click", showMainMenu);
  DOM.endRestartButton.addEventListener("click", () => {
    ensureAudio();
    startRun();
  });
  DOM.endMenuButton.addEventListener("click", showMainMenu);
  DOM.topPauseButton.addEventListener("click", pauseGame);
  DOM.nextWaveButton.addEventListener("click", () => {
    ensureAudio();
    startWave(false);
  });
  DOM.mysteryBoxButton.addEventListener("click", openMysteryBox);
  DOM.reloadButton.addEventListener("click", startReload);
  DOM.dashButton.addEventListener("click", requestDash);
  DOM.touchPauseButton.addEventListener("click", pauseGame);

  DOM.gameCanvas.addEventListener("pointermove", (event) => {
    const point = worldPointFromClient(event.clientX, event.clientY);
    state.mouse.x = point.x;
    state.mouse.y = point.y;
    state.mouse.inside = true;
  });

  DOM.gameCanvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    ensureAudio();
    const point = worldPointFromClient(event.clientX, event.clientY);
    state.mouse.x = point.x;
    state.mouse.y = point.y;
    state.mouse.down = true;
  });

  window.addEventListener("pointerup", () => {
    state.mouse.down = false;
  });

  DOM.gameCanvas.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    KEYS[key] = true;

    if (event.repeat && ["r", " ", "escape", "p", "1", "2", "3", "q", "m"].includes(key)) {
      return;
    }

    if (key === "r") {
      startReload();
    } else if (key === " ") {
      event.preventDefault();
      requestDash();
    } else if (key === "escape" || key === "p") {
      event.preventDefault();
      pauseGame();
    } else if (key === "1") {
      setActiveSlot("fists");
    } else if (key === "2") {
      setActiveSlot("primary");
    } else if (key === "3") {
      setActiveSlot("secondary");
    } else if (key === "q") {
      cycleWeapon();
    } else if (key === "m") {
      toggleMute();
    }
  });

  window.addEventListener("keyup", (event) => {
    KEYS[event.key.toLowerCase()] = false;
  });

  attachTouchPad(DOM.movePad, DOM.moveThumb, "move");
  attachTouchPad(DOM.aimPad, DOM.aimThumb, "aim");

  window.addEventListener("blur", () => {
    Object.keys(KEYS).forEach((key) => delete KEYS[key]);
    state.mouse.down = false;
    state.moveStick.x = 0;
    state.moveStick.y = 0;
    state.aimStick.active = false;
    state.touch.moveId = null;
    state.touch.aimId = null;
    resetTouchPad(DOM.moveThumb);
    resetTouchPad(DOM.aimThumb);
    if (state.screen === "playing" || state.screen === "intermission") {
      pauseGame();
    }
  });
}

createWeaponSlots();
createUpgradeButtons();
bindEvents();
syncTouchMode();
syncMuteButtons();
createDecalsAndBarrels();
refreshUI();
renderLogs();
renderDropPills();
requestAnimationFrame(loop);

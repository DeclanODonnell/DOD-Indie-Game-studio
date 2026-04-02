const STAGE_DEFINITIONS = [
  {
    index: 0,
    label: "Stage 1",
    choices: ["ant", "fly", "bee"],
    nextChoices: ["dog", "cat", "koala"],
    nextLabel: "Stage 2",
    overlayEyebrow: "Stage 2 unlocked",
    overlayTitle: "Choose your Stage 2 animal",
    overlayCopy: "Your God starter is maxed out. Reset helpers, upgrades, and resources, keep the click boost, and move into Dog, Cat, or Koala."
  },
  {
    index: 1,
    label: "Stage 2",
    choices: ["dog", "cat", "koala"],
    nextChoices: ["shark", "bear", "ape"],
    nextLabel: "Stage 3",
    overlayEyebrow: "Stage 3 unlocked",
    overlayTitle: "Choose your Stage 3 animal",
    overlayCopy: "Your God middle form is complete. Reset helpers, upgrades, and resources, keep the click boost, and pick the final animal."
  },
  {
    index: 2,
    label: "Stage 3",
    choices: ["shark", "bear", "ape"],
    nextChoices: [],
    nextLabel: null,
    overlayEyebrow: "Final stage",
    overlayTitle: "Final stage active",
    overlayCopy: "There is no next stage after this yet. Push your final animal all the way through God form."
  }
];

const RANK_DEFINITIONS = [
  {
    index: 0,
    id: "worker",
    label: "Worker",
    nextLabel: "Enforcer",
    thresholdByStage: [8500, 42000, 220000],
    powerMultiplier: 1,
    growthMin: 1.08,
    growthMax: 1.26,
    helperGrowthScale: 0.96
  },
  {
    index: 1,
    id: "enforcer",
    label: "Enforcer",
    nextLabel: "Queen",
    thresholdByStage: [65000, 320000, 1800000],
    powerMultiplier: 1.72,
    growthMin: 1.18,
    growthMax: 1.38,
    helperGrowthScale: 1.06
  },
  {
    index: 2,
    id: "queen",
    label: "Queen",
    nextLabel: "Cyber",
    thresholdByStage: [360000, 1950000, 11000000],
    powerMultiplier: 2.65,
    growthMin: 1.28,
    growthMax: 1.48,
    helperGrowthScale: 1.14
  },
  {
    index: 3,
    id: "cyber",
    label: "Cyber",
    nextLabel: "God",
    thresholdByStage: [2100000, 11000000, 62000000],
    powerMultiplier: 4.1,
    growthMin: 1.38,
    growthMax: 1.62,
    helperGrowthScale: 1.22
  },
  {
    index: 4,
    id: "god",
    label: "God",
    nextLabel: null,
    thresholdByStage: [11500000, 60000000, 340000000],
    powerMultiplier: 6.4,
    growthMin: 1.52,
    growthMax: 1.82,
    helperGrowthScale: 1.32
  }
];

const MAX_STAGE = STAGE_DEFINITIONS.length - 1;
const MAX_RANK = RANK_DEFINITIONS.length - 1;

const HELPER_BLUEPRINTS = [
  { baseCost: 36, baseIncome: 0.34, growth: 1.31 },
  { baseCost: 300, baseIncome: 2.5, growth: 1.33 },
  { baseCost: 2400, baseIncome: 18.5, growth: 1.35 },
  { baseCost: 19000, baseIncome: 138, growth: 1.38 },
  { baseCost: 140000, baseIncome: 980, growth: 1.41 }
];

const SPECIES_POOL = [
  { id: "ant", name: "Ant", shape: "ant", accent: "#ffd14b", secondary: "#ff8c31", blurb: "Build your colony and gather sugar." },
  { id: "fly", name: "Fly", shape: "fly", accent: "#a7ff57", secondary: "#68d957", blurb: "Land on filth and grow your swarm." },
  { id: "bee", name: "Bee", shape: "bee", accent: "#ffe05e", secondary: "#ff7cbf", blurb: "Collect pollen and power your hive." },
  { id: "dog", name: "Dog", shape: "canid", accent: "#ffb35b", secondary: "#ff7a3f", blurb: "Run a hungry pack and crush the yard." },
  { id: "cat", name: "Cat", shape: "feline", accent: "#f6a4c7", secondary: "#ff73ab", blurb: "Turn naps and claws into sharp profit." },
  { id: "koala", name: "Koala", shape: "koala", accent: "#b7b8d8", secondary: "#8a90c9", blurb: "Stack sleepy power through eucalyptus." },
  { id: "shark", name: "Shark", shape: "reptile", accent: "#77f2ff", secondary: "#0087d9", blurb: "Go full apex predator in deep water." },
  { id: "bear", name: "Bear", shape: "canid", accent: "#dca36c", secondary: "#7a4b25", blurb: "Become a forest brute with cub backup." },
  { id: "ape", name: "Ape", shape: "simian", accent: "#a5ff73", secondary: "#4c8a2b", blurb: "Build jungle power with a full troop." }
];

const SPECIES_BY_ID = Object.fromEntries(SPECIES_POOL.map((species) => [species.id, species]));

const CREATURES = {
  ant: {
    stage: 0,
    name: "Ant",
    resourceName: "Sugar",
    themeClass: "theme-ant",
    speciesId: "ant",
    clickBase: 1,
    helperCostFactor: 1,
    helperIncomeFactor: 1,
    helpers: [
      { name: "Tiny Worker", blurb: "Scrapes together tiny sugar shards." },
      { name: "Gatherer Ant", blurb: "Brings back cleaner sugar trails." },
      { name: "Soldier Ant", blurb: "Pushes the colony harder every second." },
      { name: "Nest Drone", blurb: "Automates deeper tunnel routes." },
      { name: "Colony Enforcer", blurb: "Turns the nest into a full sugar engine." }
    ],
    upgrades: [
      { id: "mandibles", name: "Stronger Mandibles", blurb: "Tap bites hit much harder.", cost: 120, effect: { clickMultiplier: 2 } },
      { id: "expansion", name: "Colony Expansion", blurb: "All passive ants haul more sugar every second.", cost: 780, effect: { passiveMultiplier: 1.45 } },
      { id: "tunnels", name: "Tunnel Network", blurb: "Early colony tiers run much faster underground.", cost: 5200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.85 } } },
      { id: "command", name: "Royal Command", blurb: "Crit taps happen more often and hit harder.", cost: 27000, effect: { critChance: 0.12, critMultiplier: 1.18 } },
      { id: "plating", name: "Exo-Plating", blurb: "Every helper adds bite force to your taps.", cost: 118000, effect: { clickPerHelper: 0.03, tierFactor: { tiers: [3, 4], factor: 1.25 } } },
      { id: "core", name: "Neural Colony Core", blurb: "Events pay out harder and spawn sooner.", cost: 420000, effect: { eventRewardMultiplier: 1.9, eventCooldownFactor: 0.84 } }
    ]
  },
  fly: {
    stage: 0,
    name: "Fly",
    resourceName: "Filth",
    themeClass: "theme-fly",
    speciesId: "fly",
    clickBase: 1,
    helperCostFactor: 1,
    helperIncomeFactor: 1,
    helpers: [
      { name: "Buzz Fly", blurb: "Buzzes back with gross scraps." },
      { name: "Filth Scout", blurb: "Finds richer rot pockets." },
      { name: "Swarm Fly", blurb: "Turns grime into steady gains." },
      { name: "Rot Gatherer", blurb: "Funnels whole piles of stink." },
      { name: "Infested Flyer", blurb: "Mass-produces dirty passive income." }
    ],
    upgrades: [
      { id: "feet", name: "Sticky Feet", blurb: "Clicks stick longer and hit much harder.", cost: 120, effect: { clickMultiplier: 2 } },
      { id: "detection", name: "Rot Detection", blurb: "Passive swarm income thickens fast.", cost: 780, effect: { passiveMultiplier: 1.45 } },
      { id: "growth", name: "Swarm Growth", blurb: "Smaller flies multiply their output.", cost: 5200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.85 } } },
      { id: "wings", name: "Toxic Wings", blurb: "Crit taps land harder with sharp burst chance.", cost: 27000, effect: { critChance: 0.12, critMultiplier: 1.18 } },
      { id: "parasites", name: "Parasite Burst", blurb: "Every helper makes your tap swarm nastier.", cost: 118000, effect: { clickPerHelper: 0.03, tierFactor: { tiers: [3, 4], factor: 1.25 } } },
      { id: "processor", name: "Corrupted Filth Processor", blurb: "Events spike harder and show up sooner.", cost: 420000, effect: { eventRewardMultiplier: 1.9, eventCooldownFactor: 0.84 } }
    ]
  },
  bee: {
    stage: 0,
    name: "Bee",
    resourceName: "Pollen",
    themeClass: "theme-bee",
    speciesId: "bee",
    clickBase: 1,
    helperCostFactor: 1,
    helperIncomeFactor: 1,
    helpers: [
      { name: "Tiny Bee", blurb: "Brings home small pollen clumps." },
      { name: "Worker Bee", blurb: "Runs cleaner flower routes." },
      { name: "Nectar Carrier", blurb: "Moves rich hive fuel steadily." },
      { name: "Guard Bee", blurb: "Protects and scales the hive." },
      { name: "Royal Drone", blurb: "Pushes the bloom engine hard." }
    ],
    upgrades: [
      { id: "nectar", name: "Golden Nectar", blurb: "Clicks gather double pollen with every tap.", cost: 120, effect: { clickMultiplier: 2 } },
      { id: "flight", name: "Efficient Flight", blurb: "Your passive hive output grows faster.", cost: 780, effect: { passiveMultiplier: 1.45 } },
      { id: "mind", name: "Hive Mind", blurb: "Early workers sync into stronger lanes.", cost: 5200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.85 } } },
      { id: "reserve", name: "Honey Reserve", blurb: "Crit taps trigger richer bloom bursts.", cost: 27000, effect: { critChance: 0.12, critMultiplier: 1.18 } },
      { id: "stinger", name: "Stinger Overdrive", blurb: "Each helper feeds sting power into taps.", cost: 118000, effect: { clickPerHelper: 0.03, tierFactor: { tiers: [3, 4], factor: 1.25 } } },
      { id: "engine", name: "Royal Bloom Engine", blurb: "Events bloom faster and reward larger drops.", cost: 420000, effect: { eventRewardMultiplier: 1.9, eventCooldownFactor: 0.84 } }
    ]
  },
  dog: {
    stage: 1,
    name: "Dog",
    resourceName: "Bones",
    themeClass: "theme-dog",
    speciesId: "dog",
    clickBase: 1.45,
    helperCostFactor: 1.32,
    helperIncomeFactor: 2.05,
    helpers: [
      { name: "Yard Pup", blurb: "Runs the first bone scraps back." },
      { name: "Pack Runner", blurb: "Keeps the whole yard moving." },
      { name: "Bone Hound", blurb: "Sniffs out deeper scrap piles." },
      { name: "Scrap Tracker", blurb: "Turns junk routes into clean income." },
      { name: "Alpha Pack", blurb: "Leads the strongest yard grind." }
    ],
    upgrades: [
      { id: "jaws", name: "Stronger Jaws", blurb: "Tap bites hit much harder.", cost: 180, effect: { clickMultiplier: 2.05 } },
      { id: "howl", name: "Pack Howl", blurb: "All passive dogs haul more bones every second.", cost: 1180, effect: { passiveMultiplier: 1.5 } },
      { id: "cache", name: "Bone Cache", blurb: "Early pack tiers hit harder.", cost: 7600, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.92 } } },
      { id: "route", name: "Scrap Route", blurb: "Crit taps snap harder and more often.", cost: 39000, effect: { critChance: 0.14, critMultiplier: 1.22 } },
      { id: "guard", name: "Guard Instinct", blurb: "Every helper adds pack pressure to your taps.", cost: 168000, effect: { clickPerHelper: 0.034, tierFactor: { tiers: [3, 4], factor: 1.28 } } },
      { id: "alpha", name: "Alpha Signal", blurb: "Events pay out harder and come faster.", cost: 590000, effect: { eventRewardMultiplier: 1.95, eventCooldownFactor: 0.82 } }
    ]
  },
  cat: {
    stage: 1,
    name: "Cat",
    resourceName: "Fish",
    themeClass: "theme-cat",
    speciesId: "cat",
    clickBase: 1.45,
    helperCostFactor: 1.32,
    helperIncomeFactor: 2.05,
    helpers: [
      { name: "Tiny Kitten", blurb: "Paws together tiny fish gains." },
      { name: "Alley Cat", blurb: "Sneaks through every side route." },
      { name: "Fish Sneak", blurb: "Turns every stash into fast income." },
      { name: "Nap Keeper", blurb: "Builds pressure while the screen stays calm." },
      { name: "Night Stalker", blurb: "Owns the late-shift haul." }
    ],
    upgrades: [
      { id: "claws", name: "Sharp Claws", blurb: "Tap swipes hit much harder.", cost: 180, effect: { clickMultiplier: 2.05 } },
      { id: "pile", name: "Fish Pile", blurb: "Passive cat income climbs faster.", cost: 1180, effect: { passiveMultiplier: 1.5 } },
      { id: "paws", name: "Silent Paws", blurb: "Early cat tiers move cleaner and faster.", cost: 7600, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.92 } } },
      { id: "nap", name: "Catnap Reserve", blurb: "Crit taps land richer fish bursts.", cost: 39000, effect: { critChance: 0.14, critMultiplier: 1.22 } },
      { id: "moon", name: "Moonlight Stare", blurb: "Every helper adds stealth force to taps.", cost: 168000, effect: { clickPerHelper: 0.034, tierFactor: { tiers: [3, 4], factor: 1.28 } } },
      { id: "reflex", name: "Nine-Live Reflex", blurb: "Events sharpen up and hit harder.", cost: 590000, effect: { eventRewardMultiplier: 1.95, eventCooldownFactor: 0.82 } }
    ]
  },
  koala: {
    stage: 1,
    name: "Koala",
    resourceName: "Eucalyptus",
    themeClass: "theme-koala",
    speciesId: "koala",
    clickBase: 1.45,
    helperCostFactor: 1.32,
    helperIncomeFactor: 2.05,
    helpers: [
      { name: "Sleepy Joey", blurb: "Carries tiny leaf stacks home." },
      { name: "Branch Hopper", blurb: "Moves the tree line faster." },
      { name: "Leaf Carrier", blurb: "Keeps eucalyptus flowing every second." },
      { name: "Tree Guardian", blurb: "Locks the canopy into profit." },
      { name: "Dream Keeper", blurb: "Runs the whole sleepy machine." }
    ],
    upgrades: [
      { id: "leaves", name: "Fresh Leaves", blurb: "Tap gathers hit much harder.", cost: 180, effect: { clickMultiplier: 2.05 } },
      { id: "cycle", name: "Sleep Cycle", blurb: "Passive koala income builds faster.", cost: 1180, effect: { passiveMultiplier: 1.5 } },
      { id: "branches", name: "Branch Network", blurb: "Early joey tiers move through trees faster.", cost: 7600, effect: { tierFactor: { tiers: [0, 1, 2], factor: 1.92 } } },
      { id: "pouch", name: "Deep Pouch", blurb: "Crit taps burst out bigger leaf chunks.", cost: 39000, effect: { critChance: 0.14, critMultiplier: 1.22 } },
      { id: "dream", name: "Dream Drift", blurb: "Every helper feeds extra calm into taps.", cost: 168000, effect: { clickPerHelper: 0.034, tierFactor: { tiers: [3, 4], factor: 1.28 } } },
      { id: "reactor", name: "Eucalyptus Reactor", blurb: "Events pop sooner and reward more.", cost: 590000, effect: { eventRewardMultiplier: 1.95, eventCooldownFactor: 0.82 } }
    ]
  },
  shark: {
    stage: 2,
    name: "Shark",
    resourceName: "Teeth",
    themeClass: "theme-shark",
    speciesId: "shark",
    clickBase: 2.15,
    helperCostFactor: 1.72,
    helperIncomeFactor: 4.8,
    helpers: [
      { name: "Pup Shark", blurb: "Circles in tiny feeding loops." },
      { name: "Reef Cutter", blurb: "Slices the shallow routes open." },
      { name: "Tide Hunter", blurb: "Keeps the waterline productive." },
      { name: "Blood Tracker", blurb: "Finds the richest ocean pulls." },
      { name: "Apex Fin", blurb: "Owns the whole feeding lane." }
    ],
    upgrades: [
      { id: "bite", name: "Serrated Bite", blurb: "Tap strikes hit brutally hard.", cost: 320, effect: { clickMultiplier: 2.15 } },
      { id: "current", name: "Deep Current", blurb: "Passive sharks tear through the water faster.", cost: 2100, effect: { passiveMultiplier: 1.56 } },
      { id: "wake", name: "Red Wake", blurb: "Early shark tiers scale hard.", cost: 13200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 2 } } },
      { id: "rush", name: "Predator Rush", blurb: "Crit taps crash much harder.", cost: 72000, effect: { critChance: 0.15, critMultiplier: 1.25 } },
      { id: "school", name: "Hunter School", blurb: "Every helper sharpens your tap force.", cost: 305000, effect: { clickPerHelper: 0.04, tierFactor: { tiers: [3, 4], factor: 1.32 } } },
      { id: "jaw", name: "Titan Jaw", blurb: "Events hit harder and arrive quicker.", cost: 1040000, effect: { eventRewardMultiplier: 2, eventCooldownFactor: 0.8 } }
    ]
  },
  bear: {
    stage: 2,
    name: "Bear",
    resourceName: "Honey",
    themeClass: "theme-bear",
    speciesId: "bear",
    clickBase: 2.15,
    helperCostFactor: 1.72,
    helperIncomeFactor: 4.8,
    helpers: [
      { name: "Forest Cub", blurb: "Carries small honey hauls." },
      { name: "River Forager", blurb: "Runs heavier food routes." },
      { name: "Cave Bruiser", blurb: "Turns brute force into income." },
      { name: "Pine Mauler", blurb: "Keeps the whole forest churning." },
      { name: "Mountain Alpha", blurb: "Runs the heaviest bear engine." }
    ],
    upgrades: [
      { id: "paws", name: "Iron Paws", blurb: "Tap smashes land much harder.", cost: 320, effect: { clickMultiplier: 2.15 } },
      { id: "roar", name: "Forest Roar", blurb: "Passive bear income surges faster.", cost: 2100, effect: { passiveMultiplier: 1.56 } },
      { id: "cubs", name: "Cub Guard", blurb: "Early bear tiers ramp hard.", cost: 13200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 2 } } },
      { id: "cache", name: "Cave Cache", blurb: "Crit taps slam much harder.", cost: 72000, effect: { critChance: 0.15, critMultiplier: 1.25 } },
      { id: "fur", name: "Rage Fur", blurb: "Every helper adds brute force to taps.", cost: 305000, effect: { clickPerHelper: 0.04, tierFactor: { tiers: [3, 4], factor: 1.32 } } },
      { id: "titan", name: "Titan Roar", blurb: "Events hit harder and come faster.", cost: 1040000, effect: { eventRewardMultiplier: 2, eventCooldownFactor: 0.8 } }
    ]
  },
  ape: {
    stage: 2,
    name: "Ape",
    resourceName: "Totems",
    themeClass: "theme-ape",
    speciesId: "ape",
    clickBase: 2.15,
    helperCostFactor: 1.72,
    helperIncomeFactor: 4.8,
    helpers: [
      { name: "Young Ape", blurb: "Starts the first jungle haul." },
      { name: "Troop Scout", blurb: "Finds stronger primal routes." },
      { name: "Vine Runner", blurb: "Moves the troop faster every second." },
      { name: "Drum Caller", blurb: "Locks the whole jungle into rhythm." },
      { name: "Alpha Ape", blurb: "Turns the troop into a final-stage engine." }
    ],
    upgrades: [
      { id: "fists", name: "Heavy Fists", blurb: "Tap hits land much harder.", cost: 320, effect: { clickMultiplier: 2.15 } },
      { id: "vines", name: "Vine Routes", blurb: "Passive ape income climbs fast.", cost: 2100, effect: { passiveMultiplier: 1.56 } },
      { id: "order", name: "Troop Order", blurb: "Early ape tiers scale hard.", cost: 13200, effect: { tierFactor: { tiers: [0, 1, 2], factor: 2 } } },
      { id: "rhythm", name: "Jungle Rhythm", blurb: "Crit taps land with savage spikes.", cost: 72000, effect: { critChance: 0.15, critMultiplier: 1.25 } },
      { id: "rage", name: "Primal Rage", blurb: "Every helper adds more troop force to taps.", cost: 305000, effect: { clickPerHelper: 0.04, tierFactor: { tiers: [3, 4], factor: 1.32 } } },
      { id: "crown", name: "Stone Crown", blurb: "Events hit harder and arrive quicker.", cost: 1040000, effect: { eventRewardMultiplier: 2, eventCooldownFactor: 0.8 } }
    ]
  }
};

const EVENT_DEFINITIONS = {
  resourceBurst: {
    title: "Resource Burst",
    eyebrow: "Bonus event",
    description: "A loaded cache is loose. Crack it before it burns out.",
    duration: 9000,
    button: "CRACK CACHE"
  },
  predatorAttack: {
    title: "Predator Attack",
    eyebrow: "Threat event",
    description: "Tap fast to scare it off or lose passive income for a while.",
    duration: 8500,
    button: "SCARE IT OFF",
    warning: "PREDATOR ATTACK"
  },
  mutationSurge: {
    title: "Mutation Surge",
    eyebrow: "Boost event",
    description: "Absorb the surge for a short click frenzy.",
    duration: 9000,
    button: "ABSORB SURGE"
  },
  glitchOrb: {
    title: "Glitch Orb",
    eyebrow: "Glitch event",
    description: "Crack the orb for cyber gains and a neon burst.",
    duration: 10000,
    button: "BREAK ORB"
  },
  creatureInvasion: {
    title: "Creature Invasion",
    eyebrow: "Critical warning",
    description: "Stabilise the arena before the invasion tears your run apart.",
    duration: 11000,
    button: "STABILISE 0/7",
    tapsNeeded: 7,
    warning: "CREATURE INVASION"
  }
};

const DOM = {
  introOverlay: document.querySelector("#introOverlay"),
  gameShell: document.querySelector("#gameShell"),
  choiceCards: Array.from(document.querySelectorAll("[data-lineage]")),
  choiceSpriteHosts: Array.from(document.querySelectorAll("[data-choice-sprite]")),
  stageValue: document.querySelector("#stageValue"),
  creatureNameValue: document.querySelector("#creatureNameValue"),
  resourceNameValue: document.querySelector("#resourceNameValue"),
  resourceTotalValue: document.querySelector("#resourceTotalValue"),
  resourcePerSecondValue: document.querySelector("#resourcePerSecondValue"),
  muteButton: document.querySelector("#muteButton"),
  formEyebrow: document.querySelector("#formEyebrow"),
  formTitle: document.querySelector("#formTitle"),
  clickPowerValue: document.querySelector("#clickPowerValue"),
  rankValue: document.querySelector("#rankValue"),
  permanentBonusValue: document.querySelector("#permanentBonusValue"),
  warningBanner: document.querySelector("#warningBanner"),
  scene: document.querySelector("#scene"),
  helperSwarm: document.querySelector("#helperSwarm"),
  particleLayer: document.querySelector("#particleLayer"),
  floatLayer: document.querySelector("#floatLayer"),
  mainCreatureDisplay: document.querySelector("#mainCreatureDisplay"),
  mainCreature: document.querySelector("#mainCreature"),
  mainCreaturePlate: document.querySelector("#mainCreaturePlate"),
  mainCreatureTitle: document.querySelector("#mainCreatureTitle"),
  mainCreatureRankTag: document.querySelector("#mainCreatureRankTag"),
  eventCard: document.querySelector("#eventCard"),
  eventEyebrow: document.querySelector("#eventEyebrow"),
  eventTitle: document.querySelector("#eventTitle"),
  eventDescription: document.querySelector("#eventDescription"),
  eventTimer: document.querySelector("#eventTimer"),
  eventActionButton: document.querySelector("#eventActionButton"),
  boostList: document.querySelector("#boostList"),
  helperTotalValue: document.querySelector("#helperTotalValue"),
  eventCountdownValue: document.querySelector("#eventCountdownValue"),
  helpersTabButton: document.querySelector("#helpersTabButton"),
  upgradesTabButton: document.querySelector("#upgradesTabButton"),
  helpersTab: document.querySelector("#helpersTab"),
  upgradesTab: document.querySelector("#upgradesTab"),
  evolutionStatusValue: document.querySelector("#evolutionStatusValue"),
  evolutionHintValue: document.querySelector("#evolutionHintValue"),
  evolutionProgressFill: document.querySelector("#evolutionProgressFill"),
  evolveButton: document.querySelector("#evolveButton"),
  stayButton: document.querySelector("#stayButton"),
  evolutionOverlay: document.querySelector("#evolutionOverlay"),
  evolutionStageEyebrow: document.querySelector("#evolutionStageEyebrow"),
  evolutionOverlayTitle: document.querySelector("#evolutionOverlayTitle"),
  evolutionOverlayCopy: document.querySelector("#evolutionOverlayCopy"),
  evolutionChoices: document.querySelector("#evolutionChoices"),
  evolutionDelayButton: document.querySelector("#evolutionDelayButton"),
  toastStack: document.querySelector("#toastStack"),
  screenFlash: document.querySelector("#screenFlash")
};

const state = {
  phase: "choose",
  creatureKey: null,
  stage: 0,
  rank: 0,
  rankProgress: 0,
  resource: 0,
  totalEarned: 0,
  clicks: 0,
  helperCounts: Array(HELPER_BLUEPRINTS.length).fill(0),
  ownedUpgradeIds: [],
  activeTab: "helpers",
  rankReady: false,
  evolveAvailable: false,
  finalFormReached: false,
  evolutionChoices: [],
  evolutionOpen: false,
  mute: false,
  activeEvent: null,
  nextEventAt: performance.now() + 12000,
  temporaryEffects: [],
  warningText: "",
  warningUntil: 0,
  lastFrameAt: performance.now(),
  lastUiRenderAt: 0,
  uiDirty: true
};

const audioState = {
  context: null
};

const renderCache = {
  mainSprite: "",
  helperSwarm: "",
  evolutionChoices: ""
};

function ensureMainCreatureChrome() {
  if (!DOM.scene || !DOM.mainCreature) {
    return;
  }

  if (!DOM.mainCreatureDisplay) {
    const display = document.createElement("div");
    display.id = "mainCreatureDisplay";
    display.className = "main-creature-display";
    display.setAttribute("aria-hidden", "true");
    DOM.scene.insertBefore(display, DOM.mainCreature);
    DOM.mainCreatureDisplay = display;
  }

  const existingGlow = DOM.mainCreatureDisplay.querySelector(".main-creature-glow");
  if (!existingGlow) {
    const glow = document.createElement("span");
    glow.className = "main-creature-glow";
    glow.setAttribute("aria-hidden", "true");
    DOM.mainCreatureDisplay.appendChild(glow);
  }

  if (!DOM.mainCreaturePlate) {
    const plate = document.createElement("span");
    plate.id = "mainCreaturePlate";
    plate.className = "main-creature-plate";
    plate.setAttribute("aria-hidden", "true");
    DOM.mainCreatureDisplay.appendChild(plate);
    DOM.mainCreaturePlate = plate;
  }

  if (!DOM.mainCreatureRankTag) {
    const rankTag = document.createElement("span");
    rankTag.id = "mainCreatureRankTag";
    rankTag.className = "main-creature-rank-tag";
    rankTag.setAttribute("aria-hidden", "true");
    rankTag.textContent = "WORKER";
    DOM.mainCreatureDisplay.appendChild(rankTag);
    DOM.mainCreatureRankTag = rankTag;
  }

  if (!DOM.mainCreatureTitle) {
    const title = document.createElement("span");
    title.id = "mainCreatureTitle";
    title.className = "main-creature-title";
    title.setAttribute("aria-hidden", "true");
    title.textContent = "ANT";
    DOM.mainCreatureDisplay.appendChild(title);
    DOM.mainCreatureTitle = title;
  }
}

function markDirty() {
  state.uiDirty = true;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const absolute = Math.abs(value);
  if (absolute < 1000) {
    return absolute >= 100 ? Math.floor(value).toLocaleString("en-GB") : value.toFixed(value >= 10 ? 1 : 2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
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

function formatSeconds(milliseconds) {
  return Math.max(0, milliseconds / 1000).toFixed(1);
}

function getCreature(creatureKey = state.creatureKey) {
  return creatureKey ? CREATURES[creatureKey] || null : null;
}

function getStageDefinition(stage = state.stage) {
  return STAGE_DEFINITIONS[stage] || STAGE_DEFINITIONS[0];
}

function getNextStageDefinition() {
  return STAGE_DEFINITIONS[state.stage + 1] || null;
}

function getRankDefinition(rank = state.rank) {
  return RANK_DEFINITIONS[rank] || RANK_DEFINITIONS[0];
}

function getNextRankDefinition() {
  return RANK_DEFINITIONS[state.rank + 1] || null;
}

function getSpeciesById(speciesId) {
  return SPECIES_BY_ID[speciesId] || SPECIES_BY_ID.ant;
}

function getCurrentSpecies() {
  const creature = getCreature();
  if (!creature) {
    return SPECIES_BY_ID.ant;
  }
  return getSpeciesById(creature.speciesId);
}

function getCurrentResourceName() {
  const creature = getCreature();
  if (!creature) {
    return "Sugar";
  }
  if (state.rank === 0) {
    return creature.resourceName;
  }
  return `${getRankDefinition().label} ${creature.resourceName}`;
}

function getCurrentCreatureName() {
  const creature = getCreature();
  if (!creature) {
    return "Worker Ant";
  }
  return `${getRankDefinition().label} ${creature.name}`;
}

function getFormEyebrow() {
  return `${getStageDefinition().label} / ${getRankDefinition().label} rank`;
}

function getCurrentThreshold() {
  return getRankDefinition().thresholdByStage[state.stage] || null;
}

function getCurrentProgressRatio() {
  const threshold = getCurrentThreshold();
  if (!threshold) {
    return 1;
  }
  return clamp(state.rankProgress / threshold, 0, 1);
}

function getCurrentGrowthScale() {
  const rankDef = getRankDefinition();
  return rankDef.growthMin + (rankDef.growthMax - rankDef.growthMin) * getCurrentProgressRatio();
}

function getTotalHelpers() {
  return state.helperCounts.reduce((total, count) => total + count, 0);
}

function getPermanentMultiplier() {
  return [1, 1.55, 2.25][state.stage] || 1;
}

function getUpgradeCostMultiplier() {
  return [1.35, 1.9, 2.5][state.stage] || 1.35;
}

function applyEffectToSnapshot(snapshot, effect) {
  if (effect.clickMultiplier) {
    snapshot.clickMultiplier *= effect.clickMultiplier;
  }
  if (effect.passiveMultiplier) {
    snapshot.passiveMultiplier *= effect.passiveMultiplier;
  }
  if (effect.critChance) {
    snapshot.critChance += effect.critChance;
  }
  if (effect.critMultiplier) {
    snapshot.critMultiplier += effect.critMultiplier;
  }
  if (effect.clickPerHelper) {
    snapshot.clickPerHelper += effect.clickPerHelper;
  }
  if (effect.eventRewardMultiplier) {
    snapshot.eventRewardMultiplier *= effect.eventRewardMultiplier;
  }
  if (effect.eventCooldownFactor) {
    snapshot.eventCooldownFactor *= effect.eventCooldownFactor;
  }
  if (effect.tierFactor) {
    effect.tierFactor.tiers.forEach((tier) => {
      snapshot.helperTierMultipliers[tier] *= effect.tierFactor.factor;
    });
  }
}

function getUpgradeSnapshot(now = performance.now()) {
  const creature = getCreature();
  const snapshot = {
    permanentMultiplier: getPermanentMultiplier(),
    rankPowerMultiplier: getRankDefinition().powerMultiplier,
    clickMultiplier: 1,
    passiveMultiplier: 1,
    helperTierMultipliers: Array(HELPER_BLUEPRINTS.length).fill(1),
    critChance: 0.05,
    critMultiplier: 2.1,
    clickPerHelper: 0,
    eventRewardMultiplier: 1,
    eventCooldownFactor: 1
  };

  if (creature) {
    creature.upgrades.forEach((upgrade) => {
      if (state.ownedUpgradeIds.includes(upgrade.id)) {
        applyEffectToSnapshot(snapshot, upgrade.effect);
      }
    });
  }

  state.temporaryEffects
    .filter((effect) => effect.until > now)
    .forEach((effect) => applyEffectToSnapshot(snapshot, effect));

  return snapshot;
}

function getBaseClickValue(snapshot = getUpgradeSnapshot()) {
  const creature = getCreature();
  const helperLink = getTotalHelpers() * snapshot.clickPerHelper;
  const baseClick = creature?.clickBase || 1;
  return baseClick * snapshot.rankPowerMultiplier * (1 + helperLink) * snapshot.clickMultiplier * snapshot.permanentMultiplier;
}

function getPassivePerSecond(snapshot = getUpgradeSnapshot()) {
  const creature = getCreature();
  const incomeFactor = creature?.helperIncomeFactor || 1;
  const helperOutput = HELPER_BLUEPRINTS.reduce((total, helper, index) => {
    const tierMultiplier = snapshot.helperTierMultipliers[index] || 1;
    return total + helper.baseIncome * incomeFactor * state.helperCounts[index] * tierMultiplier;
  }, 0);

  return helperOutput * snapshot.passiveMultiplier * snapshot.rankPowerMultiplier;
}

function getHelperCost(index) {
  const blueprint = HELPER_BLUEPRINTS[index];
  const creature = getCreature();
  const count = state.helperCounts[index];
  const growth = blueprint.growth + state.stage * 0.015 + state.rank * 0.012;
  const costFactor = (creature?.helperCostFactor || 1) * (1 + state.stage * 0.28) * (1 + state.rank * 0.12);
  return Math.floor(blueprint.baseCost * costFactor * Math.pow(growth, count));
}

function getHelperOutput(index, snapshot = getUpgradeSnapshot()) {
  const blueprint = HELPER_BLUEPRINTS[index];
  const creature = getCreature();
  const incomeFactor = creature?.helperIncomeFactor || 1;
  const tierMultiplier = snapshot.helperTierMultipliers[index] || 1;
  return blueprint.baseIncome * incomeFactor * tierMultiplier * snapshot.passiveMultiplier * snapshot.rankPowerMultiplier;
}

function getUpgradeRecord(upgradeId) {
  const creature = getCreature();
  if (!creature) {
    return null;
  }

  const index = creature.upgrades.findIndex((entry) => entry.id === upgradeId);
  if (index < 0) {
    return null;
  }

  return {
    index,
    upgrade: creature.upgrades[index]
  };
}

function getUpgradeCost(index, upgrade) {
  return Math.floor(upgrade.cost * getUpgradeCostMultiplier() * (1 + index * 0.14));
}

function canAfford(cost) {
  return state.resource >= cost;
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
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 30), startAt + duration);
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
  playTone({ frequency: 420, slideTo: 680, duration: 0.08, gain: 0.022, type: "triangle" });
}

function playUpgradeSound() {
  playTone({ frequency: 520, slideTo: 760, duration: 0.13, gain: 0.03, type: "square" });
  window.setTimeout(() => {
    playTone({ frequency: 760, slideTo: 980, duration: 0.09, gain: 0.02, type: "triangle" });
  }, 40);
}

function playEvolveSound() {
  playTone({ frequency: 260, slideTo: 420, duration: 0.16, gain: 0.03, type: "sawtooth" });
  window.setTimeout(() => {
    playTone({ frequency: 420, slideTo: 860, duration: 0.22, gain: 0.035, type: "square" });
  }, 70);
}

function playEventSound() {
  playTone({ frequency: 340, slideTo: 960, duration: 0.16, gain: 0.028, type: "triangle" });
}

function queueToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  DOM.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function setWarning(text, duration = 3200) {
  state.warningText = text;
  state.warningUntil = performance.now() + duration;
  markDirty();
}

function triggerFlash() {
  DOM.screenFlash.classList.remove("is-active");
  void DOM.screenFlash.offsetWidth;
  DOM.screenFlash.classList.add("is-active");
}

function triggerShake(duration = 650) {
  document.body.classList.add("is-shaking");
  window.setTimeout(() => {
    document.body.classList.remove("is-shaking");
  }, duration);
}

function spawnFloatingText(text, x, y, tone = "") {
  const entry = document.createElement("span");
  entry.className = `float-text ${tone}`.trim();
  entry.textContent = text;
  entry.style.setProperty("--x", x);
  entry.style.setProperty("--y", y);
  DOM.floatLayer.appendChild(entry);
  window.setTimeout(() => {
    entry.remove();
  }, 1000);
}

function spawnParticles(x, y, count = 10) {
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.4;
    const distance = randomBetween(18, 76);
    particle.className = "burst-particle";
    particle.style.setProperty("--x", x);
    particle.style.setProperty("--y", y);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${randomBetween(5, 10)}px`);
    DOM.particleLayer.appendChild(particle);
    window.setTimeout(() => {
      particle.remove();
    }, 760);
  }
}

function getScenePointFromEvent(event) {
  const rect = DOM.scene.getBoundingClientRect();
  if (!rect.width || !event) {
    return { x: "50%", y: "54%" };
  }

  const clientX = "clientX" in event ? event.clientX : rect.left + rect.width / 2;
  const clientY = "clientY" in event ? event.clientY : rect.top + rect.height / 2;
  const x = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92);
  const y = clamp(((clientY - rect.top) / rect.height) * 100, 12, 90);
  return { x: `${x}%`, y: `${y}%` };
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const numeric = Number.parseInt(full, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDisplayGrowthScale(rawGrowth) {
  return 1 + (rawGrowth - 1) * 0.58;
}

function getSpeciesArt(species, palette) {
  switch (species.id) {
    case "ant":
      return {
        anchor: { headX: 110, headY: 70, headW: 44, headH: 44, bodyY: 116, bodyW: 62 },
        markup: `
          <g fill="none" stroke="${palette.stroke}" stroke-width="6" stroke-linecap="round">
            <path d="M90 103 L54 88" />
            <path d="M130 103 L166 88" />
            <path d="M88 121 L48 122" />
            <path d="M132 121 L172 122" />
            <path d="M92 139 L58 154" />
            <path d="M128 139 L162 154" />
            <path d="M101 48 L88 24" />
            <path d="M119 48 L132 24" />
          </g>
          <ellipse cx="110" cy="150" rx="34" ry="40" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <ellipse cx="110" cy="110" rx="28" ry="32" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="70" r="22" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="102" cy="69" r="4.5" fill="${palette.stroke}" />
          <circle cx="118" cy="69" r="4.5" fill="${palette.stroke}" />
          <path d="M103 84 Q110 89 117 84" fill="none" stroke="${palette.stroke}" stroke-width="4" stroke-linecap="round" />
        `
      };
    case "fly":
      return {
        anchor: { headX: 110, headY: 68, headW: 42, headH: 42, bodyY: 118, bodyW: 58 },
        markup: `
          <ellipse cx="77" cy="92" rx="36" ry="23" fill="${palette.wing}" stroke="${rgba("#ffffff", 0.48)}" stroke-width="4" transform="rotate(-22 77 92)" />
          <ellipse cx="143" cy="92" rx="36" ry="23" fill="${palette.wing}" stroke="${rgba("#ffffff", 0.48)}" stroke-width="4" transform="rotate(22 143 92)" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="5" stroke-linecap="round">
            <path d="M92 110 L58 124" />
            <path d="M128 110 L162 124" />
            <path d="M94 130 L62 142" />
            <path d="M126 130 L158 142" />
          </g>
          <ellipse cx="110" cy="124" rx="28" ry="46" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <ellipse cx="110" cy="152" rx="18" ry="18" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="68" r="20" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="101" cy="68" r="4.5" fill="${palette.stroke}" />
          <circle cx="119" cy="68" r="4.5" fill="${palette.stroke}" />
        `
      };
    case "bee":
      return {
        anchor: { headX: 110, headY: 72, headW: 40, headH: 40, bodyY: 118, bodyW: 60 },
        markup: `
          <ellipse cx="78" cy="94" rx="34" ry="22" fill="${palette.wing}" stroke="${rgba("#ffffff", 0.48)}" stroke-width="4" transform="rotate(-18 78 94)" />
          <ellipse cx="142" cy="94" rx="34" ry="22" fill="${palette.wing}" stroke="${rgba("#ffffff", 0.48)}" stroke-width="4" transform="rotate(18 142 94)" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="6" stroke-linecap="round">
            <path d="M100 52 L90 30" />
            <path d="M120 52 L130 30" />
            <path d="M96 138 L70 154" />
            <path d="M124 138 L150 154" />
          </g>
          <ellipse cx="110" cy="122" rx="31" ry="46" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M79 104 H141" stroke="${palette.stroke}" stroke-width="8" stroke-linecap="round" />
          <path d="M79 122 H141" stroke="${palette.stroke}" stroke-width="8" stroke-linecap="round" />
          <path d="M79 140 H141" stroke="${palette.stroke}" stroke-width="8" stroke-linecap="round" />
          <circle cx="110" cy="72" r="19" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M110 166 L102 182 L118 182 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <circle cx="102" cy="72" r="4.5" fill="${palette.stroke}" />
          <circle cx="118" cy="72" r="4.5" fill="${palette.stroke}" />
        `
      };
    case "dog":
      return {
        anchor: { headX: 110, headY: 78, headW: 58, headH: 58, bodyY: 132, bodyW: 96 },
        markup: `
          <g fill="none" stroke="${palette.stroke}" stroke-width="10" stroke-linecap="round">
            <path d="M86 138 V176" />
            <path d="M134 138 V176" />
            <path d="M70 130 V172" />
            <path d="M150 130 V172" />
            <path d="M156 120 Q188 102 180 78" />
          </g>
          <ellipse cx="110" cy="132" rx="50" ry="32" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="78" r="30" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M84 58 L64 86 L90 88 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M136 58 L156 86 L130 88 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="100" cy="76" r="4.5" fill="${palette.stroke}" />
          <circle cx="120" cy="76" r="4.5" fill="${palette.stroke}" />
          <ellipse cx="110" cy="90" rx="9" ry="7" fill="${palette.stroke}" />
        `
      };
    case "cat":
      return {
        anchor: { headX: 110, headY: 76, headW: 56, headH: 56, bodyY: 132, bodyW: 90 },
        markup: `
          <g fill="none" stroke="${palette.stroke}" stroke-width="9" stroke-linecap="round">
            <path d="M88 138 V176" />
            <path d="M132 138 V176" />
            <path d="M156 134 Q188 112 166 72" />
          </g>
          <ellipse cx="110" cy="132" rx="46" ry="30" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="76" r="28" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M88 52 L70 80 L96 76 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M132 52 L150 80 L124 76 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="100" cy="74" r="4.5" fill="${palette.stroke}" />
          <circle cx="120" cy="74" r="4.5" fill="${palette.stroke}" />
          <path d="M101 89 Q110 96 119 89" fill="none" stroke="${palette.stroke}" stroke-width="4" stroke-linecap="round" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="3" stroke-linecap="round">
            <path d="M82 88 H98" />
            <path d="M82 94 H98" />
            <path d="M122 88 H138" />
            <path d="M122 94 H138" />
          </g>
        `
      };
    case "koala":
      return {
        anchor: { headX: 110, headY: 86, headW: 64, headH: 64, bodyY: 138, bodyW: 92 },
        markup: `
          <ellipse cx="110" cy="140" rx="48" ry="34" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="82" cy="70" r="20" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="138" cy="70" r="20" fill="${rgba("#ffffff", 0.82)}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="86" r="32" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="10" stroke-linecap="round">
            <path d="M86 144 V178" />
            <path d="M134 144 V178" />
            <path d="M70 118 L54 154" />
            <path d="M150 118 L166 154" />
          </g>
          <circle cx="98" cy="84" r="4.5" fill="${palette.stroke}" />
          <circle cx="122" cy="84" r="4.5" fill="${palette.stroke}" />
          <ellipse cx="110" cy="100" rx="12" ry="10" fill="${palette.stroke}" />
        `
      };
    case "shark":
      return {
        anchor: { headX: 86, headY: 110, headW: 54, headH: 40, bodyY: 112, bodyW: 124 },
        markup: `
          <path d="M40 116 Q74 78 148 86 Q182 91 196 108 Q182 126 148 136 Q74 146 40 116 Z" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M38 116 L10 88 L18 116 L10 144 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M110 86 L126 50 L144 88 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <path d="M114 126 L140 150 L112 148 Z" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="80" cy="106" r="5" fill="${palette.stroke}" />
          <path d="M62 122 Q84 132 108 122" fill="none" stroke="${palette.stroke}" stroke-width="4" stroke-linecap="round" />
          <g stroke="${palette.stroke}" stroke-width="4" stroke-linecap="round">
            <path d="M126 100 V128" />
            <path d="M136 98 V130" />
            <path d="M146 96 V132" />
          </g>
        `
      };
    case "bear":
      return {
        anchor: { headX: 110, headY: 84, headW: 62, headH: 62, bodyY: 138, bodyW: 100 },
        markup: `
          <ellipse cx="110" cy="140" rx="52" ry="36" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="86" cy="60" r="15" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="134" cy="60" r="15" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="84" r="32" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="12" stroke-linecap="round">
            <path d="M86 144 V178" />
            <path d="M134 144 V178" />
            <path d="M72 120 L52 154" />
            <path d="M148 120 L168 154" />
          </g>
          <circle cx="98" cy="82" r="4.5" fill="${palette.stroke}" />
          <circle cx="122" cy="82" r="4.5" fill="${palette.stroke}" />
          <ellipse cx="110" cy="98" rx="10" ry="8" fill="${palette.stroke}" />
        `
      };
    case "ape":
      return {
        anchor: { headX: 110, headY: 78, headW: 56, headH: 56, bodyY: 136, bodyW: 98 },
        markup: `
          <ellipse cx="110" cy="138" rx="50" ry="36" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="110" cy="78" r="28" fill="${palette.accent}" stroke="${palette.stroke}" stroke-width="5" />
          <circle cx="84" cy="78" r="10" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <circle cx="136" cy="78" r="10" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
          <g fill="none" stroke="${palette.stroke}" stroke-width="12" stroke-linecap="round">
            <path d="M74 118 L48 162" />
            <path d="M146 118 L172 162" />
            <path d="M90 144 V178" />
            <path d="M130 144 V178" />
          </g>
          <circle cx="100" cy="76" r="4.5" fill="${palette.stroke}" />
          <circle cx="120" cy="76" r="4.5" fill="${palette.stroke}" />
          <path d="M100 92 Q110 98 120 92" fill="none" stroke="${palette.stroke}" stroke-width="4" stroke-linecap="round" />
        `
      };
    default:
      return getSpeciesArt(SPECIES_BY_ID.ant, palette);
  }
}

function getRankArt(rank, anchor, palette) {
  const headLeft = anchor.headX - anchor.headW / 2;
  const headTop = anchor.headY - anchor.headH / 2;
  const headRight = anchor.headX + anchor.headW / 2;
  const bodyLeft = 110 - anchor.bodyW / 2;
  const bodyRight = 110 + anchor.bodyW / 2;
  const bodyTop = anchor.bodyY - 22;
  const bodyBottom = anchor.bodyY + 24;
  let back = "";
  let front = "";

  if (rank === 1) {
    front += `
      <g>
        <ellipse cx="${bodyLeft - 10}" cy="${anchor.bodyY - 6}" rx="16" ry="13" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <ellipse cx="${bodyRight + 10}" cy="${anchor.bodyY - 6}" rx="16" ry="13" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <rect x="${headLeft + 3}" y="${headTop + 10}" width="${anchor.headW - 6}" height="12" rx="6" fill="#ef3f4f" stroke="${palette.stroke}" stroke-width="3" />
        <path d="M${headRight - 2} ${headTop + 16} L${headRight + 14} ${headTop + 8} L${headRight + 10} ${headTop + 22}" fill="#ef3f4f" stroke="${palette.stroke}" stroke-width="3" stroke-linejoin="round" />
      </g>
    `;
  }

  if (rank === 2) {
    back += `
      <g opacity="0.98">
        <ellipse cx="${anchor.headX - anchor.headW * 0.36}" cy="${headTop + anchor.headH * 0.9}" rx="${Math.max(10, anchor.headW * 0.18)}" ry="${Math.max(26, anchor.headH * 0.8)}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <ellipse cx="${anchor.headX + anchor.headW * 0.36}" cy="${headTop + anchor.headH * 0.9}" rx="${Math.max(10, anchor.headW * 0.18)}" ry="${Math.max(26, anchor.headH * 0.8)}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
        <ellipse cx="${anchor.headX}" cy="${headTop + anchor.headH * 1.02}" rx="${Math.max(18, anchor.headW * 0.26)}" ry="${Math.max(18, anchor.headH * 0.34)}" fill="${palette.secondary}" stroke="${palette.stroke}" stroke-width="4" />
      </g>
    `;
    front += `
      <polygon
        points="${anchor.headX - 24},${headTop + 6} ${anchor.headX - 12},${headTop - 16} ${anchor.headX},${headTop + 2} ${anchor.headX + 12},${headTop - 16} ${anchor.headX + 24},${headTop + 6}"
        fill="#ffd86b"
        stroke="${palette.stroke}"
        stroke-width="4"
        stroke-linejoin="round"
      />
    `;
  }

  if (rank === 3) {
    front += `
      <g>
        <rect x="${bodyLeft + 10}" y="${bodyTop}" width="${anchor.bodyW - 20}" height="${bodyBottom - bodyTop}" rx="18" fill="${rgba("#9eb2ca", 0.28)}" stroke="${rgba("#eaf5ff", 0.72)}" stroke-width="4" />
        <rect x="${headLeft + 6}" y="${headTop + 8}" width="${anchor.headW - 12}" height="${anchor.headH - 16}" rx="14" fill="${rgba("#9eb2ca", 0.22)}" stroke="${rgba("#eaf5ff", 0.72)}" stroke-width="4" />
        <rect x="${headLeft + 6}" y="${anchor.headY - 8}" width="${anchor.headW - 12}" height="16" rx="8" fill="#46e9ff" stroke="${palette.stroke}" stroke-width="4" />
        <circle cx="${bodyLeft + 18}" cy="${anchor.bodyY}" r="5" fill="#46e9ff" stroke="${palette.stroke}" stroke-width="3" />
        <circle cx="${bodyRight - 18}" cy="${anchor.bodyY}" r="5" fill="#46e9ff" stroke="${palette.stroke}" stroke-width="3" />
      </g>
    `;
  }

  if (rank === 4) {
    back += `
      <g opacity="0.95">
        <ellipse cx="110" cy="${anchor.bodyY - 8}" rx="${anchor.bodyW * 0.74}" ry="58" fill="${rgba("#fff2a6", 0.22)}" />
        <ellipse cx="110" cy="${anchor.bodyY - 8}" rx="${anchor.bodyW * 0.58}" ry="42" fill="${palette.glow}" />
      </g>
    `;
    front += `
      <g>
        <ellipse cx="${anchor.headX}" cy="${headTop - 10}" rx="${Math.max(18, anchor.headW * 0.42)}" ry="8" fill="none" stroke="#fff3b0" stroke-width="5" />
        <polygon
          points="${anchor.headX - 26},${headTop + 2} ${anchor.headX - 14},${headTop - 18} ${anchor.headX - 4},${headTop - 2} ${anchor.headX + 4},${headTop - 18} ${anchor.headX + 14},${headTop - 2} ${anchor.headX + 26},${headTop + 2}"
          fill="#ffe38f"
          stroke="${palette.stroke}"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <path d="M${anchor.headX} ${headTop - 36} V${headTop - 20}" stroke="#fff4b8" stroke-width="4" stroke-linecap="round" />
        <path d="M${anchor.headX - 18} ${headTop - 28} H${anchor.headX - 6}" stroke="#fff4b8" stroke-width="4" stroke-linecap="round" />
        <path d="M${anchor.headX + 6} ${headTop - 28} H${anchor.headX + 18}" stroke="#fff4b8" stroke-width="4" stroke-linecap="round" />
      </g>
    `;
  }

  return { back, front };
}

function buildCreatureSvgMarkup(species, rank) {
  const palette = {
    accent: species.accent,
    secondary: species.secondary,
    stroke: "#120d09",
    wing: rgba("#ffffff", 0.8),
    glow: rgba(species.accent, 0.3)
  };
  const art = getSpeciesArt(species, palette);
  const rankArt = getRankArt(rank, art.anchor, palette);

  return `
    <svg class="creature-svg creature-svg-${species.id}" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
      <ellipse cx="110" cy="188" rx="58" ry="14" fill="rgba(0, 0, 0, 0.34)" />
      ${rankArt.back}
      <g class="creature-base">${art.markup}</g>
      ${rankArt.front}
    </svg>
  `;
}

function buildCreatureSpriteMarkup({ speciesId, rank = 0, growthScale = 1, progressRatio = 1, sizeClass = "size-main" }) {
  const species = getSpeciesById(speciesId);
  const displayScale = getDisplayGrowthScale(growthScale);
  const rankLabel = getRankDefinition(rank).label.toUpperCase();
  return `
    <span
      class="creature-sprite ${sizeClass} species-${species.id} rank-${rank}"
      style="--species-accent:${species.accent}; --species-secondary:${species.secondary}; --growth-scale:${displayScale.toFixed(3)}; --progress-ratio:${progressRatio.toFixed(3)};"
      aria-hidden="true"
    >
      <span class="sprite-frame">
        ${buildCreatureSvgMarkup(species, rank)}
        <span class="creature-fallback">
          <span class="creature-glow"></span>
          <span class="creature-avatar-shell">
            <span class="creature-rank-accent"></span>
            <span class="creature-avatar">
              <span class="creature-face-dot dot-left"></span>
              <span class="creature-face-dot dot-right"></span>
              <span class="creature-mouth-line"></span>
            </span>
          </span>
          <span class="creature-nameplate">${species.name.toUpperCase()}</span>
          <span class="creature-rankplate">${rankLabel}</span>
        </span>
      </span>
    </span>
  `;
}

function applyTheme() {
  document.body.classList.remove(
    "theme-ant",
    "theme-fly",
    "theme-bee",
    "theme-dog",
    "theme-cat",
    "theme-koala",
    "theme-shark",
    "theme-bear",
    "theme-ape",
    "theme-cyber"
  );
  const creature = getCreature();
  if (!creature) {
    document.body.classList.add("theme-ant");
    return;
  }
  document.body.classList.add(creature.themeClass);
}

function renderChoiceSprites() {
  DOM.choiceSpriteHosts.forEach((host) => {
    const speciesId = host.dataset.choiceSprite;
    host.innerHTML = buildCreatureSpriteMarkup({ speciesId, rank: 0, growthScale: 1.24, progressRatio: 1, sizeClass: "size-choice" });
  });
}

function renderMainCreature() {
  ensureMainCreatureChrome();
  const species = getCurrentSpecies();
  const rankDef = getRankDefinition();
  DOM.mainCreatureDisplay.dataset.creature = species.id;
  DOM.mainCreatureDisplay.dataset.rank = String(state.rank);
  DOM.mainCreatureDisplay.style.setProperty("--main-growth-scale", getDisplayGrowthScale(getCurrentGrowthScale()).toFixed(3));
  DOM.mainCreatureDisplay.style.setProperty("--main-accent", species.accent);
  DOM.mainCreatureDisplay.style.setProperty("--main-secondary", species.secondary);
  DOM.mainCreature.dataset.creature = species.id;
  DOM.mainCreature.dataset.rank = String(state.rank);
  DOM.mainCreature.style.setProperty("--main-growth-scale", getDisplayGrowthScale(getCurrentGrowthScale()).toFixed(3));
  DOM.mainCreature.style.setProperty("--main-accent", species.accent);
  DOM.mainCreature.style.setProperty("--main-secondary", species.secondary);
  DOM.mainCreatureTitle.textContent = species.name.toUpperCase();
  DOM.mainCreatureRankTag.textContent = rankDef.label.toUpperCase();
}

function getHelperVisualEntries() {
  const totalHelpers = getTotalHelpers();
  if (!totalHelpers) {
    return [];
  }

  const maxRenderable = totalHelpers <= 48
    ? totalHelpers
    : Math.min(96, 48 + Math.ceil(Math.sqrt(totalHelpers - 48) * 5));

  const groupSize = Math.max(1, Math.ceil(totalHelpers / maxRenderable));
  const entries = [];
  let remaining = totalHelpers;

  while (remaining > 0) {
    const count = Math.min(groupSize, remaining);
    entries.push({ count });
    remaining -= count;
  }

  return entries;
}

function renderHelperSwarm() {
  const entries = getHelperVisualEntries();
  if (!entries.length) {
    DOM.helperSwarm.replaceChildren();
    renderCache.helperSwarm = "empty";
    return;
  }

  const signature = `${getCurrentSpecies().id}:${state.rank}:${state.helperCounts.join("-")}`;
  if (renderCache.helperSwarm === signature) {
    return;
  }

  const helperGrowth = getRankDefinition().helperGrowthScale;
  const densityScale = entries.length > 70 ? 0.72 : entries.length > 44 ? 0.82 : entries.length > 24 ? 0.92 : 1;

  DOM.helperSwarm.innerHTML = entries.map((entry, index) => {
    const ring = Math.floor(Math.sqrt(index / 10) * 2.2);
    const slotsInRing = 12 + ring * 6;
    const slot = index % slotsInRing;
    const angle = (slot / slotsInRing) * Math.PI * 2 + (ring % 2) * 0.2;
    const radiusX = 132 + ring * 40 + (slot % 3) * 5;
    const radiusY = 98 + ring * 28 + (slot % 4) * 5;
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    const driftX = `${Math.cos(angle + 0.6) * (8 + ring * 1.5)}px`;
    const driftY = `${Math.sin(angle + 0.6) * (6 + ring * 1.2)}px`;
    const duration = `${5.6 + ring * 0.8 + (slot % 5) * 0.18}s`;

    return `
      <div class="helper-echo ${entry.count > 1 ? "is-cluster" : ""}" style="--x:${x}px; --y:${y}px; --drift-x:${driftX}; --drift-y:${driftY}; --delay:${(index % 7) * 0.09}s; --orbit-duration:${duration}; --swarm-scale:${densityScale};">
        ${buildCreatureSpriteMarkup({
          speciesId: getCurrentSpecies().id,
          rank: state.rank,
          growthScale: helperGrowth,
          progressRatio: 1,
          sizeClass: "size-helper"
        })}
        ${entry.count > 1 ? `<span class="helper-count">x${entry.count}</span>` : ""}
      </div>
    `;
  }).join("");
  renderCache.helperSwarm = signature;
}

function renderHelpers(snapshot) {
  const creature = getCreature();
  if (!creature) {
    return;
  }

  const resourceName = getCurrentResourceName();
  DOM.helpersTab.innerHTML = creature.helpers.map((helper, index) => {
    const cost = getHelperCost(index);
    const owned = state.helperCounts[index];
    const output = getHelperOutput(index, snapshot);
    const affordable = canAfford(cost);

    return `
      <article class="shop-item ${affordable ? "is-affordable" : ""}" data-helper-item="${index}">
        <div class="shop-top">
          <div>
            <h3>${helper.name}</h3>
            <p class="shop-help">${helper.blurb}</p>
          </div>
          <span class="owned-pill">x${owned}</span>
        </div>

        <div class="shop-bottom">
          <div class="shop-meta">
            <span>${formatNumber(output)} ${resourceName}/sec each</span>
            <span>Cost: ${formatNumber(cost)}</span>
          </div>
          <button class="shop-buy" type="button" data-buy-helper="${index}" ${affordable ? "" : "disabled"}>BUY</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderUpgrades() {
  const creature = getCreature();
  if (!creature) {
    return;
  }

  DOM.upgradesTab.innerHTML = creature.upgrades.map((upgrade, index) => {
    const owned = state.ownedUpgradeIds.includes(upgrade.id);
    const cost = getUpgradeCost(index, upgrade);
    const affordable = !owned && canAfford(cost);

    return `
      <article class="shop-item ${affordable ? "is-affordable" : ""} ${owned ? "is-owned" : ""}" data-upgrade-item="${upgrade.id}">
        <div class="shop-top">
          <div>
            <h3>${upgrade.name}</h3>
            <p class="shop-help">${upgrade.blurb}</p>
          </div>
          <span class="owned-pill">${owned ? "OWNED" : "READY"}</span>
        </div>

        <div class="shop-bottom">
          <div class="shop-meta">
            <span>Cost: ${formatNumber(cost)}</span>
            <span>${owned ? "Effect installed" : "Permanent for this animal"}</span>
          </div>
          <button class="shop-buy ${owned ? "is-owned" : ""}" type="button" data-buy-upgrade="${upgrade.id}" ${owned || !affordable ? "disabled" : ""}>${owned ? "OWNED" : "BUY"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderBoosts(now) {
  const activeBoosts = state.temporaryEffects.filter((effect) => effect.until > now);
  if (!activeBoosts.length) {
    DOM.boostList.innerHTML = '<span class="boost-chip boost-chip-empty">No boosts live</span>';
    return;
  }

  DOM.boostList.innerHTML = activeBoosts.map((effect) => {
    const remaining = Math.ceil((effect.until - now) / 1000);
    return `<span class="boost-chip">${effect.label} ${remaining}s</span>`;
  }).join("");
}

function renderEventCard(now) {
  if (!state.activeEvent) {
    DOM.eventCard.hidden = true;
    return;
  }

  const definition = EVENT_DEFINITIONS[state.activeEvent.key];
  const remaining = Math.max(0, state.activeEvent.until - now);
  DOM.eventEyebrow.textContent = definition.eyebrow;
  DOM.eventTitle.textContent = definition.title;
  DOM.eventDescription.textContent = definition.description;
  DOM.eventTimer.textContent = `${formatSeconds(remaining)}s`;
  DOM.eventActionButton.textContent = state.activeEvent.key === "creatureInvasion"
    ? `STABILISE ${state.activeEvent.progress}/${definition.tapsNeeded}`
    : definition.button;
  DOM.eventCard.hidden = false;
}

function renderWarning(now) {
  const activeDefinition = state.activeEvent ? EVENT_DEFINITIONS[state.activeEvent.key] : null;
  const warningText = activeDefinition?.warning || (state.warningUntil > now ? state.warningText : "");

  if (!warningText) {
    DOM.warningBanner.hidden = true;
    return;
  }

  DOM.warningBanner.hidden = false;
  DOM.warningBanner.textContent = warningText;
}

function renderEvolutionChoices() {
  const nextStage = getNextStageDefinition();
  const signature = `${state.stage}:${state.evolutionChoices.join("|")}`;

  if (nextStage) {
    DOM.evolutionStageEyebrow.textContent = nextStage.overlayEyebrow;
    DOM.evolutionOverlayTitle.textContent = nextStage.overlayTitle;
    DOM.evolutionOverlayCopy.textContent = nextStage.overlayCopy;
  }

  if (renderCache.evolutionChoices === signature) {
    return;
  }

  DOM.evolutionChoices.innerHTML = state.evolutionChoices.map((speciesId) => {
    const species = getSpeciesById(speciesId);
    const nextStageIndex = nextStage ? nextStage.index : state.stage;
    const nextBoost = [1, 1.55, 2.25][nextStageIndex] || getPermanentMultiplier();
    return `
        <button class="evolution-choice" type="button" data-evolve-choice="${species.id}">
          <span class="choice-sprite-host">${buildCreatureSpriteMarkup({ speciesId: species.id, rank: 0, growthScale: 1.24, progressRatio: 1, sizeClass: "size-choice" })}</span>
          <span class="choice-name">Worker ${species.name}</span>
          <span class="choice-desc">${species.blurb}</span>
          <span class="evolution-copy">Reset the run, keep a stronger click boost, and climb Worker, Enforcer, Queen, Cyber, and God again. Next click boost: x${nextBoost.toFixed(2)}.</span>
        </button>
    `;
  }).join("");
  renderCache.evolutionChoices = signature;
}

function renderTabs() {
  const helpersActive = state.activeTab === "helpers";
  DOM.helpersTab.hidden = !helpersActive;
  DOM.upgradesTab.hidden = helpersActive;
  DOM.helpersTabButton.classList.toggle("is-active", helpersActive);
  DOM.upgradesTabButton.classList.toggle("is-active", !helpersActive);
  DOM.helpersTabButton.setAttribute("aria-selected", String(helpersActive));
  DOM.upgradesTabButton.setAttribute("aria-selected", String(!helpersActive));
}

function renderProgress(snapshot) {
  const creature = getCreature();
  const threshold = getCurrentThreshold();
  const nextRank = getNextRankDefinition();
  const nextStage = getNextStageDefinition();
  const remaining = Math.max(0, (threshold || 0) - state.rankProgress);
  DOM.evolutionProgressFill.style.width = `${getCurrentProgressRatio() * 100}%`;

  if (!creature) {
    DOM.evolutionStatusValue.textContent = "Choose a creature";
    DOM.evolutionHintValue.textContent = "Pick a starter to begin the run.";
    DOM.evolveButton.hidden = true;
    DOM.evolveButton.disabled = true;
    DOM.stayButton.hidden = true;
    return;
  }

  if (state.finalFormReached) {
    DOM.evolutionStatusValue.textContent = "FINAL GOD FORM REACHED";
    DOM.evolutionHintValue.textContent = "Stage 3 God form is complete. There is no next stage after this yet, so this is the current end point.";
    DOM.evolutionProgressFill.style.width = "100%";
    DOM.evolveButton.hidden = true;
    DOM.evolveButton.disabled = true;
    DOM.stayButton.hidden = true;
    return;
  }

  if (state.rankReady && nextRank) {
    DOM.evolutionStatusValue.textContent = `${nextRank.label.toUpperCase()} READY`;
    DOM.evolutionHintValue.textContent = `${getCurrentCreatureName()} is built out. Rank it up into ${nextRank.label} ${creature.name}.`;
    DOM.evolveButton.textContent = "RANK UP";
    DOM.evolveButton.hidden = false;
    DOM.evolveButton.disabled = false;
    DOM.stayButton.hidden = true;
    return;
  }

  if (state.evolveAvailable) {
    DOM.evolutionStatusValue.textContent = `${nextStage.label} READY`;
    DOM.evolutionHintValue.textContent = `God ${creature.name} is maxed out. Open the next stage now or stay here and overfarm.`;
    DOM.evolveButton.textContent = "EVOLVE NOW";
    DOM.evolveButton.hidden = false;
    DOM.evolveButton.disabled = false;
    DOM.stayButton.hidden = false;
    return;
  }

  if (nextRank) {
    DOM.evolutionStatusValue.textContent = `Grow Into ${nextRank.label} ${creature.name}`;
    DOM.evolutionHintValue.textContent = `${formatNumber(remaining)} more ${getCurrentResourceName()} needed to rank up. Current click boost: x${snapshot.permanentMultiplier.toFixed(2)}.`;
  } else if (nextStage) {
    DOM.evolutionStatusValue.textContent = `Push To ${nextStage.label}`;
    DOM.evolutionHintValue.textContent = `${formatNumber(remaining)} more ${getCurrentResourceName()} needed to unlock the next animal stage. Current click boost: x${snapshot.permanentMultiplier.toFixed(2)}.`;
  } else {
    DOM.evolutionStatusValue.textContent = `Finish God ${creature.name}`;
    DOM.evolutionHintValue.textContent = `${formatNumber(remaining)} more ${getCurrentResourceName()} needed to cap the final form.`;
  }

  DOM.evolveButton.hidden = true;
  DOM.evolveButton.disabled = true;
  DOM.stayButton.hidden = true;
}

function renderAll(now = performance.now()) {
  if (state.phase !== "play") {
    return;
  }

  applyTheme();

  const snapshot = getUpgradeSnapshot(now);
  const passivePerSecond = getPassivePerSecond(snapshot);
  const baseClick = getBaseClickValue(snapshot);

  DOM.creatureNameValue.textContent = getCurrentCreatureName();
  DOM.stageValue.textContent = getStageDefinition().label;
  DOM.resourceNameValue.textContent = getCurrentResourceName();
  DOM.resourceTotalValue.textContent = formatNumber(state.resource);
  DOM.resourcePerSecondValue.textContent = `${formatNumber(passivePerSecond)} / sec`;
  DOM.formEyebrow.textContent = getFormEyebrow();
  DOM.formTitle.textContent = getCurrentCreatureName();
  DOM.clickPowerValue.textContent = formatNumber(baseClick);
  DOM.rankValue.textContent = getRankDefinition().label;
  DOM.permanentBonusValue.textContent = `x${snapshot.permanentMultiplier.toFixed(2)}`;
  DOM.helperTotalValue.textContent = `${formatNumber(getTotalHelpers())} helpers`;
  DOM.eventCountdownValue.textContent = state.activeEvent
    ? `Event live: ${formatSeconds(state.activeEvent.until - now)}s`
    : `Next event in ${formatSeconds(state.nextEventAt - now)}s`;
  DOM.muteButton.textContent = state.mute ? "SFX OFF" : "SFX ON";
  DOM.muteButton.setAttribute("aria-pressed", String(!state.mute));
  DOM.mainCreature.setAttribute("aria-label", `Collect ${getCurrentResourceName()}`);

  renderMainCreature();
  renderHelperSwarm();
  renderHelpers(snapshot);
  renderUpgrades();
  renderBoosts(now);
  renderEventCard(now);
  renderWarning(now);
  renderProgress(snapshot);
  renderTabs();
}

function spendResource(cost) {
  if (!canAfford(cost)) {
    return false;
  }
  state.resource -= cost;
  markDirty();
  return true;
}

function grantResources(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  state.resource += amount;
  state.rankProgress += amount;
  state.totalEarned += amount;
  markDirty();
  maybeUnlockProgression();
}

function addTemporaryEffect(effect) {
  state.temporaryEffects.push(effect);
  markDirty();
}

function maybeUnlockProgression() {
  const threshold = getCurrentThreshold();
  const nextStage = getNextStageDefinition();
  const nextRank = getNextRankDefinition();
  const creature = getCreature();
  if (!threshold || state.rankReady || state.evolveAvailable || state.finalFormReached || state.rankProgress < threshold) {
    return;
  }

  if (nextRank && creature) {
    state.rankReady = true;
    playEvolveSound();
    triggerFlash();
    setWarning(`${nextRank.label.toUpperCase()} READY`, 2200);
    queueToast(`${nextRank.label} ${creature.name} unlocked.`);
    markDirty();
    return;
  }

  if (nextStage) {
    state.evolveAvailable = true;
    state.evolutionChoices = [...nextStage.choices];
    state.evolutionOpen = true;
    DOM.evolutionOverlay.hidden = false;
    renderEvolutionChoices();
    playEvolveSound();
    triggerFlash();
    triggerShake(520);
    setWarning(`${nextStage.label.toUpperCase()} READY`, 2400);
    queueToast(`${nextStage.label} chamber unlocked.`);
    markDirty();
    return;
  }

  state.finalFormReached = true;
  playEvolveSound();
  triggerFlash();
  triggerShake(520);
  setWarning("GOD FORM COMPLETE", 2600);
  queueToast("Final God form completed.");
  markDirty();
}

function scheduleNextEvent(now = performance.now()) {
  const snapshot = getUpgradeSnapshot(now);
  state.nextEventAt = now + randomBetween(15000, 25000) * snapshot.eventCooldownFactor;
}

function openEvolutionOverlay() {
  if (!state.evolveAvailable || state.stage >= MAX_STAGE) {
    return;
  }
  state.evolutionOpen = true;
  renderEvolutionChoices();
  DOM.evolutionOverlay.hidden = false;
}

function closeEvolutionOverlay() {
  state.evolutionOpen = false;
  DOM.evolutionOverlay.hidden = true;
}

function delayEvolution() {
  closeEvolutionOverlay();
  markDirty();
}

function resetAnimalProgress() {
  state.resource = 0;
  state.rank = 0;
  state.rankProgress = 0;
  state.helperCounts = Array(HELPER_BLUEPRINTS.length).fill(0);
  state.ownedUpgradeIds = [];
  state.temporaryEffects = [];
  state.activeEvent = null;
  state.rankReady = false;
  state.evolveAvailable = false;
  state.finalFormReached = false;
  state.evolutionChoices = [];
  state.warningText = "";
  state.warningUntil = 0;
  closeEvolutionOverlay();
  scheduleNextEvent();
  renderCache.helperSwarm = "";
  renderCache.mainSprite = "";
  renderCache.evolutionChoices = "";
  markDirty();
}

function chooseCreature(creatureKey) {
  const creature = getCreature(creatureKey);
  if (!creature || creature.stage !== 0) {
    return;
  }

  state.phase = "play";
  state.creatureKey = creatureKey;
  state.stage = creature.stage;
  state.totalEarned = 0;
  state.clicks = 0;
  resetAnimalProgress();
  document.body.classList.remove("is-choosing");
  DOM.introOverlay.hidden = true;
  DOM.gameShell.hidden = false;
  playEvolveSound();
  queueToast(`Worker ${creature.name} run initialized.`);
  markDirty();
}

function rankUpCreature() {
  const creature = getCreature();
  const nextRank = getNextRankDefinition();
  if (!creature || !state.rankReady || !nextRank) {
    return;
  }

  state.rank += 1;
  state.rankProgress = 0;
  state.rankReady = false;
  renderCache.mainSprite = "";
  renderCache.helperSwarm = "";
  triggerFlash();
  triggerShake(420);
  playEvolveSound();
  queueToast(`${getCurrentCreatureName()} online.`);
  setWarning(`${getCurrentCreatureName().toUpperCase()} ONLINE`, 1800);
  markDirty();
}

function handlePrimaryAction() {
  if (state.rankReady) {
    rankUpCreature();
    return;
  }

  if (state.evolveAvailable) {
    openEvolutionOverlay();
  }
}

function evolveInto(speciesId) {
  const nextStage = getNextStageDefinition();
  const nextCreature = getCreature(speciesId);
  if (!state.evolveAvailable || !nextStage || !nextCreature || !nextStage.choices.includes(speciesId)) {
    return;
  }

  state.creatureKey = speciesId;
  state.stage = nextCreature.stage;
  resetAnimalProgress();
  triggerFlash();
  triggerShake();
  playEvolveSound();
  queueToast(`Worker ${nextCreature.name} online. Click boost x${getPermanentMultiplier().toFixed(2)}.`);
  markDirty();
}

function buyHelper(index, sourceButton) {
  const cost = getHelperCost(index);
  if (!spendResource(cost)) {
    return;
  }

  state.helperCounts[index] += 1;
  playUpgradeSound();
  queueToast(`${getCreature().helpers[index].name} deployed.`);
  const item = sourceButton?.closest("[data-helper-item]");
  if (item) {
    item.classList.add("is-purchased");
    window.setTimeout(() => item.classList.remove("is-purchased"), 320);
  }
  markDirty();
}

function buyUpgrade(upgradeId, sourceButton) {
  const record = getUpgradeRecord(upgradeId);
  if (!record) {
    return;
  }

  const cost = getUpgradeCost(record.index, record.upgrade);
  if (state.ownedUpgradeIds.includes(record.upgrade.id) || !spendResource(cost)) {
    return;
  }

  state.ownedUpgradeIds.push(record.upgrade.id);
  playUpgradeSound();
  queueToast(`${record.upgrade.name} installed.`);
  scheduleNextEvent();
  const item = sourceButton?.closest("[data-upgrade-item]");
  if (item) {
    item.classList.add("is-purchased");
    window.setTimeout(() => item.classList.remove("is-purchased"), 320);
  }
  markDirty();
}

function getRandomEventKey() {
  const bag = [
    "resourceBurst",
    "resourceBurst",
    "predatorAttack",
    "mutationSurge",
    "glitchOrb",
    "creatureInvasion"
  ];
  return pickRandom(bag);
}

function spawnEvent(now = performance.now()) {
  if (state.activeEvent || state.phase !== "play" || state.evolutionOpen) {
    return;
  }

  const key = getRandomEventKey();
  const definition = EVENT_DEFINITIONS[key];
  state.activeEvent = {
    key,
    progress: 0,
    until: now + definition.duration
  };

  if (definition.warning) {
    setWarning(definition.warning, definition.duration);
  }

  if (key === "creatureInvasion") {
    triggerShake(800);
  }

  playEventSound();
  markDirty();
}

function resolveEventSuccess(now = performance.now()) {
  if (!state.activeEvent) {
    return;
  }

  const snapshot = getUpgradeSnapshot(now);
  const eventKey = state.activeEvent.key;
  let reward = 0;

  if (eventKey === "resourceBurst") {
    reward = Math.max(40, getPassivePerSecond(snapshot) * 18, getBaseClickValue(snapshot) * 18) * snapshot.eventRewardMultiplier;
    grantResources(reward);
    queueToast(`Burst cracked for ${formatNumber(reward)} ${getCurrentResourceName()}.`);
  }

  if (eventKey === "predatorAttack") {
    addTemporaryEffect({
      label: "Safe Zone",
      until: now + 12000,
      passiveMultiplier: 1.25
    });
    queueToast("Predator repelled.");
  }

  if (eventKey === "mutationSurge") {
    addTemporaryEffect({
      label: "Mutation Surge",
      until: now + 15000,
      clickMultiplier: 2.1,
      critChance: 0.22
    });
    queueToast("Mutation surge absorbed.");
  }

  if (eventKey === "glitchOrb") {
    reward = Math.max(60, getPassivePerSecond(snapshot) * 12) * snapshot.eventRewardMultiplier;
    grantResources(reward);
    addTemporaryEffect({
      label: "Glitch Overdrive",
      until: now + 13000,
      clickMultiplier: 1.45,
      passiveMultiplier: 1.45
    });
    queueToast("Glitch orb broken open.");
  }

  if (eventKey === "creatureInvasion") {
    reward = Math.max(120, getPassivePerSecond(snapshot) * 24, getBaseClickValue(snapshot) * 22) * snapshot.eventRewardMultiplier;
    grantResources(reward);
    addTemporaryEffect({
      label: "Invasion Frenzy",
      until: now + 18000,
      clickMultiplier: 1.4,
      passiveMultiplier: 1.85
    });
    queueToast("Arena stabilised. Invasion energy hijacked.");
  }

  playEventSound();
  triggerFlash();
  state.activeEvent = null;
  scheduleNextEvent(now);
  markDirty();
}

function resolveEventFailure(now = performance.now()) {
  if (!state.activeEvent) {
    return;
  }

  if (state.activeEvent.key === "predatorAttack") {
    addTemporaryEffect({
      label: "Predator Scare",
      until: now + 12000,
      passiveMultiplier: 0.6
    });
    queueToast("Predator slipped through. Passive income dropped.");
  }

  if (state.activeEvent.key === "creatureInvasion") {
    addTemporaryEffect({
      label: "Arena Instability",
      until: now + 10000,
      passiveMultiplier: 0.72
    });
    queueToast("Invasion shook the arena. Passive income clipped.");
  }

  state.activeEvent = null;
  scheduleNextEvent(now);
  markDirty();
}

function handleEventAction(event) {
  if (!state.activeEvent) {
    return;
  }

  const point = getScenePointFromEvent(event);
  if (state.activeEvent.key === "creatureInvasion") {
    state.activeEvent.progress += 1;
    spawnFloatingText("+1", point.x, point.y, "");
    spawnParticles(point.x, point.y, 8);
    if (state.activeEvent.progress >= EVENT_DEFINITIONS.creatureInvasion.tapsNeeded) {
      resolveEventSuccess();
    }
    markDirty();
    return;
  }

  spawnFloatingText("EVENT!", point.x, point.y, "");
  spawnParticles(point.x, point.y, 10);
  resolveEventSuccess();
}

function handleCreatureClick(event) {
  if (state.phase !== "play") {
    return;
  }

  const snapshot = getUpgradeSnapshot();
  const baseValue = getBaseClickValue(snapshot);
  const crit = Math.random() < snapshot.critChance;
  const amount = crit ? baseValue * snapshot.critMultiplier : baseValue;
  const point = getScenePointFromEvent(event);

  grantResources(amount);
  state.clicks += 1;
  DOM.mainCreature.classList.add("is-popping");
  window.setTimeout(() => DOM.mainCreature.classList.remove("is-popping"), 260);
  spawnFloatingText(`+${formatNumber(amount)}`, point.x, point.y, crit ? "is-crit" : "");
  spawnParticles(point.x, point.y, crit ? 14 : 8);
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

function tick(now) {
  const deltaSeconds = Math.min((now - state.lastFrameAt) / 1000, 0.1);
  state.lastFrameAt = now;

  if (state.phase === "play") {
    const passive = getPassivePerSecond(getUpgradeSnapshot(now));
    if (passive > 0) {
      grantResources(passive * deltaSeconds);
    }

    state.temporaryEffects = state.temporaryEffects.filter((effect) => effect.until > now);

    if (!state.activeEvent && now >= state.nextEventAt) {
      spawnEvent(now);
    }

    if (state.activeEvent && now >= state.activeEvent.until) {
      resolveEventFailure(now);
    }

    if (state.warningUntil <= now && !state.activeEvent) {
      state.warningText = "";
    }

    if (state.uiDirty || now - state.lastUiRenderAt > 140) {
      renderAll(now);
      state.uiDirty = false;
      state.lastUiRenderAt = now;
    }
  }

  window.requestAnimationFrame(tick);
}

function bindEvents() {
  DOM.choiceCards.forEach((card) => {
    card.addEventListener("click", () => {
      const creatureKey = card.dataset.lineage;
      if (!creatureKey) {
        return;
      }
      chooseCreature(creatureKey);
    });
  });

  DOM.mainCreature.addEventListener("click", handleCreatureClick);
  DOM.mainCreature.addEventListener("pointerdown", ensureAudio);
  DOM.muteButton.addEventListener("click", toggleMute);
  DOM.helpersTabButton.addEventListener("click", () => setActiveTab("helpers"));
  DOM.upgradesTabButton.addEventListener("click", () => setActiveTab("upgrades"));
  DOM.evolveButton.addEventListener("click", handlePrimaryAction);
  DOM.stayButton.addEventListener("click", delayEvolution);
  DOM.evolutionDelayButton.addEventListener("click", delayEvolution);
  DOM.eventActionButton.addEventListener("click", handleEventAction);

  DOM.helpersTab.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-helper]");
    if (!button) {
      return;
    }
    buyHelper(Number(button.dataset.buyHelper), button);
  });

  DOM.upgradesTab.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-upgrade]");
    if (!button) {
      return;
    }
    buyUpgrade(button.dataset.buyUpgrade, button);
  });

  DOM.evolutionChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-evolve-choice]");
    if (!button) {
      return;
    }
    evolveInto(button.dataset.evolveChoice);
  });
}

function init() {
  ensureMainCreatureChrome();
  renderChoiceSprites();
  bindEvents();
  renderTabs();
  window.requestAnimationFrame(tick);
}

init();

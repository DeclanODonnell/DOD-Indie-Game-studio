const STAGES = [
  {
    label: "Stage 1",
    blurb: "Starter swarm animals. These are the first forms players see.",
    choices: ["ant", "fly", "bee"]
  },
  {
    label: "Stage 2",
    blurb: "Mid-run animal choices after the first prestige reset.",
    choices: ["dog", "cat", "koala"]
  },
  {
    label: "Stage 3",
    blurb: "Final stage animals with the heaviest upgrade looks.",
    choices: ["shark", "bear", "ape"]
  },
  {
    label: "Secret Final Stage",
    blurb: "A hidden endgame form beyond every God animal.",
    choices: ["celestial"]
  }
];

const RANKS = [
  { id: "worker", label: "Worker", note: "Base readable form." },
  { id: "enforcer", label: "Enforcer", note: "Muscles + headband." },
  { id: "queen", label: "Queen", note: "Crown + shine." },
  { id: "cyber", label: "Cyber", note: "Species-specific cyber shell." },
  { id: "god", label: "God", note: "Aura + halo." }
];

const SPECIES = {
  ant: {
    stage: 0,
    name: "Ant",
    description: "Colony runner with segmented body blocks.",
    colors: { primary: "#ffd14b", secondary: "#ff8c31", strong: "#fff1b0" }
  },
  fly: {
    stage: 0,
    name: "Fly",
    description: "Big eyes, wings, and gross little hover energy.",
    colors: { primary: "#a7ff57", secondary: "#68d957", strong: "#e5ffc7" }
  },
  bee: {
    stage: 0,
    name: "Bee",
    description: "Striped hive bug with wings and a tail stinger.",
    colors: { primary: "#ffe05e", secondary: "#ffb347", strong: "#fff5c2" }
  },
  dog: {
    stage: 1,
    name: "Dog",
    description: "Chunky snout, floppy ears, and pack brute look.",
    colors: { primary: "#ffb15a", secondary: "#ff7b3d", strong: "#ffe2bf" }
  },
  cat: {
    stage: 1,
    name: "Cat",
    description: "Sharper face, ears, whiskers, and cleaner body lines.",
    colors: { primary: "#f6a4c7", secondary: "#ff6aa8", strong: "#ffd7eb" }
  },
  koala: {
    stage: 1,
    name: "Koala",
    description: "Rounder face with oversized ears and sleepy body blocks.",
    colors: { primary: "#c0c2e0", secondary: "#8b92c8", strong: "#eef0ff" }
  },
  shark: {
    stage: 2,
    name: "Shark",
    description: "Long body profile, fins, mouth line, and eye placement.",
    colors: { primary: "#7bf2ff", secondary: "#0087d9", strong: "#d8fdff" }
  },
  bear: {
    stage: 2,
    name: "Polar Bear",
    description: "Arctic heavyweight with pale fur, icy muzzle, and colder armor reads.",
    colors: { primary: "#eef7ff", secondary: "#92b8d7", strong: "#ffffff" }
  },
  ape: {
    stage: 2,
    name: "Ape",
    description: "Brown bruiser with a heavier brow, huge arms, and a more gorilla-like frame.",
    colors: { primary: "#b8885d", secondary: "#6e4327", strong: "#f2dcc8" }
  },
  celestial: {
    stage: 3,
    name: "Celestial",
    description: "Final hidden silhouette form with cosmic glow and unreadable god-tier detail.",
    colors: { primary: "#0d1018", secondary: "#1a2231", strong: "#cde7ff" }
  }
};

const quickNav = document.querySelector("#quickNav");
const referenceStages = document.querySelector("#referenceStages");
const summarySpeciesCount = document.querySelector("#summarySpeciesCount");
const summaryFormCount = document.querySelector("#summaryFormCount");

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

function getSpecies(speciesId) {
  return SPECIES[speciesId] || SPECIES.ant;
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
          <rect class="eye eye-left" x="102" y="78" width="8" height="10" fill="${palette.stroke}" />
          <rect class="eye eye-right" x="130" y="78" width="8" height="10" fill="${palette.stroke}" />
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
  if (speciesId === "celestial") {
    return { back: "", front: "" };
  }
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

function buildCreatureMarkup(speciesId, rankIndex, size = 168) {
  return `<div class="creature-graphic is-reference" style="width:${size}px;height:${size}px;">${buildCreatureSvg(speciesId, rankIndex)}</div>`;
}

function getDisplayRanks(speciesId) {
  if (speciesId === "celestial") {
    return [{ id: "celestial", label: "CELESTIAL", note: "Final hidden silhouette form." }];
  }
  return RANKS;
}

function buildQuickNav() {
  quickNav.innerHTML = Object.entries(SPECIES).map(([speciesId, species]) => {
    return `<a href="#species-${speciesId}">${species.name}</a>`;
  }).join("");
}

function buildSpeciesMarkup(speciesId, stageIndex) {
  const species = getSpecies(speciesId);
  const displayRanks = getDisplayRanks(speciesId);
  return `<article class="species-panel" id="species-${speciesId}">
      <div class="species-head">
        <p class="eyebrow">${STAGES[stageIndex].label} / ${species.name}</p>
        <h3>${species.name}</h3>
        <p class="species-copy">${species.description}</p>
      </div>
      <div class="rank-grid">
        ${displayRanks.map((rank, rankIndex) => `
          <div class="rank-card">
            <strong>${rank.label}</strong>
            <div class="rank-preview">${buildCreatureMarkup(speciesId, rankIndex)}</div>
            <p class="rank-note">${rank.note}</p>
          </div>
        `).join("")}
      </div>
    </article>`;
}

function buildStageMarkup(stage, stageIndex) {
  return `<section class="panel stage-panel">
      <div class="stage-head">
        <p class="eyebrow">${stage.label}</p>
        <h2>${stage.blurb}</h2>
      </div>
      <div class="species-list">
        ${stage.choices.map((speciesId) => buildSpeciesMarkup(speciesId, stageIndex)).join("")}
      </div>
    </section>`;
}

function renderReference() {
  if (summarySpeciesCount) {
    summarySpeciesCount.textContent = String(Object.keys(SPECIES).length);
  }
  if (summaryFormCount) {
    const totalForms = Object.keys(SPECIES).reduce((sum, speciesId) => sum + getDisplayRanks(speciesId).length, 0);
    summaryFormCount.textContent = String(totalForms);
  }
  buildQuickNav();
  referenceStages.innerHTML = STAGES.map(buildStageMarkup).join("");
}

renderReference();

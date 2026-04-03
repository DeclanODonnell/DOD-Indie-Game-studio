const games = [
  {
    title: "Animal Clicker",
    summary: "Pick a creature, build resources, buy helpers, and evolve through increasingly ridiculous forms.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/animal-clicker/index.html"
  },
  {
    title: "Pulse Recall",
    summary: "3x3 memory grid challenge. Watch the sequence, replay it cleanly, and push your best round count.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/pulse-recall/index.html"
  },
  {
    title: "Reaction Lab",
    summary: "Wait for the live signal, hit on green, and chase a faster reaction time without false starts.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/reaction-lab/index.html"
  },
  {
    title: "Sudoku",
    summary: "Three-life Sudoku with Rookie, Cipher, and Impossible boards.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/signal-sudoku/index.html"
  },
  {
    title: "Neon Trails",
    summary: "Fast neon line duel against the CPU. Use swipe, WASD, or arrow keys.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/neon-trails/index.html"
  },
  {
    title: "Snake",
    summary: "Classic Snake with calm, standard, and rush speeds. Eat, grow, and stay alive.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/snake/index.html"
  },
  {
    title: "Pong",
    summary: "Arcade Pong against the CPU with Rookie, Standard, and Expert difficulty.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/pong/index.html"
  },
  {
    title: "Dead Rush: Stickman",
    summary: "Stickman survival shooter with campfire defense, upgrades, bosses, and mystery box chaos.",
    status: "Play now",
    linkLabel: "Play",
    link: "games/dead-rush-stickman/index.html"
  }
];

const gameList = document.querySelector("#game-list");
const arcadeIntro = document.querySelector("#arcadeIntro");
const arcadeMachine = document.querySelector("#arcadeMachine");

const HOMEPAGE_INTRO_TIMINGS = {
  pushFallback: 3120,
  fade: 820
};

let homepageIntroPushTimer = null;
let homepageIntroFinishTimer = null;

function renderGames() {
  const fragment = document.createDocumentFragment();

  games.forEach((game) => {
    const row = document.createElement("article");
    row.className = "game-row";

    const copy = document.createElement("div");
    copy.className = "game-copy";

    const title = document.createElement("h2");
    title.textContent = game.title;

    const summary = document.createElement("p");
    summary.textContent = game.summary;

    const status = document.createElement("span");
    status.className = "game-status";
    status.textContent = game.status;

    const link = document.createElement("a");
    link.className = "game-link";
    link.href = game.link;
    link.textContent = game.linkLabel;
    link.setAttribute("aria-label", `Open ${game.title}`);

    copy.append(title, summary, status);
    row.append(copy, link);
    fragment.appendChild(row);
  });

  gameList.replaceChildren(fragment);
}

function initRevealAnimations() {
  const sections = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

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

function shouldPlayHomepageIntro() {
  if (!arcadeIntro || !arcadeMachine) {
    return false;
  }

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearHomepageIntroTimers() {
  if (homepageIntroPushTimer) {
    window.clearTimeout(homepageIntroPushTimer);
    homepageIntroPushTimer = null;
  }

  if (homepageIntroFinishTimer) {
    window.clearTimeout(homepageIntroFinishTimer);
    homepageIntroFinishTimer = null;
  }
}

function finishHomepageIntro() {
  clearHomepageIntroTimers();
  document.body.classList.remove("has-intro", "intro-revealing");
  document.body.classList.add("intro-finished");

  if (arcadeIntro) {
    arcadeIntro.hidden = true;
    arcadeIntro.setAttribute("aria-hidden", "true");
  }
}

function skipHomepageIntro() {
  finishHomepageIntro();
}

function startHomepageIntro() {
  if (!arcadeIntro) {
    return;
  }

  clearHomepageIntroTimers();
  document.body.classList.remove("intro-finished", "intro-revealing");
  arcadeIntro.hidden = false;
  arcadeIntro.setAttribute("aria-hidden", "false");

  if (arcadeMachine) {
    arcadeMachine.style.animation = "none";
    void arcadeMachine.offsetWidth;
    arcadeMachine.style.animation = "";
  }

  document.body.classList.add("has-intro");
  let revealStarted = false;

  const beginReveal = () => {
    if (revealStarted) {
      return;
    }

    revealStarted = true;
    document.body.classList.add("intro-revealing");
    homepageIntroFinishTimer = window.setTimeout(() => {
      finishHomepageIntro();
    }, HOMEPAGE_INTRO_TIMINGS.fade);
  };

  if (arcadeMachine) {
    const handlePushComplete = () => beginReveal();
    arcadeMachine.addEventListener("animationend", handlePushComplete, { once: true });
    homepageIntroPushTimer = window.setTimeout(beginReveal, HOMEPAGE_INTRO_TIMINGS.pushFallback);
  } else {
    homepageIntroPushTimer = window.setTimeout(beginReveal, HOMEPAGE_INTRO_TIMINGS.pushFallback);
  }
}

renderGames();
initRevealAnimations();

if (shouldPlayHomepageIntro()) {
  startHomepageIntro();
} else {
  skipHomepageIntro();
}

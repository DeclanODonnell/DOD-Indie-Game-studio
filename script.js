const games = [
  {
    title: "Animal Clicker",
    summary: "Arcade idle clicker with creature picks, helpers, upgrades, mutations, and glitch events.",
    status: "Play now",
    linkLabel: "Play",
    link: "idlecritter.exe/index.html"
  },
  {
    title: "Sudoku",
    summary: "Logic puzzle with Rookie, Cipher, and Impossible.",
    status: "Play now",
    linkLabel: "Play",
    link: "sudoku.html"
  },
  {
    title: "Neon Trails",
    summary: "Yellow line vs blue CPU. Swipe or use WASD / arrow keys.",
    status: "Play now",
    linkLabel: "Play",
    link: "line-game.html"
  },
  {
    title: "Snake",
    summary: "Eat, grow, and stay clear of walls. Calm, Standard, or Rush.",
    status: "Play now",
    linkLabel: "Play",
    link: "snake.html"
  },
  {
    title: "Pong",
    summary: "Minimal paddle match against the CPU. Rookie, Standard, or Expert.",
    status: "Play now",
    linkLabel: "Play",
    link: "pong.html"
  },
  {
    title: "Stickman Defender",
    summary: "Arena survival shooter with campfire defense, upgrades, a mystery box, bosses, and mobile controls.",
    status: "Play now",
    linkLabel: "Play",
    link: "stickman-defender/index.html"
  }
];

const gameList = document.querySelector("#game-list");

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

renderGames();
initRevealAnimations();

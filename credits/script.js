const introScreen = document.querySelector("#intro-screen");
const crawlScreen = document.querySelector("#crawl-screen");
const crawlTrack = document.querySelector("#crawl-track");
const creditsClose = document.querySelector("#credits-close");

const CREDITS_TIMINGS = {
  intro: 4200,
  pause: 800,
  returnDelay: 0
};

let introTimer = null;
let pauseTimer = null;
let returnTimer = null;

function setSequenceState(state) {
  document.body.dataset.sequenceState = state;

  if (introScreen) {
    introScreen.setAttribute("aria-hidden", String(state !== "intro"));
  }

  if (crawlScreen) {
    crawlScreen.setAttribute("aria-hidden", String(state !== "crawl"));
  }
}

function clearTimers() {
  if (introTimer) {
    window.clearTimeout(introTimer);
    introTimer = null;
  }

  if (pauseTimer) {
    window.clearTimeout(pauseTimer);
    pauseTimer = null;
  }

  if (returnTimer) {
    window.clearTimeout(returnTimer);
    returnTimer = null;
  }
}

function returnToArcade() {
  clearTimers();
  if (crawlTrack) {
    crawlTrack.classList.remove("is-animating");
  }
  window.location.replace("../index.html");
}

function applyCrawlSizing() {
  if (!crawlTrack) {
    return;
  }

  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;
  const isMobile = viewportWidth <= 720;

  if (isMobile) {
    const width = Math.max(viewportWidth * 1.8, 1500);
    const fontSize = Math.max(Math.min(viewportWidth * 0.34, viewportHeight * 0.36), 160);
    crawlTrack.style.width = `${width}px`;
    crawlTrack.style.fontSize = `${fontSize}px`;
    return;
  }

  const width = Math.max(viewportWidth * 2.2, 4200);
  const fontSize = Math.max(Math.min(viewportWidth * 0.34, viewportHeight * 0.62), 320);
  crawlTrack.style.width = `${width}px`;
  crawlTrack.style.fontSize = `${fontSize}px`;
}

function updateCrawlDistance() {
  if (!crawlTrack || !crawlScreen) {
    return;
  }

  const viewportHeight = crawlScreen.clientHeight || window.innerHeight || 0;
  const crawlHeight = crawlTrack.scrollHeight || 0;
  const safetyBuffer = Math.max(160, viewportHeight * 0.18);
  const distance = viewportHeight + crawlHeight + safetyBuffer;

  crawlTrack.style.setProperty("--crawl-distance", `${-distance}px`);
}

function startCrawl() {
  setSequenceState("crawl");

  if (!crawlTrack) {
    returnToArcade();
    return;
  }

  applyCrawlSizing();
  updateCrawlDistance();
  crawlTrack.classList.remove("is-animating");
  void crawlTrack.offsetWidth;
  crawlTrack.classList.add("is-animating");
}

function beginCreditsSequence() {
  clearTimers();
  setSequenceState("intro");

  introTimer = window.setTimeout(() => {
    setSequenceState("blackout");

    pauseTimer = window.setTimeout(() => {
      startCrawl();
    }, CREDITS_TIMINGS.pause);
  }, CREDITS_TIMINGS.intro);
}

function preventInteraction(event) {
  event.preventDefault();
}

function initCreditsPage() {
  beginCreditsSequence();

  if (crawlTrack) {
    crawlTrack.addEventListener("animationend", () => {
      setSequenceState("blackout");
      returnTimer = window.setTimeout(returnToArcade, CREDITS_TIMINGS.returnDelay);
    });
  }

  if (creditsClose) {
    creditsClose.addEventListener("click", () => {
      returnToArcade();
    });
  }

  window.addEventListener("wheel", preventInteraction, { passive: false });
  window.addEventListener("touchmove", preventInteraction, { passive: false });
  window.addEventListener("keydown", (event) => {
    const blockedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
      "Spacebar"
    ];

    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
    }
  });

  window.addEventListener("resize", () => {
    applyCrawlSizing();
    updateCrawlDistance();
  });
}

initCreditsPage();

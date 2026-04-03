const hoopStartButton = document.querySelector("#hoop-start-button");
const hoopIntroStart = document.querySelector("#hoop-intro-start");
const hoopIntroPanel = document.querySelector("#hoop-intro-panel");
const hoopStatus = document.querySelector("#hoop-status");
const hoopPhaseValue = document.querySelector("#hoop-phase");
const hoopScoreValue = document.querySelector("#hoop-score");
const hoopBestValue = document.querySelector("#hoop-best");
const hoopStreakLabel = document.querySelector("#hoop-streak-label");
const hoopAimValue = document.querySelector("#hoop-aim-value");
const hoopPowerValue = document.querySelector("#hoop-power-value");
const hoopAimFill = document.querySelector("#hoop-aim-fill");
const hoopPowerFill = document.querySelector("#hoop-power-fill");
const hoopAimMarker = document.querySelector("#hoop-aim-marker");
const hoopPowerMarker = document.querySelector("#hoop-power-marker");
const hoopShell = document.querySelector("#hoop-stage-shell");
const hoopCanvas = document.querySelector("#hoop-canvas");

const hoopBestStorageKey = "dod_hoop_rush_best";

const hoopState = {
  mode: "menu",
  score: 0,
  attempts: 0,
  streak: 0,
  best: loadHoopBest(),
  aimValue: 0.5,
  powerValue: 0.5,
  aimDirection: 1,
  powerDirection: 1,
  rafId: 0,
  queueTimer: null,
  lastFrame: 0,
  shot: null,
  flashUntil: 0
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function easeInOutSine(progress) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function loadHoopBest() {
  try {
    const raw = window.localStorage.getItem(hoopBestStorageKey);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch (error) {
    return 0;
  }
}

function saveHoopBest() {
  try {
    window.localStorage.setItem(hoopBestStorageKey, String(hoopState.best));
  } catch (error) {
    // Ignore storage failures.
  }
}

function showHoopIntro() {
  hoopIntroPanel.hidden = false;
}

function hideHoopIntro() {
  hoopIntroPanel.hidden = true;
}

function clearHoopQueueTimer() {
  if (hoopState.queueTimer) {
    window.clearTimeout(hoopState.queueTimer);
    hoopState.queueTimer = null;
  }
}

function setHoopStatus(text) {
  hoopStatus.textContent = text;
}

function updateHoopHud() {
  const phaseLabel = {
    menu: "Idle",
    aim: "Aim",
    power: "Power",
    shot: "Shot",
    reset: "Reset"
  };

  hoopPhaseValue.textContent = phaseLabel[hoopState.mode] || "Idle";
  hoopScoreValue.textContent = String(hoopState.score);
  hoopBestValue.textContent = String(hoopState.best);
  hoopStreakLabel.textContent = `Streak ${hoopState.streak} · ${hoopState.attempts} att`;
  hoopAimValue.textContent = `${Math.round(hoopState.aimValue * 100)}%`;
  hoopPowerValue.textContent = `${Math.round(hoopState.powerValue * 100)}%`;
  hoopAimFill.style.setProperty("--fill", `${Math.max(4, hoopState.aimValue * 100)}%`);
  hoopPowerFill.style.setProperty("--fill", `${Math.max(4, hoopState.powerValue * 100)}%`);
  hoopAimMarker.style.setProperty("--marker", `${hoopState.aimValue * 100}%`);
  hoopPowerMarker.style.setProperty("--marker", `${hoopState.powerValue * 100}%`);
  hoopStartButton.textContent = hoopState.mode === "menu" ? "Start" : "Restart";
}

function resetHoopMeters() {
  hoopState.aimValue = 0.18 + Math.random() * 0.18;
  hoopState.powerValue = 0.2 + Math.random() * 0.16;
  hoopState.aimDirection = 1;
  hoopState.powerDirection = 1;
}

function beginHoopRound(resetScore) {
  clearHoopQueueTimer();
  hideHoopIntro();

  if (resetScore) {
    hoopState.score = 0;
    hoopState.attempts = 0;
    hoopState.streak = 0;
  }

  hoopState.mode = "aim";
  hoopState.shot = null;
  hoopState.flashUntil = 0;
  resetHoopMeters();
  setHoopStatus("Aim meter live. Click to lock aim.");
  updateHoopHud();
}

function buildShotSegment(start, end, height, sway, duration) {
  return { start, end, height, sway, duration };
}

function getHoopScene() {
  const width = hoopCanvas.width / (window.devicePixelRatio || 1);
  const height = hoopCanvas.height / (window.devicePixelRatio || 1);
  const shortSide = Math.min(width, height);
  const rimRadius = clamp(shortSide * 0.048, 22, 32);
  const ballRadius = clamp(shortSide * 0.037, 15, 24);
  const backboardWidth = clamp(shortSide * 0.042, 24, 34);
  const backboardHeight = clamp(shortSide * 0.31, 128, 186);
  const hoopX = width * 0.665;
  const hoopY = height * 0.27;
  const shooterX = width * 0.17;
  const shooterY = height * 0.8;

  return {
    width,
    height,
    courtLineY: height * 0.84,
    ballRadius,
    shooter: {
      x: shooterX,
      y: shooterY
    },
    release: {
      x: shooterX + ballRadius * 1.25,
      y: shooterY - ballRadius * 2.75
    },
    hoop: {
      x: hoopX,
      y: hoopY,
      rimRadius
    },
    backboard: {
      x: hoopX + rimRadius * 1.2,
      y: hoopY - backboardHeight * 0.62,
      width: backboardWidth,
      height: backboardHeight,
      impactX: hoopX + rimRadius * 1.15 - ballRadius * 0.08
    }
  };
}

function planHoopShot(scene) {
  const aimOffset = hoopState.aimValue - 0.52;
  const targetPower = 0.55 - Math.abs(aimOffset) * 0.08;
  const powerOffset = hoopState.powerValue - targetPower;
  const arcLift = scene.height * (0.34 + hoopState.powerValue * 0.08);
  const sway = aimOffset * scene.width * 0.18;
  let type = "long";

  if (Math.abs(aimOffset) <= 0.06 && Math.abs(powerOffset) <= 0.085) {
    type = "swish";
  } else if (aimOffset > 0.05 && aimOffset <= 0.17 && Math.abs(powerOffset) <= 0.085) {
    type = "bank";
  } else if (aimOffset > 0.15 || (aimOffset > 0.08 && powerOffset > 0.08)) {
    type = "boardMiss";
  } else if (powerOffset < -0.11) {
    type = "short";
  } else if (aimOffset < -0.09) {
    type = "left";
  }

  if (type === "swish") {
    return {
      outcome: "swish",
      made: true,
      boardHit: false,
      segments: [
        buildShotSegment(
          scene.release,
          {
            x: scene.hoop.x - scene.hoop.rimRadius * 0.08,
            y: scene.hoop.y + scene.ballRadius * 0.24
          },
          arcLift,
          sway,
          1120 + hoopState.powerValue * 180
        )
      ]
    };
  }

  if (type === "bank") {
    return {
      outcome: "bank",
      made: true,
      boardHit: true,
      segments: [
        buildShotSegment(
          scene.release,
          {
            x: scene.backboard.impactX,
            y: scene.hoop.y - scene.hoop.rimRadius * 0.92
          },
          arcLift,
          sway + scene.hoop.rimRadius * 0.32,
          760 + hoopState.powerValue * 120
        ),
        buildShotSegment(
          {
            x: scene.backboard.impactX,
            y: scene.hoop.y - scene.hoop.rimRadius * 0.92
          },
          {
            x: scene.hoop.x - scene.hoop.rimRadius * 0.14,
            y: scene.hoop.y + scene.ballRadius * 0.24
          },
          scene.hoop.rimRadius * 1.15,
          -scene.hoop.rimRadius * 0.5,
          360
        )
      ]
    };
  }

  if (type === "boardMiss") {
    const impactPoint = {
      x: scene.backboard.impactX,
      y: scene.hoop.y - scene.hoop.rimRadius * (1.12 + clamp(powerOffset * 2.1, -0.2, 0.55))
    };

    return {
      outcome: "boardMiss",
      made: false,
      boardHit: true,
      segments: [
        buildShotSegment(
          scene.release,
          impactPoint,
          arcLift,
          sway + scene.hoop.rimRadius * 0.3,
          760 + hoopState.powerValue * 90
        ),
        buildShotSegment(
          impactPoint,
          {
            x: scene.hoop.x - scene.hoop.rimRadius * 0.9,
            y: scene.hoop.y + scene.hoop.rimRadius * 1.8
          },
          scene.hoop.rimRadius * 0.55,
          -scene.hoop.rimRadius * 0.9,
          420
        )
      ]
    };
  }

  if (type === "short") {
    return {
      outcome: "short",
      made: false,
      boardHit: false,
      segments: [
        buildShotSegment(
          scene.release,
          {
            x: scene.hoop.x - scene.hoop.rimRadius * 0.72,
            y: scene.hoop.y + scene.hoop.rimRadius * 2.1
          },
          scene.height * (0.25 + hoopState.powerValue * 0.05),
          sway * 0.65,
          1020
        )
      ]
    };
  }

  if (type === "left") {
    return {
      outcome: "left",
      made: false,
      boardHit: false,
      segments: [
        buildShotSegment(
          scene.release,
          {
            x: scene.hoop.x - scene.hoop.rimRadius * (2.3 + Math.abs(aimOffset) * 2.4),
            y: scene.hoop.y + scene.hoop.rimRadius * 0.58
          },
          arcLift,
          sway - scene.hoop.rimRadius * 0.65,
          1080
        )
      ]
    };
  }

  return {
    outcome: "long",
    made: false,
    boardHit: false,
    segments: [
      buildShotSegment(
        scene.release,
        {
          x: scene.hoop.x + scene.hoop.rimRadius * 1.45,
          y: scene.hoop.y - scene.hoop.rimRadius * 0.08
        },
        arcLift + scene.hoop.rimRadius * 0.4,
        sway * 0.75,
        1080 + hoopState.powerValue * 120
      )
    ]
  };
}

function launchHoopShot() {
  const scene = getHoopScene();
  const shotPlan = planHoopShot(scene);
  const now = performance.now();
  let boardImpactAt = null;
  let totalDuration = 0;

  shotPlan.segments.forEach((segment, index) => {
    totalDuration += segment.duration;
    if (shotPlan.boardHit && index === 0) {
      boardImpactAt = totalDuration;
    }
  });

  hoopState.shot = {
    outcome: shotPlan.outcome,
    made: shotPlan.made,
    boardHit: shotPlan.boardHit,
    startTime: now,
    totalDuration,
    boardImpactAt,
    segments: shotPlan.segments
  };

  hoopState.mode = "shot";
  setHoopStatus("Shot launched.");
  updateHoopHud();
}

function finishHoopShot() {
  if (!hoopState.shot) {
    return;
  }

  hoopState.attempts += 1;
  hoopState.flashUntil = performance.now() + 220;

  if (hoopState.shot.made) {
    hoopState.score += 1;
    hoopState.streak += 1;
  } else {
    hoopState.streak = 0;
  }

  if (hoopState.streak > hoopState.best) {
    hoopState.best = hoopState.streak;
    saveHoopBest();
  }

  hoopState.mode = "reset";
  setHoopStatus(hoopState.shot.made ? "Swish. New round loading." : "Miss. New round loading.");
  updateHoopHud();

  clearHoopQueueTimer();
  hoopState.queueTimer = window.setTimeout(() => {
    beginHoopRound(false);
  }, 950);
}

function handleHoopStagePress() {
  if (hoopState.mode === "menu") {
    beginHoopRound(true);
    return;
  }

  if (hoopState.mode === "aim") {
    hoopState.mode = "power";
    setHoopStatus("Power meter live. Click to shoot.");
    updateHoopHud();
    return;
  }

  if (hoopState.mode === "power") {
    launchHoopShot();
  }
}

function setCanvasSize() {
  const wrap = hoopCanvas.parentElement;
  if (!wrap) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(wrap.clientWidth));
  const height = Math.max(340, Math.floor(wrap.clientHeight));
  hoopCanvas.width = Math.floor(width * dpr);
  hoopCanvas.height = Math.floor(height * dpr);
  const ctx = hoopCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getArcPoint(segment, progress) {
  const eased = easeInOutSine(progress);
  const lift = 4 * progress * (1 - progress);
  return {
    x: lerp(segment.start.x, segment.end.x, eased) + segment.sway * Math.sin(Math.PI * progress),
    y: lerp(segment.start.y, segment.end.y, eased) - segment.height * lift
  };
}

function getShotStateAt(now) {
  if (!hoopState.shot) {
    return null;
  }

  const elapsed = now - hoopState.shot.startTime;
  let consumed = 0;

  for (let index = 0; index < hoopState.shot.segments.length; index += 1) {
    const segment = hoopState.shot.segments[index];
    const segmentEnd = consumed + segment.duration;

    if (elapsed <= segmentEnd || index === hoopState.shot.segments.length - 1) {
      const segmentProgress = clamp((elapsed - consumed) / segment.duration, 0, 1);
      return {
        done: elapsed >= hoopState.shot.totalDuration,
        segmentIndex: index,
        progress: clamp(elapsed / hoopState.shot.totalDuration, 0, 1),
        point: getArcPoint(segment, segmentProgress)
      };
    }

    consumed = segmentEnd;
  }

  return {
    done: true,
    segmentIndex: hoopState.shot.segments.length - 1,
    progress: 1,
    point: getArcPoint(hoopState.shot.segments[hoopState.shot.segments.length - 1], 1)
  };
}

function drawHoopScene(now) {
  const ctx = hoopCanvas.getContext("2d");
  const scene = getHoopScene();
  const { width, height } = scene;

  ctx.clearRect(0, 0, width, height);

  const courtGradient = ctx.createLinearGradient(0, 0, width, height);
  courtGradient.addColorStop(0, "rgba(14, 20, 24, 0.96)");
  courtGradient.addColorStop(1, "rgba(22, 16, 6, 0.96)");
  ctx.fillStyle = courtGradient;
  drawRoundedRect(ctx, 0, 0, width, height, 28);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 212, 0, 0.04)";
  for (let stripe = 0; stripe < 9; stripe += 1) {
    ctx.fillRect((width / 8) * stripe, 0, 2, height);
  }

  ctx.strokeStyle = "rgba(255, 212, 0, 0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.08, scene.courtLineY);
  ctx.lineTo(width * 0.92, scene.courtLineY);
  ctx.stroke();

  const boardFlashActive = hoopState.shot?.boardHit
    && hoopState.shot.boardImpactAt
    && now >= hoopState.shot.startTime + hoopState.shot.boardImpactAt - 70
    && now <= hoopState.shot.startTime + hoopState.shot.boardImpactAt + 120;

  ctx.strokeStyle = boardFlashActive
    ? "rgba(255, 248, 196, 1)"
    : "rgba(255, 244, 182, 0.94)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(scene.backboard.x + scene.backboard.width * 0.45, scene.backboard.y - scene.hoop.rimRadius * 1.6);
  ctx.lineTo(scene.backboard.x + scene.backboard.width * 0.45, scene.hoop.y + scene.hoop.rimRadius * 0.7);
  ctx.stroke();

  ctx.fillStyle = boardFlashActive
    ? "rgba(255, 248, 224, 0.34)"
    : "rgba(255, 255, 255, 0.2)";
  drawRoundedRect(
    ctx,
    scene.backboard.x,
    scene.backboard.y,
    scene.backboard.width,
    scene.backboard.height,
    6
  );
  ctx.fill();

  ctx.strokeStyle = hoopState.flashUntil > now && hoopState.shot?.made
    ? "rgba(255, 240, 109, 1)"
    : "rgba(255, 156, 40, 0.96)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(scene.hoop.x, scene.hoop.y, scene.hoop.rimRadius, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 248, 218, 0.38)";
  ctx.lineWidth = 2;
  for (let net = -2; net <= 2; net += 1) {
    ctx.beginPath();
    ctx.moveTo(scene.hoop.x + net * (scene.hoop.rimRadius * 0.42), scene.hoop.y + 4);
    ctx.lineTo(scene.hoop.x + net * (scene.hoop.rimRadius * 0.2), scene.hoop.y + scene.hoop.rimRadius * 1.65);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 212, 0, 0.12)";
  drawRoundedRect(
    ctx,
    scene.shooter.x - scene.ballRadius * 2.4,
    scene.shooter.y - scene.ballRadius * 0.8,
    scene.ballRadius * 4.4,
    scene.ballRadius * 6,
    16
  );
  ctx.fill();

  ctx.fillStyle = "#f5eed7";
  ctx.beginPath();
  ctx.arc(scene.shooter.x, scene.shooter.y - scene.ballRadius * 1.52, scene.ballRadius * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f5eed7";
  ctx.beginPath();
  ctx.moveTo(scene.shooter.x, scene.shooter.y - scene.ballRadius * 0.74);
  ctx.lineTo(scene.shooter.x, scene.shooter.y + scene.ballRadius * 1.7);
  ctx.moveTo(scene.shooter.x - scene.ballRadius * 1.15, scene.shooter.y + scene.ballRadius * 0.3);
  ctx.lineTo(scene.release.x + scene.ballRadius * 0.16, scene.release.y + scene.ballRadius * 0.18);
  ctx.moveTo(scene.shooter.x, scene.shooter.y + scene.ballRadius * 1.7);
  ctx.lineTo(scene.shooter.x - scene.ballRadius * 1.1, scene.shooter.y + scene.ballRadius * 3.3);
  ctx.moveTo(scene.shooter.x, scene.shooter.y + scene.ballRadius * 1.7);
  ctx.lineTo(scene.shooter.x + scene.ballRadius * 0.95, scene.shooter.y + scene.ballRadius * 3.3);
  ctx.stroke();

  if (hoopState.mode === "aim" || hoopState.mode === "power") {
    const angle = -1.18 + hoopState.aimValue * 0.68;
    const lineLength = width * 0.34;
    ctx.strokeStyle = "rgba(255, 212, 0, 0.24)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(scene.release.x, scene.release.y);
    ctx.lineTo(
      scene.release.x + Math.cos(angle) * lineLength,
      scene.release.y + Math.sin(angle) * lineLength
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  let ball = { x: scene.release.x, y: scene.release.y };

  if (hoopState.shot) {
    const shotState = getShotStateAt(now);
    ball = shotState.point;

    if (shotState.done && hoopState.mode === "shot") {
      finishHoopShot();
    }
  }

  ctx.fillStyle = "rgba(255, 212, 0, 0.18)";
  ctx.beginPath();
  ctx.ellipse(ball.x, ball.y + scene.ballRadius * 1.1, scene.ballRadius * 1.05, scene.ballRadius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9d43";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, scene.ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(40, 18, 3, 0.82)";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, scene.ballRadius, 0, Math.PI * 2);
  ctx.moveTo(ball.x - scene.ballRadius * 0.82, ball.y);
  ctx.lineTo(ball.x + scene.ballRadius * 0.82, ball.y);
  ctx.moveTo(ball.x, ball.y - scene.ballRadius * 0.82);
  ctx.quadraticCurveTo(ball.x + scene.ballRadius * 0.28, ball.y, ball.x, ball.y + scene.ballRadius * 0.82);
  ctx.moveTo(ball.x, ball.y - scene.ballRadius * 0.82);
  ctx.quadraticCurveTo(ball.x - scene.ballRadius * 0.32, ball.y, ball.x, ball.y + scene.ballRadius * 0.82);
  ctx.stroke();

  if (hoopState.flashUntil > now) {
    ctx.fillStyle = hoopState.shot?.made
      ? "rgba(255, 240, 109, 0.14)"
      : "rgba(255, 108, 108, 0.12)";
    drawRoundedRect(ctx, 8, 8, width - 16, height - 16, 24);
    ctx.fill();
  }
}

function hoopLoop(now) {
  if (!hoopState.lastFrame) {
    hoopState.lastFrame = now;
  }

  const dt = Math.min(0.04, (now - hoopState.lastFrame) / 1000);
  hoopState.lastFrame = now;

  if (hoopState.mode === "aim") {
    hoopState.aimValue += dt * 0.62 * hoopState.aimDirection;
    if (hoopState.aimValue >= 1) {
      hoopState.aimValue = 1;
      hoopState.aimDirection = -1;
    } else if (hoopState.aimValue <= 0) {
      hoopState.aimValue = 0;
      hoopState.aimDirection = 1;
    }
    updateHoopHud();
  } else if (hoopState.mode === "power") {
    hoopState.powerValue += dt * 1.04 * hoopState.powerDirection;
    if (hoopState.powerValue >= 1) {
      hoopState.powerValue = 1;
      hoopState.powerDirection = -1;
    } else if (hoopState.powerValue <= 0) {
      hoopState.powerValue = 0;
      hoopState.powerDirection = 1;
    }
    updateHoopHud();
  }

  drawHoopScene(now);
  hoopState.rafId = window.requestAnimationFrame(hoopLoop);
}

function teardownHoop() {
  clearHoopQueueTimer();
  if (hoopState.rafId) {
    window.cancelAnimationFrame(hoopState.rafId);
    hoopState.rafId = 0;
  }
}

hoopStartButton?.addEventListener("click", () => beginHoopRound(true));
hoopIntroStart?.addEventListener("click", () => beginHoopRound(true));
hoopShell?.addEventListener("click", (event) => {
  if (event.target.closest(".overlay-box")) {
    return;
  }
  handleHoopStagePress();
});

window.addEventListener("resize", setCanvasSize);
window.addEventListener("beforeunload", teardownHoop);

setCanvasSize();
updateHoopHud();
showHoopIntro();
setHoopStatus("Hoop Rush ready.");
hoopState.rafId = window.requestAnimationFrame(hoopLoop);

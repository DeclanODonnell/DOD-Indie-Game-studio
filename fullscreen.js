(() => {
  const roots = Array.from(document.querySelectorAll("[data-fullscreen-root]"));
  const buttons = Array.from(document.querySelectorAll("[data-fullscreen-button]"));

  if (!roots.length || !buttons.length) {
    return;
  }

  const getFullscreenElement = () =>
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null;

  const canRequestFullscreen = (element) =>
    Boolean(element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen);

  const canExitFullscreen = () =>
    Boolean(document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen);

  const isSupported = roots.some(canRequestFullscreen) && canExitFullscreen();

  if (!isSupported) {
    buttons.forEach((button) => {
      button.hidden = true;
      button.disabled = true;
    });
    return;
  }

  const requestFullscreen = (element) => {
    const method = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
    return method ? method.call(element) : Promise.reject(new Error("Fullscreen unavailable."));
  };

  const exitFullscreen = () => {
    const method = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    return method ? method.call(document) : Promise.resolve();
  };

  const isRootActive = (root) => {
    const activeElement = getFullscreenElement();
    return activeElement === root || root.contains(activeElement);
  };

  const syncState = () => {
    roots.forEach((root) => {
      root.classList.toggle("is-fullscreen", isRootActive(root));
    });

    buttons.forEach((button) => {
      const root = button.closest("[data-fullscreen-root]") || roots[0];
      const isActive = root ? isRootActive(root) : false;
      button.textContent = isActive ? "Exit Fullscreen" : "Fullscreen";
      button.setAttribute("aria-pressed", String(isActive));
    });

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const root = button.closest("[data-fullscreen-root]") || roots[0];

      try {
        if (root && isRootActive(root)) {
          await exitFullscreen();
        } else if (root) {
          await requestFullscreen(root);
        }
      } catch (error) {
        console.warn("Fullscreen toggle failed.", error);
      } finally {
        syncState();
      }
    });
  });

  ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach((eventName) => {
    document.addEventListener(eventName, syncState);
  });

  syncState();
})();

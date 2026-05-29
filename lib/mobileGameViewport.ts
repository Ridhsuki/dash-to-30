type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: (...args: unknown[]) => Promise<void> | void;
  msRequestFullscreen?: (...args: unknown[]) => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

const MOBILE_QUERY = "(max-width: 900px), (pointer: coarse), (hover: none)";

function getFullscreenElement() {
  const doc = document as FullscreenDocument;

  return (
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

function getRequestFullscreen(element: FullscreenElement) {
  return (
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.msRequestFullscreen
  );
}

function getExitFullscreen() {
  const doc = document as FullscreenDocument;

  return (
    document.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen
  );
}

function getScreenOrientation() {
  if (typeof screen === "undefined") return null;

  return screen.orientation as LockableScreenOrientation | undefined;
}

export function isMobileGameViewport() {
  if (typeof window === "undefined") return false;

  const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  const coarsePointer = window.matchMedia?.(MOBILE_QUERY).matches ?? false;

  return hasTouch && coarsePointer;
}

function setMobileGameClass(active: boolean) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dt30-mobile-game-active", active);
  document.body.classList.toggle("dt30-mobile-game-active", active);
}

export async function enterMobileGameViewport(target?: HTMLElement | null) {
  if (typeof window === "undefined") return;
  if (!isMobileGameViewport()) return;

  setMobileGameClass(true);

  const element = (target ||
    document.getElementById("dash-to-30-game-root") ||
    document.documentElement) as FullscreenElement;

  try {
    if (!getFullscreenElement()) {
      const requestFullscreen = getRequestFullscreen(element);

      if (requestFullscreen) {
        await Promise.resolve(
          requestFullscreen.call(element, {
            navigationUI: "hide",
          }),
        );
      }
    }
  } catch (error) {
    console.info("[DashTo30] Fullscreen request skipped:", error);
  }

  try {
    const orientation = getScreenOrientation();
    await orientation?.lock?.("landscape");
  } catch (error) {
    console.info("[DashTo30] Orientation lock skipped:", error);
  }
}

export async function exitMobileGameViewport() {
  if (typeof window === "undefined") return;
  if (!isMobileGameViewport()) return;

  setMobileGameClass(false);

  try {
    getScreenOrientation()?.unlock?.();
  } catch {
    // Ignore unsupported orientation unlock.
  }

  try {
    if (getFullscreenElement()) {
      const exitFullscreen = getExitFullscreen();

      if (exitFullscreen) {
        await Promise.resolve(exitFullscreen.call(document));
      }
    }
  } catch (error) {
    console.info("[DashTo30] Fullscreen exit skipped:", error);
  }
}

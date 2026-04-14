import type {
  CurrentValue,
  ResolvedAnimation,
  ScrollToOptions,
  StickToBottomAnimation,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

const DEFAULT_BOTTOM_OFFSET_PX = 70;
const SIXTY_FPS_INTERVAL_MS = 1000 / 60;
const WAIT_FOR_NEXT_FRAME_MS = Math.ceil(SIXTY_FPS_INTERVAL_MS);
const MIN_IDLE_FALLBACK_POLL_MS = 240;
const DETACHED_FALLBACK_POLL_MS = 1000;
const HIDDEN_FALLBACK_POLL_MS = 1500;
const LONG_IDLE_FALLBACK_POLL_MS = 480;
const MAX_IDLE_FALLBACK_POLL_MS = 960;
const ACTIVE_FALLBACK_POLL_WINDOW_MS = 1000;
const LONG_IDLE_FALLBACK_POLL_THRESHOLD_MS = 5000;
const MAX_IDLE_FALLBACK_POLL_THRESHOLD_MS = 15000;

export const RETAIN_ANIMATION_DURATION_MS = 350;

export const DEFAULT_SPRING_ANIMATION = {
  damping: 0.7,
  stiffness: 0.05,
  mass: 1.25,
} as const;

const animationCache = new Map<string, Readonly<Required<typeof DEFAULT_SPRING_ANIMATION>>>();

export function activateFallbackPolling(
  fallbackPollActiveUntilRef: CurrentValue<number>,
  optionsRef: CurrentValue<StickToBottomOptions>,
) {
  const intervalMs = optionsRef.current.fallbackPollInterval;

  if (intervalMs === false || intervalMs === undefined || intervalMs <= 0) {
    return;
  }

  fallbackPollActiveUntilRef.current =
    Date.now() + Math.max(intervalMs * 6, ACTIVE_FALLBACK_POLL_WINDOW_MS);
}

export function getBottomOffset(optionsRef: CurrentValue<StickToBottomOptions>) {
  return optionsRef.current.bottomOffset ?? DEFAULT_BOTTOM_OFFSET_PX;
}

export function resolveWaitDuration(wait: ScrollToOptions["wait"]) {
  if (wait === true) {
    return WAIT_FOR_NEXT_FRAME_MS;
  }

  if (typeof wait === "number" && Number.isFinite(wait) && wait > 0) {
    return wait;
  }

  return 0;
}

export function shouldRunFallbackPoll(state: StickToBottomState, activeUntil: number) {
  return !!state.animation || state.isNearBottom || state.isAtBottom || Date.now() < activeUntil;
}

export function getFallbackPollDelay(
  intervalMs: number,
  state: StickToBottomState,
  activeUntil: number,
  context: {
    hasScrollElement: boolean;
    isVisible: boolean;
  },
) {
  if (!context.hasScrollElement) {
    return Math.max(intervalMs * 8, DETACHED_FALLBACK_POLL_MS);
  }

  if (!context.isVisible) {
    return Math.max(intervalMs * 12, HIDDEN_FALLBACK_POLL_MS);
  }

  if (state.animation || state.isNearBottom || Date.now() < activeUntil) {
    return intervalMs;
  }

  const baseDelay = state.isAtBottom
    ? Math.max(intervalMs * 3, MIN_IDLE_FALLBACK_POLL_MS)
    : Math.max(intervalMs * 4, MIN_IDLE_FALLBACK_POLL_MS);
  const idleFor = activeUntil > 0 ? Math.max(Date.now() - activeUntil, 0) : 0;

  if (idleFor >= MAX_IDLE_FALLBACK_POLL_THRESHOLD_MS) {
    return Math.max(baseDelay * 4, MAX_IDLE_FALLBACK_POLL_MS);
  }

  if (idleFor >= LONG_IDLE_FALLBACK_POLL_THRESHOLD_MS) {
    return Math.max(baseDelay * 2, LONG_IDLE_FALLBACK_POLL_MS);
  }

  return baseDelay;
}

export function findNearestVerticalScrollable(element: HTMLElement | null) {
  let current = element;

  while (current) {
    const style = getComputedStyle(current);
    const overflowY = style.overflowY === "visible" ? style.overflow : style.overflowY;
    const scrollable =
      ["auto", "scroll", "overlay"].includes(overflowY) &&
      current.scrollHeight > current.clientHeight;

    if (scrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

export function mergeAnimations(
  ...animations: (StickToBottomAnimation | boolean | undefined)[]
): ResolvedAnimation {
  const result = { ...DEFAULT_SPRING_ANIMATION };
  let instant = false;

  for (const animation of animations) {
    if (animation === "instant") {
      instant = true;
      continue;
    }

    if (animation === "smooth") {
      instant = false;
      continue;
    }

    if (typeof animation !== "object") {
      continue;
    }

    instant = false;
    result.damping = animation.damping ?? result.damping;
    result.stiffness = animation.stiffness ?? result.stiffness;
    result.mass = animation.mass ?? result.mass;
  }

  const key = JSON.stringify(result);

  if (!animationCache.has(key)) {
    animationCache.set(key, Object.freeze(result));
  }

  return instant ? "instant" : animationCache.get(key)!;
}

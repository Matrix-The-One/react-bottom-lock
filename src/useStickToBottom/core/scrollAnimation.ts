import { mergeAnimations, resolveWaitDuration } from "./internal";
import type {
  AnimationState,
  CurrentValue,
  ScrollToOptions,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

const SIXTY_FPS_INTERVAL_MS = 1000 / 60;

interface ScrollAnimationRuntimeRefs {
  animationFrameRef: CurrentValue<number | null>;
  animationResolveRef: CurrentValue<((result: boolean) => void) | null>;
  animationRetainTokenRef: CurrentValue<number>;
  animationRetainUntilRef: CurrentValue<number>;
  animationWaitUntilRef: CurrentValue<number>;
}

interface StartScrollAnimationOptions {
  defaultDuration?: number | Promise<void>;
  edge: AnimationState["edge"];
  getTargetScrollTop: () => number | null;
  ignoreEscapesOnUserScroll?: boolean;
  isSelecting: () => boolean;
  onInvalidTarget?: () => void;
  optionsRef: CurrentValue<StickToBottomOptions>;
  resolveResult: () => boolean;
  runtimeRefs: ScrollAnimationRuntimeRefs;
  scrollOptions: ScrollToOptions;
  state: StickToBottomState;
  stopAnimation: (result?: boolean) => void;
}

export function startScrollAnimation({
  defaultDuration = 0,
  edge,
  getTargetScrollTop,
  ignoreEscapesOnUserScroll = false,
  isSelecting,
  onInvalidTarget,
  optionsRef,
  resolveResult,
  runtimeRefs,
  scrollOptions,
  state,
  stopAnimation,
}: StartScrollAnimationOptions) {
  const waitElapsed = Date.now() + resolveWaitDuration(scrollOptions.wait);
  const behavior = mergeAnimations(optionsRef.current, scrollOptions.animation);
  const ignoreEscapes = scrollOptions.ignoreEscapes ?? false;
  const retainDuration = scrollOptions.duration ?? defaultDuration;
  const shouldReuseAnimation =
    scrollOptions.wait === true &&
    state.animation?.behavior === behavior &&
    state.animation?.edge === edge;

  if (!shouldReuseAnimation) {
    stopAnimation(false);
  }

  runtimeRefs.animationWaitUntilRef.current = Math.max(
    runtimeRefs.animationWaitUntilRef.current,
    waitElapsed,
  );

  let animationPromise: Promise<boolean>;

  if (state.animation?.behavior === behavior && state.animation.edge === edge) {
    state.animation.ignoreEscapes ||= ignoreEscapes;
    animationPromise = state.animation.promise;
  } else {
    let resolvePromise!: (result: boolean) => void;

    animationPromise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });

    runtimeRefs.animationResolveRef.current = resolvePromise;
    state.animation = {
      behavior,
      edge,
      promise: animationPromise,
      ignoreEscapes,
    };

    const tick = (now: number) => {
      if (state.animation?.promise !== animationPromise) {
        return;
      }

      if (ignoreEscapesOnUserScroll && state.escapedFromLock && !state.animation.ignoreEscapes) {
        stopAnimation(false);
        return;
      }

      if (isSelecting() || Date.now() < runtimeRefs.animationWaitUntilRef.current) {
        runtimeRefs.animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const targetScrollTop = getTargetScrollTop();

      if (targetScrollTop === null) {
        stopAnimation(false);
        onInvalidTarget?.();
        return;
      }

      const diff = targetScrollTop - state.scrollTop;

      if (Math.abs(diff) <= 1) {
        state.scrollTop = targetScrollTop;

        if (Date.now() < runtimeRefs.animationRetainUntilRef.current) {
          runtimeRefs.animationFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        stopAnimation(resolveResult());
        return;
      }

      if (behavior === "instant") {
        state.scrollTop = targetScrollTop;
        runtimeRefs.animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const tickDelta = Math.max((now - (state.lastTick ?? now)) / SIXTY_FPS_INTERVAL_MS, 1);

      state.lastTick = now;
      state.velocity =
        (behavior.damping * state.velocity + behavior.stiffness * diff) / behavior.mass;

      const nextStep = Math.max(Math.abs(state.velocity * tickDelta), 1);
      const nextScrollTop = state.scrollTop + Math.sign(diff) * Math.min(Math.abs(diff), nextStep);

      state.scrollTop = nextScrollTop;
      runtimeRefs.animationFrameRef.current = requestAnimationFrame(tick);
    };

    runtimeRefs.animationFrameRef.current = requestAnimationFrame(tick);
  }

  const retainToken = runtimeRefs.animationRetainTokenRef.current + 1;
  runtimeRefs.animationRetainTokenRef.current = retainToken;

  if (retainDuration instanceof Promise) {
    runtimeRefs.animationRetainUntilRef.current = Number.POSITIVE_INFINITY;

    void retainDuration.finally(() => {
      if (
        runtimeRefs.animationRetainTokenRef.current === retainToken &&
        state.animation?.promise === animationPromise
      ) {
        runtimeRefs.animationRetainUntilRef.current = Date.now();
      }
    });
  } else {
    const previousRetainUntil = Number.isFinite(runtimeRefs.animationRetainUntilRef.current)
      ? runtimeRefs.animationRetainUntilRef.current
      : 0;

    runtimeRefs.animationRetainUntilRef.current = Math.max(
      previousRetainUntil,
      waitElapsed + retainDuration,
    );
  }

  return animationPromise;
}

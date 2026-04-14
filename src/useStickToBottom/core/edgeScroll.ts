import { getBottomOffset } from "./internal";
import { startScrollAnimation } from "./scrollAnimation";
import type {
  CurrentValue,
  ScrollToEdge,
  ScrollToOptions,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

interface ScrollRuntimeRefs {
  animationFrameRef: CurrentValue<number | null>;
  animationResolveRef: CurrentValue<((result: boolean) => void) | null>;
  animationRetainTokenRef: CurrentValue<number>;
  animationRetainUntilRef: CurrentValue<number>;
  animationWaitUntilRef: CurrentValue<number>;
}

interface ScrollHelperOptions {
  isSelecting: () => boolean;
  optionsRef: CurrentValue<StickToBottomOptions>;
  runtimeRefs: ScrollRuntimeRefs;
  state: StickToBottomState;
  stopAnimation: (result?: boolean) => void;
}

interface ScrollToBottomHelperOptions extends ScrollHelperOptions {
  normalizeScrollOptions: (optionsOrBehavior?: Parameters<ScrollToEdge>[0]) => ScrollToOptions;
  optionsOrBehavior?: Parameters<ScrollToEdge>[0];
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
}

interface ScrollToTopHelperOptions extends ScrollHelperOptions {
  normalizeScrollOptions: (optionsOrBehavior?: Parameters<ScrollToEdge>[0]) => ScrollToOptions;
  optionsOrBehavior?: Parameters<ScrollToEdge>[0];
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  setIsNearBottom: (next: boolean) => void;
}

interface StopScrollHelperOptions {
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  stopAnimation: (result?: boolean) => void;
}

export function normalizeScrollOptions(
  optionsOrBehavior: Parameters<ScrollToEdge>[0] = {},
): ScrollToOptions {
  return typeof optionsOrBehavior === "string"
    ? ({ animation: optionsOrBehavior } satisfies ScrollToOptions)
    : optionsOrBehavior;
}

export function scrollToBottomHelper({
  isSelecting,
  normalizeScrollOptions,
  optionsOrBehavior = {},
  optionsRef,
  runtimeRefs,
  setEscapedFromLock,
  setIsAtBottom,
  state,
  stopAnimation,
}: ScrollToBottomHelperOptions) {
  const scrollOptions = normalizeScrollOptions(optionsOrBehavior);

  if (!scrollOptions.preserveScrollPosition) {
    setEscapedFromLock(false);
    setIsAtBottom(true);
  }

  return startScrollAnimation({
    defaultDuration: optionsRef.current.retainAnimationMs ?? 0,
    edge: "bottom",
    getTargetScrollTop: () => state.calculatedTargetScrollTop,
    ignoreEscapesOnUserScroll: true,
    isSelecting,
    optionsRef,
    resolveResult: () => !state.escapedFromLock,
    runtimeRefs,
    scrollOptions,
    state,
    stopAnimation,
  });
}

export function scrollToTopHelper({
  isSelecting,
  normalizeScrollOptions,
  optionsOrBehavior = {},
  optionsRef,
  runtimeRefs,
  setEscapedFromLock,
  setIsAtBottom,
  setIsNearBottom,
  state,
  stopAnimation,
}: ScrollToTopHelperOptions) {
  const scrollOptions = normalizeScrollOptions(optionsOrBehavior);

  if (!scrollOptions.preserveScrollPosition) {
    const isTopWithinBottomOffset = state.targetScrollTop <= getBottomOffset(optionsRef);

    setEscapedFromLock(!isTopWithinBottomOffset);
    setIsAtBottom(isTopWithinBottomOffset);
    setIsNearBottom(isTopWithinBottomOffset);
  }

  return startScrollAnimation({
    edge: "top",
    getTargetScrollTop: () => 0,
    isSelecting,
    optionsRef,
    resolveResult: () => true,
    runtimeRefs,
    scrollOptions,
    state,
    stopAnimation,
  });
}

export function stopScrollHelper({
  setEscapedFromLock,
  setIsAtBottom,
  stopAnimation,
}: StopScrollHelperOptions) {
  stopAnimation(false);
  setEscapedFromLock(true);
  setIsAtBottom(false);
}

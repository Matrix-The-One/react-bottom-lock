import { getBottomOffset, mergeAnimations, RETAIN_ANIMATION_DURATION_MS } from "./internal";
import type {
  CurrentValue,
  ScrollToEdge,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

interface ApplyMeasuredScrollMetricsOptions {
  contentHeight: number;
  lastViewportHeightRef: CurrentValue<number | undefined>;
  markFallbackPollActive: () => void;
  optionsRef: CurrentValue<StickToBottomOptions>;
  scheduleResizeDifferenceReset: (difference: number) => void;
  scrollToBottom: ScrollToEdge;
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  setIsNearBottom: (next: boolean) => void;
  state: StickToBottomState;
  viewportHeight: number;
}

interface MeasureContentHeightOptions {
  contentElementRef: CurrentValue<HTMLElement | null>;
  pendingMeasuredHeightRef: CurrentValue<number | null>;
  scrollElement: HTMLElement;
}

export function applyMeasuredMetrics({
  contentHeight,
  lastViewportHeightRef,
  markFallbackPollActive,
  optionsRef,
  scheduleResizeDifferenceReset,
  scrollToBottom,
  setEscapedFromLock,
  setIsAtBottom,
  setIsNearBottom,
  state,
  viewportHeight,
}: ApplyMeasuredScrollMetricsOptions) {
  const previousHeight = state.lastContentHeight;
  const previousViewportHeight = lastViewportHeightRef.current;
  const isAnimatingToTop = state.animation?.edge === "top";

  if (previousHeight === contentHeight && previousViewportHeight === viewportHeight) {
    return;
  }

  lastViewportHeightRef.current = viewportHeight;

  const difference = contentHeight - (previousHeight ?? contentHeight);
  state.lastContentHeight = contentHeight;
  state.resizeDifference = difference;
  markFallbackPollActive();

  if (state.scrollTop > state.targetScrollTop) {
    state.scrollTop = state.targetScrollTop;
  }

  setIsNearBottom(state.scrollDifference <= getBottomOffset(optionsRef));

  const isInitialMeasure = previousHeight === undefined;
  const shouldKeepInitialLock = optionsRef.current.initial !== false;

  if (difference >= 0 && !state.escapedFromLock && (!isInitialMeasure || shouldKeepInitialLock)) {
    const animation = mergeAnimations(
      optionsRef.current,
      isInitialMeasure ? optionsRef.current.initial : optionsRef.current.resize,
    );

    void scrollToBottom({
      animation,
      wait: true,
      preserveScrollPosition: true,
      duration:
        animation === "instant"
          ? undefined
          : (optionsRef.current.retainAnimationMs ?? RETAIN_ANIMATION_DURATION_MS),
    });
  } else if (!isAnimatingToTop && state.scrollDifference <= getBottomOffset(optionsRef)) {
    setEscapedFromLock(false);
    setIsAtBottom(true);
  }

  scheduleResizeDifferenceReset(difference);
}

export function measureContentHeight({
  contentElementRef,
  pendingMeasuredHeightRef,
  scrollElement,
}: MeasureContentHeightOptions) {
  return Math.max(
    pendingMeasuredHeightRef.current ?? 0,
    scrollElement.scrollHeight,
    contentElementRef.current?.scrollHeight ?? 0,
    Math.ceil(contentElementRef.current?.getBoundingClientRect().height ?? 0),
  );
}

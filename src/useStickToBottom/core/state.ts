import type { CurrentValue, StickToBottomOptions, StickToBottomState } from "../types";

export interface TargetScrollCalculation {
  targetScrollTop: number;
  calculatedScrollTop: number;
}

interface CreateStickToBottomStateOptions {
  escapedFromLock: boolean;
  isAtBottom: boolean;
  isNearBottom: boolean;
  lastCalculationRef: CurrentValue<TargetScrollCalculation | undefined>;
  optionsRef: CurrentValue<StickToBottomOptions>;
  scrollElementRef: CurrentValue<HTMLElement | null>;
}

export function createStickToBottomState({
  escapedFromLock,
  isAtBottom,
  isNearBottom,
  lastCalculationRef,
  optionsRef,
  scrollElementRef,
}: CreateStickToBottomStateOptions): StickToBottomState {
  const state: StickToBottomState = {
    resizeDifference: 0,
    accumulated: 0,
    velocity: 0,
    escapedFromLock,
    isAtBottom,
    isNearBottom,

    get scrollTop() {
      return scrollElementRef.current?.scrollTop ?? 0;
    },
    set scrollTop(scrollTop: number) {
      const scrollElement = scrollElementRef.current;

      if (!scrollElement) {
        return;
      }

      scrollElement.scrollTop = scrollTop;
      state.ignoreScrollToTop = scrollElement.scrollTop;
    },

    get targetScrollTop() {
      const scrollElement = scrollElementRef.current;

      if (!scrollElement) {
        return 0;
      }

      return Math.max(scrollElement.scrollHeight - 1 - scrollElement.clientHeight, 0);
    },
    get calculatedTargetScrollTop() {
      const scrollElement = scrollElementRef.current;

      if (!scrollElement) {
        return 0;
      }

      const targetScrollTop = state.targetScrollTop;
      const getTargetScrollTop = optionsRef.current.targetScrollTop;

      if (!getTargetScrollTop) {
        return targetScrollTop;
      }

      const lastCalculation = lastCalculationRef.current;

      if (lastCalculation && lastCalculation.targetScrollTop === targetScrollTop) {
        return lastCalculation.calculatedScrollTop;
      }

      const calculatedScrollTop = Math.max(
        Math.min(getTargetScrollTop(targetScrollTop, { scrollElement }), targetScrollTop),
        0,
      );

      lastCalculationRef.current = { targetScrollTop, calculatedScrollTop };

      requestAnimationFrame(() => {
        lastCalculationRef.current = undefined;
      });

      return calculatedScrollTop;
    },
    get scrollDifference() {
      return state.calculatedTargetScrollTop - state.scrollTop;
    },
  };

  return state;
}

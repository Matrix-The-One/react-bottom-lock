import { getBottomOffset } from "./internal";
import type {
  CurrentValue,
  PendingScrollEvaluation,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

interface FlushPendingScrollEvaluationOptions {
  isSelecting: () => boolean;
  lastWheelAtRef: CurrentValue<number>;
  lastWheelDirectionRef: CurrentValue<-1 | 0 | 1>;
  optionsRef: CurrentValue<StickToBottomOptions>;
  pendingScrollEvaluationRef: CurrentValue<PendingScrollEvaluation | null>;
  pointerInteractingRef: CurrentValue<boolean>;
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  state: StickToBottomState;
}

export function evaluatePendingScroll({
  isSelecting,
  lastWheelAtRef,
  lastWheelDirectionRef,
  optionsRef,
  pendingScrollEvaluationRef,
  pointerInteractingRef,
  setEscapedFromLock,
  setIsAtBottom,
  state,
}: FlushPendingScrollEvaluationOptions) {
  const pendingEvaluation = pendingScrollEvaluationRef.current;
  pendingScrollEvaluationRef.current = null;

  if (!pendingEvaluation) {
    return;
  }

  const { scrollTop, ignoreScrollToTop } = pendingEvaluation;
  let { previousScrollTop } = pendingEvaluation;
  const isIgnoredProgrammaticScroll =
    ignoreScrollToTop !== undefined && Math.abs(scrollTop - ignoreScrollToTop) <= 1;

  if (isIgnoredProgrammaticScroll) {
    return;
  }

  if (ignoreScrollToTop !== undefined && ignoreScrollToTop > scrollTop + 1) {
    previousScrollTop = ignoreScrollToTop;
  }

  if (isSelecting()) {
    setEscapedFromLock(true);
    setIsAtBottom(false);
    return;
  }

  if (state.resizeDifference) {
    return;
  }

  const bottomOffset = getBottomOffset(optionsRef);
  const isScrollingDown = scrollTop > previousScrollTop;
  const isScrollingUp = scrollTop < previousScrollTop;
  const wheelDirection =
    Date.now() - lastWheelAtRef.current < 150 ? lastWheelDirectionRef.current : 0;
  const isWithinBottomOffset = state.scrollDifference <= bottomOffset;

  if (state.animation?.ignoreEscapes) {
    state.scrollTop = previousScrollTop;
    return;
  }

  if (isWithinBottomOffset) {
    setEscapedFromLock(false);
    setIsAtBottom(true);
    return;
  }

  if (
    isScrollingUp &&
    (pointerInteractingRef.current || wheelDirection < 0 || wheelDirection === 0)
  ) {
    setEscapedFromLock(true);
  }

  if (isScrollingDown || isScrollingUp || state.isAtBottom) {
    setIsAtBottom(false);
  }
}

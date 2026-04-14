import { findNearestVerticalScrollable, getBottomOffset } from "./internal";
import type {
  CurrentValue,
  PendingScrollEvaluation,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

interface QueuePendingScrollEvaluationOptions {
  eventTarget: EventTarget | null;
  flushPendingScrollEvaluation: () => void;
  optionsRef: CurrentValue<StickToBottomOptions>;
  pendingScrollEvaluationRef: CurrentValue<PendingScrollEvaluation | null>;
  scrollElementRef: CurrentValue<HTMLElement | null>;
  scrollEvaluationFrameRef: CurrentValue<number | null>;
  setIsNearBottom: (next: boolean) => void;
  state: StickToBottomState;
}

interface HandleWheelInteractionOptions {
  event: WheelEvent;
  lastWheelAtRef: CurrentValue<number>;
  lastWheelDirectionRef: CurrentValue<-1 | 0 | 1>;
  scrollElementRef: CurrentValue<HTMLElement | null>;
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  state: StickToBottomState;
}

interface HandlePointerDownOptions {
  event: PointerEvent;
  pointerInteractingRef: CurrentValue<boolean>;
  scrollElementRef: CurrentValue<HTMLElement | null>;
}

export function queuePendingScrollEvaluation({
  eventTarget,
  flushPendingScrollEvaluation,
  optionsRef,
  pendingScrollEvaluationRef,
  scrollElementRef,
  scrollEvaluationFrameRef,
  setIsNearBottom,
  state,
}: QueuePendingScrollEvaluationOptions) {
  if (eventTarget !== scrollElementRef.current) {
    return;
  }

  const { scrollTop, ignoreScrollToTop } = state;
  const previousScrollTop = state.lastScrollTop ?? scrollTop;

  state.lastScrollTop = scrollTop;
  state.ignoreScrollToTop = undefined;
  setIsNearBottom(state.scrollDifference <= getBottomOffset(optionsRef));

  pendingScrollEvaluationRef.current = {
    scrollTop,
    previousScrollTop,
    ignoreScrollToTop,
  };

  if (scrollEvaluationFrameRef.current === null) {
    scrollEvaluationFrameRef.current = requestAnimationFrame(flushPendingScrollEvaluation);
  }
}

export function handleWheelInteraction({
  event,
  lastWheelAtRef,
  lastWheelDirectionRef,
  scrollElementRef,
  setEscapedFromLock,
  setIsAtBottom,
  state,
}: HandleWheelInteractionOptions) {
  const scrollElement = scrollElementRef.current;

  if (!scrollElement) {
    return;
  }

  const nearestScrollable = findNearestVerticalScrollable(event.target as HTMLElement | null);

  if (
    nearestScrollable !== scrollElement ||
    event.deltaY === 0 ||
    scrollElement.scrollHeight <= scrollElement.clientHeight
  ) {
    return;
  }

  lastWheelAtRef.current = Date.now();
  lastWheelDirectionRef.current = event.deltaY < 0 ? -1 : 1;

  if (event.deltaY < 0 && !state.animation?.ignoreEscapes) {
    setEscapedFromLock(true);
    setIsAtBottom(false);
  }
}

export function handlePointerDownInteraction({
  event,
  pointerInteractingRef,
  scrollElementRef,
}: HandlePointerDownOptions) {
  const scrollElement = scrollElementRef.current;

  if (!scrollElement) {
    return;
  }

  if (findNearestVerticalScrollable(event.target as HTMLElement | null) === scrollElement) {
    pointerInteractingRef.current = true;
  }
}

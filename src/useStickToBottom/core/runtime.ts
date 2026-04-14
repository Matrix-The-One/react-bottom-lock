import type {
  CurrentValue,
  PendingScrollEvaluation,
  StickToBottomOptions,
  StickToBottomState,
} from "../types";

interface LastCalculation {
  targetScrollTop: number;
  calculatedScrollTop: number;
}

interface CancelResizeDifferenceResetOptions {
  resizeDifferenceResetFrameRef: CurrentValue<number | null>;
  resizeDifferenceResetTailFrameRef: CurrentValue<number | null>;
}

interface CancelPendingScrollEvaluationOptions {
  pendingScrollEvaluationRef: CurrentValue<PendingScrollEvaluation | null>;
  scrollEvaluationFrameRef: CurrentValue<number | null>;
}

interface StopRuntimeAnimationOptions {
  animationFrameRef: CurrentValue<number | null>;
  animationResolveRef: CurrentValue<((result: boolean) => void) | null>;
  animationRetainTokenRef: CurrentValue<number>;
  animationRetainUntilRef: CurrentValue<number>;
  animationWaitUntilRef: CurrentValue<number>;
  state: StickToBottomState;
}

interface ResetObservedStateOptions {
  cancelPendingScrollEvaluation: () => void;
  cancelResizeDifferenceReset: () => void;
  fallbackPollActiveUntilRef: CurrentValue<number>;
  lastCalculationRef: CurrentValue<LastCalculation | undefined>;
  lastViewportHeightRef: CurrentValue<number | undefined>;
  lastWheelAtRef: CurrentValue<number>;
  lastWheelDirectionRef: CurrentValue<-1 | 0 | 1>;
  measurementFrameRef: CurrentValue<number | null>;
  optionsRef: CurrentValue<StickToBottomOptions>;
  pendingMeasuredHeightRef: CurrentValue<number | null>;
  pointerInteractingRef: CurrentValue<boolean>;
  setEscapedFromLock: (next: boolean) => void;
  setIsAtBottom: (next: boolean) => void;
  setIsNearBottom: (next: boolean) => void;
  state: StickToBottomState;
  stopAnimation: (result?: boolean) => void;
}

interface ScheduleResizeDifferenceResetOptions extends CancelResizeDifferenceResetOptions {
  cancelResizeDifferenceReset: () => void;
  state: StickToBottomState;
}

export function clearResizeDifferenceReset({
  resizeDifferenceResetFrameRef,
  resizeDifferenceResetTailFrameRef,
}: CancelResizeDifferenceResetOptions) {
  if (resizeDifferenceResetFrameRef.current !== null) {
    cancelAnimationFrame(resizeDifferenceResetFrameRef.current);
    resizeDifferenceResetFrameRef.current = null;
  }

  if (resizeDifferenceResetTailFrameRef.current !== null) {
    cancelAnimationFrame(resizeDifferenceResetTailFrameRef.current);
    resizeDifferenceResetTailFrameRef.current = null;
  }
}

export function clearPendingScrollEvaluation({
  pendingScrollEvaluationRef,
  scrollEvaluationFrameRef,
}: CancelPendingScrollEvaluationOptions) {
  if (scrollEvaluationFrameRef.current !== null) {
    cancelAnimationFrame(scrollEvaluationFrameRef.current);
    scrollEvaluationFrameRef.current = null;
  }

  pendingScrollEvaluationRef.current = null;
}

export function stopRuntimeAnimation(
  {
    animationFrameRef,
    animationResolveRef,
    animationRetainTokenRef,
    animationRetainUntilRef,
    animationWaitUntilRef,
    state,
  }: StopRuntimeAnimationOptions,
  result?: boolean,
) {
  if (animationFrameRef.current !== null) {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }

  state.animation = undefined;
  state.lastTick = undefined;
  state.velocity = 0;
  state.accumulated = 0;
  animationWaitUntilRef.current = 0;
  animationRetainUntilRef.current = 0;
  animationRetainTokenRef.current += 1;

  if (result !== undefined && animationResolveRef.current) {
    const resolve = animationResolveRef.current;
    animationResolveRef.current = null;
    resolve(result);
  } else if (result === undefined) {
    animationResolveRef.current = null;
  }
}

export function resetObservedRuntimeState({
  cancelPendingScrollEvaluation,
  cancelResizeDifferenceReset,
  fallbackPollActiveUntilRef,
  lastCalculationRef,
  lastViewportHeightRef,
  lastWheelAtRef,
  lastWheelDirectionRef,
  measurementFrameRef,
  optionsRef,
  pendingMeasuredHeightRef,
  pointerInteractingRef,
  setEscapedFromLock,
  setIsAtBottom,
  setIsNearBottom,
  state,
  stopAnimation,
}: ResetObservedStateOptions) {
  stopAnimation(false);
  cancelResizeDifferenceReset();
  cancelPendingScrollEvaluation();

  if (measurementFrameRef.current !== null) {
    cancelAnimationFrame(measurementFrameRef.current);
    measurementFrameRef.current = null;
  }

  lastCalculationRef.current = undefined;
  pendingMeasuredHeightRef.current = null;
  lastViewportHeightRef.current = undefined;
  fallbackPollActiveUntilRef.current = 0;
  pointerInteractingRef.current = false;
  lastWheelDirectionRef.current = 0;
  lastWheelAtRef.current = 0;

  state.lastContentHeight = undefined;
  state.lastScrollTop = undefined;
  state.ignoreScrollToTop = undefined;
  state.resizeDifference = 0;
  state.lastTick = undefined;

  setEscapedFromLock(false);
  setIsAtBottom(optionsRef.current.initial !== false);
  setIsNearBottom(false);
}

export function queueResizeDifferenceReset(
  {
    cancelResizeDifferenceReset,
    resizeDifferenceResetFrameRef,
    resizeDifferenceResetTailFrameRef,
    state,
  }: ScheduleResizeDifferenceResetOptions,
  difference: number,
) {
  cancelResizeDifferenceReset();
  resizeDifferenceResetFrameRef.current = requestAnimationFrame(() => {
    resizeDifferenceResetFrameRef.current = null;
    resizeDifferenceResetTailFrameRef.current = requestAnimationFrame(() => {
      resizeDifferenceResetTailFrameRef.current = null;

      if (state.resizeDifference === difference) {
        state.resizeDifference = 0;
      }
    });
  });
}

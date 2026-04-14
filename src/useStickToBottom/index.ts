import { useCallback, useRef, useState } from "react";
import type { RefCallback } from "react";
import { bindContentElement, bindScrollElement } from "./core/bindings";
import {
  normalizeScrollOptions,
  scrollToBottomHelper,
  scrollToTopHelper,
  stopScrollHelper,
} from "./core/edgeScroll";
import {
  useAdaptiveFallbackPolling,
  useDocumentMouseState,
  usePointerInteractionCleanup,
  useVisibilityMeasurementRefresh,
} from "./core/effects";
import {
  handlePointerDownInteraction,
  handleWheelInteraction,
  queuePendingScrollEvaluation,
} from "./core/interactions";
import { activateFallbackPolling } from "./core/internal";
import { applyMeasuredMetrics, measureContentHeight } from "./core/measurement";
import {
  clearPendingScrollEvaluation,
  clearResizeDifferenceReset,
  queueResizeDifferenceReset,
  resetObservedRuntimeState,
  stopRuntimeAnimation,
} from "./core/runtime";
import { evaluatePendingScroll } from "./core/scrollEvaluation";
import { createStickToBottomState } from "./core/state";
import type {
  PendingScrollEvaluation,
  ScrollToEdge,
  StickToBottomOptions,
  StickToBottomResult,
  StickToBottomState,
} from "./types";
import type { TargetScrollCalculation } from "./core/state";

export type {
  ScrollContext,
  ScrollToEdge,
  ScrollToOptions,
  SpringAnimation,
  StickToBottomAnimation,
  StickToBottomOptions,
  StickToBottomResult,
  StickToBottomState,
} from "./types";

export function useStickToBottom(options: StickToBottomOptions = {}): StickToBottomResult {
  const [escapedFromLock, setEscapedFromLockState] = useState(false);
  const [isAtBottom, setIsAtBottomState] = useState(options.initial !== false);
  const [isNearBottom, setIsNearBottomState] = useState(false);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const scrollElementRef = useRef<HTMLElement | null>(null);
  const contentElementRef = useRef<HTMLElement | null>(null);
  const lastBoundScrollElementRef = useRef<HTMLElement | null>(null);
  const lastScrollElementOverflowAnchorRef = useRef("");
  const lastBoundContentElementRef = useRef<HTMLElement | null>(null);
  const lastCalculationRef = useRef<TargetScrollCalculation | undefined>(undefined);
  const contentResizeObserverRef = useRef<ResizeObserver | null>(null);
  const viewportResizeObserverRef = useRef<ResizeObserver | null>(null);
  const pendingMeasuredHeightRef = useRef<number | null>(null);
  const measurementFrameRef = useRef<number | null>(null);
  const lastViewportHeightRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);
  const animationResolveRef = useRef<((result: boolean) => void) | null>(null);
  const resizeDifferenceResetFrameRef = useRef<number | null>(null);
  const resizeDifferenceResetTailFrameRef = useRef<number | null>(null);
  const scrollEvaluationFrameRef = useRef<number | null>(null);
  const pendingScrollEvaluationRef = useRef<PendingScrollEvaluation | null>(null);
  const animationWaitUntilRef = useRef(0);
  const animationRetainUntilRef = useRef(0);
  const animationRetainTokenRef = useRef(0);
  const fallbackPollActiveUntilRef = useRef(0);
  const pointerInteractingRef = useRef(false);
  const mouseDownRef = useRef(false);
  const lastWheelDirectionRef = useRef<-1 | 0 | 1>(0);
  const lastWheelAtRef = useRef(0);

  const stateRef = useRef<StickToBottomState | null>(null);

  if (!stateRef.current) {
    // Keep the scroll engine mutable without re-rendering on every frame.
    stateRef.current = createStickToBottomState({
      escapedFromLock,
      isAtBottom,
      isNearBottom,
      lastCalculationRef,
      optionsRef,
      scrollElementRef,
    });
  }

  const state = stateRef.current;

  const setEscapedFromLock = useCallback(
    (next: boolean) => {
      state.escapedFromLock = next;
      setEscapedFromLockState(next);
    },
    [state],
  );

  const setIsAtBottom = useCallback(
    (next: boolean) => {
      state.isAtBottom = next;
      setIsAtBottomState(next);
    },
    [state],
  );

  const setIsNearBottom = useCallback(
    (next: boolean) => {
      state.isNearBottom = next;
      setIsNearBottomState(next);
    },
    [state],
  );

  const cancelResizeDifferenceReset = useCallback(() => {
    clearResizeDifferenceReset({
      resizeDifferenceResetFrameRef,
      resizeDifferenceResetTailFrameRef,
    });
  }, []);

  const cancelPendingScrollEvaluation = useCallback(() => {
    clearPendingScrollEvaluation({
      pendingScrollEvaluationRef,
      scrollEvaluationFrameRef,
    });
  }, []);

  const isSelecting = useCallback(() => {
    const scrollElement = scrollElementRef.current;
    if (!mouseDownRef.current || !scrollElement) return false;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    return (
      range.commonAncestorContainer.contains(scrollElement) ||
      scrollElement.contains(range.commonAncestorContainer)
    );
  }, []);

  const stopAnimation = useCallback(
    (result?: boolean) => {
      stopRuntimeAnimation(
        {
          animationFrameRef,
          animationResolveRef,
          animationRetainTokenRef,
          animationRetainUntilRef,
          animationWaitUntilRef,
          state,
        },
        result,
      );
    },
    [state],
  );

  const resetObservedState = useCallback(() => {
    resetObservedRuntimeState({
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
    });
  }, [
    cancelPendingScrollEvaluation,
    cancelResizeDifferenceReset,
    setEscapedFromLock,
    setIsAtBottom,
    setIsNearBottom,
    state,
    stopAnimation,
  ]);

  const scheduleResizeDifferenceReset = useCallback(
    (difference: number) => {
      queueResizeDifferenceReset(
        {
          cancelResizeDifferenceReset,
          resizeDifferenceResetFrameRef,
          resizeDifferenceResetTailFrameRef,
          state,
        },
        difference,
      );
    },
    [cancelResizeDifferenceReset, state],
  );

  const markFallbackPollActive = useCallback(() => {
    activateFallbackPolling(fallbackPollActiveUntilRef, optionsRef);
  }, []);

  const scrollToBottom = useCallback<ScrollToEdge>(
    (optionsOrBehavior = {}) => {
      return scrollToBottomHelper({
        isSelecting,
        optionsOrBehavior,
        normalizeScrollOptions,
        optionsRef,
        runtimeRefs: {
          animationFrameRef,
          animationResolveRef,
          animationRetainTokenRef,
          animationRetainUntilRef,
          animationWaitUntilRef,
        },
        setEscapedFromLock,
        setIsAtBottom,
        state,
        stopAnimation,
      });
    },
    [isSelecting, optionsRef, setEscapedFromLock, setIsAtBottom, state, stopAnimation],
  );

  const scrollToTop = useCallback<ScrollToEdge>(
    (optionsOrBehavior = {}) => {
      return scrollToTopHelper({
        isSelecting,
        optionsOrBehavior,
        normalizeScrollOptions,
        optionsRef,
        runtimeRefs: {
          animationFrameRef,
          animationResolveRef,
          animationRetainTokenRef,
          animationRetainUntilRef,
          animationWaitUntilRef,
        },
        setEscapedFromLock,
        setIsAtBottom,
        setIsNearBottom,
        state,
        stopAnimation,
      });
    },
    [
      isSelecting,
      optionsRef,
      setEscapedFromLock,
      setIsAtBottom,
      setIsNearBottom,
      state,
      stopAnimation,
    ],
  );

  const stopScroll = useCallback(() => {
    stopScrollHelper({
      setEscapedFromLock,
      setIsAtBottom,
      stopAnimation,
    });
  }, [setEscapedFromLock, setIsAtBottom, stopAnimation]);

  const applyMeasuredScrollMetrics = useCallback(
    (contentHeight: number, viewportHeight: number) => {
      applyMeasuredMetrics({
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
      });
    },
    [
      markFallbackPollActive,
      scheduleResizeDifferenceReset,
      scrollToBottom,
      setEscapedFromLock,
      setIsAtBottom,
      setIsNearBottom,
      state,
    ],
  );

  const scheduleContentMeasurement = useCallback(
    (fallbackHeight?: number) => {
      if (fallbackHeight !== undefined) {
        pendingMeasuredHeightRef.current = Math.max(
          pendingMeasuredHeightRef.current ?? 0,
          fallbackHeight,
        );
      }

      if (measurementFrameRef.current !== null) {
        return;
      }

      measurementFrameRef.current = requestAnimationFrame(() => {
        // ResizeObserver callbacks and manual height notifications can arrive
        // out of order, so we collapse them into one frame-aligned measure.
        measurementFrameRef.current = null;

        const scrollElement = scrollElementRef.current;

        if (!scrollElement) {
          pendingMeasuredHeightRef.current = null;
          return;
        }

        const measuredHeight = measureContentHeight({
          contentElementRef,
          pendingMeasuredHeightRef,
          scrollElement,
        });

        pendingMeasuredHeightRef.current = null;
        applyMeasuredScrollMetrics(measuredHeight, scrollElement.clientHeight);
      });
    },
    [applyMeasuredScrollMetrics],
  );

  const measure = useCallback(() => {
    scheduleContentMeasurement();
  }, [scheduleContentMeasurement]);

  const flushPendingScrollEvaluation = useCallback(() => {
    scrollEvaluationFrameRef.current = null;
    evaluatePendingScroll({
      isSelecting,
      lastWheelAtRef,
      lastWheelDirectionRef,
      optionsRef,
      pendingScrollEvaluationRef,
      pointerInteractingRef,
      setEscapedFromLock,
      setIsAtBottom,
      state,
    });
  }, [isSelecting, optionsRef, setEscapedFromLock, setIsAtBottom, state]);

  const handleScroll = useCallback(
    ({ target }: Event) => {
      queuePendingScrollEvaluation({
        eventTarget: target,
        flushPendingScrollEvaluation,
        optionsRef,
        pendingScrollEvaluationRef,
        scrollElementRef,
        scrollEvaluationFrameRef,
        setIsNearBottom,
        state,
      });
    },
    [flushPendingScrollEvaluation, optionsRef, setIsNearBottom, state],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      handleWheelInteraction({
        event,
        lastWheelAtRef,
        lastWheelDirectionRef,
        scrollElementRef,
        setEscapedFromLock,
        setIsAtBottom,
        state,
      });
    },
    [setEscapedFromLock, setIsAtBottom, state],
  );

  const handlePointerDown = useCallback((event: PointerEvent) => {
    handlePointerDownInteraction({
      event,
      pointerInteractingRef,
      scrollElementRef,
    });
  }, []);

  const clearPointerInteraction = useCallback(() => {
    pointerInteractingRef.current = false;
  }, []);

  const attachScrollElement = useCallback<RefCallback<HTMLElement | null>>(
    (ref) => {
      bindScrollElement(ref instanceof HTMLElement ? ref : null, {
        handlePointerDown,
        handleScroll,
        handleWheel,
        lastBoundScrollElementRef,
        lastScrollElementOverflowAnchorRef,
        resetObservedState,
        scheduleContentMeasurement,
        scrollElementRef,
        viewportResizeObserverRef,
      });
    },
    [handlePointerDown, handleScroll, handleWheel, resetObservedState, scheduleContentMeasurement],
  );

  const contentRef = useCallback<RefCallback<HTMLElement | null>>(
    (element) => {
      bindContentElement(element, {
        contentElementRef,
        contentResizeObserverRef,
        lastBoundContentElementRef,
        resetObservedState,
        scheduleContentMeasurement,
      });
    },
    [resetObservedState, scheduleContentMeasurement],
  );

  const notifyContentHeight = useCallback(
    (height: number) => {
      scheduleContentMeasurement(height);
    },
    [scheduleContentMeasurement],
  );

  useDocumentMouseState(mouseDownRef);
  usePointerInteractionCleanup(clearPointerInteraction);
  useVisibilityMeasurementRefresh({
    fallbackPollInterval: options.fallbackPollInterval,
    markFallbackPollActive,
    scheduleContentMeasurement,
  });
  useAdaptiveFallbackPolling({
    fallbackPollInterval: options.fallbackPollInterval,
    fallbackPollActiveUntilRef,
    scheduleContentMeasurement,
    scrollElementRef,
    state,
  });

  return {
    scrollRef: attachScrollElement,
    contentRef,
    notifyContentHeight,
    measure,
    scrollToBottom,
    scrollToTop,
    stopScroll,
    isAtBottom,
    isNearBottom,
    escapedFromLock,
    state,
  };
}

import { useEffect } from "react";
import { getFallbackPollDelay, shouldRunFallbackPoll } from "./internal";
import type { StickToBottomState } from "../types";

interface CurrentValue<T> {
  current: T;
}

interface VisibilityRefreshOptions {
  fallbackPollInterval?: number | false;
  markFallbackPollActive: () => void;
  scheduleContentMeasurement: () => void;
}

interface AdaptiveFallbackPollingOptions {
  fallbackPollInterval?: number | false;
  fallbackPollActiveUntilRef: CurrentValue<number>;
  scheduleContentMeasurement: () => void;
  scrollElementRef: CurrentValue<HTMLElement | null>;
  state: StickToBottomState;
}

export function useDocumentMouseState(mouseDownRef: CurrentValue<boolean>) {
  useEffect(() => {
    const doc = globalThis.document;

    if (!doc) {
      return;
    }

    const handleMouseDown = () => {
      mouseDownRef.current = true;
    };
    const clearMouseDown = () => {
      mouseDownRef.current = false;
    };

    doc.addEventListener("mousedown", handleMouseDown, { passive: true });
    doc.addEventListener("mouseup", clearMouseDown, { passive: true });
    doc.addEventListener("click", clearMouseDown, { passive: true });

    return () => {
      doc.removeEventListener("mousedown", handleMouseDown);
      doc.removeEventListener("mouseup", clearMouseDown);
      doc.removeEventListener("click", clearMouseDown);
    };
  }, [mouseDownRef]);
}

export function usePointerInteractionCleanup(clearPointerInteraction: () => void) {
  useEffect(() => {
    window.addEventListener("pointerup", clearPointerInteraction, {
      passive: true,
    });
    window.addEventListener("pointercancel", clearPointerInteraction, {
      passive: true,
    });
    window.addEventListener("blur", clearPointerInteraction);

    return () => {
      window.removeEventListener("pointerup", clearPointerInteraction);
      window.removeEventListener("pointercancel", clearPointerInteraction);
      window.removeEventListener("blur", clearPointerInteraction);
    };
  }, [clearPointerInteraction]);
}

export function useVisibilityMeasurementRefresh({
  fallbackPollInterval,
  markFallbackPollActive,
  scheduleContentMeasurement,
}: VisibilityRefreshOptions) {
  useEffect(() => {
    const doc = globalThis.document;

    if (
      !doc ||
      fallbackPollInterval === false ||
      fallbackPollInterval === undefined ||
      fallbackPollInterval <= 0
    ) {
      return;
    }

    const handleVisibilityChange = () => {
      if (doc.visibilityState !== "hidden") {
        markFallbackPollActive();
        scheduleContentMeasurement();
      }
    };

    doc.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      doc.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fallbackPollInterval, markFallbackPollActive, scheduleContentMeasurement]);
}

export function useAdaptiveFallbackPolling({
  fallbackPollInterval,
  fallbackPollActiveUntilRef,
  scheduleContentMeasurement,
  scrollElementRef,
  state,
}: AdaptiveFallbackPollingOptions) {
  useEffect(() => {
    if (
      fallbackPollInterval === false ||
      fallbackPollInterval === undefined ||
      fallbackPollInterval <= 0
    ) {
      return;
    }

    let timeoutId = 0;
    let cancelled = false;

    const scheduleNextPoll = () => {
      if (cancelled) {
        return;
      }

      const isVisible = globalThis.document?.visibilityState !== "hidden";
      const hasScrollElement = !!scrollElementRef.current;

      timeoutId = window.setTimeout(
        () => {
          if (cancelled) {
            return;
          }

          const isCurrentlyVisible = globalThis.document?.visibilityState !== "hidden";
          const scrollElement = scrollElementRef.current;
          const shouldMeasure =
            isCurrentlyVisible &&
            scrollElement &&
            shouldRunFallbackPoll(state, fallbackPollActiveUntilRef.current);

          if (shouldMeasure) {
            scheduleContentMeasurement();
          }

          scheduleNextPoll();
        },
        getFallbackPollDelay(fallbackPollInterval, state, fallbackPollActiveUntilRef.current, {
          hasScrollElement,
          isVisible,
        }),
      );
    };

    scheduleNextPoll();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    fallbackPollActiveUntilRef,
    fallbackPollInterval,
    scheduleContentMeasurement,
    scrollElementRef,
    state,
  ]);
}

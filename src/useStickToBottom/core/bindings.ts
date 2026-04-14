import type { CurrentValue } from "../types";

interface BindScrollElementOptions {
  handlePointerDown: (event: PointerEvent) => void;
  handleScroll: (event: Event) => void;
  handleWheel: (event: WheelEvent) => void;
  lastBoundScrollElementRef: CurrentValue<HTMLElement | null>;
  lastScrollElementOverflowAnchorRef: CurrentValue<string>;
  resetObservedState: () => void;
  scheduleContentMeasurement: () => void;
  scrollElementRef: CurrentValue<HTMLElement | null>;
  viewportResizeObserverRef: CurrentValue<ResizeObserver | null>;
}

interface BindContentElementOptions {
  contentElementRef: CurrentValue<HTMLElement | null>;
  contentResizeObserverRef: CurrentValue<ResizeObserver | null>;
  lastBoundContentElementRef: CurrentValue<HTMLElement | null>;
  resetObservedState: () => void;
  scheduleContentMeasurement: () => void;
}

export function bindScrollElement(
  nextElement: HTMLElement | null,
  {
    handlePointerDown,
    handleScroll,
    handleWheel,
    lastBoundScrollElementRef,
    lastScrollElementOverflowAnchorRef,
    resetObservedState,
    scheduleContentMeasurement,
    scrollElementRef,
    viewportResizeObserverRef,
  }: BindScrollElementOptions,
) {
  const previousElement = scrollElementRef.current;
  const lastBoundElement = lastBoundScrollElementRef.current;
  const shouldReset =
    nextElement !== null && lastBoundElement !== null && lastBoundElement !== nextElement;

  if (previousElement) {
    previousElement.removeEventListener("scroll", handleScroll);
    previousElement.removeEventListener("wheel", handleWheel);
    previousElement.removeEventListener("pointerdown", handlePointerDown);
    viewportResizeObserverRef.current?.disconnect();
    previousElement.style.overflowAnchor = lastScrollElementOverflowAnchorRef.current;
    lastScrollElementOverflowAnchorRef.current = "";
  }

  if (nextElement) {
    lastBoundScrollElementRef.current = nextElement;
  }

  if (shouldReset) {
    resetObservedState();
  }

  scrollElementRef.current = nextElement;

  if (!nextElement) {
    return;
  }

  lastScrollElementOverflowAnchorRef.current = nextElement.style.overflowAnchor;
  // The hook already owns scroll reconciliation, so native scroll anchoring
  // can introduce one-frame jumps during async remeasurement.
  nextElement.style.overflowAnchor = "none";

  nextElement.addEventListener("scroll", handleScroll, { passive: true });
  nextElement.addEventListener("wheel", handleWheel, { passive: true });
  nextElement.addEventListener("pointerdown", handlePointerDown, {
    passive: true,
  });

  if (typeof ResizeObserver !== "undefined") {
    viewportResizeObserverRef.current = new ResizeObserver(() => {
      scheduleContentMeasurement();
    });
    viewportResizeObserverRef.current.observe(nextElement);
  }

  scheduleContentMeasurement();
}

export function bindContentElement(
  element: HTMLElement | null,
  {
    contentElementRef,
    contentResizeObserverRef,
    lastBoundContentElementRef,
    resetObservedState,
    scheduleContentMeasurement,
  }: BindContentElementOptions,
) {
  const lastBoundElement = lastBoundContentElementRef.current;
  const shouldReset = element !== null && lastBoundElement !== null && lastBoundElement !== element;

  contentResizeObserverRef.current?.disconnect();
  contentElementRef.current = element;

  if (element) {
    lastBoundContentElementRef.current = element;
  }

  if (shouldReset) {
    resetObservedState();
  }

  if (element && typeof ResizeObserver !== "undefined") {
    contentResizeObserverRef.current = new ResizeObserver(() => {
      scheduleContentMeasurement();
    });
    contentResizeObserverRef.current.observe(element);
  }

  scheduleContentMeasurement();
}

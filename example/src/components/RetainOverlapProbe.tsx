import { useCallback, useEffect, useRef, useState } from 'react';
import { useStickToBottom } from 'react-bottom-lock';

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}

interface ProbeSnapshot {
  animationActive: boolean;
  escapedFromLock: boolean;
  gap: number;
  isAtBottom: boolean;
  isNearBottom: boolean;
  rowCount: number;
  scrollTop: number;
  targetScrollTop: number;
}

const INITIAL_ROW_COUNT = 60;
const APPEND_ROW_COUNT = 8;

export function RetainOverlapProbe() {
  const {
    contentRef,
    isAtBottom,
    isNearBottom,
    scrollRef,
    scrollToBottom,
    state,
    escapedFromLock,
  } = useStickToBottom({
    bottomOffset: 0,
    initial: false,
    resize: 'instant',
  });
  const [rowCount, setRowCount] = useState(INITIAL_ROW_COUNT);
  const [snapshot, setSnapshot] = useState<ProbeSnapshot>(() => ({
    animationActive: false,
    escapedFromLock: false,
    gap: 0,
    isAtBottom: false,
    isNearBottom: false,
    rowCount: INITIAL_ROW_COUNT,
    scrollTop: 0,
    targetScrollTop: 0,
  }));

  const firstDeferredRef = useRef<Deferred | null>(null);
  const secondDeferredRef = useRef<Deferred | null>(null);
  const scrollerElementRef = useRef<HTMLDivElement | null>(null);

  const attachScrollRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollerElementRef.current = element;
      scrollRef(element);
    },
    [scrollRef],
  );

  const readSnapshot = useCallback((): ProbeSnapshot => {
    const scroller = scrollerElementRef.current;
    const gap = scroller
      ? scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop
      : 0;

    return {
      animationActive: !!state.animation,
      escapedFromLock,
      gap,
      isAtBottom,
      isNearBottom,
      rowCount,
      scrollTop: state.scrollTop,
      targetScrollTop: state.targetScrollTop,
    };
  }, [escapedFromLock, isAtBottom, isNearBottom, rowCount, state]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(readSnapshot());
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [readSnapshot]);

  const appendRows = useCallback(() => {
    setRowCount((current) => current + APPEND_ROW_COUNT);
  }, []);

  const createDeferred = useCallback((): Deferred => {
    let resolve!: () => void;

    const promise = new Promise<void>((nextResolve) => {
      resolve = nextResolve;
    });

    return { promise, resolve };
  }, []);

  const waitForFrame = useCallback(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }, []);

  const startOverlap = useCallback(async () => {
    const firstDeferred = createDeferred();
    const secondDeferred = createDeferred();

    firstDeferredRef.current = firstDeferred;
    secondDeferredRef.current = secondDeferred;

    void scrollToBottom({
      animation: 'instant',
      duration: firstDeferred.promise,
      ignoreEscapes: true,
    });

    await waitForFrame();

    void scrollToBottom({
      animation: 'instant',
      duration: secondDeferred.promise,
      ignoreEscapes: true,
      wait: true,
    });

    await waitForFrame();
    setSnapshot(readSnapshot());
  }, [createDeferred, readSnapshot, scrollToBottom, waitForFrame]);

  const resolveFirst = useCallback(() => {
    firstDeferredRef.current?.resolve();
    firstDeferredRef.current = null;
  }, []);

  const resolveSecond = useCallback(() => {
    secondDeferredRef.current?.resolve();
    secondDeferredRef.current = null;
  }, []);

  return (
    <div className='flex min-h-svh flex-col gap-4 bg-background p-6 text-foreground'>
      <div className='flex flex-wrap gap-2'>
        <button
          className='rounded border px-3 py-1.5'
          data-testid='probe-start-overlap'
          type='button'
          onClick={() => {
            void startOverlap();
          }}
        >
          start overlap
        </button>
        <button
          className='rounded border px-3 py-1.5'
          data-testid='probe-resolve-first'
          type='button'
          onClick={resolveFirst}
        >
          resolve first
        </button>
        <button
          className='rounded border px-3 py-1.5'
          data-testid='probe-resolve-second'
          type='button'
          onClick={resolveSecond}
        >
          resolve second
        </button>
        <button
          className='rounded border px-3 py-1.5'
          data-testid='probe-append'
          type='button'
          onClick={appendRows}
        >
          append rows
        </button>
      </div>

      <div className='flex flex-wrap gap-3 text-sm'>
        <div data-testid='probe-animation-active' data-value={String(snapshot.animationActive)}>
          animationActive:{String(snapshot.animationActive)}
        </div>
        <div data-testid='probe-at-bottom' data-value={String(snapshot.isAtBottom)}>
          isAtBottom:{String(snapshot.isAtBottom)}
        </div>
        <div data-testid='probe-near-bottom' data-value={String(snapshot.isNearBottom)}>
          isNearBottom:{String(snapshot.isNearBottom)}
        </div>
        <div data-testid='probe-escaped' data-value={String(snapshot.escapedFromLock)}>
          escaped:{String(snapshot.escapedFromLock)}
        </div>
        <div data-testid='probe-gap' data-value={snapshot.gap.toFixed(2)}>
          gap:{snapshot.gap.toFixed(2)}
        </div>
        <div data-testid='probe-scroll-top' data-value={snapshot.scrollTop.toFixed(2)}>
          scrollTop:{snapshot.scrollTop.toFixed(2)}
        </div>
        <div
          data-testid='probe-target-scroll-top'
          data-value={snapshot.targetScrollTop.toFixed(2)}
        >
          targetScrollTop:{snapshot.targetScrollTop.toFixed(2)}
        </div>
        <div data-testid='probe-row-count' data-value={String(snapshot.rowCount)}>
          rowCount:{snapshot.rowCount}
        </div>
      </div>

      <div
        className='h-[420px] overflow-y-auto rounded border border-border p-2'
        data-testid='probe-scroller'
        ref={attachScrollRef}
      >
        <div className='flex flex-col gap-2' ref={contentRef}>
          {Array.from({ length: rowCount }, (_, index) => (
            <div
              key={index}
              className='rounded border border-border bg-card px-3 py-3'
            >
              row {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

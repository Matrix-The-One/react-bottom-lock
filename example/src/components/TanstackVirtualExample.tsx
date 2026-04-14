import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useVirtualStickToBottom } from 'react-bottom-lock';
import { getUiCopy, type Locale } from '@/lib/i18n';
import { mergeRefs } from '@/lib/mergeRefs';
import { DemoPanel } from './DemoPanel';
import { MessageBubble } from './MessageBubble';
import { useDemoStream } from '../hooks/useDemoStream';

export interface ExampleProps {
  locale: Locale;
}

export function TanstackVirtualExample({ locale }: ExampleProps) {
  const copy = getUiCopy(locale);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const {
    scrollRef,
    contentRef,
    notifyContentHeight,
    scrollToTop,
    scrollToBottom,
    stopScroll,
    isAtBottom,
    isNearBottom,
    escapedFromLock,
  } = useVirtualStickToBottom({
    fallbackPollInterval: 80,
    initial: 'instant',
  });
  const { messages, status, activeScenario, runScenario, reset, stop } =
    useDemoStream(locale);
  const streamingMessageId =
    status === 'streaming' ? messages[messages.length - 1]?.id : null;

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    estimateSize: () => 132,
    getScrollElement: () => parentRef.current,
    overscan: 6,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const translateY = virtualItems[0]?.start ?? 0;

  useLayoutEffect(() => {
    notifyContentHeight(totalSize);
  }, [notifyContentHeight, totalSize]);

  const handleRunScenario = useCallback(
    (scenario: Parameters<typeof runScenario>[0]) => {
      runScenario(scenario);
      void scrollToBottom();
    },
    [runScenario, scrollToBottom],
  );

  const handleScrollToTop = useCallback(() => {
    stopScroll();
    void scrollToTop({ animation: 'smooth' });
  }, [scrollToTop, stopScroll]);

  const handleScrollToBottom = useCallback(() => {
    void scrollToBottom();
  }, [scrollToBottom]);

  const handleReset = useCallback(() => {
    reset();
    void scrollToBottom();
  }, [reset, scrollToBottom]);

  const scrollContainerRef = useMemo(
    () => mergeRefs(parentRef, scrollRef),
    [scrollRef],
  );

  return (
    <DemoPanel
      testId='panel-tanstack'
      locale={locale}
      panelTag={copy.examples.tanstackTag}
      title={copy.examples.tanstackTitle}
      status={status}
      activeScenario={activeScenario}
      isAtBottom={isAtBottom}
      isNearBottom={isNearBottom}
      escapedFromLock={escapedFromLock}
      onRunScenario={handleRunScenario}
      onReset={handleReset}
      onScrollToTop={handleScrollToTop}
      onScrollToBottom={handleScrollToBottom}
      onStop={stop}
    >
      <div
        className='demo-scrollbar demo-thread-surface flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px]'
        data-demo-scroll='true'
        ref={scrollContainerRef}
        tabIndex={0}
      >
        <div
          ref={contentRef}
          style={{
            height: totalSize,
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `translateY(${translateY}px)`,
            }}
          >
            {virtualItems.map((virtualRow) => {
              const message = messages[virtualRow.index];
              if (!message) return null;

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className='px-3 pb-3 first:pt-3 sm:px-4 sm:pb-4 sm:first:pt-4'
                >
                  <MessageBubble
                    locale={locale}
                    message={message}
                    isStreaming={message.id === streamingMessageId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DemoPanel>
  );
}

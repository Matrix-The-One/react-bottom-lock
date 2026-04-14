import { forwardRef, useCallback, useMemo } from 'react';
import type { RefCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type {
  Components,
  ItemProps,
  ListProps,
  ScrollerProps,
} from 'react-virtuoso';
import {
  useVirtualStickToBottom,
} from 'react-bottom-lock';
import { mergeRefs } from '@/lib/mergeRefs';
import { cn } from '@/lib/utils';
import { getUiCopy, type Locale } from '@/lib/i18n';
import type { DemoMessage } from '../data/scenarios';
import { useDemoStream } from '../hooks/useDemoStream';
import { DemoPanel } from './DemoPanel';
import { MessageBubble } from './MessageBubble';

export interface ExampleProps {
  locale: Locale;
}

export function VirtuosoExample({ locale }: ExampleProps) {
  const copy = getUiCopy(locale);
  const {
    contentRef,
    scrollerRef,
    notifyContentHeight,
    scrollToTop,
    scrollToBottom,
    isAtBottom,
    isNearBottom,
    escapedFromLock,
  } = useVirtualStickToBottom({
    initial: 'instant',
  });
  const { messages, status, activeScenario, runScenario, reset, stop } =
    useDemoStream(locale);
  const streamingMessageId =
    status === 'streaming' ? messages[messages.length - 1]?.id : null;

  const components = useMemo(
    () => createVirtuosoComponents(contentRef, locale),
    [contentRef, locale],
  );

  const handleRunScenario = useCallback(
    (scenario: Parameters<typeof runScenario>[0]) => {
      runScenario(scenario);
      void scrollToBottom();
    },
    [runScenario, scrollToBottom],
  );

  const handleScrollToTop = useCallback(() => {
    void scrollToTop({ animation: 'smooth' });
  }, [scrollToTop]);

  const handleScrollToBottom = useCallback(() => {
    void scrollToBottom();
  }, [scrollToBottom]);

  const handleReset = useCallback(() => {
    reset();
    void scrollToBottom();
  }, [reset, scrollToBottom]);

  return (
    <DemoPanel
      testId='panel-virtuoso'
      locale={locale}
      panelTag={copy.examples.virtuosoTag}
      title={copy.examples.virtuosoTitle}
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
      <Virtuoso
        className='min-h-0 min-w-0 flex-1'
        data={messages}
        components={components}
        increaseViewportBy={{ top: 4000, bottom: 4000 }}
        scrollerRef={scrollerRef}
        totalListHeightChanged={notifyContentHeight}
        followOutput={false}
        computeItemKey={(_, message) => message.id}
        itemContent={(_, message) => (
          <MessageBubble
            locale={locale}
            message={message}
            isStreaming={message.id === streamingMessageId}
          />
        )}
      />
    </DemoPanel>
  );
}

function createVirtuosoComponents(
  contentRef: RefCallback<HTMLElement | null>,
  locale: Locale,
): Components<DemoMessage> {
  const copy = getUiCopy(locale);
  const Scroller = forwardRef<
    HTMLDivElement,
    ScrollerProps & { className?: string }
  >(function DemoScroller({ children, className, style, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn(
          'demo-scrollbar demo-thread-surface h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px]',
          className,
        )}
        ref={ref}
        style={style}
        data-demo-scroll='true'
        tabIndex={0}
      >
        {children}
      </div>
    );
  });

  const List = forwardRef<HTMLDivElement, ListProps>(function DemoList(
    { children, style },
    ref,
  ) {
    return (
      <div
        ref={mergeRefs(ref, contentRef)}
        style={style}
        className='flex min-h-full min-w-0 flex-col gap-3 px-3 py-3 pr-4 sm:gap-4 sm:px-4 sm:py-4 sm:pr-5'
      >
        {children}
      </div>
    );
  });

  Scroller.displayName = 'DemoVirtuosoScroller';
  List.displayName = 'DemoVirtuosoList';

  return {
    Scroller,
    List,
    EmptyPlaceholder: () => (
      <div className='grid min-h-full place-items-center px-6 py-16 text-sm text-muted-foreground'>
        {copy.panel.emptyState}
      </div>
    ),
    Item: ({
      children,
      style,
      'data-index': dataIndex,
      'data-item-index': dataItemIndex,
      'data-known-size': dataKnownSize,
      'data-item-group-index': dataItemGroupIndex,
    }: ItemProps<DemoMessage>) => (
      <div
        className='min-w-0 pb-3'
        style={style}
        data-index={dataIndex}
        data-item-index={dataItemIndex}
        data-known-size={dataKnownSize}
        data-item-group-index={dataItemGroupIndex}
      >
        {children}
      </div>
    ),
  };
}

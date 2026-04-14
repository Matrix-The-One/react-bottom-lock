import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  List,
  useDynamicRowHeight,
  useListCallbackRef,
  type RowComponentProps,
} from 'react-window';
import { useVirtualStickToBottom } from 'react-bottom-lock';
import { getUiCopy, type Locale } from '@/lib/i18n';
import { DemoPanel } from './DemoPanel';
import { MessageBubble } from './MessageBubble';
import { useDemoStream } from '../hooks/useDemoStream';
import type { DemoMessage } from '../data/scenarios';

export interface ExampleProps {
  locale: Locale;
}

interface ReactWindowRowData {
  locale: Locale;
  messages: DemoMessage[];
  streamingMessageId: string | null;
}

export function ReactWindowExample({ locale }: ExampleProps) {
  const copy = getUiCopy(locale);
  const {
    scrollRef,
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
  const [listApi, attachListRef] = useListCallbackRef(null);
  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 132,
  });
  const streamingMessageId =
    status === 'streaming' ? messages[messages.length - 1]?.id : null;

  const rowProps = useMemo<ReactWindowRowData>(
    () => ({
      locale,
      messages,
      streamingMessageId,
    }),
    [locale, messages, streamingMessageId],
  );

  useEffect(() => {
    scrollRef(listApi?.element ?? null);

    return () => {
      scrollRef(null);
    };
  }, [listApi, scrollRef]);

  useLayoutEffect(() => {
    const element = listApi?.element;
    if (!element) return;

    notifyContentHeight(element.scrollHeight);
  });

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

  return (
    <DemoPanel
      testId='panel-react-window'
      locale={locale}
      panelTag={copy.examples.reactWindowTag}
      title={copy.examples.reactWindowTitle}
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
      <List
        className='demo-scrollbar demo-thread-surface min-h-0 min-w-0 flex-1 overflow-x-hidden overscroll-contain rounded-[24px]'
        data-demo-scroll='true'
        listRef={attachListRef}
        rowComponent={ReactWindowRow}
        rowCount={messages.length}
        rowHeight={rowHeight}
        rowProps={rowProps}
        style={{ minHeight: 0 }}
        tabIndex={0}
        onResize={() => {
          const element = listApi?.element;
          if (!element) return;

          notifyContentHeight(element.scrollHeight);
        }}
      />
    </DemoPanel>
  );
}

function ReactWindowRow({
  ariaAttributes,
  index,
  locale,
  messages,
  streamingMessageId,
  style,
}: RowComponentProps<ReactWindowRowData>) {
  const message = messages[index];
  if (!message) return null;

  return (
    <div
      {...ariaAttributes}
      style={style}
      className='px-3 pb-3 first:pt-3 sm:px-4 sm:pb-4 sm:first:pt-4'
    >
      <MessageBubble
        locale={locale}
        message={message}
        isStreaming={message.id === streamingMessageId}
      />
    </div>
  );
}

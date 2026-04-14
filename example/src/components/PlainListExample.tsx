import { useCallback } from 'react';
import { useStickToBottom } from 'react-bottom-lock';
import { getUiCopy, type Locale } from '@/lib/i18n';
import { useDemoStream } from '../hooks/useDemoStream';
import { DemoPanel } from './DemoPanel';
import { MessageBubble } from './MessageBubble';

export interface ExampleProps {
  locale: Locale;
}

export function PlainListExample({ locale }: ExampleProps) {
  const copy = getUiCopy(locale);
  const {
    scrollRef,
    contentRef,
    scrollToTop,
    scrollToBottom,
    isAtBottom,
    isNearBottom,
    escapedFromLock,
  } = useStickToBottom({
    fallbackPollInterval: 80,
    initial: 'instant',
  });
  const { messages, status, activeScenario, runScenario, reset, stop } =
    useDemoStream(locale);
  const streamingMessageId =
    status === 'streaming' ? messages[messages.length - 1]?.id : null;

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
      testId='panel-plain'
      locale={locale}
      panelTag={copy.examples.plainTag}
      title={copy.examples.plainTitle}
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
        ref={scrollRef}
        tabIndex={0}
      >
        <div
          className='flex min-h-full min-w-0 flex-col gap-3 px-3 py-3 pr-4 sm:gap-4 sm:px-4 sm:py-4 sm:pr-5'
          ref={contentRef}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              locale={locale}
              message={message}
              isStreaming={message.id === streamingMessageId}
            />
          ))}
        </div>
      </div>
    </DemoPanel>
  );
}

import { forwardRef } from 'react';
import { Streamdown } from 'streamdown';
import type { DemoMessage } from '../data/scenarios';
import { getUiCopy, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  locale: Locale;
  message: DemoMessage;
  isStreaming?: boolean;
}

export const MessageBubble = forwardRef<HTMLElement, MessageBubbleProps>(function MessageBubble({
  locale,
  message,
  isStreaming = false,
}, ref) {
  const copy = getUiCopy(locale);
  const isUser = message.role === 'user';

  return (
    <article
      ref={ref}
      data-message-id={message.id}
      data-message-role={message.role}
      className={cn(
        'flex w-full min-w-0 flex-col gap-2',
        isUser ? 'items-end' : 'items-start',
      )}
    >
      <div className='px-1 text-[0.63rem] tracking-[0.24em] text-muted-foreground uppercase'>
        {isUser ? copy.message.you : copy.message.assistant}
      </div>
      <div
        className={cn(
          'demo-message-shell w-full min-w-0 overflow-hidden rounded-[28px] border px-4 py-4 sm:px-5 sm:py-5',
          isUser
            ? 'demo-message-shell--user max-w-[94%] border-foreground/12 text-background sm:max-w-[92%]'
            : 'demo-message-shell--assistant max-w-full border-border text-foreground',
        )}
      >
        {message.markdown.length === 0 ? (
          <div className='text-sm text-muted-foreground'>{copy.message.streaming}</div>
        ) : (
          <div className='demo-markdown-scroll'>
            <Streamdown
              animated={{ animation: 'fadeIn', duration: 220, sep: 'word', stagger: 12 }}
              className={cn(
                'demo-markdown',
                isUser ? 'demo-markdown--user' : 'demo-markdown--assistant',
              )}
              controls={false}
              isAnimating={isStreaming}
              lineNumbers={false}
            >
              {message.markdown}
            </Streamdown>
          </div>
        )}
      </div>
    </article>
  );
});

MessageBubble.displayName = 'MessageBubble';

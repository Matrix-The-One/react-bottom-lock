import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import {
  createIntroMessage,
  createPromptMessage,
  createScenarioFrames,
  nextMessageId,
  type DemoMessage,
  type DemoScenario,
  type DemoStatus,
} from '../data/scenarios';

const FINAL_LAYOUT_SETTLE_MS = 480;

export function useDemoStream(locale: Locale) {
  const [messages, setMessages] = useState<DemoMessage[]>(() => [
    createIntroMessage(locale),
  ]);
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(
    null,
  );

  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);
  const localeRef = useRef(locale);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }

    timersRef.current = [];
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
    setStatus('idle');
  }, [clearTimers]);

  const reset = useCallback(() => {
    stop();
    setActiveScenario(null);
    setMessages([createIntroMessage(locale)]);
  }, [locale, stop]);

  const runScenario = useCallback(
    (scenario: DemoScenario) => {
      clearTimers();

      const runId = ++runIdRef.current;
      const assistantId = nextMessageId('assistant');
      const frames = createScenarioFrames(locale, scenario);

      setActiveScenario(scenario);
      setStatus('streaming');
      setMessages((previous) => [
        ...previous,
        createPromptMessage(locale, scenario),
        {
          id: assistantId,
          role: 'assistant',
          markdown: '',
        },
      ]);

      let elapsed = 0;

      frames.forEach((frame, index) => {
        elapsed += frame.delay;
        const isLast = index === frames.length - 1;

        const timer = window.setTimeout(() => {
          if (runId !== runIdRef.current) {
            return;
          }

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantId
                ? {
                    id: assistantId,
                    role: 'assistant',
                    markdown: frame.markdown,
                  }
                : message,
            ),
          );

          if (isLast) {
            const idleTimer = window.setTimeout(() => {
              if (runId !== runIdRef.current) {
                return;
              }

              setStatus('idle');
            }, FINAL_LAYOUT_SETTLE_MS);

            timersRef.current.push(idleTimer);
          }
        }, elapsed);

        timersRef.current.push(timer);
      });
    },
    [clearTimers, locale],
  );

  useEffect(() => {
    if (localeRef.current === locale) {
      return;
    }

    localeRef.current = locale;
    clearTimers();
    runIdRef.current += 1;
    setStatus('idle');
    setActiveScenario(null);
    setMessages([createIntroMessage(locale)]);
  }, [clearTimers, locale]);

  useEffect(() => {
    return () => {
      clearTimers();
      runIdRef.current += 1;
    };
  }, [clearTimers]);

  return {
    messages,
    status,
    activeScenario,
    runScenario,
    reset,
    stop,
  };
}

import { useEffect, useState } from 'react';
import { PlainListExample } from '@/components/PlainListExample';
import { PreferenceToolbar } from '@/components/PreferenceToolbar';
import { ReactWindowExample } from '@/components/ReactWindowExample';
import { RetainOverlapProbe } from '@/components/RetainOverlapProbe';
import { TanstackVirtualExample } from '@/components/TanstackVirtualExample';
import { VirtuosoExample } from '@/components/VirtuosoExample';
import { Button } from '@/components/ui/button';
import { getUiCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { detectPreferredLocale, detectPreferredTheme } from '@/lib/preferences';

type ExampleView = 'plain' | 'virtuoso' | 'react-window' | 'tanstack';

export default function App() {
  const [theme, setTheme] = useState(detectPreferredTheme);
  const [locale, setLocale] = useState(detectPreferredLocale);
  const [activeExample, setActiveExample] = useState<ExampleView>('plain');
  const copy = getUiCopy(locale);
  const probe =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('probe')
      : null;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
  }, [locale, theme]);

  if (probe === 'retain-overlap') {
    return <RetainOverlapProbe />;
  }

  return (
    <div className='relative h-svh min-h-svh overflow-hidden bg-background text-foreground'>
      <div className='demo-background pointer-events-none absolute inset-0' />
      <div className='demo-grid-overlay pointer-events-none absolute inset-0' />
      <div className='relative mx-auto flex h-svh min-h-svh max-w-[1420px] flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-5'>
        <header className='demo-hero mb-3 shrink-0 rounded-[28px] border border-border/70 px-4 py-3 sm:px-5'>
          <div className='flex min-w-0 flex-col gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='demo-hero__eyebrow shrink-0'>{copy.examples.heroEyebrow}</div>
            </div>

            <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
              <div
                aria-label={copy.examples.tabsLabel}
                className='demo-tab-strip'
                data-testid='example-tabs'
                role='tablist'
              >
                <Button
                  aria-controls='tabpanel-plain'
                  aria-selected={activeExample === 'plain'}
                  className={cn(
                    'demo-tab-button',
                    activeExample === 'plain' && 'demo-tab-button--active',
                  )}
                  data-active={activeExample === 'plain'}
                  data-testid='tab-plain'
                  id='tab-plain'
                  role='tab'
                  size='sm'
                  variant='ghost'
                  onClick={() => setActiveExample('plain')}
                >
                  {copy.examples.plainTab}
                </Button>
                <Button
                  aria-controls='tabpanel-virtuoso'
                  aria-selected={activeExample === 'virtuoso'}
                  className={cn(
                    'demo-tab-button',
                    activeExample === 'virtuoso' && 'demo-tab-button--active',
                  )}
                  data-active={activeExample === 'virtuoso'}
                  data-testid='tab-virtuoso'
                  id='tab-virtuoso'
                  role='tab'
                  size='sm'
                  variant='ghost'
                  onClick={() => setActiveExample('virtuoso')}
                >
                  {copy.examples.virtuosoTab}
                </Button>
                <Button
                  aria-controls='tabpanel-react-window'
                  aria-selected={activeExample === 'react-window'}
                  className={cn(
                    'demo-tab-button',
                    activeExample === 'react-window' &&
                      'demo-tab-button--active',
                  )}
                  data-active={activeExample === 'react-window'}
                  data-testid='tab-react-window'
                  id='tab-react-window'
                  role='tab'
                  size='sm'
                  variant='ghost'
                  onClick={() => setActiveExample('react-window')}
                >
                  {copy.examples.reactWindowTab}
                </Button>
                <Button
                  aria-controls='tabpanel-tanstack'
                  aria-selected={activeExample === 'tanstack'}
                  className={cn(
                    'demo-tab-button',
                    activeExample === 'tanstack' &&
                      'demo-tab-button--active',
                  )}
                  data-active={activeExample === 'tanstack'}
                  data-testid='tab-tanstack'
                  id='tab-tanstack'
                  role='tab'
                  size='sm'
                  variant='ghost'
                  onClick={() => setActiveExample('tanstack')}
                >
                  {copy.examples.tanstackTab}
                </Button>
              </div>

              <PreferenceToolbar
                theme={theme}
                locale={locale}
                onThemeChange={setTheme}
                onLocaleChange={setLocale}
              />
            </div>
          </div>
        </header>
        <main className='flex min-h-0 min-w-0 flex-1 overflow-hidden'>
          <section
            aria-labelledby='tab-plain'
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col',
              activeExample !== 'plain' && 'hidden',
            )}
            data-testid='tabpanel-plain'
            hidden={activeExample !== 'plain'}
            id='tabpanel-plain'
            role='tabpanel'
          >
            <PlainListExample locale={locale} />
          </section>
          <section
            aria-labelledby='tab-virtuoso'
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col',
              activeExample !== 'virtuoso' && 'hidden',
            )}
            data-testid='tabpanel-virtuoso'
            hidden={activeExample !== 'virtuoso'}
            id='tabpanel-virtuoso'
            role='tabpanel'
          >
            <VirtuosoExample locale={locale} />
          </section>
          <section
            aria-labelledby='tab-react-window'
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col',
              activeExample !== 'react-window' && 'hidden',
            )}
            data-testid='tabpanel-react-window'
            hidden={activeExample !== 'react-window'}
            id='tabpanel-react-window'
            role='tabpanel'
          >
            <ReactWindowExample locale={locale} />
          </section>
          <section
            aria-labelledby='tab-tanstack'
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col',
              activeExample !== 'tanstack' && 'hidden',
            )}
            data-testid='tabpanel-tanstack'
            hidden={activeExample !== 'tanstack'}
            id='tabpanel-tanstack'
            role='tabpanel'
          >
            <TanstackVirtualExample locale={locale} />
          </section>
        </main>
      </div>
    </div>
  );
}

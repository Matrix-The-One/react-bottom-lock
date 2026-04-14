import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, RotateCcw, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUiCopy, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  getScenarioLabels,
  type DemoScenario,
  type DemoStatus,
} from '../data/scenarios';

export interface DemoPanelProps {
  testId: string;
  locale: Locale;
  panelTag: string;
  title: string;
  status: DemoStatus;
  activeScenario: DemoScenario | null;
  isAtBottom: boolean;
  isNearBottom: boolean;
  escapedFromLock: boolean;
  onRunScenario: (scenario: DemoScenario) => void;
  onReset: () => void;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  onStop: () => void;
  children: ReactNode;
}

export function DemoPanel({
  testId,
  locale,
  panelTag,
  title,
  status,
  activeScenario,
  isAtBottom,
  isNearBottom,
  escapedFromLock,
  onRunScenario,
  onReset,
  onScrollToTop,
  onScrollToBottom,
  onStop,
  children,
}: DemoPanelProps) {
  const copy = getUiCopy(locale);
  const scenarioLabels = getScenarioLabels(locale);

  return (
    <Card
      className='relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-card/88'
      data-testid={testId}
    >
      <div className='absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-foreground/18 to-transparent' />

      <CardHeader className='grid shrink-0 gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline'>{copy.panel.runnablePanel}</Badge>
          <Badge variant='secondary'>{panelTag}</Badge>
        </div>

        <div className='grid min-h-0 content-start gap-1'>
          <CardTitle className='text-[1.25rem] leading-none sm:text-[1.35rem]'>
            {title}
          </CardTitle>
        </div>

        <div className='demo-chip-row flex min-w-0 gap-2 overflow-x-auto overflow-y-hidden pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0'>
          <Badge
            data-testid='status-text'
            data-state={status}
            variant={status === 'streaming' ? 'default' : 'secondary'}
            className={cn(status === 'streaming' ? 'shadow-[var(--shadow-seal)]' : undefined)}
          >
            {copy.panel.status}:{' '}
            {status === 'streaming' ? copy.panel.streaming : copy.panel.idle}
          </Badge>
          <Badge
            data-scenario={activeScenario ?? 'none'}
            data-testid='active-scenario'
            variant='outline'
          >
            {copy.panel.scenario}:{' '}
            {activeScenario ? scenarioLabels[activeScenario] : copy.panel.none}
          </Badge>
          <Badge
            data-testid='at-bottom'
            data-value={String(isAtBottom)}
            variant='outline'
            className={cn(
              isAtBottom
                ? 'border-foreground/16 bg-foreground/[0.08] text-foreground'
                : undefined,
            )}
          >
            {copy.panel.bottomLock}: {isAtBottom ? copy.panel.yes : copy.panel.no}
          </Badge>
          <Badge
            data-testid='near-bottom'
            data-value={String(isNearBottom)}
            variant='outline'
            className={cn(
              isNearBottom
                ? 'border-foreground/14 bg-foreground/[0.07] text-foreground'
                : undefined,
            )}
          >
            {copy.panel.nearBottom}: {isNearBottom ? copy.panel.yes : copy.panel.no}
          </Badge>
          <Badge
            data-testid='escaped-lock'
            data-value={String(escapedFromLock)}
            variant='outline'
            className={cn(
              escapedFromLock
                ? 'border-foreground/18 bg-foreground/[0.1] text-foreground'
                : undefined,
            )}
          >
            {copy.panel.escaped}: {escapedFromLock ? copy.panel.yes : copy.panel.no}
          </Badge>
        </div>

        <div className='demo-chip-row flex min-w-0 gap-1.5 overflow-x-auto overflow-y-hidden pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0'>
          {(Object.entries(scenarioLabels) as [DemoScenario, string][]).map(
            ([scenario, label]) => (
              <Button
                key={scenario}
                data-testid={`scenario-${scenario}`}
                className={cn(
                  'rounded-full',
                  activeScenario === scenario
                    ? 'shadow-[var(--shadow-seal)]'
                    : undefined,
                )}
                size='sm'
                variant={activeScenario === scenario ? 'default' : 'secondary'}
                onClick={() => onRunScenario(scenario)}
              >
                {label}
              </Button>
            ),
          )}
          <Button
            className='rounded-full'
            data-testid='action-scroll-top'
            size='sm'
            variant='outline'
            onClick={onScrollToTop}
          >
            <ArrowUp />
            {copy.panel.scrollToTop}
          </Button>
          <Button
            className='rounded-full'
            data-testid='action-scroll'
            size='sm'
            variant='outline'
            onClick={onScrollToBottom}
          >
            <ArrowDown />
            {copy.panel.scrollToBottom}
          </Button>
          <Button
            className='rounded-full'
            data-testid='action-reset'
            size='sm'
            variant='outline'
            onClick={onReset}
          >
            <RotateCcw />
            {copy.panel.reset}
          </Button>
          {status === 'streaming' && (
            <Button
              className='rounded-full shadow-[var(--shadow-seal)]'
              data-testid='action-stop'
              size='sm'
              variant='default'
              onClick={onStop}
            >
              <Square />
              {copy.panel.stop}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='demo-thread-frame flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4'>
        {children}
      </CardContent>
    </Card>
  );
}

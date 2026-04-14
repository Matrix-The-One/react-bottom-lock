import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

const MAX_BOTTOM_GAP_PX = 12;
const EXAMPLES = [
  {
    name: 'plain',
    panel: 'panel-plain',
    tab: 'tab-plain',
  },
  {
    name: 'virtuoso',
    panel: 'panel-virtuoso',
    tab: 'tab-virtuoso',
  },
  {
    name: 'react-window',
    panel: 'panel-react-window',
    tab: 'tab-react-window',
  },
  {
    name: 'tanstack-virtual',
    panel: 'panel-tanstack',
    tab: 'tab-tanstack',
  },
] as const;

test.describe('demo scenarios', () => {
  for (const example of EXAMPLES) {
    test(`${example.name} list stays pinned during the markdown stream`, async ({
      page,
    }) => {
      test.setTimeout(55_000);

      await page.goto('/');
      await page.getByTestId(example.tab).click();

      const panel = page.getByTestId(example.panel);
      await expect(panel).toBeVisible();

      await runStream(panel);
      await assertPinned(panel);

      await panel.getByTestId('action-reset').click();
      await runStream(panel);
      await assertPinned(panel);
      await assertScrollToTopAndBack(panel);

      await panel.getByTestId('action-reset').click();
      await assertScrollToTopDuringStreamAndBack(panel, page);
    });

    test(`${example.name} list escapes and relocks with keyboard scrolling during stream`, async ({
      page,
    }) => {
      await page.goto('/');
      await page.getByTestId(example.tab).click();

      const panel = page.getByTestId(example.panel);
      await expect(panel).toBeVisible();

      await assertKeyboardEscapeAndRelock(panel, page);
    });
  }

  test('toolbar language switch keeps working across locales', async ({
    page,
  }) => {
    await page.goto('/');
    const html = page.locator('html');
    const initialLocale = (await html.getAttribute('lang')) === 'zh' ? 'zh' : 'en';
    const toggledLocale = initialLocale === 'zh' ? 'en' : 'zh';

    await page.getByTestId('action-locale-toggle').click();
    await expect(html).toHaveAttribute('lang', toggledLocale);
    await expect(
      page.getByTestId(
        toggledLocale === 'en' ? 'action-locale-en' : 'action-locale-zh',
      ),
    ).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(
      page.getByTestId(
        toggledLocale === 'en' ? 'action-locale-zh' : 'action-locale-en',
      ),
    ).toHaveAttribute(
      'data-active',
      'false',
    );

    await expect(page.getByTestId('toolbar-theme')).toBeVisible();
    await expect(page.getByTestId('toolbar-language')).toBeVisible();

    await page.getByTestId('action-locale-toggle').click();
    await expect(html).toHaveAttribute('lang', initialLocale);
    await expect(
      page.getByTestId(
        initialLocale === 'zh' ? 'action-locale-zh' : 'action-locale-en',
      ),
    ).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(
      page.getByTestId(
        initialLocale === 'zh' ? 'action-locale-en' : 'action-locale-zh',
      ),
    ).toHaveAttribute(
      'data-active',
      'false',
    );
  });

  test('retain duration promises do not cancel newer retained animations', async ({
    page,
  }) => {
    await page.goto('/?probe=retain-overlap');

    await page.getByTestId('probe-start-overlap').click();
    await expect(page.getByTestId('probe-animation-active')).toHaveAttribute(
      'data-value',
      'true',
    );

    await page.getByTestId('probe-resolve-first').click();

    await expect
      .poll(async () => {
        return await page.getByTestId('probe-animation-active').getAttribute('data-value');
      })
      .toBe('true');

    await page.getByTestId('probe-append').click();

    await expect(page.getByTestId('probe-at-bottom')).toHaveAttribute(
      'data-value',
      'true',
    );
    await expect
      .poll(async () => {
        return Number(
          (await page.getByTestId('probe-gap').getAttribute('data-value')) ?? Number.NaN,
        );
      })
      .toBeLessThanOrEqual(MAX_BOTTOM_GAP_PX);

    await page.getByTestId('probe-resolve-second').click();

    await expect
      .poll(async () => {
        return await page.getByTestId('probe-animation-active').getAttribute('data-value');
      })
      .toBe('false');
  });
});

async function runStream(panel: Locator) {
  await panel.getByTestId('scenario-stream').click();
  await expect(panel.getByTestId('status-text')).toHaveAttribute(
    'data-state',
    'idle',
    {
      timeout: 20_000,
    },
  );
}

async function assertPinned(panel: Locator) {
  await expect(panel.getByTestId('at-bottom')).toHaveAttribute(
    'data-value',
    'true',
  );
  await expect(panel.getByTestId('near-bottom')).toHaveAttribute(
    'data-value',
    'true',
  );
  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute(
    'data-value',
    'false',
  );

  const scroller = panel.locator('[data-demo-scroll="true"]');
  await expect
    .poll(async () => {
      return await scroller.evaluate((node) => {
        return node.scrollHeight - node.clientHeight - node.scrollTop;
      });
    })
    .toBeLessThanOrEqual(MAX_BOTTOM_GAP_PX);
}

async function assertScrollToTopAndBack(panel: Locator) {
  const scroller = panel.locator('[data-demo-scroll="true"]');

  await panel.getByTestId('action-scroll-top').click();

  await expect
    .poll(async () => {
      return await scroller.evaluate((node) => node.scrollTop);
    })
    .toBeLessThanOrEqual(1);

  await expect(panel.getByTestId('at-bottom')).toHaveAttribute('data-value', 'false');
  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute('data-value', 'true');

  await panel.getByTestId('action-scroll').click();
  await assertPinned(panel);
}

async function assertScrollToTopDuringStreamAndBack(
  panel: Locator,
  page: import('@playwright/test').Page,
) {
  const scroller = panel.locator('[data-demo-scroll="true"]');

  await panel.getByTestId('scenario-stream').click();
  await expect(panel.getByTestId('status-text')).toHaveAttribute('data-state', 'streaming');

  await expect
    .poll(async () => {
      return await scroller.evaluate(
        (node, minScrollableDistance) =>
          node.scrollHeight - node.clientHeight > minScrollableDistance,
        MAX_BOTTOM_GAP_PX * 8,
      );
    })
    .toBe(true);

  await panel.getByTestId('action-scroll-top').click();

  await expect
    .poll(async () => {
      return await scroller.evaluate((node) => node.scrollTop);
    })
    .toBeLessThanOrEqual(1);

  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute('data-value', 'true');
  await expect(panel.getByTestId('at-bottom')).toHaveAttribute('data-value', 'false');

  await page.waitForTimeout(600);
  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute('data-value', 'true');

  await panel.getByTestId('action-scroll').click();
  await expect(panel.getByTestId('status-text')).toHaveAttribute('data-state', 'idle', {
    timeout: 20_000,
  });
  await assertPinned(panel);
}

async function assertKeyboardEscapeAndRelock(panel: Locator, page: import('@playwright/test').Page) {
  await panel.getByTestId('scenario-stream').click();
  await expect(panel.getByTestId('status-text')).toHaveAttribute('data-state', 'streaming');

  const scroller = panel.locator('[data-demo-scroll="true"]');

  await expect
    .poll(async () => {
      return await scroller.evaluate(
        (node, minScrollableDistance) =>
          node.scrollHeight - node.clientHeight > minScrollableDistance,
        MAX_BOTTOM_GAP_PX * 8,
      );
    })
    .toBe(true);

  await scroller.focus();
  await expect(scroller).toBeFocused();
  await page.waitForTimeout(600);
  await scrollWithKeyboard(scroller, 'up');

  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute('data-value', 'true');
  await expect(panel.getByTestId('at-bottom')).toHaveAttribute('data-value', 'false');

  await relockToBottomWithKeyboard(panel, scroller);

  await expect(panel.getByTestId('escaped-lock')).toHaveAttribute('data-value', 'false');
  await expect(panel.getByTestId('at-bottom')).toHaveAttribute('data-value', 'true');

  await expect(panel.getByTestId('status-text')).toHaveAttribute('data-state', 'idle', {
    timeout: 20_000,
  });
  await assertPinned(panel);
}

async function scrollWithKeyboard(scroller: Locator, direction: 'up' | 'down') {
  const initialScrollTop = await scroller.evaluate((node) => node.scrollTop);
  const primaryKey = direction === 'up' ? 'Home' : 'End';
  const fallbackKey = direction === 'up' ? 'PageUp' : 'PageDown';

  await scroller.press(primaryKey);

  if (await waitForKeyboardScroll(scroller, initialScrollTop, direction)) {
    return;
  }

  for (let index = 0; index < 6; index += 1) {
    await scroller.press(fallbackKey);

    if (await waitForKeyboardScroll(scroller, initialScrollTop, direction)) {
      return;
    }
  }

  throw new Error(`Keyboard scrolling did not move the scroller ${direction}`);
}

async function relockToBottomWithKeyboard(panel: Locator, scroller: Locator) {
  for (let index = 0; index < 8; index += 1) {
    const isAtBottom =
      (await panel.getByTestId('at-bottom').getAttribute('data-value')) === 'true';

    if (isAtBottom) {
      return;
    }

    await scrollWithKeyboard(scroller, 'down');
  }

  throw new Error('Keyboard scrolling did not relock the scroller to the bottom');
}

async function waitForKeyboardScroll(
  scroller: Locator,
  initialScrollTop: number,
  direction: 'up' | 'down',
) {
  try {
    if (direction === 'up') {
      await expect
        .poll(async () => {
          return await scroller.evaluate((node) => node.scrollTop);
        }, { timeout: 750 })
        .toBeLessThan(initialScrollTop);
    } else {
      await expect
        .poll(async () => {
          return await scroller.evaluate((node) => node.scrollTop);
        }, { timeout: 750 })
        .toBeGreaterThan(initialScrollTop);
    }

    return true;
  } catch {
    return false;
  }
}

[简体中文](./README.md) | English

# react-bottom-lock

Sticky bottom scrolling for React chat and streaming UIs.

## Install

```bash
pnpm add react-bottom-lock
```

## Integration

### Regular scroll container

```tsx
import { useStickToBottom } from 'react-bottom-lock';

function ChatList({ children }: { children: React.ReactNode }) {
  const sticky = useStickToBottom();

  return (
    <div ref={sticky.scrollRef} style={{ height: 480, overflow: 'auto' }}>
      <div ref={sticky.contentRef}>{children}</div>
    </div>
  );
}
```

### `react-virtuoso`

```tsx
import { Virtuoso } from 'react-virtuoso';
import { useVirtualStickToBottom } from 'react-bottom-lock';

function Timeline({ items }: { items: string[] }) {
  const { scrollerRef, notifyContentHeight } = useVirtualStickToBottom();

  return (
    <Virtuoso
      data={items}
      scrollerRef={scrollerRef}
      totalListHeightChanged={notifyContentHeight}
      followOutput={false}
      itemContent={(index, item) => <div>{item}</div>}
    />
  );
}
```

### `react-window`

```tsx
import { useEffect, useLayoutEffect } from 'react';
import {
  List,
  useDynamicRowHeight,
  useListCallbackRef,
  type RowComponentProps,
} from 'react-window';
import { useVirtualStickToBottom } from 'react-bottom-lock';

function Row({ index, items, style }: RowComponentProps<{ items: string[] }>) {
  return <div style={style}>{items[index]}</div>;
}

function Timeline({ items }: { items: string[] }) {
  const { scrollRef, notifyContentHeight } = useVirtualStickToBottom();
  const [listApi, listRef] = useListCallbackRef(null);
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 96 });
  const syncHeight = () => {
    const element = listApi?.element;
    if (element) {
      notifyContentHeight(element.scrollHeight);
    }
  };

  useEffect(() => {
    scrollRef(listApi?.element ?? null);

    return () => {
      scrollRef(null);
    };
  }, [listApi, scrollRef]);

  useLayoutEffect(() => {
    syncHeight();
  });

  return (
    <List
      listRef={listRef}
      onResize={syncHeight}
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={rowHeight}
      rowProps={{ items }}
    />
  );
}
```

### `@tanstack/react-virtual`

```tsx
import { useLayoutEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useVirtualStickToBottom } from 'react-bottom-lock';

function Timeline({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const { scrollRef, contentRef, notifyContentHeight } =
    useVirtualStickToBottom();

  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 96,
    getScrollElement: () => parentRef.current,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  useLayoutEffect(() => {
    notifyContentHeight(totalSize);
  }, [notifyContentHeight, totalSize]);

  return (
    <div
      ref={(node) => {
        parentRef.current = node;
        scrollRef(node);
      }}
      style={{ height: 480, overflow: 'auto' }}
    >
      <div
        ref={contentRef}
        style={{ height: totalSize, position: 'relative' }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API

### `useStickToBottom(options?)`

**Options**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `bottomOffset` | `number` | `70` | How close to the bottom still counts as “near bottom”. |
| `initial` | `StickToBottomAnimation \| boolean` | `true` | Whether the first measurement should auto-lock to the bottom, and which animation to use. Pass `false` to disable the initial auto-follow. |
| `resize` | `StickToBottomAnimation` | falls back to the default spring config | Animation used when content keeps growing and the hook is still following the bottom. |
| `retainAnimationMs` | `number` | `350` | How long to retain the animation state after auto-following, which helps absorb async layout settling. |
| `fallbackPollInterval` | `number \| false` | `false` | Optional polling interval for environments where `ResizeObserver` is not reliable enough on its own. |
| `targetScrollTop` | `(targetScrollTop: number, context: ScrollContext) => number` | `undefined` | Override the final target `scrollTop`. The return value is clamped to the valid scroll range. |

**Returns**

| Return value | Type | Description |
| --- | --- | --- |
| `scrollRef` / `scrollerRef` | `RefCallback<HTMLElement \| null>` | Bind the scroll container. Both names are equivalent. |
| `contentRef` | `RefCallback<HTMLElement \| null>` | Bind the content container so the hook can observe height changes. |
| `notifyContentHeight` | `(height: number) => void` | Manually report a content height update when external systems know it before DOM measurement fully settles. |
| `measure` | `() => void` | Trigger a manual re-measurement. |
| `scrollToTop` | `(options?: ScrollToOptions \| 'instant' \| 'smooth') => Promise<boolean>` | Scroll to the top programmatically. |
| `scrollToBottom` | `(options?: ScrollToOptions \| 'instant' \| 'smooth') => Promise<boolean>` | Scroll to the bottom programmatically. |
| `stopScroll` | `() => void` | Stop the current automatic scroll and mark the lock as escaped. |
| `isAtBottom` | `boolean` | Whether the list is currently bottom-locked. |
| `isNearBottom` | `boolean` | Whether the viewport is within the `bottomOffset` threshold. |
| `escapedFromLock` | `boolean` | Whether the user has intentionally broken out of bottom lock. |
| `state` | `StickToBottomState` | Internal runtime state. |

**`ScrollToOptions`**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | `StickToBottomAnimation` | inherits the hook defaults | Animation used for this specific scroll request. |
| `wait` | `boolean \| number` | `false` | Pass `true` to wait until the next frame, or a number to wait that many milliseconds before starting. |
| `ignoreEscapes` | `boolean` | `false` | Whether this scroll should ignore user escape actions while it is running. |
| `preserveScrollPosition` | `boolean` | `false` | Try to preserve the current scroll intent instead of immediately resetting to a bottom-locking state. |
| `duration` | `number \| Promise<void>` | `0` | How long to retain the animation state after reaching the target. You can also pass a Promise to retain it until that Promise settles. |

### `useVirtualStickToBottom(options?)`

| Return value | Type | Description |
| --- | --- | --- |
| `scrollerRef` | `RefCallback<HTMLElement \| Window \| null>` | Bind this to the virtual list's exposed scroller ref. Supports both element scrolling and `Window` scrolling. |
| `notifyContentHeight` | `(height: number) => void` | Notify the hook when total virtualized content height changes. |

## Example

```bash
pnpm install
pnpm --dir example dev
```

```bash
pnpm --dir example test
```

## Acknowledgements

This project is inspired by [`stackblitz-labs/use-stick-to-bottom`](https://github.com/stackblitz-labs/use-stick-to-bottom). If you redistribute or derive from this project, please keep the attribution in [NOTICE.md](./NOTICE.md).

## License

MIT

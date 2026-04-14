简体中文 | [English](./README.en.md)

# react-bottom-lock

适用于聊天与流式界面的 React 吸底滚动 Hook。

## 安装

```bash
pnpm add react-bottom-lock
```

## 使用

### 普通滚动容器

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
  const { scrollRef, notifyContentHeight } = useVirtualStickToBottom();

  return (
    <Virtuoso
      data={items}
      scrollerRef={scrollRef}
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

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `bottomOffset` | `number` | `70` | 距离底部多少像素内仍视为“接近底部”。 |
| `initial` | `StickToBottomAnimation \| boolean` | `true` | 首次测量时是否自动吸底，以及使用哪种动画。传 `false` 可关闭首次自动吸底。 |
| `resize` | `StickToBottomAnimation` | `undefined` | 内容高度继续增长时，自动追底所使用的动画。未传时会合并当前配置，最终回退到默认弹簧配置。 |
| `retainAnimationMs` | `number` | `350` | 自动追底后的保留时长，避免异步布局抖动过早结束滚动。 |
| `fallbackPollInterval` | `number \| false` | `false` | 备用轮询间隔，适合接入某些不会可靠触发 `ResizeObserver` 的场景。 |
| `targetScrollTop` | `(targetScrollTop: number, context: ScrollContext) => number` | `undefined` | 自定义最终目标 `scrollTop`，返回值会被自动夹在合法滚动范围内。 |

**Returns**

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `scrollRef` | `RefCallback<HTMLElement \| null>` | 绑定滚动容器。 |
| `contentRef` | `RefCallback<HTMLElement \| null>` | 绑定内容容器，用于监听内容高度变化。 |
| `notifyContentHeight` | `(height: number) => void` | 当外部已知内容高度变化、但 DOM 还没法稳定测到时，可手动通知。 |
| `measure` | `() => void` | 主动触发一次重新测量。 |
| `scrollToTop` | `(options?: ScrollToOptions \| 'instant' \| 'smooth') => Promise<boolean>` | 主动滚到顶部。 |
| `scrollToBottom` | `(options?: ScrollToOptions \| 'instant' \| 'smooth') => Promise<boolean>` | 主动滚到底部。 |
| `stopScroll` | `() => void` | 中断当前自动滚动，并把状态标记为已脱离吸底。 |
| `isAtBottom` | `boolean` | 当前是否仍保持底部锁定。 |
| `isNearBottom` | `boolean` | 当前是否位于 `bottomOffset` 阈值内。 |
| `escapedFromLock` | `boolean` | 用户是否已主动脱离吸底。 |
| `state` | `StickToBottomState` | 内部运行态。 |

**`ScrollToOptions`**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `animation` | `StickToBottomAnimation` | `undefined` | 本次滚动使用的动画。未传时会沿用 Hook 当前配置。 |
| `wait` | `boolean \| number` | `false` | 传 `true` 会等到下一帧再开始；传数字则表示等待对应毫秒数。 |
| `ignoreEscapes` | `boolean` | `false` | 滚动过程中是否忽略用户脱离锁定的动作。 |
| `preserveScrollPosition` | `boolean` | `false` | 是否尽量保留当前滚动意图，而不是立刻重置为吸底或脱离状态。 |
| `duration` | `number \| Promise<void>` | `0` | 滚动到位后保留动画状态多久；也可以传一个 Promise，在其完成前保持动画状态。 |

### `useVirtualStickToBottom(options?)`

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `scrollRef` | `RefCallback<HTMLElement \| Window \| null>` | 绑定虚拟列表暴露出的滚动容器引用。支持元素滚动和 `Window` 级滚动。 |
| `notifyContentHeight` | `(height: number) => void` | 当虚拟列表总高度变化时通知 Hook，可直接绑定给对应库的总高度回调。 |

## 示例

```bash
pnpm install
pnpm --dir example dev
```

```bash
pnpm --dir example test
```

## 致谢

本项目的思路参考了 [`stackblitz-labs/use-stick-to-bottom`](https://github.com/stackblitz-labs/use-stick-to-bottom)。如需分发或二次改造，请保留 [NOTICE.md](./NOTICE.md) 中的归属说明。

## License

MIT

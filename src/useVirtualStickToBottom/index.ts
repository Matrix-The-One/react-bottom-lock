import { useCallback } from "react";
import type { RefCallback } from "react";
import { useStickToBottom } from "../useStickToBottom";
import type { StickToBottomOptions, StickToBottomResult } from "../useStickToBottom";

const DEFAULT_VIRTUAL_FALLBACK_POLL_INTERVAL = 80;

export type VirtualStickToBottomOptions = StickToBottomOptions;

export interface VirtualStickToBottomResult extends Omit<StickToBottomResult, "scrollRef"> {
  scrollRef: RefCallback<HTMLElement | Window | null>;
}

export function useVirtualStickToBottom(
  options: VirtualStickToBottomOptions = {},
): VirtualStickToBottomResult {
  const stickyBottom = useStickToBottom({
    ...options,
    fallbackPollInterval: options.fallbackPollInterval ?? DEFAULT_VIRTUAL_FALLBACK_POLL_INTERVAL,
  });
  const { notifyContentHeight, scrollRef: attachScrollRef, ...rest } = stickyBottom;

  const scrollRef = useCallback<RefCallback<HTMLElement | Window | null>>(
    (element) => {
      if (element instanceof HTMLElement) {
        attachScrollRef(element);
        return;
      }

      if (typeof Window !== "undefined" && element instanceof Window) {
        // Some virtualizers can hand us Window for page-level scrolling; use
        // the document's scrolling element so the core hook can stay
        // element-based internally.
        attachScrollRef(
          element.document.scrollingElement instanceof HTMLElement
            ? element.document.scrollingElement
            : null,
        );
        return;
      }

      attachScrollRef(null);
    },
    [attachScrollRef],
  );

  return {
    ...rest,
    notifyContentHeight,
    scrollRef,
  };
}

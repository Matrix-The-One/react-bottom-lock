import { useCallback } from "react";
import type { RefCallback } from "react";
import { useStickToBottom } from "../useStickToBottom";
import type { StickToBottomOptions, StickToBottomResult } from "../useStickToBottom";

const DEFAULT_VIRTUAL_FALLBACK_POLL_INTERVAL = 80;

export type VirtualStickToBottomOptions = StickToBottomOptions;

export interface VirtualStickToBottomResult extends Omit<StickToBottomResult, "scrollerRef"> {
  scrollerRef: RefCallback<HTMLElement | Window | null>;
}

export function useVirtualStickToBottom(
  options: VirtualStickToBottomOptions = {},
): VirtualStickToBottomResult {
  const stickyBottom = useStickToBottom({
    ...options,
    fallbackPollInterval: options.fallbackPollInterval ?? DEFAULT_VIRTUAL_FALLBACK_POLL_INTERVAL,
  });
  const { notifyContentHeight, scrollerRef: attachScrollerRef, ...rest } = stickyBottom;

  const scrollerRef = useCallback<RefCallback<HTMLElement | Window | null>>(
    (element) => {
      if (element instanceof HTMLElement) {
        attachScrollerRef(element);
        return;
      }

      if (typeof Window !== "undefined" && element instanceof Window) {
        // Some virtualizers can hand us Window for page-level scrolling; use
        // the document's scrolling element so the core hook can stay
        // element-based internally.
        attachScrollerRef(
          element.document.scrollingElement instanceof HTMLElement
            ? element.document.scrollingElement
            : null,
        );
        return;
      }

      attachScrollerRef(null);
    },
    [attachScrollerRef],
  );

  return {
    ...rest,
    notifyContentHeight,
    scrollerRef,
  };
}

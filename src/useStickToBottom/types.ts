import type { RefCallback } from "react";
import { DEFAULT_SPRING_ANIMATION } from "./core/internal";

type ScrollBehaviorMode = "instant" | "smooth";

export type SpringAnimation = Partial<typeof DEFAULT_SPRING_ANIMATION>;
export type StickToBottomAnimation = ScrollBehaviorMode | SpringAnimation;

export interface ScrollContext {
  scrollElement: HTMLElement;
}

export interface StickToBottomOptions extends SpringAnimation {
  bottomOffset?: number;
  resize?: StickToBottomAnimation;
  initial?: StickToBottomAnimation | boolean;
  retainAnimationMs?: number;
  fallbackPollInterval?: number | false;
  targetScrollTop?: (targetScrollTop: number, context: ScrollContext) => number;
}

export interface ScrollToOptions {
  animation?: StickToBottomAnimation;
  wait?: boolean | number;
  ignoreEscapes?: boolean;
  preserveScrollPosition?: boolean;
  duration?: number | Promise<void>;
}

export type ScrollToEdge = (options?: ScrollBehaviorMode | ScrollToOptions) => Promise<boolean>;

export type ResolvedAnimation = "instant" | Readonly<Required<SpringAnimation>>;

export interface AnimationState {
  behavior: ResolvedAnimation;
  edge: "bottom" | "top";
  ignoreEscapes: boolean;
  promise: Promise<boolean>;
}

export interface StickToBottomState {
  lastContentHeight?: number;
  lastScrollTop?: number;
  ignoreScrollToTop?: number;
  resizeDifference: number;
  accumulated: number;
  velocity: number;
  lastTick?: number;
  escapedFromLock: boolean;
  isAtBottom: boolean;
  isNearBottom: boolean;
  animation?: AnimationState;
  get scrollTop(): number;
  set scrollTop(scrollTop: number);
  get targetScrollTop(): number;
  get calculatedTargetScrollTop(): number;
  get scrollDifference(): number;
}

export interface StickToBottomResult {
  scrollRef: RefCallback<HTMLElement | null>;
  scrollerRef: RefCallback<HTMLElement | null>;
  contentRef: RefCallback<HTMLElement | null>;
  notifyContentHeight: (height: number) => void;
  measure: () => void;
  scrollToBottom: ScrollToEdge;
  scrollToTop: ScrollToEdge;
  stopScroll: () => void;
  isAtBottom: boolean;
  isNearBottom: boolean;
  escapedFromLock: boolean;
  state: StickToBottomState;
}

export interface CurrentValue<T> {
  current: T;
}

export interface PendingScrollEvaluation {
  scrollTop: number;
  previousScrollTop: number;
  ignoreScrollToTop?: number;
}

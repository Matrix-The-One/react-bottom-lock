# react-bottom-lock

## 2.0.0

### Major Changes

- 3b6b5da: Remove the `scrollerRef` alias from the public API and standardize on `scrollRef` for both `useStickToBottom` and `useVirtualStickToBottom`.

  If you were previously destructuring `scrollerRef`, rename it to `scrollRef`. For integrations such as `react-virtuoso`, pass it through as `scrollerRef={scrollRef}`.

## 1.0.1

### Patch Changes

- 11bba0c: Adjust the README language switcher order to show Simplified Chinese first.

All notable changes to this project will be documented in this file.

## 1.0.0

### Major Changes

- Initial stable release of `react-bottom-lock`.

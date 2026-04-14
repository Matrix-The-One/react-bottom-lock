---
"react-bottom-lock": major
---

Remove the `scrollerRef` alias from the public API and standardize on `scrollRef` for both `useStickToBottom` and `useVirtualStickToBottom`.

If you were previously destructuring `scrollerRef`, rename it to `scrollRef`. For integrations such as `react-virtuoso`, pass it through as `scrollerRef={scrollRef}`.

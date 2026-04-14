import type { Locale } from '../lib/i18n';

export type DemoRole = 'user' | 'assistant';

export interface DemoMessage {
  id: string;
  role: DemoRole;
  markdown: string;
}

export type DemoStatus = 'idle' | 'streaming';

export const DEMO_SCENARIOS = ['stream'] as const;

export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

interface DemoFrame {
  delay: number;
  markdown: string;
}

interface ScenarioLocaleCopy {
  intro: string[];
  prompt: (label: string) => string;
  stream: {
    intro: string[];
    closing: string[];
    codeTitle: string;
    checklistTitle: string;
    tableTitle: string;
    imageTitle: string;
    fieldNotesTitle: string;
    releaseTitle: string;
    imageAlt: string;
    imageCaption: string;
  };
}

let messageCounter = 0;
const DEMO_STREAM_DELAY_MULTIPLIER = 1.25;

const SCENARIO_LABELS: Record<Locale, Record<DemoScenario, string>> = {
  en: {
    stream: 'Markdown stream',
  },
  zh: {
    stream: 'Markdown 流式输出',
  },
};

const SCENARIO_COPY: Record<Locale, ScenarioLocaleCopy> = {
  en: {
    intro: [
      '## Streamdown playground',
      'This demo compares the same stick-to-bottom behavior across a regular DOM list and several virtualized list integrations, while every assistant answer is rendered as streaming Markdown through `streamdown`.',
      '- The latest visible content should remain readable while new tokens arrive.\n- Code fences, tables, images, and follow-up paragraphs should all keep growing without breaking the lock.\n- The viewport should detach only after a real reader action, never because layout is still settling.',
    ],
    prompt: (label) => `Start stream: **${label}**`,
    stream: {
      intro: [
        '## A single long mixed Markdown stream',
        'This example intentionally puts prose, code, lists, tables, and media into one continuous answer because that is much closer to a real chat response than isolated toy cases.',
        'The critical behavior is not simply “scroll to bottom once”. The harder requirement is to keep following the newest content while the last message keeps changing shape under the reader.',
        'That means late line wraps, delayed image decode, extra checklist items, and a table that keeps receiving rows should all feel ordinary while the reader is still following the stream.',
        '> A polished chat surface treats asynchronous growth as a normal layout event, not as a signal that the user has suddenly decided to leave the bottom.',
        'The purpose of making this stream intentionally tall is to preserve enough scroll range for real escape-and-relock testing. A short answer can look fine while still hiding timing bugs.',
      ],
      closing: [
        'By the time the stream reaches this closing section, the viewport has already survived multiple types of growth: long prose, a fence that extended downward, a comparison table, a late media block, and several explanatory follow-ups.',
        'If the hook is healthy, the newest paragraph should still remain visible unless the reader explicitly scrolled away. There should be no mysterious one-line drop at the end.',
        'That is the behavior people expect from production chat interfaces: quiet, predictable, and trustworthy even when the answer keeps morphing for several more seconds.',
        'It also makes regression testing much more honest. A single mixed stream forces the implementation to coordinate scroll intent, measurement, and late reconciliation under sustained pressure.',
        'The result should feel almost invisible. The answer simply keeps arriving, and the reader only loses the lock when they genuinely mean to browse older messages.',
        'If a later refactor weakens any part of that contract, this demo should make the regression obvious very quickly.',
      ],
      codeTitle: '### 1. Runtime contract',
      checklistTitle: '### 2. Follow rules',
      tableTitle: '### 3. Scroll checkpoints',
      imageTitle: '### 4. Late media block',
      fieldNotesTitle: '### 5. Failure patterns',
      releaseTitle: '### 6. Release checklist',
      imageAlt: 'Monochrome floating panels',
      imageCaption:
        'A grayscale placeholder image arrives late and stretches the thread after the message is already on screen.',
    },
  },
  zh: {
    intro: [
      '## Streamdown 演示',
      '这个示例把同一套 stick-to-bottom 行为分别放进普通 DOM 列表和多种虚拟列表接入方式里，但助手消息统一改成通过 `streamdown` 渲染流式 Markdown。',
      '- 最新内容在 token 持续追加时要始终可读。\n- 代码围栏、表格、图片和后续补充段落继续增长时，底部锁定不能丢。\n- 只有读者真的滚走，视口才应该脱离，而不是被布局仍在收敛的过程误伤。',
    ],
    prompt: (label) => `开始流式输出：**${label}**`,
    stream: {
      intro: [
        '## 一条更长的混合 Markdown 流',
        '这个示例刻意把长文本、代码、列表、表格和媒体塞进同一条连续回答里，因为这比拆成几个孤立的小场景更接近真实聊天响应。',
        '真正难的地方不是“滚到底一次”，而是最后一条消息在读者还停留在底部时持续变形，滚动逻辑仍要稳定地跟住它。',
        '这意味着段落延迟换行、图片晚到、清单项继续追加、表格不停加行，都应该被视为正常的内容增长，而不是脱离底部的信号。',
        '> 一个足够精致的聊天界面，会把异步变高当成正常布局事件，而不是误判成用户突然想离开最新消息。',
        '故意把这条流做得更高，是为了给脱离、重新贴底和晚到测量留下足够真实的滚动空间。太短的示例很容易把问题藏起来。',
      ],
      closing: [
        '当流式内容走到这里时，视口已经连续承受了多种不同增长：长段落、向下伸长的代码围栏、逐步扩展的表格、延迟出现的媒体块，以及几轮补充说明。',
        '如果 Hook 足够健康，那么除非读者主动滚走，否则这一段结束语现在仍应该稳定停留在视口里，不会出现那种莫名其妙掉下一行的情况。',
        '这正是生产级聊天界面最需要的感觉：安静、可预期，而且在回答持续变化的几秒钟里仍然值得信任。',
        '它也让回归验证更诚实。一条混合流会强迫实现同时处理滚动意图、尺寸测量和晚到重算，而不是只在一个过于轻量的玩具例子里表现良好。',
        '理想结果应该几乎让人感觉不到存在感。回答自然持续出现，而底部锁定只会在读者明确想翻看旧消息时才释放。',
        '如果后续改动削弱了这条契约，这个示例会很快把问题暴露出来。',
      ],
      codeTitle: '### 1. 运行时契约',
      checklistTitle: '### 2. 跟随规则',
      tableTitle: '### 3. 滚动检查点',
      imageTitle: '### 4. 延迟媒体块',
      fieldNotesTitle: '### 5. 常见失败模式',
      releaseTitle: '### 6. 发布检查单',
      imageAlt: '黑白漂浮面板',
      imageCaption:
        '一张灰阶占位图会稍后出现，并在消息已经可见之后继续把线程拉高。',
    },
  },
};

const CODE_LINES: Record<Locale, string[]> = {
  en: [
    '```ts',
    "type LockState = 'locked' | 'escaped'",
    '',
    'interface StickyOptions {',
    '  bottomOffset: number',
    "  animation: 'smooth' | 'instant'",
    "  resize: 'smooth' | 'instant'",
    '  retainMs: number',
    '}',
    '',
    'interface ScrollMetrics {',
    '  scrollTop: number',
    '  clientHeight: number',
    '  scrollHeight: number',
    '}',
    '',
    'function getBottomGap(metrics: ScrollMetrics) {',
    '  return metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop',
    '}',
    '',
    'function shouldFollow(lockState: LockState, gap: number, bottomOffset: number) {',
    "  return lockState !== 'escaped' && gap <= bottomOffset",
    '}',
    '',
    'function reconcileChunk(lockState: LockState, options: StickyOptions) {',
    '  const metrics = measureScrollMetrics()',
    '  const gap = getBottomGap(metrics)',
    '',
    '  if (!shouldFollow(lockState, gap, options.bottomOffset)) {',
    '    return',
    '  }',
    '',
    '  scrollToBottom({',
    '    animation: options.animation,',
    '    duration: options.retainMs,',
    '    preserveScrollPosition: true,',
    '  })',
    '}',
    '',
    'function reconcileResize(lockState: LockState, options: StickyOptions) {',
    '  requestAnimationFrame(() => {',
    '    reconcileChunk(lockState, options)',
    '  })',
    '}',
    '',
    'for (const block of incomingBlocks) {',
    '  render(block)',
    '  reconcileResize(lockState, options)',
    '}',
    '',
    'function onLateAssetDecoded(lockState: LockState, options: StickyOptions) {',
    '  queueMicrotask(() => reconcileResize(lockState, options))',
    '}',
    '```',
  ],
  zh: [
    '```ts',
    "type LockState = 'locked' | 'escaped'",
    '',
    'interface StickyOptions {',
    '  bottomOffset: number',
    "  animation: 'smooth' | 'instant'",
    "  resize: 'smooth' | 'instant'",
    '  retainMs: number',
    '}',
    '',
    'interface ScrollMetrics {',
    '  scrollTop: number',
    '  clientHeight: number',
    '  scrollHeight: number',
    '}',
    '',
    'function getBottomGap(metrics: ScrollMetrics) {',
    '  return metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop',
    '}',
    '',
    'function shouldFollow(lockState: LockState, gap: number, bottomOffset: number) {',
    "  return lockState !== 'escaped' && gap <= bottomOffset",
    '}',
    '',
    'function reconcileChunk(lockState: LockState, options: StickyOptions) {',
    '  const metrics = measureScrollMetrics()',
    '  const gap = getBottomGap(metrics)',
    '',
    '  if (!shouldFollow(lockState, gap, options.bottomOffset)) {',
    '    return',
    '  }',
    '',
    '  scrollToBottom({',
    '    animation: options.animation,',
    '    duration: options.retainMs,',
    '    preserveScrollPosition: true,',
    '  })',
    '}',
    '',
    'function onLateAssetDecoded(lockState: LockState, options: StickyOptions) {',
    '  queueMicrotask(() => reconcileChunk(lockState, options))',
    '}',
    '```',
  ],
};

const CHECKLIST_LINES: Record<Locale, string[]> = {
  en: [
    '- Keep the newest rendered block visible',
    '- Ignore harmless layout jitter near the bottom',
    '- Let the reader break the lock intentionally',
    '- Reconcile late paragraph wraps before ending the follow state',
    '- Re-measure after images or code highlighting finish',
    '- Preserve enough scroll range to test escape and relock behavior',
    '- Avoid mistaking spring retention for user intent',
    '- Make programmatic relock feel immediate and calm',
  ],
  zh: [
    '- 让最新渲染出的区块始终保持可见',
    '- 忽略接近底部时无害的布局抖动',
    '- 只在读者明确滚走时解除锁定',
    '- 在结束跟随状态前，兜住延迟到来的段落换行',
    '- 图片或代码高亮完成后重新测量高度',
    '- 保留足够的滚动距离来验证脱离与重新贴底',
    '- 不要把动画保留期误判成用户意图',
    '- 让程序化重新贴底看起来迅速而稳定',
  ],
};

const TABLE_LINES: Record<Locale, string[]> = {
  en: [
    '| Phase | DOM list | Virtual list | Expected result |',
    '| --- | --- | --- | --- |',
    '| Initial tokens | `scrollHeight` grows immediately | Total size reconciles through an adapter | Bottom lock stays on |',
    '| Paragraph reflow | Native layout wraps lines later | Row measurement updates item height | Latest line stays visible |',
    '| Code fence growth | New lines extend the bubble | Row size expands inside virtualization | No premature detach |',
    '| Checklist append | Extra bullets extend the answer | Total size rises with the rendered rows | Bottom gap remains near zero |',
    '| Table expansion | Rows keep extending the message | Virtual rows keep getting re-measured | The viewport still follows |',
    '| Image decode | Media arrives after text is visible | Late size updates propagate to the scroller | Lock is retained |',
    '| Manual scroll escape | User scrolls upward | User scrolls upward | Auto-follow stops |',
    '| Programmatic relock | Scroll-to-bottom is requested | Scroll-to-bottom is requested | Lock resumes smoothly |',
    '| Closing prose | Final paragraphs keep wrapping | Final paragraphs keep wrapping | End state remains pinned |',
  ],
  zh: [
    '| 阶段 | DOM 列表 | 虚拟列表 | 预期结果 |',
    '| --- | --- | --- | --- |',
    '| 初始 token | `scrollHeight` 立即增长 | 通过适配器同步总高度 | 底部锁定保持开启 |',
    '| 段落重排 | 原生布局稍后换行 | 行高重新测量后更新项目尺寸 | 最新一行仍可见 |',
    '| 代码围栏增长 | 新行继续把气泡拉长 | 虚拟项内部高度继续扩张 | 不会提前脱离 |',
    '| 清单追加 | 新 bullet 继续加长回答 | 已渲染行带动总高度上升 | 底部间隙仍接近零 |',
    '| 表格扩展 | 表格继续向下长 | 虚拟行持续重新测量 | 视口仍然跟随 |',
    '| 图片解码 | 文字可见后媒体才出现 | 晚到的尺寸更新继续传给滚动容器 | 锁定被保留 |',
    '| 手动脱离 | 用户向上滚动 | 用户向上滚动 | 自动跟随停止 |',
    '| 程序化贴底 | 主动请求滚到底 | 主动请求滚到底 | 锁定平滑恢复 |',
    '| 收尾段落 | 最后几段继续换行 | 最后几段继续换行 | 最终状态仍贴底 |',
  ],
};

const FIELD_NOTES_BLOCKS: Record<Locale, string[]> = {
  en: [
    'A common regression shows up after the stream looks stable for a moment. The last paragraph seems finished, then a delayed font metric or syntax-highlight pass changes the line breaks and nudges the newest sentence below the fold.',
    'Another failure mode happens when a virtualizer updates row height correctly but the sticky-scroll layer is still relying on stale total-height assumptions. The list then misses one resize step and the bottom gap quietly grows.',
    'Media is especially useful here because it exercises a very different timing path. Text arrives, the user sees the answer, and only later does the image decode and expand the same message again.',
    'A healthy implementation keeps distinguishing between “the layout moved” and “the user moved”. That boundary is the difference between a trustworthy chat UI and one that constantly leaks the newest lines.',
    'The longer this stream becomes, the more honest the test is. It gives enough vertical range for keyboard escape, pointer escape, delayed reflow, and manual relock to collide with each other in realistic ways.',
  ],
  zh: [
    '有一种常见回归会在流看起来已经稳定之后才出现。最后一段仿佛已经结束，但字体度量或代码高亮稍后改变了换行位置，于是最新一句被悄悄挤到折叠线下方。',
    '另一类问题发生在虚拟列表已经正确更新了行高，但粘底层仍依赖过期的总高度判断，于是某一次尺寸变化被漏掉，底部间隙开始悄悄变大。',
    '媒体内容尤其适合暴露这类问题，因为它走的是完全不同的时序路径。文字先到、读者先看到回答，图片却在更晚的时间点再次把同一条消息拉高。',
    '真正稳健的实现会持续区分“布局在移动”和“用户在移动”。这条边界，正是值得信任的聊天界面和总会漏掉最新几行内容的界面之间最直观的差别。',
    '这条流越长，测试就越诚实。它会给键盘脱离、指针脱离、延迟重排和手动重新贴底足够真实的重叠空间。',
  ],
};

const RELEASE_LINES: Record<Locale, string[]> = {
  en: [
    '1. Verify the viewport stays pinned through the final prose tail.',
    '2. Scroll up during the stream and confirm lock escape is preserved.',
    '3. Scroll back down and confirm relock happens without overshoot.',
    '4. Check that image decode does not introduce a one-frame drop.',
    '5. Check that virtualized variants reconcile the same way as plain DOM.',
    '6. Re-run the stream after reset so stale runtime state cannot hide.',
    '7. Keep the demo tall enough that regressions remain visible.',
  ],
  zh: [
    '1. 确认最后几段补充文本出现时，视口仍然贴底。',
    '2. 在流式过程中主动向上滚动，确认脱离状态能够保持。',
    '3. 再滚回底部，确认重新贴底不会出现过冲。',
    '4. 确认图片解码不会带来一帧式下坠。',
    '5. 确认虚拟列表示例和普通 DOM 行为一致。',
    '6. 重置后再次运行，避免旧运行态掩盖问题。',
    '7. 保持示例足够长，让回归问题始终可见。',
  ],
};

const IMAGE_DATA_URI = toDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 820">
    <defs>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f7f7f8" />
        <stop offset="100%" stop-color="#e8e8eb" />
      </linearGradient>
      <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.9)" />
        <stop offset="100%" stop-color="rgba(23,23,25,0.08)" />
      </linearGradient>
      <linearGradient id="screen" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#111214" />
        <stop offset="100%" stop-color="#3a3b40" />
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
    </defs>
    <rect width="1280" height="820" rx="54" fill="url(#bg)" />
    <circle cx="240" cy="182" r="138" fill="rgba(255,255,255,0.9)" filter="url(#blur)" />
    <circle cx="1036" cy="158" r="124" fill="rgba(17,17,18,0.08)" filter="url(#blur)" />
    <circle cx="1060" cy="668" r="146" fill="rgba(255,255,255,0.72)" filter="url(#blur)" />
    <g transform="translate(138 132)">
      <rect x="0" y="82" width="450" height="486" rx="54" fill="url(#panel)" stroke="rgba(17,17,18,0.08)" />
      <rect x="42" y="124" width="366" height="280" rx="38" fill="url(#screen)" />
      <rect x="70" y="454" width="168" height="18" rx="9" fill="rgba(17,17,18,0.64)" />
      <rect x="70" y="492" width="248" height="14" rx="7" fill="rgba(17,17,18,0.26)" />
    </g>
    <g transform="translate(670 96)">
      <rect x="0" y="0" width="472" height="610" rx="58" fill="rgba(255,255,255,0.76)" stroke="rgba(17,17,18,0.08)" />
      <rect x="48" y="54" width="376" height="242" rx="36" fill="url(#screen)" />
      <rect x="48" y="334" width="280" height="18" rx="9" fill="rgba(17,17,18,0.72)" />
      <rect x="48" y="374" width="346" height="14" rx="7" fill="rgba(17,17,18,0.28)" />
      <rect x="48" y="414" width="320" height="14" rx="7" fill="rgba(17,17,18,0.18)" />
      <rect x="48" y="472" width="148" height="84" rx="26" fill="rgba(17,17,18,0.06)" />
      <rect x="220" y="472" width="204" height="84" rx="26" fill="rgba(17,17,18,0.88)" />
    </g>
  </svg>
`);

export function getScenarioLabels(locale: Locale) {
  return SCENARIO_LABELS[locale];
}

export function createIntroMessage(locale: Locale): DemoMessage {
  return {
    id: nextMessageId('assistant'),
    role: 'assistant',
    markdown: joinBlocks(SCENARIO_COPY[locale].intro),
  };
}

export function createPromptMessage(
  locale: Locale,
  scenario: DemoScenario,
): DemoMessage {
  const copy = SCENARIO_COPY[locale];
  const labels = getScenarioLabels(locale);

  return {
    id: nextMessageId('user'),
    role: 'user',
    markdown: copy.prompt(labels[scenario]),
  };
}

export function createScenarioFrames(locale: Locale, scenario: DemoScenario) {
  switch (scenario) {
    case 'stream':
      return streamScenarioFrames(locale);
  }
}

export function nextMessageId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function streamScenarioFrames(locale: Locale): DemoFrame[] {
  const copy = SCENARIO_COPY[locale];
  const intro = joinBlocks(copy.stream.intro);
  const codeBlock = CODE_LINES[locale].join('\n');
  const checklistBlock = CHECKLIST_LINES[locale].join('\n');
  const tableBlock = TABLE_LINES[locale].join('\n');
  const imageBlock = joinBlocks([
    copy.stream.imageTitle,
    createImageTag(copy.stream.imageAlt),
    `_${copy.stream.imageCaption}_`,
  ]);
  const fieldNotesContent = joinBlocks(FIELD_NOTES_BLOCKS[locale]);
  const fieldNotesBlock = joinBlocks([copy.stream.fieldNotesTitle, fieldNotesContent]);
  const releaseContent = RELEASE_LINES[locale].join('\n');
  const releaseBlock = joinBlocks([copy.stream.releaseTitle, releaseContent]);
  const closing = joinBlocks(copy.stream.closing);

  const codeBase = [intro, copy.stream.codeTitle];
  const checklistBase = [...codeBase, codeBlock, copy.stream.checklistTitle, checklistBlock];
  const tableBase = [...checklistBase, copy.stream.tableTitle];
  const imageBase = [...tableBase, tableBlock, imageBlock];
  const fieldNotesBase = [...imageBase, copy.stream.fieldNotesTitle];
  const releaseBase = [...imageBase, fieldNotesBlock, copy.stream.releaseTitle];
  const finalBase = [...imageBase, fieldNotesBlock, releaseBlock];

  return [
    ...cumulativeMarkdownFrames(intro, 68, locale),
    ...cumulativeLineFrames(CODE_LINES[locale], 60, codeBase),
    {
      delay: scaleDemoDelay(140),
      markdown: joinBlocks(checklistBase),
    },
    ...cumulativeLineFrames(TABLE_LINES[locale], 92, tableBase),
    {
      delay: scaleDemoDelay(170),
      markdown: joinBlocks(imageBase),
    },
    ...cumulativeMarkdownFrames(fieldNotesContent, 70, locale, fieldNotesBase),
    ...cumulativeLineFrames(RELEASE_LINES[locale], 86, releaseBase),
    ...cumulativeMarkdownFrames(closing, 72, locale, finalBase),
  ];
}

function cumulativeMarkdownFrames(
  markdown: string,
  delay: number,
  locale: Locale,
  baseBlocks: string[] = [],
) {
  let current = '';

  return chunkMarkdown(markdown, locale).map((chunk) => {
    current += chunk;
    return {
      delay: scaleDemoDelay(delay),
      markdown: joinBlocks([...baseBlocks, current]),
    };
  });
}

function cumulativeLineFrames(
  lines: string[],
  delay: number,
  baseBlocks: string[] = [],
) {
  const currentLines: string[] = [];

  return lines.map((line) => {
    currentLines.push(line);
    return {
      delay: scaleDemoDelay(delay),
      markdown: joinBlocks([...baseBlocks, currentLines.join('\n')]),
    };
  });
}

function scaleDemoDelay(delay: number) {
  return Math.round(delay * DEMO_STREAM_DELAY_MULTIPLIER);
}

function chunkMarkdown(text: string, locale: Locale) {
  const sizes = locale === 'zh' ? [18, 22, 20, 24, 16] : [40, 48, 44, 52, 36];
  const chunks: string[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < text.length) {
    const size = sizes[index % sizes.length];
    chunks.push(text.slice(cursor, cursor + size));
    cursor += size;
    index += 1;
  }

  return chunks;
}

function joinBlocks(blocks: string[]) {
  return blocks.filter(Boolean).join('\n\n');
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createImageTag(alt: string) {
  return `<img src="${IMAGE_DATA_URI}" alt="${escapeHtmlAttribute(alt)}" width="1280" height="820" />`;
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

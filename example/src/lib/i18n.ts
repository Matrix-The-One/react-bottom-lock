export const SUPPORTED_LOCALES = ['en', 'zh'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface UiCopy {
  toolbar: {
    themeLabel: string;
    light: string;
    dark: string;
    languageLabel: string;
    english: string;
    chinese: string;
  };
  examples: {
    heroEyebrow: string;
    tabsLabel: string;
    plainTab: string;
    virtuosoTab: string;
    reactWindowTab: string;
    tanstackTab: string;
    plainTag: string;
    plainTitle: string;
    virtuosoTag: string;
    virtuosoTitle: string;
    reactWindowTag: string;
    reactWindowTitle: string;
    tanstackTag: string;
    tanstackTitle: string;
  };
  panel: {
    runnablePanel: string;
    status: string;
    idle: string;
    streaming: string;
    scenario: string;
    none: string;
    bottomLock: string;
    nearBottom: string;
    escaped: string;
    yes: string;
    no: string;
    scrollToTop: string;
    scrollToBottom: string;
    reset: string;
    stop: string;
    emptyState: string;
  };
  message: {
    you: string;
    assistant: string;
    streaming: string;
  };
}

const UI_COPY: Record<Locale, UiCopy> = {
  en: {
    toolbar: {
      themeLabel: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      languageLabel: 'Language',
      english: 'English',
      chinese: '中文',
    },
    examples: {
      heroEyebrow: 'react-bottom-lock',
      tabsLabel: 'Examples',
      plainTab: 'Plain DOM',
      virtuosoTab: 'Virtuoso',
      reactWindowTab: 'React Window',
      tanstackTab: 'TanStack Virtual',
      plainTag: 'Plain DOM',
      plainTitle: 'Plain Markdown thread',
      virtuosoTag: 'Virtuoso',
      virtuosoTitle: 'Virtuoso Markdown thread',
      reactWindowTag: 'React Window',
      reactWindowTitle: 'React Window Markdown thread',
      tanstackTag: 'TanStack Virtual',
      tanstackTitle: 'TanStack Virtual Markdown thread',
    },
    panel: {
      runnablePanel: 'Live panel',
      status: 'Status',
      idle: 'Idle',
      streaming: 'Streaming',
      scenario: 'Stream',
      none: 'Ready',
      bottomLock: 'Bottom lock',
      nearBottom: 'Near bottom',
      escaped: 'Escaped',
      yes: 'yes',
      no: 'no',
      scrollToTop: 'Scroll to top',
      scrollToBottom: 'Scroll to bottom',
      reset: 'Reset',
      stop: 'Stop',
      emptyState: 'Start the Markdown stream to begin.',
    },
    message: {
      you: 'You',
      assistant: 'Assistant',
      streaming: 'Streaming Markdown…',
    },
  },
  zh: {
    toolbar: {
      themeLabel: '外观',
      light: '浅色',
      dark: '深色',
      languageLabel: '语言',
      english: 'English',
      chinese: '中文',
    },
    examples: {
      heroEyebrow: 'react-bottom-lock',
      tabsLabel: '示例',
      plainTab: '普通 DOM',
      virtuosoTab: 'Virtuoso',
      reactWindowTab: 'React Window',
      tanstackTab: 'TanStack Virtual',
      plainTag: '普通 DOM',
      plainTitle: '普通 Markdown 线程',
      virtuosoTag: 'Virtuoso',
      virtuosoTitle: 'Virtuoso Markdown 线程',
      reactWindowTag: 'React Window',
      reactWindowTitle: 'React Window Markdown 线程',
      tanstackTag: 'TanStack Virtual',
      tanstackTitle: 'TanStack Virtual Markdown 线程',
    },
    panel: {
      runnablePanel: '运行面板',
      status: '状态',
      idle: '空闲',
      streaming: '流式输出',
      scenario: '流',
      none: '待开始',
      bottomLock: '底部锁定',
      nearBottom: '接近底部',
      escaped: '已脱离',
      yes: '是',
      no: '否',
      scrollToTop: '滚到顶部',
      scrollToBottom: '滚到底部',
      reset: '重置',
      stop: '停止',
      emptyState: '开始 Markdown 流式输出后会显示在这里。',
    },
    message: {
      you: '你',
      assistant: '助手',
      streaming: '正在渲染 Markdown…',
    },
  },
};

export function getUiCopy(locale: Locale) {
  return UI_COPY[locale];
}

import { MoonStar, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUiCopy, type Locale } from '@/lib/i18n';
import type { DemoTheme } from '@/lib/preferences';

export interface PreferenceToolbarProps {
  theme: DemoTheme;
  locale: Locale;
  onThemeChange: (theme: DemoTheme) => void;
  onLocaleChange: (locale: Locale) => void;
}

export function PreferenceToolbar({
  theme,
  locale,
  onThemeChange,
  onLocaleChange,
}: PreferenceToolbarProps) {
  const copy = getUiCopy(locale);
  const isLightTheme = theme === 'light';
  const isChinese = locale === 'zh';

  return (
    <div className='demo-toolbar' data-testid='preference-toolbar'>
      <div
        className='demo-control-group demo-control-group--theme'
        data-testid='toolbar-theme'
      >
        <button
          aria-checked={!isLightTheme}
          aria-label={`${copy.toolbar.themeLabel}: ${
            isLightTheme ? copy.toolbar.light : copy.toolbar.dark
          }`}
          className='demo-toggle-switch'
          data-state={isLightTheme ? 'left' : 'right'}
          data-testid='action-theme-toggle'
          role='switch'
          type='button'
          onClick={() => onThemeChange(isLightTheme ? 'dark' : 'light')}
        >
          <span aria-hidden='true' className='demo-toggle-switch__thumb' />
          <span
            className={cn(
              'demo-toggle-switch__option',
              isLightTheme && 'demo-toggle-switch__option--active',
            )}
            data-active={isLightTheme}
            data-testid='action-theme-light'
          >
            <SunMedium className='size-3.5' />
            {copy.toolbar.light}
          </span>
          <span
            className={cn(
              'demo-toggle-switch__option',
              !isLightTheme && 'demo-toggle-switch__option--active',
            )}
            data-active={!isLightTheme}
            data-testid='action-theme-dark'
          >
            <MoonStar className='size-3.5' />
            {copy.toolbar.dark}
          </span>
        </button>
      </div>

      <div
        className='demo-control-group demo-control-group--language'
        data-testid='toolbar-language'
      >
        <button
          aria-checked={!isChinese}
          aria-label={`${copy.toolbar.languageLabel}: ${
            isChinese ? copy.toolbar.chinese : copy.toolbar.english
          }`}
          className='demo-toggle-switch'
          data-state={isChinese ? 'left' : 'right'}
          data-testid='action-locale-toggle'
          role='switch'
          type='button'
          onClick={() => onLocaleChange(isChinese ? 'en' : 'zh')}
        >
          <span aria-hidden='true' className='demo-toggle-switch__thumb' />
          <span
            className={cn(
              'demo-toggle-switch__option',
              isChinese && 'demo-toggle-switch__option--active',
            )}
            data-active={isChinese}
            data-testid='action-locale-zh'
          >
            {copy.toolbar.chinese}
          </span>
          <span
            className={cn(
              'demo-toggle-switch__option',
              !isChinese && 'demo-toggle-switch__option--active',
            )}
            data-active={!isChinese}
            data-testid='action-locale-en'
          >
            {copy.toolbar.english}
          </span>
        </button>
      </div>
    </div>
  );
}

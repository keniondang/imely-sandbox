import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Str } from '../components/Str'
import { useApp } from '../context/AppContext'

const THEMES = [
  { id: 'light', key: 'setting.font_setting.theme_light' },
  { id: 'dark', key: 'setting.font_setting.theme_dark' },
] as const

const LANGUAGES = [
  { id: 'vi', key: 'setting.font_setting.language_vie' },
  { id: 'en', key: 'setting.font_setting.language_eng' },
  { id: 'id', key: 'setting.font_setting.language_id' },
  { id: 'zh', key: 'setting.font_setting.language_zh' },
] as const

// Purely cosmetic selection — this settings page previews the real app's
// own theme/language picker, not the sandbox's translator locale control
// (the ID/EN/VI pills in the Inspector), so it doesn't touch `locale`.
export function AppearanceScreen() {
  const { closeAppearance } = useApp()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<'vi' | 'en' | 'id' | 'zh'>('id')

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-line shrink-0">
        <button
          onClick={closeAppearance}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink shrink-0 active:scale-90 active:bg-subtle transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-ink">
          <Str k="setting.font_setting.header" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-[13px] text-muted mb-2">
          <Str k="setting.font_setting.theme" />
        </div>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`text-[13.5px] font-semibold rounded-full px-4 py-2 border active:scale-95 transition-transform ${
                theme === t.id ? 'border-imely-primary bg-imely-mint/40 text-imely-primaryDark' : 'border-line text-ink'
              }`}
            >
              <Str k={t.key} />
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="text-[13px] text-muted mb-2">
            <Str k="setting.font_setting.language" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`text-[13.5px] font-semibold rounded-full px-4 py-2.5 border active:scale-95 transition-transform ${
                  language === l.id ? 'border-imely-primary bg-imely-mint/40 text-imely-primaryDark' : 'border-line text-ink'
                }`}
              >
                <Str k={l.key} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

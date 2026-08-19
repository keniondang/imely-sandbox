import { applyVars, resolveString, type SourceLocale } from './strings'

// A believable stand-in name/title for the handful of toast keys whose real
// trigger site fills in something dynamic (a chat mode's title, a character
// or user's name) — so a Translation Mode / Inspector preview shows
// concrete text instead of a raw ${LAZY_DATA(...)} token or a literal "XXX".
const MOCK_NAME = 'Sarah'

// ${LAZY_DATA(...)} vars each toast key's real showToast() call passes —
// mirrors the actual call site (see ChatDetailScreen.tsx's selectMode) so
// the preview matches what a translator would see the real action produce.
const TOAST_VARS: Partial<Record<string, (locale: SourceLocale) => Record<string, string | number>>> = {
  'chat.mode.changed.toast': (locale) => ({ chatModeTitle: resolveString('chat.mode.flash.title', locale) }),
}

// Toast keys whose real showToast() call does more than a plain
// resolveString() — a substring swap, or text appended after the resolved
// string (see CharacterFormScreen.tsx's submit and useProfileOptions.ts's
// toggleFollow) — replicated here so the preview matches.
function postprocess(key: string, text: string): string {
  if (key === 'bot.character_created_success_with_name') return text.replace('XXX', MOCK_NAME)
  if (key === 'identity.follow.follow_success_toast') return `${text} ${MOCK_NAME}`
  return text
}

// What a toast-only key (registered via useRegisterKeys, no persistent DOM
// element — see Str.tsx) would actually show if its real trigger fired right
// now. `translated` is the target locale's already-typed override or live
// draft, if any — reused as-is (vars/postprocess still applied) rather than
// re-resolving from the base language, so a translator's own wording shows
// exactly as typed, the same way <Str> prefers an override over the sheet.
export function resolveToastPreview(key: string, baseLocale: SourceLocale, translated?: string): string {
  const vars = TOAST_VARS[key]?.(baseLocale)
  const text = translated !== undefined ? applyVars(translated, vars) : resolveString(key, baseLocale, vars)
  return postprocess(key, text)
}

# imely localization sandbox — Phase 1

A live, clickable rebuild of the imely UI where every visible string is pulled
from `src/data/strings.json` (generated from `IMELY_-_String_Localized__-_Editor.xlsx`)
instead of being hardcoded. A translator can search any string key, jump
straight to where it renders, and type a test translation to see if it breaks
the layout — before it ever ships.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. The left panel is the **String Inspector**;
the phone frame on the right is the **live preview**.

## How it works

- `src/data/strings.json` — all 1,479 keys × vi/en/id, regenerated any time
  from the source xlsx (see note below).
- `src/lib/strings.ts` — resolves a key + locale to text, substitutes
  `${LAZY_DATA(x)}` tokens with placeholder values.
- `src/components/Str.tsx` — the only place text gets rendered. Every screen
  uses `<Str k="toast.did_block_user" vars={{ name: 'Reygan' }} />` instead of
  hardcoded copy. On mount it **registers itself** (which screen it lives on)
  and tags its DOM node with `data-str-key="..."` so the Inspector can find
  and highlight it.
- `src/context/AppContext.tsx` — global state: active locale, per-key text
  overrides (for stress-testing translation length), which screen is showing,
  and the "jump to this key" request.
- `src/sandbox/Inspector.tsx` — the panel. Default view groups keys by which
  screen currently renders them (green dot = wired). Search box matches
  across *all* 1,479 keys, even ones not wired into a screen yet, so you can
  see the raw locale values immediately and it'll light up once a screen is
  built for it. Clicking a key switches screens if needed, scrolls to it,
  pulses a highlight, and flags it if the rendered text overflows its
  container.

## What's real vs. placeholder

- Real: all copy/strings, layout structure, categories/keys from your xlsx.
- Placeholder (per your note — you'll guide this): character cards, chat
  thread previews, avatars, usernames — see `src/data/mockContent.ts`.

## Screens wired so far

- `feed` — Beranda / "Untuk Anda" discover grid
- `chatlist` — Obrolan thread list
- `profile` — Profil, MêLy Club upgrade card, gem balance

## Next phases (not built yet)

- Phase 3: popups, menus, modals — send more screenshots, I'll wire them
  into the same `Str` + registry pattern.
- Phase 4: locale side-by-side compare view, export a list of all
  overflow-flagged keys for QA.

## Regenerating strings.json from a new xlsx export

The conversion script isn't checked in yet (it was run once ad hoc) — ping me
and I'll drop a `scripts/convert-strings.py` into the repo so this becomes a
one-command refresh whenever the sheet updates.

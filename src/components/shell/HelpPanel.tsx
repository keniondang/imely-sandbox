import {
  X,
  Search,
  SlidersHorizontal,
  MousePointerClick,
  Download,
  Languages,
  Layers,
  ListChecks,
  Keyboard,
  ArrowRightLeft,
} from 'lucide-react'

// A first-time-open reference for the tool's two ways of working — the
// String Inspector (browse/verify in context) and Translation Mode
// (work through strings one at a time). Kept as plain content in one place
// rather than scattered tooltips, so a translator can read it once instead
// of discovering each feature by trial and error.
export function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button onClick={onClose} aria-label="Close" className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-surface rounded-2xl shadow-2xl border border-line flex flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="text-[16px] font-bold text-ink">How this works</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-subtle active:scale-90 transition-transform"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          <Section
            icon={<Search size={16} className="text-imely-primary" />}
            title="String Inspector"
            subtitle="The left sidebar — for finding and verifying strings in context."
          >
            <Item icon={<Layers size={14} />} title="Browse the tree">
              Every screen in the app is listed, in the order you'd actually move through it. Click a screen to open
              it, drilling into its Menu/Popup groups if it has any — the live preview on the right follows along.
            </Item>
            <Item icon={<Search size={14} />} title="Search">
              Matches a string's key, category, or its ID/EN/VI text — useful when you know roughly what something
              says but not which screen it's on.
            </Item>
            <Item icon={<SlidersHorizontal size={14} />} title="Filter">
              All / Wired / Unwired / Untranslated / Translated narrow the tree down. "Unwired" means a string
              exists in the sheet but isn't shown anywhere in this build yet.
            </Item>
            <Item icon={<MousePointerClick size={14} />} title="Click any string">
              Selecting a row jumps the live preview to wherever it renders and outlines it with a pink glow, so you
              can see exactly which piece of UI it is before translating it.
            </Item>
            <Item icon={<Download size={14} />} title="Export .xlsx">
              Downloads every string in whichever language you pick — this is how finished work leaves the tool.
            </Item>
          </Section>

          <Section
            icon={<Languages size={16} className="text-imely-primary" />}
            title="Translation Mode"
            subtitle="One string at a time — for actually doing the translation work."
          >
            <Item icon={<ArrowRightLeft size={14} />} title="Getting in and out">
              Open it from the "Translation Mode" button next to Export; "Exit" in its green header brings you back
              to the String Inspector. Target picks which language you're translating into (ZH-TW / TH); Base picks
              which reference language (ID/EN/VI) is shown as the source.
            </Item>
            <Item icon={<SlidersHorizontal size={14} />} title="Filters">
              Wired / Unwired / Untranslated narrow the queue the same way as in the Inspector — turn on
              "Untranslated" to only step through strings that still need work.
            </Item>
            <Item icon={<Layers size={14} />} title="Page / Group navigation">
              Click either label to jump straight to any page or group instead of stepping one at a time — each
              entry shows its own translated/total count.
            </Item>
            <Item icon={<ListChecks size={14} />} title="Progress bars">
              Three tiers: the whole queue, the current page, and the current group — so you can see how much is
              left at a glance, at whatever scope you care about.
            </Item>
            <Item icon={<Keyboard size={14} />} title="Save & Next">
              Saves your translation and auto-advances to the next untranslated string — or use the ← / → arrow
              keys (while not typing) to step through without saving.
            </Item>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-[14px] font-bold text-ink">{title}</div>
      </div>
      <div className="text-[12.5px] text-muted mt-0.5 mb-3">{subtitle}</div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Item({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-subtle flex items-center justify-center text-muted shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        <div className="text-[12.5px] text-muted leading-relaxed mt-0.5">{children}</div>
      </div>
    </div>
  )
}

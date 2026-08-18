export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`w-11 h-6 rounded-full shrink-0 transition-colors relative ${checked ? 'bg-imely-primary' : 'bg-gray-300'}`}
    >
      <span
        // Positioned with an explicit `left` rather than a translate-x
        // transform — this component's absolutely-positioned knob has no
        // in-flow siblings, so a transform-based offset was landing on the
        // browser's computed static-position instead of the track's actual
        // left edge, pushing the knob outside the track. Explicit left is
        // unambiguous regardless of that.
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-[left]"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  )
}

import { useState } from 'react'
import { FILTER_CATEGORIES, GENDER_OPTIONS } from '../data/mockContent'
import { Str } from './Str'
import { ZoneScope } from '../context/ScreenScope'

interface FilterModalProps {
  onClose: () => void
  onApply: (gender: string, categories: string[]) => void
}

export function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [gender, setGender] = useState('All')
  const [categories, setCategories] = useState<string[]>([])

  function toggleCategory(tag: string) {
    setCategories((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <ZoneScope zone="filter">
    <div className="h-full relative">
      {/* backdrop */}
      <button
        onClick={onClose}
        aria-label="Close filter"
        className="absolute inset-0 bg-black/40"
      />

      {/* sheet — pinned to the bottom edge of the screen */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-surface rounded-t-3xl flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          <div className="text-center">
            <div className="font-extrabold text-[19px] text-ink">
              <Str k="discover_filter.header_title" />
            </div>
            <div className="text-[13px] text-muted mt-0.5">
              <Str k="discover_filter.header_subtitle" />
            </div>
          </div>

          <div className="mt-6">
            <div className="font-bold text-[14px] text-ink mb-2.5">
              <Str k="discover_filter.gender_title" />
            </div>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => {
                const active = gender === g
                return (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium active:scale-95 transition-all ${
                      active
                        ? 'border border-imely-ink text-ink bg-surface'
                        : 'bg-subtle text-ink'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="font-bold text-[14px] text-ink">
              <Str k="discover_filter.tag_title" />
            </div>
            <div className="text-[12.5px] text-muted mb-2.5">
              <Str k="discover_filter.tag_subtitle" />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_CATEGORIES.map((c) => {
                const active = categories.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium active:scale-95 transition-all ${
                      active ? 'bg-imely-primary text-white' : 'bg-subtle text-ink'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-line">
          <button
            onClick={() => onApply(gender, categories)}
            className="w-full bg-imely-primary text-white font-bold rounded-full py-3.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
          >
            <Str k="discover_filter.button_footer" />
          </button>
        </div>
      </div>
    </div>
    </ZoneScope>
  )
}

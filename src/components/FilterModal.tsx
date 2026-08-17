import { useState } from 'react'
import { FILTER_CATEGORIES, GENDER_OPTIONS } from '../data/mockContent'
import { NoSheet } from './NoSheet'

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
    <div className="h-full relative">
      {/* backdrop */}
      <button
        onClick={onClose}
        aria-label="Close filter"
        className="absolute inset-0 bg-black/40"
      />

      {/* sheet — pinned to the bottom edge of the screen */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-3xl flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          <div className="text-center">
            <div className="font-extrabold text-[19px] text-imely-ink">
              <NoSheet>Filter</NoSheet>
            </div>
            <div className="text-[13px] text-gray-400 mt-0.5">
              <NoSheet>Opsi Tampilan</NoSheet>
            </div>
          </div>

          <div className="mt-6">
            <div className="font-bold text-[14px] text-imely-ink mb-2.5">
              <NoSheet>Preferensi Gender:</NoSheet>
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
                        ? 'border border-imely-ink text-imely-ink bg-white'
                        : 'bg-gray-100 text-imely-ink'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="font-bold text-[14px] text-imely-ink">
              <NoSheet>Kategori:</NoSheet>
            </div>
            <div className="text-[12.5px] text-gray-400 mb-2.5">
              <NoSheet>Pilih beberapa kategori:</NoSheet>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_CATEGORIES.map((c) => {
                const active = categories.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium active:scale-95 transition-all ${
                      active ? 'bg-imely-primary text-white' : 'bg-gray-100 text-imely-ink'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-imely-line">
          <button
            onClick={() => onApply(gender, categories)}
            className="w-full bg-imely-primary text-white font-bold rounded-full py-3.5 active:scale-[0.97] active:bg-imely-primaryDark transition-transform"
          >
            <NoSheet>Terapkan</NoSheet>
          </button>
        </div>
      </div>
    </div>
  )
}

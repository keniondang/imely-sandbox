import { useState } from 'react'
import { ArrowLeft, MoreVertical, Pencil, MessageCircle, User, Trash2, Plus, X } from 'lucide-react'
import { Str } from '../components/Str'
import { ZoneScope } from '../context/ScreenScope'
import { useApp } from '../context/AppContext'
import { usePopupRequest } from '../hooks/usePopupRequest'
import { MOCK_FEED_CHARACTERS, type MockCharacter } from '../data/mockContent'

// Same character line-up as Beranda/Obrolan — these are the characters this
// user has created, kept in sync with the rest of the sandbox rather than
// inventing a separate placeholder set.
export function MyCharactersScreen() {
  const { closeMyCharacters, openChat, openCharacterProfile, openCharacterForm, showToast } = useApp()
  const [menuFor, setMenuFor] = useState<MockCharacter | null>(null)
  const [deleteConfirmFor, setDeleteConfirmFor] = useState<MockCharacter | null>(null)

  // Inspector-driven popup jumps have no specific character in mind, so fall
  // back to the first mock row — same stand-in pattern used elsewhere for
  // "preview" navigation into character-scoped content.
  usePopupRequest('mycharacters', 'menu', (open) => setMenuFor(open ? MOCK_FEED_CHARACTERS[0] : null))
  usePopupRequest('mycharacters', 'delete_confirm', (open) => setDeleteConfirmFor(open ? MOCK_FEED_CHARACTERS[0] : null))

  function startChat(c: MockCharacter) {
    setMenuFor(null)
    closeMyCharacters()
    openChat({ id: c.id, name: c.name, color: c.color })
  }

  function viewProfile(c: MockCharacter) {
    setMenuFor(null)
    closeMyCharacters()
    openCharacterProfile(c.id)
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="relative flex items-center justify-center px-3 py-2.5 border-b border-imely-line shrink-0">
        <button
          onClick={closeMyCharacters}
          className="absolute left-3 w-8 h-8 rounded-full flex items-center justify-center text-imely-ink active:scale-90 active:bg-gray-100 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="font-bold text-[16px] text-imely-ink">
          <Str k="list_bot.title" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {MOCK_FEED_CHARACTERS.map((c) => (
          <div key={c.id} className="flex gap-3 px-4 py-3.5 border-b border-imely-line last:border-0">
            <button onClick={() => startChat(c)} className="flex-1 flex gap-3 text-left active:opacity-70 transition-opacity">
              <div className="w-11 h-11 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <div className="min-w-0">
                <div className="font-bold text-[15px] text-imely-ink">{c.name}</div>
                <div className="text-[12.5px] text-gray-500 line-clamp-2 mt-0.5">{c.biography}</div>
              </div>
            </button>
            <button
              onClick={() => setMenuFor(c)}
              className="shrink-0 text-gray-400 active:scale-90 transition-transform self-start"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => openCharacterForm()}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white border border-imely-line rounded-full pl-3.5 pr-4 py-2.5 shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={16} className="text-imely-primary" />
        <span className="font-bold text-[13.5px] text-imely-primary">
          <Str k="list_bot.btn_create" />
        </span>
      </button>

      {menuFor && (
        <ZoneScope zone="menu">
          <div className="absolute inset-0 z-10">
            <button onClick={() => setMenuFor(null)} aria-label="Close options" className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-imely-line">
                <div className="font-bold text-[16px] text-imely-ink">
                  <Str k="setting_menu.option" />
                </div>
                <button onClick={() => setMenuFor(null)} className="text-gray-400 active:scale-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <button
                onClick={() => {
                  const editId = menuFor.id
                  setMenuFor(null)
                  openCharacterForm(editId)
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <Pencil size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="bot_menu.opt_edit_bot" />
                </span>
              </button>
              <button
                onClick={() => startChat(menuFor)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <MessageCircle size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="bot_menu.opt_chat" />
                </span>
              </button>
              <button
                onClick={() => viewProfile(menuFor)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-imely-line active:bg-gray-50 transition-colors text-left"
              >
                <User size={17} className="text-imely-ink" />
                <span className="text-[14px] text-imely-ink">
                  <Str k="bot_menu.opt_open_profile" />
                </span>
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmFor(menuFor)
                  setMenuFor(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
              >
                <Trash2 size={17} className="text-red-500" />
                <span className="text-[14px] text-red-500">
                  <Str k="bot_menu.opt_delete" />
                </span>
              </button>
              <div className="h-2" />
            </div>
          </div>
        </ZoneScope>
      )}

      {deleteConfirmFor && (
        <ZoneScope zone="delete_confirm">
          <div className="absolute inset-0 z-20">
            <button
              onClick={() => setDeleteConfirmFor(null)}
              aria-label="Close delete confirmation"
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5">
              <div className="font-bold text-[16px] text-imely-ink">
                <Str k="bot_menu.opt_delete_title" />
              </div>
              <div className="mt-1 text-[13px] text-gray-500">{deleteConfirmFor.name}?</div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirmFor(null)}
                  className="font-semibold text-[14px] text-imely-ink active:opacity-70 transition-opacity"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmFor(null)
                    showToast('Karakter dihapus — segera hadir')
                  }}
                  className="font-semibold text-[14px] text-red-500 active:opacity-70 transition-opacity"
                >
                  <Str k="bot_menu.opt_delete" />
                </button>
              </div>
            </div>
          </div>
        </ZoneScope>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { useApp, type ScreenId, type Zone } from '../context/AppContext'

// Lets a screen's local popup/menu state respond to a jump from the String
// Inspector. `setOpen` is called with `true` when the Inspector targets this
// exact (screenId, zone), and `false` when it targets a different zone on the
// same screen — so switching to another popup, or back to the page itself,
// closes this one instead of leaving it stacked on top.
export function usePopupRequest(screenId: ScreenId, zone: Zone, setOpen: (open: boolean) => void) {
  const { popupRequest, popupRequestToken } = useApp()

  useEffect(() => {
    if (!popupRequest || popupRequest.screenId !== screenId) return
    setOpen(popupRequest.zone === zone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupRequestToken])
}

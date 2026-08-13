import { useApp, type ScreenId, type Zone } from '../context/AppContext'
import { MOCK_FEED_CHARACTERS } from '../data/mockContent'

// Drives the live preview to whichever overlay a screen actually lives
// behind — shared by navigateTo (jumping to a specific string) and
// openScreen (just opening a section from the Inspector tree, with no
// string selected yet), so there's exactly one place that knows chat detail
// needs a preview thread, creator profile needs both profile + creator set,
// gem history needs gems opened first, etc.
function useOpenOverlayChain() {
  const {
    closeChat,
    closeChatOptions,
    closeCharacterProfile,
    closeCreatorProfile,
    closeNotif,
    closeGems,
    closeGemHistory,
    closePurchase,
    closeFilter,
    closeProfileMenu,
    closeDevices,
    closeAccount,
    closeMyCharacters,
    closeFollowing,
    closeBadges,
    closeAppearance,
    closeSettings,
    closeAbout,
    closeVerifyEmail,
    closeUsername,
    closeDeleteAccount,
    openChat,
    openChatOptions,
    openCharacterProfile,
    openCreatorProfile,
    openNotif,
    openGems,
    openGemHistory,
    openPurchase,
    openDevices,
    openAccount,
    openMyCharacters,
    openFollowing,
    openBadges,
    openAppearance,
    openSettings,
    openNotificationSettings,
    openVideoSettings,
    openAbout,
    openVerifyEmail,
    openUsername,
    openDeleteAccount,
    setCurrentScreen,
  } = useApp()

  return function openOverlayChain(screenId: ScreenId, zone: Zone) {
    closeChat()
    closeChatOptions()
    closeCharacterProfile()
    closeCreatorProfile()
    closeNotif()
    closeGems()
    closeGemHistory()
    closePurchase()
    closeFilter()
    closeProfileMenu()
    closeDevices()
    closeAccount()
    closeMyCharacters()
    closeFollowing()
    closeBadges()
    closeAppearance()
    closeSettings()
    closeAbout()
    closeVerifyEmail()
    closeUsername()
    closeDeleteAccount()

    if (screenId === 'chatdetail') {
      const preview = MOCK_FEED_CHARACTERS[0]
      openChat({ id: preview.id, name: preview.name, color: preview.color })
    } else if (screenId === 'chatoptions') {
      const preview = MOCK_FEED_CHARACTERS[0]
      openChat({ id: preview.id, name: preview.name, color: preview.color })
      openChatOptions()
    } else if (screenId === 'characterprofile') {
      openCharacterProfile(MOCK_FEED_CHARACTERS[0].id)
    } else if (screenId === 'creatorprofile') {
      openCharacterProfile(MOCK_FEED_CHARACTERS[0].id)
      openCreatorProfile(MOCK_FEED_CHARACTERS[0].creatorName)
    } else if (screenId === 'notification') {
      openNotif()
    } else if (screenId === 'gems') {
      openGems()
    } else if (screenId === 'gemhistory') {
      openGems()
      openGemHistory()
    } else if (screenId === 'purchase') {
      openPurchase(zone === 'gem' ? 'gem' : 'club')
    } else if (screenId === 'devices') {
      openDevices()
    } else if (screenId === 'account') {
      openAccount()
    } else if (screenId === 'mycharacters') {
      openMyCharacters()
    } else if (screenId === 'following') {
      openFollowing()
    } else if (screenId === 'badges') {
      openBadges()
    } else if (screenId === 'appearance') {
      openAppearance()
    } else if (screenId === 'settings') {
      openSettings()
    } else if (screenId === 'notificationsettings') {
      openSettings()
      openNotificationSettings()
    } else if (screenId === 'videosettings') {
      openSettings()
      openVideoSettings()
    } else if (screenId === 'about') {
      openAbout()
    } else if (screenId === 'verifyemail') {
      openAccount()
      openVerifyEmail()
    } else if (screenId === 'username') {
      openAccount()
      openUsername()
    } else if (screenId === 'deleteaccount') {
      openAccount()
      openDeleteAccount()
    } else {
      setCurrentScreen(screenId)
    }
  }
}

// Selects a key AND drives the live preview to wherever it actually renders
// — used when clicking an actual string row (Inspector list, search, or the
// TranslationPanel's prev/next buttons).
export function useNavigateToString() {
  const { usage, selectKey, requestPopup } = useApp()
  const openOverlayChain = useOpenOverlayChain()

  return function navigateTo(key: string, screenId?: ScreenId, zone?: Zone) {
    const rec = screenId ? { screenId, zone: zone ?? 'page' } : usage.find((u) => u.key === key)
    selectKey(key, rec ? { screenId: rec.screenId, zone: rec.zone } : null)
    if (!rec) return
    openOverlayChain(rec.screenId, rec.zone)
    requestPopup(rec.screenId, rec.zone)
  }
}

// Opens a screen's live overlay without selecting any particular string —
// used by the Inspector tree's section headers, so a translator can jump
// straight into Gem/Chat detail/Profil Karakter etc. from the sidebar even
// before anything on that screen has ever registered usage this session.
export function useOpenScreen() {
  const { requestPopup } = useApp()
  const openOverlayChain = useOpenOverlayChain()

  return function openScreen(screenId: ScreenId, zone: Zone = 'page') {
    openOverlayChain(screenId, zone)
    requestPopup(screenId, zone)
  }
}

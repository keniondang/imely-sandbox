import { useEffect, useMemo, useRef } from 'react'
import { useApp, type ScreenId } from '../context/AppContext'
import { ZONE_TYPE } from '../sandbox/browseConfig'

// Whichever screen is actually visible in the live preview right now, AND
// the auto-follow effect that keeps the Inspector's tree focus + selected
// string in sync with it. Lives in its own hook (rather than inside
// Inspector) so FocusPanel gets identical "point at anything in the
// preview" behavior without Inspector needing to be mounted — Translation
// Mode swaps Inspector out entirely (see App.tsx), but the live preview is
// still tappable and should still drive what's selected.
export function useLivePreviewFollow(): ScreenId {
  const {
    currentScreen,
    priming,
    liveZone,
    usage,
    selectedOccurrence,
    selectKey,
    setFocusPath,
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorId,
    notifOpen,
    gemsOpen,
    gemHistoryOpen,
    purchaseOpen,
    devicesOpen,
    accountOpen,
    myCharactersOpen,
    followingOpen,
    badgesOpen,
    qrCodeOpen,
    appearanceOpen,
    settingsOpen,
    notificationSettingsOpen,
    videoSettingsOpen,
    aboutOpen,
    verifyEmailOpen,
    usernameOpen,
    deleteAccountOpen,
    characterFormOpen,
  } = useApp()

  // Base screens track currentScreen, but overlays (chat detail,
  // notification, gems) render independently of it, so check those
  // booleans first.
  const activeScreenId: ScreenId = useMemo(() => {
    if (activeChat && chatOptionsOpen) return 'chatoptions'
    if (activeChat) return 'chatdetail'
    if (qrCodeOpen) return 'qrcode'
    if (activeCharacterId && activeCreatorId) return 'creatorprofile'
    if (activeCreatorId) return 'creatorprofile'
    if (activeCharacterId) return 'characterprofile'
    if (notifOpen) return 'notification'
    if (purchaseOpen) return 'purchase'
    if (gemHistoryOpen) return 'gemhistory'
    if (gemsOpen) return 'gems'
    if (verifyEmailOpen) return 'verifyemail'
    if (usernameOpen) return 'username'
    if (deleteAccountOpen) return 'deleteaccount'
    if (accountOpen) return 'account'
    if (devicesOpen) return 'devices'
    if (myCharactersOpen) return 'mycharacters'
    if (followingOpen) return 'following'
    if (badgesOpen) return 'badges'
    if (appearanceOpen) return 'appearance'
    if (notificationSettingsOpen) return 'notificationsettings'
    if (videoSettingsOpen) return 'videosettings'
    if (settingsOpen) return 'settings'
    if (aboutOpen) return 'about'
    if (characterFormOpen) return 'characterform'
    return currentScreen
  }, [
    activeChat,
    chatOptionsOpen,
    activeCharacterId,
    activeCreatorId,
    notifOpen,
    purchaseOpen,
    gemHistoryOpen,
    gemsOpen,
    verifyEmailOpen,
    usernameOpen,
    deleteAccountOpen,
    accountOpen,
    devicesOpen,
    myCharactersOpen,
    followingOpen,
    badgesOpen,
    qrCodeOpen,
    appearanceOpen,
    notificationSettingsOpen,
    videoSettingsOpen,
    settingsOpen,
    aboutOpen,
    characterFormOpen,
    currentScreen,
  ])

  // Auto-follow: whenever the live preview's screen or open zone changes —
  // navigating to a different page, opening a menu/popup, all reachable by
  // tapping directly in the preview, not just by clicking something in the
  // Inspector — drill the tree to match AND select that context's first
  // string, so switching into Translation Mode from here shows something
  // relevant immediately instead of "select a string" with nothing picked.
  // Skipped during startup warm-up, which rapidly visits every screen/zone
  // once to register their strings — following that would flash the
  // sidebar through the whole app on every load.
  //
  // Guarded against clobbering an explicit row click: navigateTo (see
  // useNavigateToString.ts) already calls selectKey for the exact key
  // clicked, in the same handler that also changes activeScreenId/liveZone
  // — by the time this effect runs, selectedOccurrence already matches, so
  // "already matches -> don't touch it" leaves that selection alone and
  // only auto-picks a first key when the selection is stale (i.e. the
  // preview navigated on its own, not via an Inspector/panel click).
  //
  // Warm-up's own last step parks the live preview on Feed (see App.tsx),
  // which would otherwise auto-focus straight into "FEED (BERANDA)" in the
  // sidebar before the translator has clicked anything. Landing needs an
  // "armed" flag rather than a one-shot skip: priming turning off and
  // Feed's screen settling in isn't quite atomic — closing the last
  // warm-up screen's overlay unregisters its liveZone a render late, so a
  // second follow-effect run (liveZone stale-object -> null) sneaks in
  // right behind the first one. A short delay before arming absorbs that
  // trailing churn; arming itself doesn't re-trigger the effect (it's a
  // ref, not a dependency), so it only takes effect on the next genuine
  // navigation — an explicit preview tap or Inspector click.
  const armedRef = useRef(false)
  useEffect(() => {
    if (priming) {
      armedRef.current = false
      return
    }
    const t = setTimeout(() => {
      armedRef.current = true
    }, 200)
    return () => clearTimeout(t)
  }, [priming])

  useEffect(() => {
    if (priming || !armedRef.current) return
    const targetZone = liveZone && liveZone.screenId === activeScreenId ? liveZone.zone : 'page'
    const kind = ZONE_TYPE[targetZone]
    setFocusPath(kind === 'menu' || kind === 'popup' ? [activeScreenId, kind] : [activeScreenId])

    const alreadyMatches =
      selectedOccurrence?.screenId === activeScreenId && selectedOccurrence?.zone === targetZone
    if (!alreadyMatches) {
      const firstKey = usage.find((u) => u.screenId === activeScreenId && u.zone === targetZone)?.key
      selectKey(firstKey ?? null, firstKey ? { screenId: activeScreenId, zone: targetZone } : null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScreenId, liveZone, priming])

  return activeScreenId
}

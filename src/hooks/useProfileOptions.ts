import { useState } from 'react'
import { useApp, type ScreenId } from '../context/AppContext'
import { usePopupRequest } from './usePopupRequest'
import { useRegisterKeys } from '../components/Str'
import { resolveString } from '../lib/strings'

// Shared Opsi-menu / follow / block / report state for a character or
// creator profile screen. Both screens show the exact same menu, so the
// state + handlers live here once — each screen still renders its own
// <ProfileOptionsSheets> (see components/ProfileOptionsSheets.tsx) since
// only the trigger button placement differs between them.
export function useProfileOptions(screenId: ScreenId, targetName: string, onBlocked: () => void) {
  const { baseLocale, showToast } = useApp()
  useRegisterKeys([
    'identity.follow.un_follow_success_toast',
    'identity.follow.follow_success_toast',
    'report_news.report_success_toast',
  ])

  const [optionsOpen, setOptionsOpen] = useState(false)
  usePopupRequest(screenId, 'menu', setOptionsOpen)

  const [following, setFollowing] = useState(false)

  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  usePopupRequest(screenId, 'block_confirm', setBlockConfirmOpen)

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  usePopupRequest(screenId, 'report', setReportOpen)

  function toggleFollow() {
    setOptionsOpen(false)
    setFollowing((f) => !f)
    showToast(
      following
        ? resolveString('identity.follow.un_follow_success_toast', baseLocale)
        : `${resolveString('identity.follow.follow_success_toast', baseLocale)} ${targetName}`
    )
  }

  function openBlockConfirm() {
    setOptionsOpen(false)
    setBlockConfirmOpen(true)
  }

  function confirmBlock() {
    setBlockConfirmOpen(false)
    showToast(`${targetName} diblokir`)
    onBlocked()
  }

  function openReport() {
    setOptionsOpen(false)
    setReportOpen(true)
  }

  function sendReport() {
    setReportOpen(false)
    setReportReason(null)
    showToast(resolveString('report_news.report_success_toast', baseLocale))
  }

  return {
    optionsOpen,
    setOptionsOpen,
    following,
    toggleFollow,
    blockConfirmOpen,
    setBlockConfirmOpen,
    openBlockConfirm,
    confirmBlock,
    reportOpen,
    setReportOpen,
    reportReason,
    setReportReason,
    openReport,
    sendReport,
  }
}

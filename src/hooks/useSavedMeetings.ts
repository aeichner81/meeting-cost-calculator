import { useCallback, useRef, useState } from 'react'
import type { SavedMeeting } from '../domain/savedMeetings'
import { loadSavedMeetings, saveSavedMeetings } from '../storage/savedMeetings'

type Update = SavedMeeting[] | ((previous: SavedMeeting[]) => SavedMeeting[])

export interface SavedMeetingsState {
  meetings: SavedMeeting[]
  setMeetings: (update: Update) => void
  // True if saved meetings could not be loaded, or the latest save failed (AC-39).
  // Separate from the roles-and-currency flag, which this hook never touches.
  storageFailed: boolean
}

export function useSavedMeetings(): SavedMeetingsState {
  const [initial] = useState(loadSavedMeetings)
  const [meetings, setMeetingsState] = useState(initial.meetings)
  const [saveFailed, setSaveFailed] = useState(false)
  // Holds the newest list so several updates in one event each build on the last.
  const latest = useRef(initial.meetings)

  const setMeetings = useCallback((update: Update) => {
    const next = typeof update === 'function' ? update(latest.current) : update
    latest.current = next
    setMeetingsState(next)
    setSaveFailed(!saveSavedMeetings(next).ok)
  }, [])

  return { meetings, setMeetings, storageFailed: !initial.ok || saveFailed }
}

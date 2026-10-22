import { useCallback, useRef, useState } from 'react'
import { loadData, saveData } from '../storage/storage'
import type { StoredData } from '../storage/storage'

type Update = StoredData | ((previous: StoredData) => StoredData)

export interface PersistedState {
  data: StoredData
  setData: (update: Update) => void
  // True if the data could not be loaded, or the latest save failed (AC-19).
  storageFailed: boolean
}

export function usePersistedState(): PersistedState {
  const [initial] = useState(loadData)
  const [data, setDataState] = useState(initial.data)
  const [saveFailed, setSaveFailed] = useState(false)
  // Holds the newest data so several updates in one event each build on the last.
  const latest = useRef(initial.data)

  const setData = useCallback((update: Update) => {
    const next = typeof update === 'function' ? update(latest.current) : update
    latest.current = next
    setDataState(next)
    setSaveFailed(!saveData(next).ok)
  }, [])

  return { data, setData, storageFailed: !initial.ok || saveFailed }
}

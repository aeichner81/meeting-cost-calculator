import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from '../storage/storage'
import type { StoredData } from '../storage/storage'
import { usePersistedState } from './usePersistedState'

const SAMPLE: StoredData = {
  roles: [{ id: 'r1', name: 'Developer', annualSalary: 36400 }],
  currency: 'EUR',
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('usePersistedState', () => {
  it('starts with an empty role list and GBP, with no storage problem', () => {
    const { result } = renderHook(() => usePersistedState())
    expect(result.current.data).toEqual({ roles: [], currency: 'GBP' })
    expect(result.current.storageFailed).toBe(false)
  })

  // AC-17
  it('saves changes and a later mount reads them back', () => {
    const first = renderHook(() => usePersistedState())
    act(() => first.result.current.setData(SAMPLE))
    first.unmount()

    const second = renderHook(() => usePersistedState())
    expect(second.result.current.data).toEqual(SAMPLE)
    expect(second.result.current.storageFailed).toBe(false)
  })

  it('accepts an updater function that receives the latest data', () => {
    const { result } = renderHook(() => usePersistedState())
    act(() => {
      result.current.setData((prev) => ({ ...prev, currency: 'CAD' }))
      result.current.setData((prev) => ({ ...prev, roles: SAMPLE.roles }))
    })
    expect(result.current.data).toEqual({ roles: SAMPLE.roles, currency: 'CAD' })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(result.current.data)
  })

  // AC-19
  it('works with an empty list and flags the problem when loading fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    const { result } = renderHook(() => usePersistedState())
    expect(result.current.data).toEqual({ roles: [], currency: 'GBP' })
    expect(result.current.storageFailed).toBe(true)
  })

  // AC-19
  it('keeps working in memory and flags the problem when saving fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    const { result } = renderHook(() => usePersistedState())
    act(() => result.current.setData(SAMPLE))
    expect(result.current.data).toEqual(SAMPLE)
    expect(result.current.storageFailed).toBe(true)
  })
})

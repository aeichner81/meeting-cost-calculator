import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { upsertMeeting } from '../domain/savedMeetings'
import type { SavedMeeting } from '../domain/savedMeetings'
import { SAVED_MEETINGS_KEY } from '../storage/savedMeetings'
import { STORAGE_KEY, saveData } from '../storage/storage'
import { useSavedMeetings } from './useSavedMeetings'

const TEAM_SYNC: SavedMeeting = {
  name: 'Team sync',
  lines: [{ roleId: 'r1', roleName: 'Developer', headcount: 4 }],
  duration: { hours: 0, minutes: 30 },
  recurrence: 'weekly',
  currency: 'USD',
}

const BOARD_REVIEW: SavedMeeting = {
  name: 'board review',
  lines: [{ roleId: 'r2', roleName: 'Manager', headcount: 3 }],
  duration: { hours: 2, minutes: 0 },
  recurrence: 'monthly',
  currency: 'GBP',
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useSavedMeetings', () => {
  it('starts with no saved meetings and no storage problem', () => {
    const { result } = renderHook(() => useSavedMeetings())
    expect(result.current.meetings).toEqual([])
    expect(result.current.storageFailed).toBe(false)
  })

  // AC-37
  it('saves changes and a later mount reads them back, sorted by name', () => {
    const first = renderHook(() => useSavedMeetings())
    act(() => first.result.current.setMeetings([TEAM_SYNC, BOARD_REVIEW]))
    first.unmount()

    const second = renderHook(() => useSavedMeetings())
    expect(second.result.current.meetings).toEqual([BOARD_REVIEW, TEAM_SYNC])
    expect(second.result.current.storageFailed).toBe(false)
  })

  it('accepts an updater function that receives the latest meetings', () => {
    const { result } = renderHook(() => useSavedMeetings())
    act(() => {
      result.current.setMeetings((previous) => upsertMeeting(previous, TEAM_SYNC))
      result.current.setMeetings((previous) => upsertMeeting(previous, BOARD_REVIEW))
    })
    expect(result.current.meetings).toEqual([BOARD_REVIEW, TEAM_SYNC])
    expect(JSON.parse(localStorage.getItem(SAVED_MEETINGS_KEY) ?? '')).toEqual(result.current.meetings)
  })

  // AC-39
  it('works with an empty list and flags the problem when loading fails', () => {
    localStorage.setItem(SAVED_MEETINGS_KEY, '{not json')
    const { result } = renderHook(() => useSavedMeetings())
    expect(result.current.meetings).toEqual([])
    expect(result.current.storageFailed).toBe(true)
  })

  // AC-39
  it('keeps working in memory and flags the problem when saving fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    const { result } = renderHook(() => useSavedMeetings())
    act(() => result.current.setMeetings([TEAM_SYNC]))
    expect(result.current.meetings).toEqual([TEAM_SYNC])
    expect(result.current.storageFailed).toBe(true)
  })

  // AC-39
  it('never touches roles or currency, even when saved-meeting storage fails', () => {
    saveData({ roles: [{ id: 'r1', name: 'Developer', annualSalary: 36400 }], currency: 'EUR' })
    const before = localStorage.getItem(STORAGE_KEY)
    localStorage.setItem(SAVED_MEETINGS_KEY, '[{"name": 1}]')

    const { result } = renderHook(() => useSavedMeetings())
    act(() => result.current.setMeetings([TEAM_SYNC]))

    expect(localStorage.getItem(STORAGE_KEY)).toBe(before)
  })
})

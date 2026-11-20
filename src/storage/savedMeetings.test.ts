import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SavedMeeting } from '../domain/savedMeetings'
import { SAVED_MEETINGS_KEY, loadSavedMeetings, saveSavedMeetings } from './savedMeetings'
import { STORAGE_KEY, loadData, saveData } from './storage'

const TEAM_SYNC: SavedMeeting = {
  name: 'Team sync',
  lines: [
    { roleId: 'r1', roleName: 'Developer', headcount: 4 },
    { roleId: 'r2', roleName: 'Manager', headcount: 1 },
  ],
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

const ROLES_AND_CURRENCY = {
  roles: [{ id: 'r1', name: 'Developer', annualSalary: 36400 }],
  currency: 'EUR' as const,
}

function withMeeting(changes: Record<string, unknown>): string {
  return JSON.stringify([{ ...TEAM_SYNC, ...changes }])
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('loadSavedMeetings', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadSavedMeetings()).toEqual({ ok: true, meetings: [] })
  })

  // AC-37
  it('returns what saveSavedMeetings stored', () => {
    saveSavedMeetings([BOARD_REVIEW, TEAM_SYNC])
    expect(loadSavedMeetings()).toEqual({ ok: true, meetings: [BOARD_REVIEW, TEAM_SYNC] })
  })

  // AC-37
  it('returns the meetings sorted by name, A to Z, ignoring case', () => {
    localStorage.setItem(SAVED_MEETINGS_KEY, JSON.stringify([TEAM_SYNC, BOARD_REVIEW]))
    const result = loadSavedMeetings()
    expect(result.meetings.map((meeting) => meeting.name)).toEqual(['board review', 'Team sync'])
  })

  it('accepts every recurrence and currency the app offers', () => {
    const meetings = [
      { ...TEAM_SYNC, name: 'a', recurrence: 'once', currency: 'GBP' },
      { ...TEAM_SYNC, name: 'b', recurrence: 'daily', currency: 'USD' },
      { ...TEAM_SYNC, name: 'c', recurrence: 'weekly', currency: 'CAD' },
      { ...TEAM_SYNC, name: 'd', recurrence: 'fortnightly', currency: 'EUR' },
      { ...TEAM_SYNC, name: 'e', recurrence: 'monthly', currency: 'GBP' },
    ]
    localStorage.setItem(SAVED_MEETINGS_KEY, JSON.stringify(meetings))
    expect(loadSavedMeetings()).toEqual({ ok: true, meetings })
  })

  // AC-39
  it('returns an empty list and reports failure when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(loadSavedMeetings()).toEqual({ ok: false, meetings: [] })
  })

  // AC-39
  it('returns an empty list and reports failure when the stored text is not JSON', () => {
    localStorage.setItem(SAVED_MEETINGS_KEY, '{not json')
    expect(loadSavedMeetings()).toEqual({ ok: false, meetings: [] })
  })

  // AC-39
  it.each([
    ['null', 'null'],
    ['an object instead of a list', JSON.stringify({ meetings: [] })],
    ['a meeting that is not an object', JSON.stringify(['Team sync'])],
    ['a missing name', withMeeting({ name: undefined })],
    ['a spaces-only name', withMeeting({ name: '   ' })],
    ['lines not a list', withMeeting({ lines: 'x' })],
    ['a line without a role id', withMeeting({ lines: [{ roleName: 'Developer', headcount: 1 }] })],
    ['a line without a role name', withMeeting({ lines: [{ roleId: 'r1', headcount: 1 }] })],
    ['a zero headcount', withMeeting({ lines: [{ roleId: 'r1', roleName: 'Developer', headcount: 0 }] })],
    ['a fractional headcount', withMeeting({ lines: [{ roleId: 'r1', roleName: 'Developer', headcount: 1.5 }] })],
    ['a text headcount', withMeeting({ lines: [{ roleId: 'r1', roleName: 'Developer', headcount: '2' }] })],
    ['a missing duration', withMeeting({ duration: undefined })],
    ['negative hours', withMeeting({ duration: { hours: -1, minutes: 0 } })],
    ['fractional hours', withMeeting({ duration: { hours: 0.5, minutes: 0 } })],
    ['60 minutes', withMeeting({ duration: { hours: 0, minutes: 60 } })],
    ['text minutes', withMeeting({ duration: { hours: 0, minutes: '30' } })],
    ['an unknown recurrence', withMeeting({ recurrence: 'yearly' })],
    ['an unknown currency', withMeeting({ currency: 'JPY' })],
  ])('rejects stored data with the wrong shape: %s', (_label, text) => {
    localStorage.setItem(SAVED_MEETINGS_KEY, text)
    expect(loadSavedMeetings()).toEqual({ ok: false, meetings: [] })
  })

  // AC-39
  it('leaves roles and currency readable when saved-meeting data is unreadable', () => {
    saveData(ROLES_AND_CURRENCY)
    localStorage.setItem(SAVED_MEETINGS_KEY, '{not json')

    expect(loadSavedMeetings().ok).toBe(false)
    expect(loadData()).toEqual({ ok: true, data: ROLES_AND_CURRENCY })
  })
})

describe('saveSavedMeetings', () => {
  // AC-37
  it('stores the meetings under their own versioned key', () => {
    expect(saveSavedMeetings([TEAM_SYNC])).toEqual({ ok: true })
    expect(SAVED_MEETINGS_KEY).toBe('mcc:meetings:v1')
    expect(JSON.parse(localStorage.getItem(SAVED_MEETINGS_KEY) ?? '')).toEqual([TEAM_SYNC])
  })

  // AC-39
  it('does not touch the roles and currency key', () => {
    saveData(ROLES_AND_CURRENCY)
    const before = localStorage.getItem(STORAGE_KEY)

    saveSavedMeetings([TEAM_SYNC])

    expect(localStorage.getItem(STORAGE_KEY)).toBe(before)
  })

  // AC-39
  it('reports failure instead of throwing when storage is full or blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(saveSavedMeetings([TEAM_SYNC])).toEqual({ ok: false })
  })
})

describe('network use', () => {
  // AC-38
  it('makes no network calls when loading or saving meetings', () => {
    const fetchSpy = vi.fn()
    const beaconSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('XMLHttpRequest', vi.fn())
    Object.defineProperty(navigator, 'sendBeacon', { value: beaconSpy, configurable: true })

    saveSavedMeetings([TEAM_SYNC])
    loadSavedMeetings()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(XMLHttpRequest).not.toHaveBeenCalled()
    expect(beaconSpy).not.toHaveBeenCalled()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, loadData, saveData } from './storage'
import type { StoredData } from './storage'

const SAMPLE: StoredData = {
  roles: [
    { id: 'r1', name: 'Developer', annualSalary: 36400 },
    { id: 'r2', name: 'Manager', annualSalary: 72800 },
  ],
  currency: 'USD',
}

const EMPTY: StoredData = { roles: [], currency: 'GBP' }

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadData', () => {
  it('returns an empty role list and GBP when nothing is stored', () => {
    expect(loadData()).toEqual({ ok: true, data: EMPTY })
  })

  // AC-17
  it('returns what saveData stored: roles, salaries and currency', () => {
    saveData(SAMPLE)
    expect(loadData()).toEqual({ ok: true, data: SAMPLE })
  })

  // AC-19
  it('falls back to empty data and reports failure when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(loadData()).toEqual({ ok: false, data: EMPTY })
  })

  // AC-19
  it('falls back to empty data and reports failure when the stored text is not JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadData()).toEqual({ ok: false, data: EMPTY })
  })

  // AC-19
  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['roles not an array', JSON.stringify({ roles: 'x', currency: 'GBP' })],
    ['a role without a name', JSON.stringify({ roles: [{ id: 'a', annualSalary: 1 }], currency: 'GBP' })],
    ['a role with a text salary', JSON.stringify({ roles: [{ id: 'a', name: 'A', annualSalary: '1' }], currency: 'GBP' })],
    ['a role with a zero salary', JSON.stringify({ roles: [{ id: 'a', name: 'A', annualSalary: 0 }], currency: 'GBP' })],
    ['an unknown currency', JSON.stringify({ roles: [], currency: 'JPY' })],
    ['a missing currency', JSON.stringify({ roles: [] })],
  ])('rejects stored data with the wrong shape: %s', (_label, text) => {
    localStorage.setItem(STORAGE_KEY, text)
    expect(loadData()).toEqual({ ok: false, data: EMPTY })
  })
})

describe('saveData', () => {
  // AC-17
  it('stores only roles and currency under the versioned key', () => {
    expect(saveData(SAMPLE)).toEqual({ ok: true })
    expect(STORAGE_KEY).toBe('mcc:v1')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(SAMPLE)
  })

  // AC-19
  it('reports failure instead of throwing when storage is full or blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(saveData(SAMPLE)).toEqual({ ok: false })
  })
})

describe('network use', () => {
  // AC-18
  it('makes no network calls when loading or saving', () => {
    const fetchSpy = vi.fn()
    const beaconSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('XMLHttpRequest', vi.fn())
    Object.defineProperty(navigator, 'sendBeacon', { value: beaconSpy, configurable: true })

    saveData(SAMPLE)
    loadData()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(XMLHttpRequest).not.toHaveBeenCalled()
    expect(beaconSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

import { CURRENCIES, DEFAULT_CURRENCY } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import type { Role } from '../domain/types'

export const STORAGE_KEY = 'mcc:v1'

// Only roles and currency are persisted; meeting state is never stored (AC-24).
export interface StoredData {
  roles: Role[]
  currency: CurrencyCode
}

export type LoadResult = { ok: true; data: StoredData } | { ok: false; data: StoredData }

export type SaveResult = { ok: true } | { ok: false }

function emptyData(): StoredData {
  return { roles: [], currency: DEFAULT_CURRENCY }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRole(value: unknown): value is Role {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.annualSalary === 'number' &&
    Number.isFinite(value.annualSalary) &&
    value.annualSalary > 0
  )
}

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value)
}

function isStoredData(value: unknown): value is StoredData {
  return (
    isRecord(value) &&
    Array.isArray(value.roles) &&
    value.roles.every(isRole) &&
    isCurrencyCode(value.currency)
  )
}

// Never throws. Nothing stored yet is a normal first run, not a failure (AC-19).
export function loadData(): LoadResult {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (text === null) {
      return { ok: true, data: emptyData() }
    }
    const parsed: unknown = JSON.parse(text)
    if (!isStoredData(parsed)) {
      return { ok: false, data: emptyData() }
    }
    return { ok: true, data: { roles: parsed.roles, currency: parsed.currency } }
  } catch {
    return { ok: false, data: emptyData() }
  }
}

// Never throws. Data goes to this browser's local storage only (AC-18).
export function saveData(data: StoredData): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ roles: data.roles, currency: data.currency }))
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

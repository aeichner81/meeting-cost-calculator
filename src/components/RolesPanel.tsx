import { useState } from 'react'
import { formatMoney } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import type { Role } from '../domain/types'
import { RoleForm } from './RoleForm'
import styles from './RolesPanel.module.css'

interface RolesPanelProps {
  roles: Role[]
  currency: CurrencyCode
  onEdit: (id: string, name: string, annualSalary: number) => void
  onDelete: (id: string) => void
}

export function RolesPanel({ roles, currency, onEdit, onDelete }: RolesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (roles.length === 0) {
    return <p>No roles yet.</p>
  }

  function saveEdit(id: string, name: string, annualSalary: number) {
    onEdit(id, name, annualSalary)
    setEditingId(null)
  }

  return (
    <ul className={styles.list}>
      {roles.map((role) => (
        <li key={role.id}>
          {editingId === role.id ? (
            <RoleForm
              label={`Edit ${role.name}`}
              initialName={role.name}
              initialSalary={role.annualSalary}
              submitLabel="Save"
              onAdd={(name, annualSalary) => saveEdit(role.id, name, annualSalary)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <span>{role.name}</span> <span>{formatMoney(role.annualSalary, currency)}</span>{' '}
              <button type="button" onClick={() => setEditingId(role.id)}>
                Edit {role.name}
              </button>{' '}
              <button type="button" onClick={() => onDelete(role.id)}>
                Delete {role.name}
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

import { RoleForm } from './components/RoleForm'
import { RolesPanel } from './components/RolesPanel'
import { usePersistedState } from './hooks/usePersistedState'
import styles from './App.module.css'

export function App() {
  const { data, setData } = usePersistedState()

  function addRole(name: string, annualSalary: number) {
    const role = { id: crypto.randomUUID(), name, annualSalary }
    setData((previous) => ({ ...previous, roles: [...previous.roles, role] }))
  }

  function editRole(id: string, name: string, annualSalary: number) {
    setData((previous) => ({
      ...previous,
      roles: previous.roles.map((role) => (role.id === id ? { ...role, name, annualSalary } : role)),
    }))
  }

  function deleteRole(id: string) {
    setData((previous) => ({ ...previous, roles: previous.roles.filter((role) => role.id !== id) }))
  }

  return (
    <main className={styles.main}>
      <h1>Meeting Cost Calculator</h1>
      <section aria-labelledby="roles-heading">
        <h2 id="roles-heading">Roles</h2>
        <RoleForm onAdd={addRole} />
        <RolesPanel
          roles={data.roles}
          currency={data.currency}
          onEdit={editRole}
          onDelete={deleteRole}
        />
      </section>
    </main>
  )
}

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

  return (
    <main className={styles.main}>
      <h1>Meeting Cost Calculator</h1>
      <section aria-labelledby="roles-heading">
        <h2 id="roles-heading">Roles</h2>
        <RoleForm onAdd={addRole} />
        <RolesPanel roles={data.roles} currency={data.currency} />
      </section>
    </main>
  )
}

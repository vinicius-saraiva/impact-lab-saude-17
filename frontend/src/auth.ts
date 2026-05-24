export interface AuthData {
  profissionalId: string
  nome: string
  equipeId: string
}

const AUTH_KEY = 'acs_auth'

export function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthData) : null
  } catch {
    return null
  }
}

export function setAuth(data: AuthData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}

// Credenciais mock para demo
export const MOCK_USERS: Array<AuthData & { senha: string }> = [
  { profissionalId: 'acs-demo-001', nome: 'Cláudia', equipeId: '0206636a', senha: '1234' },
  { profissionalId: 'acs-demo-002', nome: 'Ana Paula', equipeId: '0206636a', senha: '1234' },
]

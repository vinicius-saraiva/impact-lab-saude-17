import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuth, MOCK_USERS } from '../auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    await new Promise((r) => setTimeout(r, 400))

    const user = MOCK_USERS.find(
      (u) => u.profissionalId === id.trim() && u.senha === senha,
    )

    if (user) {
      setAuth({ profissionalId: user.profissionalId, nome: user.nome, equipeId: user.equipeId })
      navigate('/', { replace: true })
    } else {
      setErro('ID ou senha incorretos.')
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-700 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-2xl font-bold text-white">ACS Visitas</h1>
          <p className="text-blue-200 text-sm mt-1">Secretaria Municipal de Saúde · Rio de Janeiro</p>
        </div>

        {/* Card de login */}
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-800 text-center">Entrar</h2>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">ID do profissional</label>
            <input
              type="text"
              autoComplete="username"
              placeholder="Ex: acs-demo-001"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl text-base disabled:opacity-60 transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-xs text-slate-400 text-center pt-1">
            Demo: <span className="font-mono">acs-demo-001</span> · senha <span className="font-mono">1234</span>
          </p>
        </form>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CondicaoBadge } from '../components/CondicaoBadge'
import { PrioridadeBadge } from '../components/PrioridadeBadge'
import { CONTEXTO_MEDICO, formatarDataPtBr, pacientesParaMedico } from '../dataMedico'
import type { Paciente, Condicao } from '../types'

type Filtro = 'todos' | 'critica' | 'hipertenso' | 'diabetico' | 'crianca' | 'vulneravel'

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'critica', label: 'Crítico' },
  { id: 'hipertenso', label: 'HAS' },
  { id: 'diabetico', label: 'DM' },
  { id: 'crianca', label: 'Crianças' },
  { id: 'vulneravel', label: 'Vulneráveis' },
]

export function MedicoPage() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')

  const todos = pacientesParaMedico()
  const lista = useMemo(() => {
    return todos.filter((p) => {
      if (filtro === 'critica' && p.prioridade !== 'critica') return false
      if (filtro !== 'todos' && filtro !== 'critica' && !p.condicoes.includes(filtro as Condicao))
        return false
      if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [filtro, busca, todos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Header */}
      <div className="bg-teal-700 text-white px-4 pt-10 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-teal-200 text-xs uppercase tracking-wide">Painel Médico</p>
            <h1 className="text-xl font-bold mt-1 leading-tight">Dra. Laura M.</h1>
            <p className="text-teal-100 text-sm mt-0.5">Clínica da Família Rocinha</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex-shrink-0 text-xs bg-teal-800/60 hover:bg-teal-800 text-teal-100 px-3 py-1.5 rounded-full border border-teal-500/40"
          >
            ← Modo ACS
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat valor={todos.length} label="pacientes" />
          <Stat
            valor={todos.filter((p) => p.prioridade === 'critica').length}
            label="prioridade crítica"
            tone="critical"
          />
          <Stat
            valor={todos.filter((p) => /urgência\/internação/.test(p.motivoPrioridade)).length}
            label="com evento recente"
            tone="warning"
          />
        </div>
      </div>

      {/* Busca + filtros */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar paciente..."
          className="w-full border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <div className="flex gap-2 overflow-x-auto mt-2 pb-1 scrollbar-hide">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                filtro === f.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {lista.length} pacientes
          </h2>
          <span className="text-xs text-slate-400">PRIO-ACS desc</span>
        </div>

        {lista.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhum paciente para os filtros atuais.
          </div>
        )}

        {lista.map((p) => (
          <PacienteCardMedico
            key={p.id}
            paciente={p}
            onClick={() => navigate(`/medico/paciente/${p.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({
  valor,
  label,
  tone = 'default',
}: {
  valor: number
  label: string
  tone?: 'default' | 'critical' | 'warning'
}) {
  const accent =
    tone === 'critical'
      ? 'text-red-200'
      : tone === 'warning'
        ? 'text-amber-200'
        : 'text-teal-100'
  return (
    <div className="bg-teal-800/40 rounded-xl border border-teal-500/30 px-3 py-2">
      <p className={`text-xl font-bold leading-tight ${accent}`}>{valor}</p>
      <p className="text-xs text-teal-100/80 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

function PacienteCardMedico({ paciente, onClick }: { paciente: Paciente; onClick: () => void }) {
  const ctx = CONTEXTO_MEDICO[paciente.id]
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base text-slate-800">{paciente.nome}</span>
            <PrioridadeBadge prioridade={paciente.prioridade} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {paciente.sexo[0]} · {paciente.faixaEtaria} anos
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-xs text-slate-400 leading-tight">PRIO-ACS</span>
          <span className="text-xl font-bold text-teal-700 leading-tight">{paciente.prioScore}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {paciente.condicoes.map((c) => (
          <CondicaoBadge key={c} condicao={c} />
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-2 leading-snug">{paciente.motivoPrioridade}</p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-400">
          Próx. consulta:{' '}
          <span className="text-slate-700 font-medium">
            {ctx?.proximaConsulta ? formatarDataPtBr(ctx.proximaConsulta.data) : '—'}
          </span>
        </span>
        <span className="text-teal-600 font-medium">Abrir painel ›</span>
      </div>
    </button>
  )
}

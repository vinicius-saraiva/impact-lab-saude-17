import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PrioridadeBadge } from '../components/PrioridadeBadge'
import { CondicaoBadge } from '../components/CondicaoBadge'
import { SyncBar } from '../components/SyncBar'
import { MapaVisitas } from '../components/MapaVisitas'
import { useSync } from '../hooks/useSync'
import { db } from '../db'
import { getPacientesSemana } from '../mockData'
import { getAuth } from '../auth'
import type { Paciente } from '../types'

const auth = getAuth()
const PROFISSIONAL_ID = auth?.profissionalId ?? 'acs-demo-001'
const NOME_ACS = auth?.nome ?? 'Cláudia'

const DIAS_PT: Record<string, string> = {
  '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb',
}

function formatarDia(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return {
    nomeDia: DIAS_PT[String(d.getDay())],
    numeroDia: String(d.getDate()).padStart(2, '0'),
    ehHoje: iso === new Date().toISOString().split('T')[0],
  }
}

function rangeSemanaDias(dias: string[]): string {
  if (dias.length === 0) return ''
  const ini = formatarDia(dias[0])
  const fim = formatarDia(dias[dias.length - 1])
  return `${ini.nomeDia} ${ini.numeroDia} – ${fim.nomeDia} ${fim.numeroDia}`
}

export function ListaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as { tab?: string; pacienteId?: string } | null

  const { pendentes, status, isOnline, sincronizar } = useSync()
  const [visitadosSemana, setVisitadosSemana] = useState<Set<string>>(new Set())
  const [aba, setAba] = useState<'lista' | 'mapa'>(routeState?.tab === 'mapa' ? 'mapa' : 'lista')
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null)

  const semana = getPacientesSemana()
  const diasOrdenados = Array.from(semana.keys()).sort()
  const todosPacientes = diasOrdenados.flatMap((d) => semana.get(d) ?? [])
  const totalSemana = todosPacientes.length
  const visitadosTotal = todosPacientes.filter((p) => visitadosSemana.has(p.id)).length

  useEffect(() => {
    const inicio = diasOrdenados[0]
    const hoje = new Date().toISOString().split('T')[0]
    db.visitas
      .where('profissionalId')
      .equals(PROFISSIONAL_ID)
      .and((v) => v.dataVisita >= inicio && v.dataVisita <= hoje)
      .toArray()
      .then((visitas) => setVisitadosSemana(new Set(visitas.map((v) => v.pacienteId))))
  }, [])

  // Abrir bottom sheet do paciente quando navegado via "Ver no mapa"
  useEffect(() => {
    if (routeState?.pacienteId && routeState.tab === 'mapa') {
      const p = todosPacientes.find((x) => x.id === routeState.pacienteId)
      if (p) setPacienteSelecionado(p)
    }
  }, [routeState?.pacienteId, routeState?.tab])

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Olá, {NOME_ACS} 👋</h1>
            <p className="text-blue-200 text-sm mt-0.5">Clínica da Família Rocinha</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{visitadosTotal}</div>
            <div className="text-blue-200 text-xs">de {totalSemana} visitas</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/supervisor')}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 bg-blue-800/60 px-3 py-1.5 rounded-full border border-blue-500/40"
        >
          <span>📊</span>
          Painel de gestão
          <span className="opacity-70">›</span>
        </button>
        {/* Progress */}
        <div className="mt-3 mb-4">
          <div className="h-1.5 bg-blue-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${totalSemana > 0 ? (visitadosTotal / totalSemana) * 100 : 0}%` }}
            />
          </div>
        </div>
        {/* Toggle Lista / Mapa */}
        <div className="flex bg-blue-800 rounded-xl p-1 gap-1">
          {(['lista', 'mapa'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                aba === a ? 'bg-white text-blue-700' : 'text-blue-200'
              }`}
            >
              {a === 'lista' ? '☰ Lista' : '🗺 Mapa'}
            </button>
          ))}
        </div>
      </div>

      {/* Sync bar */}
      <SyncBar pendentes={pendentes} status={status} isOnline={isOnline} onSync={sincronizar} />

      {/* Aba Mapa */}
      {aba === 'mapa' && (
        <div className="flex-1" style={{ minHeight: 0 }}>
          <MapaVisitas
            pacientes={todosPacientes}
            visitados={visitadosSemana}
            onSelectPaciente={setPacienteSelecionado}
          />
        </div>
      )}

      {/* Bottom sheet — paciente selecionado no mapa */}
      {pacienteSelecionado && (
        <>
          <div
            className="fixed inset-0 bg-black/20"
            style={{ zIndex: 1000 }}
            onClick={() => setPacienteSelecionado(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl" style={{ zIndex: 1001 }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Paciente no mapa
              </span>
              <button
                onClick={() => setPacienteSelecionado(null)}
                className="text-slate-400 text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="px-4 pb-6">
              <PacienteCard
                paciente={pacienteSelecionado}
                ordem={todosPacientes.findIndex((p) => p.id === pacienteSelecionado.id) + 1}
                visitado={visitadosSemana.has(pacienteSelecionado.id)}
                onClick={() => {
                  setPacienteSelecionado(null)
                  navigate(`/paciente/${pacienteSelecionado.id}`)
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Aba Lista — todos os pacientes da semana */}
      {aba === 'lista' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Range da semana */}
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {rangeSemanaDias(diasOrdenados)}
            </h2>
            <span className="text-xs text-slate-400">{totalSemana} visitas</span>
          </div>

          {todosPacientes.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhuma visita planejada para esta semana.
            </div>
          )}

          {/* Pendentes */}
          {todosPacientes
            .filter((p) => !visitadosSemana.has(p.id))
            .map((paciente, i) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                ordem={i + 1}
                visitado={false}
                onClick={() => navigate(`/paciente/${paciente.id}`)}
              />
            ))}

          {/* Visitados — ao fundo, em verde */}
          {visitadosTotal > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-green-200" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  {visitadosTotal} visitado{visitadosTotal > 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-green-200" />
              </div>
              {todosPacientes
                .filter((p) => visitadosSemana.has(p.id))
                .map((paciente) => (
                  <PacienteCard
                    key={paciente.id}
                    paciente={paciente}
                    ordem={0}
                    visitado={true}
                    onClick={() => navigate(`/visita/${paciente.id}`)}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface CardProps {
  paciente: Paciente
  ordem: number
  visitado: boolean
  onClick: () => void
}

function PacienteCard({ paciente, ordem, visitado, onClick }: CardProps) {
  if (visitado) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-green-50 rounded-2xl border border-green-200 p-4 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base text-green-800">{paciente.nome}</span>
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                Visitado
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {paciente.condicoes.map((c) => <CondicaoBadge key={c} condicao={c} />)}
            </div>
            <p className="text-xs text-green-600 mt-1.5">Ver visita registrada →</p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            paciente.prioridade === 'critica'
              ? 'bg-red-100 text-red-600'
              : paciente.prioridade === 'alta'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {ordem}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base text-slate-800">{paciente.nome}</span>
            <PrioridadeBadge prioridade={paciente.prioridade} />
          </div>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {paciente.condicoes.map((c) => (
              <CondicaoBadge key={c} condicao={c} />
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-1.5 leading-snug">{paciente.motivoPrioridade}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>📍 {paciente.distanciaKm.toFixed(1).replace('.', ',')} km</span>
            <span>·</span>
            <span>{paciente.sexo[0]} · {paciente.faixaEtaria} anos</span>
          </div>
        </div>

        <span className="text-slate-300 text-lg flex-shrink-0">›</span>
      </div>
    </button>
  )
}

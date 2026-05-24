import { useNavigate, useParams } from 'react-router-dom'
import { CondicaoBadge } from '../components/CondicaoBadge'
import { PrioridadeBadge } from '../components/PrioridadeBadge'
import { MOCK_PACIENTES } from '../mockData'
import {
  CONTEXTO_MEDICO,
  PRIO_LABELS,
  CONDICAO_RESUMO,
  diasDesde,
  formatarDataPtBr,
  type EventoClinico,
  type PrioAcsBreakdown,
} from '../dataMedico'

export function PacienteMedicoPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const paciente = MOCK_PACIENTES.find((p) => p.id === id)
  const ctx = id ? CONTEXTO_MEDICO[id] : undefined

  if (!paciente || !ctx) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <p className="text-slate-500">Paciente não encontrado.</p>
        <button
          onClick={() => navigate('/medico')}
          className="mt-4 text-teal-600 underline text-sm"
        >
          Voltar ao painel
        </button>
      </div>
    )
  }

  const total = Object.values(ctx.prioAcsBreakdown).reduce((s, v) => s + v, 0)
  const resumoCondicoes = paciente.condicoes.map((c) => CONDICAO_RESUMO[c]).join(' · ')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Header */}
      <div className="bg-teal-700 text-white px-4 pt-10 pb-5">
        <button
          onClick={() => navigate('/medico')}
          className="text-xs text-teal-100 hover:text-white inline-flex items-center gap-1"
        >
          ← Voltar à lista
        </button>
        <h1 className="text-2xl font-bold mt-2 leading-tight">{paciente.nome}</h1>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <PrioridadeBadge prioridade={paciente.prioridade} />
          <span className="text-sm text-teal-100">
            {paciente.sexo} · {paciente.faixaEtaria} anos · {paciente.racaCor}
          </span>
        </div>
        {resumoCondicoes && (
          <p className="text-xs text-teal-100/90 mt-1">{resumoCondicoes}</p>
        )}
      </div>

      {/* Condicoes */}
      <div className="px-4 mt-3">
        <div className="flex flex-wrap gap-1.5">
          {paciente.condicoes.map((c) => (
            <CondicaoBadge key={c} condicao={c} />
          ))}
        </div>
      </div>

      {/* PRIO-ACS breakdown */}
      <Section titulo="Score PRIO-ACS" hint="Por que este paciente foi priorizado">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Score total</p>
              <p className="text-4xl font-bold text-teal-700 leading-none">{total}</p>
            </div>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>

          <div className="mt-4 space-y-3">
            {(['icsap', 'lifeStage', 'careGap', 'social'] as (keyof PrioAcsBreakdown)[]).map(
              (key) => {
                const valor = ctx.prioAcsBreakdown[key]
                const cfg = PRIO_LABELS[key]
                const pct = (valor / cfg.max) * 100
                return (
                  <div key={key}>
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700">{cfg.titulo}</p>
                      <p className="text-sm font-mono text-slate-600">
                        {valor}
                        <span className="text-slate-400 text-xs"> / {cfg.max}</span>
                      </p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{cfg.ref}</p>
                  </div>
                )
              },
            )}
          </div>
        </div>
      </Section>

      {/* Última visita ACS */}
      {ctx.ultimaVisitaAcs && (
        <Section titulo="Última visita ACS" hint="O que o ACS registrou em campo">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">{ctx.ultimaVisitaAcs.acsNome}</p>
              <p className="text-xs text-slate-500">
                {formatarDataPtBr(ctx.ultimaVisitaAcs.data)} ·{' '}
                <span className="text-slate-400">{diasDesde(ctx.ultimaVisitaAcs.data)}d</span>
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {ctx.ultimaVisitaAcs.observacoes}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {ctx.ultimaVisitaAcs.pressaoAferida && (
                <InfoCell
                  label="Pressão aferida"
                  valor={ctx.ultimaVisitaAcs.pressaoAferida + ' mmHg'}
                />
              )}
              {ctx.ultimaVisitaAcs.adesaoMedicacao && (
                <InfoCell
                  label="Adesão medicação"
                  valor={
                    ctx.ultimaVisitaAcs.adesaoMedicacao === 'regular'
                      ? 'Regular'
                      : ctx.ultimaVisitaAcs.adesaoMedicacao === 'irregular'
                        ? 'Irregular'
                        : 'Não toma'
                  }
                  tone={ctx.ultimaVisitaAcs.adesaoMedicacao === 'regular' ? 'good' : 'warning'}
                />
              )}
            </div>

            {ctx.ultimaVisitaAcs.riscoIdentificado && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
                ⚠ Risco identificado pelo ACS: {ctx.ultimaVisitaAcs.riscoIdentificado}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Eventos não-eletivos */}
      <Section
        titulo="Eventos clínicos"
        hint={`${ctx.eventos.filter((e) => e.tipo === 'urgencia-emergencia-ou-internacao').length} não-eletivos recentes`}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <ol className="space-y-3">
            {ctx.eventos.map((e, i) => (
              <EventoItem key={i} evento={e} />
            ))}
          </ol>
        </div>
      </Section>

      {/* Próxima consulta */}
      {ctx.proximaConsulta && (
        <Section titulo="Próxima consulta agendada">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-slate-800 leading-tight">
                  {formatarDataPtBr(ctx.proximaConsulta.data)}
                </p>
                <p className="text-sm text-slate-600 mt-1">{ctx.proximaConsulta.motivo}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ctx.proximaConsulta.profissional}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
                📅
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Sugestões clínicas */}
      <Section titulo="Sugestões clínicas" hint="Roteiro pra próxima consulta">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <ul className="space-y-2">
            {ctx.sugestoesClinicas.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-teal-600 font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Histórico visitas */}
      <Section titulo="Acompanhamento ACS (12m)">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-slate-800">{ctx.totalVisitasAcs12m}</p>
            <p className="text-xs text-slate-500">visitas no último ano</p>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-snug">
            Cadência esperada para condição: aproximadamente{' '}
            <span className="font-semibold text-slate-600">
              {paciente.hipertenso || paciente.diabetico ? '4-6/ano' : '2-4/ano'}
            </span>
          </p>
        </div>
      </Section>

      <div className="px-4 mt-8 text-center">
        <p className="text-xs text-slate-400">
          Camada de inteligência sobre o VitaCare APS · não substitui o prontuário oficial
        </p>
      </div>
    </div>
  )
}

function Section({
  titulo,
  hint,
  children,
}: {
  titulo: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 mt-5">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{titulo}</h2>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function InfoCell({
  label,
  valor,
  tone = 'neutral',
}: {
  label: string
  valor: string
  tone?: 'neutral' | 'good' | 'warning'
}) {
  const toneClass =
    tone === 'good' ? 'text-green-700' : tone === 'warning' ? 'text-amber-700' : 'text-slate-700'
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${toneClass}`}>{valor}</p>
    </div>
  )
}

function EventoItem({ evento }: { evento: EventoClinico }) {
  const eUrgencia = evento.tipo === 'urgencia-emergencia-ou-internacao'
  const dias = diasDesde(evento.data)
  return (
    <li className="flex items-start gap-3">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
          eUrgencia ? 'bg-red-500' : 'bg-blue-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-sm font-medium ${eUrgencia ? 'text-red-700' : 'text-slate-700'}`}>
            {eUrgencia ? 'Urgência / Internação' : 'Agendamento APS'}
          </p>
          <p className="text-xs text-slate-400 whitespace-nowrap">
            {formatarDataPtBr(evento.data)} · {dias}d
          </p>
        </div>
        {evento.local && <p className="text-xs text-slate-500 mt-0.5">{evento.local}</p>}
      </div>
    </li>
  )
}

// Contexto clínico complementar ao MOCK_PACIENTES — visão da médica.
// Camada de "inteligência" sobre o VitaCare APS: PRIO-ACS breakdown,
// última visita do ACS, eventos não-eletivos, próxima consulta, sugestões.

import { MOCK_PACIENTES } from './mockData'
import type { Paciente, Condicao } from './types'

export type EventoTipo = 'agendamento' | 'urgencia-emergencia-ou-internacao'

export interface PrioAcsBreakdown {
  icsap: number // 0-30 — internações sensíveis à APS (Portaria SAS/MS 221/2008)
  lifeStage: number // 0-25 — idade/ciclo de vida (gestante, idoso, criança)
  careGap: number // 0-25 — atraso da cadência oficial de visita
  social: number // 0-20 — vulnerabilidade social
}

export interface EventoClinico {
  data: string
  tipo: EventoTipo
  local?: string
}

export interface UltimaVisitaAcs {
  data: string
  acsNome: string
  observacoes: string
  pressaoAferida?: string
  adesaoMedicacao?: 'regular' | 'irregular' | 'nao_toma'
  riscoIdentificado?: string
}

export interface ProximaConsulta {
  data: string
  profissional: string
  motivo: string
}

export interface ContextoMedico {
  pacienteId: string
  prioAcsBreakdown: PrioAcsBreakdown
  ultimaVisitaAcs?: UltimaVisitaAcs
  eventos: EventoClinico[]
  proximaConsulta?: ProximaConsulta
  sugestoesClinicas: string[]
  totalVisitasAcs12m: number
}

// Deriva o breakdown PRIO-ACS a partir das flags + score do paciente.
// Pesos consistentes com MASTER_CONTEXT.md §6.4.
function derivarBreakdown(p: Paciente): PrioAcsBreakdown {
  // Care gap: cresce com dias sem visita (extraído do motivoPrioridade)
  const matchDias = p.motivoPrioridade.match(/sem visita há (\d+)d/)
  const dias = matchDias ? parseInt(matchDias[1], 10) : 0
  const careGap = Math.min(25, Math.round(dias / 15))

  // ICSAP: hipertensão/diabetes não controlados + eventos não-eletivos
  const matchUrg = p.motivoPrioridade.match(/(\d+) urgência\/internação/)
  const urgs = matchUrg ? parseInt(matchUrg[1], 10) : 0
  let icsap = 0
  if (p.hipertenso) icsap += 8
  if (p.diabetico) icsap += 10
  icsap += Math.min(15, urgs * 5)
  icsap = Math.min(30, icsap)

  // Life stage: idoso (66+), criança (0-6), gestante
  let lifeStage = 0
  if (p.gestante) lifeStage = 25
  else if (p.faixaEtaria === '66+') lifeStage = 18
  else if (p.faixaEtaria === '0-6') lifeStage = 22
  else if (p.faixaEtaria === '6-18') lifeStage = 8

  // Social: vulnerabilidade
  const social = p.situacaoVulnerabilidade ? 18 : 0

  return { icsap, lifeStage, careGap, social }
}

// Eventos sintéticos consistentes com o motivoPrioridade do paciente.
function derivarEventos(p: Paciente): EventoClinico[] {
  const eventos: EventoClinico[] = []
  const matchUrg = p.motivoPrioridade.match(/(\d+) urgência\/internação/)
  const urgs = matchUrg ? parseInt(matchUrg[1], 10) : 0

  const hoje = new Date()

  for (let i = 0; i < urgs; i++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - 15 - i * 22)
    eventos.push({
      data: data.toISOString().split('T')[0],
      tipo: 'urgencia-emergencia-ou-internacao',
      local: i % 2 === 0 ? 'UPA Rocinha' : 'Hospital Miguel Couto',
    })
  }

  // Sempre adiciona pelo menos 1 agendamento histórico
  const agendaPassada = new Date(hoje)
  agendaPassada.setDate(agendaPassada.getDate() - 90)
  eventos.push({
    data: agendaPassada.toISOString().split('T')[0],
    tipo: 'agendamento',
    local: 'Clínica da Família Rocinha',
  })

  return eventos.sort((a, b) => (a.data < b.data ? 1 : -1))
}

function sugerirAcoes(p: Paciente): string[] {
  const out: string[] = []
  if (p.hipertenso && p.diabetico) {
    out.push('Solicitar HbA1c e perfil lipídico (>3 meses do último?)')
    out.push('Reforçar adesão à medicação anti-hipertensiva e hipoglicemiante')
  } else if (p.hipertenso) {
    out.push('Aferir PA e revisar adesão à medicação anti-hipertensiva')
  }
  if (p.diabetico) {
    out.push('Inspecionar pés (risco de pé diabético em idoso)')
  }
  if (p.situacaoVulnerabilidade) {
    out.push('Avaliar acesso a medicação e suporte social (Cras / Bolsa Família)')
  }
  if (p.faixaEtaria === '0-6' && p.condicoes.includes('crianca')) {
    out.push('Verificar caderneta de vacinação e marcos do desenvolvimento')
  }
  if (p.motivoPrioridade.includes('urgência/internação')) {
    out.push('Revisar prontuário UPA — identificar causa do evento não-eletivo')
  }
  if (out.length === 0) {
    out.push('Visita de rotina — aproveitar para atualizar dados sociodemográficos')
  }
  return out.slice(0, 4)
}

function proximaConsulta(p: Paciente): ProximaConsulta | undefined {
  // Idosos + crônicos descompensados → próxima consulta em 7-14 dias
  // Crônicos compensados → 30-90 dias
  const matchUrg = p.motivoPrioridade.match(/(\d+) urgência\/internação/)
  const urgs = matchUrg ? parseInt(matchUrg[1], 10) : 0
  let diasFuturos = 60
  if (urgs > 0) diasFuturos = 7 + urgs * 2
  else if (p.prioridade === 'critica') diasFuturos = 14
  else if (p.prioridade === 'alta') diasFuturos = 30

  const data = new Date()
  data.setDate(data.getDate() + diasFuturos)
  return {
    data: data.toISOString().split('T')[0],
    profissional: 'Dra. Laura M.',
    motivo:
      p.hipertenso && p.diabetico
        ? 'Acompanhamento HAS + DM'
        : p.hipertenso
          ? 'Acompanhamento HAS'
          : p.diabetico
            ? 'Acompanhamento DM'
            : 'Consulta de rotina',
  }
}

const ACS_NOMES = ['Ana Paula', 'Camila S.', 'Joana R.', 'Mariana V.']

function ultimaVisitaAcs(p: Paciente): UltimaVisitaAcs | undefined {
  if (!p.ultimaVisita) return undefined
  const idx = parseInt(p.id.replace(/\D/g, ''), 10) || 0
  const acsNome = ACS_NOMES[idx % ACS_NOMES.length]

  const obs: string[] = []
  if (p.hipertenso) obs.push('paciente refere tomar medicação')
  if (p.diabetico) obs.push('faz dieta parcial')
  if (p.situacaoVulnerabilidade) obs.push('família em situação de vulnerabilidade')
  if (p.faixaEtaria === '66+') obs.push('mora com a filha')

  const observacoes = obs.length > 0 ? obs.join(', ') + '.' : 'Visita sem intercorrências.'

  return {
    data: p.ultimaVisita,
    acsNome,
    observacoes,
    pressaoAferida: p.ultimoRegistroHipertensao?.pressao ?? (p.hipertenso ? '140/85' : undefined),
    adesaoMedicacao:
      p.hipertenso || p.diabetico ? (idx % 3 === 0 ? 'irregular' : 'regular') : undefined,
    riscoIdentificado: p.motivoPrioridade.includes('urgência') ? 'evento não-eletivo recente' : undefined,
  }
}

function totalVisitas12m(p: Paciente): number {
  if (!p.ultimaVisita) return 0
  const matchDias = p.motivoPrioridade.match(/sem visita há (\d+)d/)
  const dias = matchDias ? parseInt(matchDias[1], 10) : 0
  if (dias >= 300) return 1
  if (dias >= 180) return 2
  if (dias >= 90) return 4
  return 6
}

// Mapa pacienteId → contexto, derivado deterministicamente do MOCK_PACIENTES.
export const CONTEXTO_MEDICO: Record<string, ContextoMedico> = Object.fromEntries(
  MOCK_PACIENTES.map((p) => [
    p.id,
    {
      pacienteId: p.id,
      prioAcsBreakdown: derivarBreakdown(p),
      ultimaVisitaAcs: ultimaVisitaAcs(p),
      eventos: derivarEventos(p),
      proximaConsulta: proximaConsulta(p),
      sugestoesClinicas: sugerirAcoes(p),
      totalVisitasAcs12m: totalVisitas12m(p),
    },
  ]),
)

// Lista ordenada por PRIO-ACS desc para o painel da médica.
export function pacientesParaMedico(): Paciente[] {
  return [...MOCK_PACIENTES].sort((a, b) => b.prioScore - a.prioScore)
}

export function formatarDataPtBr(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function diasDesde(iso: string, refIso?: string): number {
  const a = new Date(iso + 'T12:00:00').getTime()
  const ref = refIso ? new Date(refIso + 'T12:00:00') : new Date()
  return Math.max(0, Math.round((ref.getTime() - a) / 86400000))
}

export const PRIO_LABELS: Record<keyof PrioAcsBreakdown, { titulo: string; max: number; ref: string }> =
  {
    icsap: { titulo: 'ICSAP', max: 30, ref: 'Portaria SAS/MS 221/2008 — internações sensíveis à APS' },
    lifeStage: { titulo: 'Ciclo de vida', max: 25, ref: 'Gestante, criança 0-6, idoso 66+' },
    careGap: { titulo: 'Lacuna de cuidado', max: 25, ref: 'Dias desde a última visita ACS' },
    social: { titulo: 'Vulnerabilidade social', max: 20, ref: 'Bolsa Família, Cras, território' },
  }

export const CONDICAO_RESUMO: Record<Condicao, string> = {
  hipertenso: 'HAS',
  diabetico: 'DM',
  gestante: 'Gestante',
  crianca: 'Criança',
  vulneravel: 'Vulnerável',
}

/**
 * Testes para:
 * 1. getCamposFaltando — validação de campos obrigatórios por perfil de paciente
 * 2. Lógica de ordenação da lista (visitados ao fundo)
 * 3. Fluxo de salvar visita: paciente passa a ser considerado visitado
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ACSDatabase } from '../db'
import type { RegistroVisita } from '../types'

function makeDb(name = `test-db-${Math.random()}`) {
  return new ACSDatabase(name)
}

// ─── getCamposFaltando (extraída do VisitaPage) ───────────────────────────────

type PacienteMin = {
  hipertenso?: boolean
  diabetico?: boolean
  gestante?: boolean
  faixaEtaria?: string
}

function getCamposFaltando(
  form: Partial<RegistroVisita>,
  paciente: PacienteMin,
  semanaGest: number | undefined,
  foiAtendido: boolean,
): string[] {
  if (!foiAtendido) return []
  const f: string[] = []

  if (paciente.hipertenso || paciente.diabetico) {
    if (!form.p1_esqueceu_dose) f.push('p1_esqueceu_dose')
    if (!form.p2_dificuldade_lembrar) f.push('p2_dificuldade_lembrar')
    if (!form.p3_desconforto_medicacao) f.push('p3_desconforto_medicacao')
    if (!form.p4_duvida_tratamento) f.push('p4_duvida_tratamento')
    if (!form.p5_mudanca_estilo_vida) f.push('p5_mudanca_estilo_vida')
    if (!form.p6_upa_emergencia) f.push('p6_upa_emergencia')
    if (paciente.diabetico && !form.p7_pe_diabetico) f.push('p7_pe_diabetico')
    if (paciente.hipertenso && form.pressaoAferidaHoje === undefined) f.push('pressaoAferidaHoje')
    if (form.pressaoAferidaHoje === true && !(form.valorPressao as string)) f.push('valorPressao')
  }

  if (paciente.gestante) {
    if (!form.p1g_mediu_pressao) f.push('p1g_mediu_pressao')
    if (!form.p2g_upa_maternidade) f.push('p2g_upa_maternidade')
    if (!form.p3g_realizou_exames) f.push('p3g_realizou_exames')
    if ((semanaGest === undefined || semanaGest <= 12) && !form.p5g_sangramento) f.push('p5g_sangramento')
    if ((semanaGest === undefined || semanaGest >= 25) && !form.p9g_bebe_mexeu) f.push('p9g_bebe_mexeu')
  }

  if (paciente.faixaEtaria === '0-6') {
    if (!form.p3c_consultas) f.push('p3c_consultas')
    if (!form.p4c_vacinacao) f.push('p4c_vacinacao')
    if (!form.p5c_alimentacao) f.push('p5c_alimentacao')
  }

  return f
}

// ─── Validação hipertenso ────────────────────────────────────────────────────

describe('getCamposFaltando — hipertenso', () => {
  const paciente: PacienteMin = { hipertenso: true }

  it('não atendido → sem campos faltando', () => {
    expect(getCamposFaltando({}, paciente, undefined, false)).toHaveLength(0)
  })

  it('atendido sem nada preenchido → lista todos os campos obrigatórios', () => {
    const faltando = getCamposFaltando({}, paciente, undefined, true)
    expect(faltando).toContain('p1_esqueceu_dose')
    expect(faltando).toContain('p2_dificuldade_lembrar')
    expect(faltando).toContain('p3_desconforto_medicacao')
    expect(faltando).toContain('p4_duvida_tratamento')
    expect(faltando).toContain('p5_mudanca_estilo_vida')
    expect(faltando).toContain('p6_upa_emergencia')
    expect(faltando).toContain('pressaoAferidaHoje')
    // p7 só para diabético
    expect(faltando).not.toContain('p7_pe_diabetico')
  })

  it('todos preenchidos e pressão não aferida → zero faltando', () => {
    const form: Partial<RegistroVisita> = {
      p1_esqueceu_dose: 'nao',
      p2_dificuldade_lembrar: 'nunca',
      p3_desconforto_medicacao: 'nao',
      p4_duvida_tratamento: 'nao',
      p5_mudanca_estilo_vida: 'nao',
      p6_upa_emergencia: 'nao',
      pressaoAferidaHoje: false,
    }
    expect(getCamposFaltando(form, paciente, undefined, true)).toHaveLength(0)
  })

  it('pressão aferida=true mas sem valor → exige valorPressao', () => {
    const form: Partial<RegistroVisita> = {
      p1_esqueceu_dose: 'nao', p2_dificuldade_lembrar: 'nunca',
      p3_desconforto_medicacao: 'nao', p4_duvida_tratamento: 'nao',
      p5_mudanca_estilo_vida: 'nao', p6_upa_emergencia: 'nao',
      pressaoAferidaHoje: true,
    }
    const faltando = getCamposFaltando(form, paciente, undefined, true)
    expect(faltando).toContain('valorPressao')
  })

  it('pressão aferida=true com valor → não exige valorPressao', () => {
    const form: Partial<RegistroVisita> = {
      p1_esqueceu_dose: 'nao', p2_dificuldade_lembrar: 'nunca',
      p3_desconforto_medicacao: 'nao', p4_duvida_tratamento: 'nao',
      p5_mudanca_estilo_vida: 'nao', p6_upa_emergencia: 'nao',
      pressaoAferidaHoje: true, valorPressao: '130/85',
    }
    expect(getCamposFaltando(form, paciente, undefined, true)).toHaveLength(0)
  })
})

// ─── Validação hipertenso + diabético ────────────────────────────────────────

describe('getCamposFaltando — hipertenso + diabético', () => {
  const paciente: PacienteMin = { hipertenso: true, diabetico: true }

  it('exige p7_pe_diabetico além dos campos de HAS', () => {
    const faltando = getCamposFaltando({}, paciente, undefined, true)
    expect(faltando).toContain('p7_pe_diabetico')
  })

  it('formulário completo HAS+DM sem nenhum campo faltando', () => {
    const form: Partial<RegistroVisita> = {
      p1_esqueceu_dose: 'nao', p2_dificuldade_lembrar: 'nunca',
      p3_desconforto_medicacao: 'nao', p4_duvida_tratamento: 'nao',
      p5_mudanca_estilo_vida: 'nao', p6_upa_emergencia: 'nao',
      p7_pe_diabetico: 'nao',
      pressaoAferidaHoje: false,
    }
    expect(getCamposFaltando(form, paciente, undefined, true)).toHaveLength(0)
  })
})

// ─── Validação gestante ──────────────────────────────────────────────────────

describe('getCamposFaltando — gestante', () => {
  const paciente: PacienteMin = { gestante: true }

  it('semana gestacional desconhecida → exige P5 e P9', () => {
    const faltando = getCamposFaltando({}, paciente, undefined, true)
    expect(faltando).toContain('p5g_sangramento')
    expect(faltando).toContain('p9g_bebe_mexeu')
  })

  it('semana gestacional 30 (>=25) → exige P9 mas não exige P5', () => {
    const form: Partial<RegistroVisita> = {
      p1g_mediu_pressao: 'sim', p2g_upa_maternidade: 'nao', p3g_realizou_exames: 'sim',
    }
    const faltando = getCamposFaltando(form, paciente, 30, true)
    expect(faltando).toContain('p9g_bebe_mexeu')
    expect(faltando).not.toContain('p5g_sangramento')
  })

  it('semana gestacional 8 (<=12) → exige P5 mas não exige P9', () => {
    const form: Partial<RegistroVisita> = {
      p1g_mediu_pressao: 'sim', p2g_upa_maternidade: 'nao', p3g_realizou_exames: 'sim',
    }
    const faltando = getCamposFaltando(form, paciente, 8, true)
    expect(faltando).toContain('p5g_sangramento')
    expect(faltando).not.toContain('p9g_bebe_mexeu')
  })
})

// ─── Validação criança ───────────────────────────────────────────────────────

describe('getCamposFaltando — criança (0-6 anos)', () => {
  const paciente: PacienteMin = { faixaEtaria: '0-6' }

  it('exige P3 consultas, P4 vacinas, P5 alimentação', () => {
    const faltando = getCamposFaltando({}, paciente, undefined, true)
    expect(faltando).toContain('p3c_consultas')
    expect(faltando).toContain('p4c_vacinacao')
    expect(faltando).toContain('p5c_alimentacao')
  })

  it('criança com todos os campos preenchidos → zero faltando', () => {
    const form: Partial<RegistroVisita> = {
      p3c_consultas: 'sim', p4c_vacinacao: 'sim', p5c_alimentacao: 'aleitamento_exclusivo',
    }
    expect(getCamposFaltando(form, paciente, undefined, true)).toHaveLength(0)
  })
})

// ─── Fluxo: salvar visita → aparece como visitado na semana ─────────────────

describe('fluxo visitadosSemana', () => {
  let db: ACSDatabase
  const INICIO = '2026-05-18'

  beforeEach(() => { db = makeDb() })
  afterEach(async () => { await db.delete() })

  async function getVisitadosNaSemana(profissionalId: string, inicio: string) {
    const hoje = new Date().toISOString().split('T')[0]
    const visitas = await db.visitas
      .where('profissionalId')
      .equals(profissionalId)
      .and((v) => v.dataVisita >= inicio && v.dataVisita <= hoje)
      .toArray()
    return new Set(visitas.map((v) => v.pacienteId))
  }

  it('paciente recém-visitado aparece no set visitadosSemana', async () => {
    const hoje = new Date().toISOString().split('T')[0]
    await db.visitas.add({
      pacienteId: 'p001', profissionalId: 'acs-001',
      dataVisita: hoje, hora: '10:00', synced: false, createdAt: Date.now(),
      estavaCasa: true, recusouVisita: false, observacoesGerais: '',
    })
    const visitados = await getVisitadosNaSemana('acs-001', INICIO)
    expect(visitados.has('p001')).toBe(true)
  })

  it('paciente NÃO visitado não aparece no set', async () => {
    const hoje = new Date().toISOString().split('T')[0]
    await db.visitas.add({
      pacienteId: 'p002', profissionalId: 'acs-001',
      dataVisita: hoje, hora: '10:00', synced: false, createdAt: Date.now(),
      estavaCasa: true, recusouVisita: false, observacoesGerais: '',
    })
    const visitados = await getVisitadosNaSemana('acs-001', INICIO)
    expect(visitados.has('p001')).toBe(false)
    expect(visitados.has('p002')).toBe(true)
  })

  it('visita de semana anterior não conta como visitado desta semana', async () => {
    await db.visitas.add({
      pacienteId: 'p001', profissionalId: 'acs-001',
      dataVisita: '2026-05-11', // semana anterior
      hora: '10:00', synced: false, createdAt: Date.now(),
      estavaCasa: true, recusouVisita: false, observacoesGerais: '',
    })
    const visitados = await getVisitadosNaSemana('acs-001', INICIO)
    expect(visitados.has('p001')).toBe(false)
  })

  it('visita "não estava em casa" também marca paciente como visitado', async () => {
    const hoje = new Date().toISOString().split('T')[0]
    await db.visitas.add({
      pacienteId: 'p001', profissionalId: 'acs-001',
      dataVisita: hoje, hora: '10:00', synced: false, createdAt: Date.now(),
      estavaCasa: false, recusouVisita: false, observacoesGerais: '',
    })
    const visitados = await getVisitadosNaSemana('acs-001', INICIO)
    expect(visitados.has('p001')).toBe(true)
  })
})

// ─── Lógica de ordenação: pendentes primeiro, visitados ao fundo ─────────────

describe('ordenação da lista', () => {
  type PacienteSimples = { id: string; prioridade: 'critica' | 'alta' | 'media' | 'baixa' }

  function ordenarLista(
    pacientes: PacienteSimples[],
    visitados: Set<string>,
  ): PacienteSimples[] {
    const pendentes = pacientes.filter((p) => !visitados.has(p.id))
    const visitadosList = pacientes.filter((p) => visitados.has(p.id))
    return [...pendentes, ...visitadosList]
  }

  it('visitados aparecem depois dos pendentes', () => {
    const pacientes: PacienteSimples[] = [
      { id: 'p1', prioridade: 'critica' },
      { id: 'p2', prioridade: 'alta' },
      { id: 'p3', prioridade: 'media' },
    ]
    const visitados = new Set(['p2'])
    const ordenados = ordenarLista(pacientes, visitados)
    expect(ordenados[0].id).toBe('p1')
    expect(ordenados[1].id).toBe('p3')
    expect(ordenados[2].id).toBe('p2') // visitado ao fundo
  })

  it('sem visitados → ordem original mantida', () => {
    const pacientes: PacienteSimples[] = [
      { id: 'p1', prioridade: 'critica' },
      { id: 'p2', prioridade: 'alta' },
    ]
    const ordenados = ordenarLista(pacientes, new Set())
    expect(ordenados.map((p) => p.id)).toEqual(['p1', 'p2'])
  })

  it('todos visitados → todos ao fundo (mesma ordem relativa)', () => {
    const pacientes: PacienteSimples[] = [
      { id: 'p1', prioridade: 'critica' },
      { id: 'p2', prioridade: 'alta' },
    ]
    const visitados = new Set(['p1', 'p2'])
    const ordenados = ordenarLista(pacientes, visitados)
    expect(ordenados.map((p) => p.id)).toEqual(['p1', 'p2'])
  })
})

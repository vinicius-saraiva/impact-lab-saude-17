# Bônus 2 — Alertas UPA + Distinção Rotina/Reativo (ACS) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor visualmente pro ACS (1) quais pacientes seus passaram pela UPA nos últimos 7 dias e (2) separar a Lista do dia em "Por evento ou atraso" vs "Por cadência regular".

**Architecture:** Camada de lógica pura em `frontend/src/alertas.ts` (testada com Vitest), 4 componentes visuais novos, 1 refator de extração do card inline e 2 páginas modificadas (`ListaPage`, `VisitaPage`). Mock enriquecido com `ultimoEventoUpa` em 3 pacientes-chave. Tipo `Paciente` ganha 2 campos (`ultimoEventoUpa?`, `cadenciaLimiteDias`).

**Tech Stack:** React 19, TypeScript strict, Vite 8, Tailwind 4, React Router, Vitest, Dexie (já existente).

**Spec:** `docs/superpowers/specs/2026-05-24-bonus-2-alertas-upa-acs-design.md`

**Working dir:** `frontend/` (rodar todos os comandos `npm run ...` daqui)

---

## Task 1: Estender tipo `Paciente` e backfill do mock

**Files:**
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/mockData.ts`

- [ ] **Step 1: Adicionar interface `EventoUpa` e campos novos no `Paciente`**

Editar `frontend/src/types.ts`. Inserir antes da interface `Paciente`:

```ts
export interface EventoUpa {
  data: string         // ISO YYYY-MM-DD
  local: string        // "UPA Rocinha", "Hospital Miguel Couto"
}
```

E adicionar dois campos opcionais/obrigatórios ao final do `Paciente`, logo após `ultimoRegistroHipertensao?: RegistroHipertensao`:

```ts
  // alertas bônus 2
  ultimoEventoUpa?: EventoUpa     // só se houve evento não-eletivo nos últimos 60d
  cadenciaLimiteDias: number      // 30 gestante / 45 criança 0-6 / 90 crônico / 180 outro
```

- [ ] **Step 2: Adicionar `cadenciaLimiteDias` em todos os 18 pacientes do mock**

Editar `frontend/src/mockData.ts`. Como `cadenciaLimiteDias` é agora obrigatório, todos os 18 objetos precisam dele. Regra:
- `gestante: true` → 30
- `faixaEtaria === '0-6'` → 45
- `hipertenso || diabetico` → 90
- default → 180

Mapeamento por paciente (use Edit replace_all em cada bloco):

| paciente | flags relevantes | `cadenciaLimiteDias` |
|---|---|---|
| p-001 Maria F. | hipertenso+diabético | 90 |
| p-002 Ana S. | hipertenso+diabético | 90 |
| p-003 Francisca M. | hipertenso+diabético | 90 |
| p-004 Luciana C. | hipertenso+diabético | 90 |
| p-005 Sandra A. | hipertenso+diabético | 90 |
| p-006 Patrícia N. | hipertenso+diabético | 90 |
| p-007 Marcos P. | hipertenso+diabético | 90 |
| p-008 Claudia O. | hipertenso+diabético | 90 |
| p-009 Fernanda R. | hipertenso+diabético | 90 |
| p-010 Francisco B. | hipertenso+diabético | 90 |
| p-011 Roberto L. | hipertenso | 90 |
| p-012 João V. | criança 0-6 | 45 |
| p-013 Francisca G. | hipertenso+diabético | 90 |
| p-014 Sebastião T. | criança 0-6 | 45 |
| p-015 Antônio D. | hipertenso+diabético | 90 |
| p-016 José K. | hipertenso | 90 |
| p-017 Juliana Q. | nada | 180 |
| p-018 Claudia Z. | nada | 180 |

Para cada paciente, adicionar `cadenciaLimiteDias: <N>,` logo após a linha `ultimaVisita: '...',`. Exemplo concreto para p-001 (já tem `ultimoRegistroHipertensao` depois, então insere antes desse):

Localizar:
```ts
    ultimaVisita: '2025-05-24',
    ultimoRegistroHipertensao: {
```
Trocar por:
```ts
    ultimaVisita: '2025-05-24',
    cadenciaLimiteDias: 90,
    ultimoRegistroHipertensao: {
```

Para os outros 17 (sem `ultimoRegistroHipertensao`), inserir após `ultimaVisita: '...',`. Exemplo p-002:
```ts
    ultimaVisita: '2025-06-27',
  },
```
Trocar por:
```ts
    ultimaVisita: '2025-06-27',
    cadenciaLimiteDias: 90,
  },
```

- [ ] **Step 3: Build pra confirmar que tipos batem**

Run: `npm run build`
Expected: `✓ built in ...` sem erros TypeScript.

Se aparecer erro do tipo `Property 'cadenciaLimiteDias' is missing`, identificar o paciente faltante e corrigir.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types.ts frontend/src/mockData.ts
git commit -m "feat(types): adiciona EventoUpa e cadenciaLimiteDias ao Paciente

Prepara camada de dados pro bônus 2 (alertas UPA + cadência).
Backfill em todos os 18 pacientes do mock com cadência padrão
por linha de cuidado (gestante 30 / criança 45 / crônico 90 / outro 180)."
```

---

## Task 2: Helper `cadenciaPadrao` (TDD)

**Files:**
- Create: `frontend/src/alertas.ts`
- Create: `frontend/src/test/alertas.test.ts`

- [ ] **Step 1: Escrever teste falhando**

Criar `frontend/src/test/alertas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cadenciaPadrao } from '../alertas'
import type { Paciente } from '../types'

type CadenciaInput = Pick<Paciente, 'gestante' | 'faixaEtaria' | 'hipertenso' | 'diabetico'>

function make(overrides: Partial<CadenciaInput> = {}): CadenciaInput {
  return {
    gestante: false,
    faixaEtaria: '45-65',
    hipertenso: false,
    diabetico: false,
    ...overrides,
  }
}

describe('cadenciaPadrao', () => {
  it('gestante tem cadência 30d', () => {
    expect(cadenciaPadrao(make({ gestante: true }))).toBe(30)
  })

  it('gestante prevalece sobre crônico (gestante hipertensa = 30d)', () => {
    expect(cadenciaPadrao(make({ gestante: true, hipertenso: true }))).toBe(30)
  })

  it('criança 0-6 tem cadência 45d', () => {
    expect(cadenciaPadrao(make({ faixaEtaria: '0-6' }))).toBe(45)
  })

  it('hipertenso tem cadência 90d', () => {
    expect(cadenciaPadrao(make({ hipertenso: true }))).toBe(90)
  })

  it('diabético tem cadência 90d', () => {
    expect(cadenciaPadrao(make({ diabetico: true }))).toBe(90)
  })

  it('hipertenso + diabético tem cadência 90d (não soma)', () => {
    expect(cadenciaPadrao(make({ hipertenso: true, diabetico: true }))).toBe(90)
  })

  it('paciente sem flags relevantes tem cadência 180d', () => {
    expect(cadenciaPadrao(make())).toBe(180)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- --run alertas`
Expected: FAIL com `Failed to resolve import "../alertas"` ou `cadenciaPadrao is not a function`.

- [ ] **Step 3: Implementar `cadenciaPadrao` em `alertas.ts`**

Criar `frontend/src/alertas.ts`:

```ts
import type { Paciente } from './types'

/** Janela em dias para considerar um evento UPA como "alerta ativo". */
export const JANELA_ALERTA_UPA_DIAS = 7

type CadenciaInput = Pick<Paciente, 'gestante' | 'faixaEtaria' | 'hipertenso' | 'diabetico'>

/**
 * Cadência padrão (em dias) de visita ACS por linha de cuidado.
 * Espelha _gap_limit_for_row no backend (scripts/gerar_lista_do_dia.py).
 * Ordem de precedência: gestante > criança 0-6 > crônico > default.
 */
export function cadenciaPadrao(p: CadenciaInput): number {
  if (p.gestante) return 30
  if (p.faixaEtaria === '0-6') return 45
  if (p.hipertenso || p.diabetico) return 90
  return 180
}
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npm run test -- --run alertas`
Expected: `7 passed` em `alertas.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/alertas.ts frontend/src/test/alertas.test.ts
git commit -m "feat(alertas): cadenciaPadrao por linha de cuidado (TDD)

Helper puro que espelha _gap_limit_for_row do backend.
Gestante 30 / criança 0-6 45 / crônico 90 / outro 180."
```

---

## Task 3: Helper `temAlertaUpa` + `diasDesdeEventoUpa` (TDD)

**Files:**
- Modify: `frontend/src/alertas.ts`
- Modify: `frontend/src/test/alertas.test.ts`

- [ ] **Step 1: Adicionar testes falhando**

Anexar ao final de `frontend/src/test/alertas.test.ts`:

```ts
import { temAlertaUpa, diasDesdeEventoUpa } from '../alertas'

function pacienteCom(overrides: Partial<Paciente> = {}): Paciente {
  return {
    id: 't-001',
    nome: 'Teste',
    equipeId: 'e1',
    unidadeId: 'u1',
    faixaEtaria: '45-65',
    sexo: 'Feminino',
    racaCor: 'Parda',
    situacaoVulnerabilidade: false,
    lat: 0,
    lng: 0,
    distanciaKm: 0,
    hipertenso: false,
    diabetico: false,
    gestante: false,
    condicoes: [],
    prioridade: 'media',
    prioScore: 50,
    motivoPrioridade: 'teste',
    ultimaVisita: null,
    enderecoDescricao: '',
    cadenciaLimiteDias: 180,
    ...overrides,
  }
}

const HOJE = new Date('2026-05-24T12:00:00')

describe('temAlertaUpa', () => {
  it('false quando paciente não tem ultimoEventoUpa', () => {
    expect(temAlertaUpa(pacienteCom(), HOJE)).toBe(false)
  })

  it('true quando evento foi há 5 dias', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-19', local: 'UPA' } })
    expect(temAlertaUpa(p, HOJE)).toBe(true)
  })

  it('true quando evento foi há exatamente 7 dias (limite inclusivo)', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-17', local: 'UPA' } })
    expect(temAlertaUpa(p, HOJE)).toBe(true)
  })

  it('false quando evento foi há 8 dias', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-16', local: 'UPA' } })
    expect(temAlertaUpa(p, HOJE)).toBe(false)
  })
})

describe('diasDesdeEventoUpa', () => {
  it('null quando paciente não tem evento', () => {
    expect(diasDesdeEventoUpa(pacienteCom(), HOJE)).toBeNull()
  })

  it('retorna 5 quando evento foi em 19/05', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-19', local: 'UPA' } })
    expect(diasDesdeEventoUpa(p, HOJE)).toBe(5)
  })

  it('retorna 0 quando evento foi hoje', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-24', local: 'UPA' } })
    expect(diasDesdeEventoUpa(p, HOJE)).toBe(0)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- --run alertas`
Expected: FAIL — `temAlertaUpa` e `diasDesdeEventoUpa` não exportados.

- [ ] **Step 3: Implementar em `alertas.ts`**

Anexar a `frontend/src/alertas.ts`:

```ts
function _diasEntre(de: string, ate: Date): number {
  const a = new Date(de + 'T12:00:00').getTime()
  const b = new Date(ate.getFullYear(), ate.getMonth(), ate.getDate(), 12, 0, 0).getTime()
  return Math.round((b - a) / 86400000)
}

export function diasDesdeEventoUpa(p: Paciente, hoje: Date = new Date()): number | null {
  if (!p.ultimoEventoUpa) return null
  return Math.max(0, _diasEntre(p.ultimoEventoUpa.data, hoje))
}

export function temAlertaUpa(p: Paciente, hoje: Date = new Date()): boolean {
  const dias = diasDesdeEventoUpa(p, hoje)
  if (dias === null) return false
  return dias <= JANELA_ALERTA_UPA_DIAS
}
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npm run test -- --run alertas`
Expected: `14 passed` (7 antigos + 7 novos).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/alertas.ts frontend/src/test/alertas.test.ts
git commit -m "feat(alertas): temAlertaUpa + diasDesdeEventoUpa (TDD)

Janela inclusiva de 7 dias. Helper _diasEntre normaliza horários
pra meio-dia evitando off-by-one por DST/timezone."
```

---

## Task 4: Helper `gapVencido` + `diasAtraso` (TDD)

**Files:**
- Modify: `frontend/src/alertas.ts`
- Modify: `frontend/src/test/alertas.test.ts`

- [ ] **Step 1: Adicionar testes falhando**

Anexar a `frontend/src/test/alertas.test.ts`:

```ts
import { gapVencido, diasAtraso } from '../alertas'

describe('gapVencido', () => {
  it('true quando paciente nunca foi visitado (ultimaVisita null)', () => {
    expect(gapVencido(pacienteCom({ ultimaVisita: null }), HOJE)).toBe(true)
  })

  it('false quando última visita foi dentro do limite', () => {
    // crônico, limite 90 — visita há 45d
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-04-09',
    })
    expect(gapVencido(p, HOJE)).toBe(false)
  })

  it('false quando última visita foi exatamente no limite (90d)', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-02-23',
    })
    expect(gapVencido(p, HOJE)).toBe(false)
  })

  it('true quando última visita ultrapassou o limite em 1 dia', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-02-22',
    })
    expect(gapVencido(p, HOJE)).toBe(true)
  })
})

describe('diasAtraso', () => {
  it('0 quando não há atraso', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-04-09',
    })
    expect(diasAtraso(p, HOJE)).toBe(0)
  })

  it('quantifica o atraso quando vencido', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-01-23', // 121d atrás → atraso 31d
    })
    expect(diasAtraso(p, HOJE)).toBe(31)
  })

  it('retorna 9999 quando ultimaVisita é null (paciente nunca visitado)', () => {
    expect(diasAtraso(pacienteCom({ ultimaVisita: null }), HOJE)).toBe(9999)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- --run alertas`
Expected: FAIL — funções não exportadas.

- [ ] **Step 3: Implementar em `alertas.ts`**

Anexar a `frontend/src/alertas.ts`:

```ts
/**
 * Dias desde a última visita ACS. Retorna 9999 se paciente nunca foi visitado.
 * Sentinel grande facilita ordenação ("nunca visitado" vai pro topo).
 */
function _diasDesdeUltimaVisita(p: Paciente, hoje: Date): number {
  if (!p.ultimaVisita) return 9999
  return Math.max(0, _diasEntre(p.ultimaVisita, hoje))
}

export function gapVencido(p: Paciente, hoje: Date = new Date()): boolean {
  return _diasDesdeUltimaVisita(p, hoje) > p.cadenciaLimiteDias
}

export function diasAtraso(p: Paciente, hoje: Date = new Date()): number {
  const dias = _diasDesdeUltimaVisita(p, hoje)
  if (dias === 9999) return 9999
  return Math.max(0, dias - p.cadenciaLimiteDias)
}
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npm run test -- --run alertas`
Expected: `21 passed` (14 antigos + 7 novos).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/alertas.ts frontend/src/test/alertas.test.ts
git commit -m "feat(alertas): gapVencido + diasAtraso (TDD)

Compara dias desde ultimaVisita com cadenciaLimiteDias do paciente.
Sentinel 9999 quando nunca visitado pra ordenação consistente."
```

---

## Task 5: Helper `ehReativo` + `particionarLista` (TDD)

**Files:**
- Modify: `frontend/src/alertas.ts`
- Modify: `frontend/src/test/alertas.test.ts`

- [ ] **Step 1: Adicionar testes falhando**

Anexar a `frontend/src/test/alertas.test.ts`:

```ts
import { ehReativo, particionarLista } from '../alertas'

describe('ehReativo', () => {
  it('true se tem alerta UPA recente', () => {
    const p = pacienteCom({ ultimoEventoUpa: { data: '2026-05-19', local: 'UPA' } })
    expect(ehReativo(p, HOJE)).toBe(true)
  })

  it('true se gap vencido (sem evento UPA)', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-01-01',
    })
    expect(ehReativo(p, HOJE)).toBe(true)
  })

  it('false se sem evento E dentro da cadência', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-04-09',
    })
    expect(ehReativo(p, HOJE)).toBe(false)
  })

  it('true se tem AMBOS (UPA recente + gap vencido)', () => {
    const p = pacienteCom({
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-01-01',
      ultimoEventoUpa: { data: '2026-05-19', local: 'UPA' },
    })
    expect(ehReativo(p, HOJE)).toBe(true)
  })
})

describe('particionarLista', () => {
  it('lista vazia retorna { reativos: [], rotina: [] }', () => {
    expect(particionarLista([], HOJE)).toEqual({ reativos: [], rotina: [] })
  })

  it('separa corretamente reativos de rotina', () => {
    const rotina = pacienteCom({
      id: 'rot',
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-04-09',
    })
    const reativoUpa = pacienteCom({
      id: 'upa',
      ultimoEventoUpa: { data: '2026-05-19', local: 'UPA' },
    })
    const reativoGap = pacienteCom({
      id: 'gap',
      hipertenso: true,
      cadenciaLimiteDias: 90,
      ultimaVisita: '2026-01-01',
    })
    const { reativos, rotina: r } = particionarLista([rotina, reativoUpa, reativoGap], HOJE)
    expect(reativos.map((p) => p.id)).toEqual(['upa', 'gap'])
    expect(r.map((p) => p.id)).toEqual(['rot'])
  })

  it('preserva ordem original dentro de cada grupo', () => {
    const a = pacienteCom({ id: 'a', ultimoEventoUpa: { data: '2026-05-22', local: 'UPA' } })
    const b = pacienteCom({ id: 'b', ultimoEventoUpa: { data: '2026-05-20', local: 'UPA' } })
    const { reativos } = particionarLista([a, b], HOJE)
    expect(reativos.map((p) => p.id)).toEqual(['a', 'b'])
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- --run alertas`
Expected: FAIL — funções não exportadas.

- [ ] **Step 3: Implementar em `alertas.ts`**

Anexar a `frontend/src/alertas.ts`:

```ts
export function ehReativo(p: Paciente, hoje: Date = new Date()): boolean {
  return temAlertaUpa(p, hoje) || gapVencido(p, hoje)
}

export function particionarLista(
  pacientes: Paciente[],
  hoje: Date = new Date(),
): { reativos: Paciente[]; rotina: Paciente[] } {
  const reativos: Paciente[] = []
  const rotina: Paciente[] = []
  for (const p of pacientes) {
    if (ehReativo(p, hoje)) reativos.push(p)
    else rotina.push(p)
  }
  return { reativos, rotina }
}
```

- [ ] **Step 4: Rodar e confirmar PASS**

Run: `npm run test -- --run alertas`
Expected: `28 passed` (21 antigos + 7 novos).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/alertas.ts frontend/src/test/alertas.test.ts
git commit -m "feat(alertas): ehReativo + particionarLista (TDD)

Particionador puro O(n) que preserva ordem original.
Fecha o módulo de lógica do bônus 2 com 28 testes."
```

---

## Task 6: Mock enrichment — `ultimoEventoUpa` em 3 pacientes

**Files:**
- Modify: `frontend/src/mockData.ts`

- [ ] **Step 1: Adicionar `ultimoEventoUpa` em Maria F. (p-001)**

Em `frontend/src/mockData.ts`, localizar o bloco do `p-001` (`PACIENTE_HIPERTENSO`). Já tem `cadenciaLimiteDias: 90` da Task 1. Adicionar o evento UPA logo após. Datas relativas a hoje (2026-05-24): 5 dias atrás = 2026-05-19.

Localizar:
```ts
    ultimaVisita: '2025-05-24',
    cadenciaLimiteDias: 90,
    ultimoRegistroHipertensao: {
```
Trocar por:
```ts
    ultimaVisita: '2025-05-24',
    cadenciaLimiteDias: 90,
    ultimoEventoUpa: { data: '2026-05-19', local: 'UPA Rocinha' },
    ultimoRegistroHipertensao: {
```

- [ ] **Step 2: Adicionar `ultimoEventoUpa` em Francisca M. (p-003)**

Localizar bloco do `p-003`:
```ts
    motivoPrioridade: '2 urgência/internação · hipertenso + diabético · idoso 66+ · sem visita há 365d',
    ultimaVisita: '2025-05-24',
    cadenciaLimiteDias: 90,
  },
```
Trocar por:
```ts
    motivoPrioridade: '2 urgência/internação · hipertenso + diabético · idoso 66+ · sem visita há 365d',
    ultimaVisita: '2025-05-24',
    cadenciaLimiteDias: 90,
    ultimoEventoUpa: { data: '2026-05-21', local: 'Hospital Miguel Couto' },
  },
```

- [ ] **Step 3: Adicionar `ultimoEventoUpa` em Fernanda R. (p-009)**

Localizar bloco do `p-009`:
```ts
    motivoPrioridade: '6 urgência/internação · hipertenso + diabético · idoso 66+',
    ultimaVisita: '2026-02-15',
    cadenciaLimiteDias: 90,
  },
```
Trocar por:
```ts
    motivoPrioridade: '6 urgência/internação · hipertenso + diabético · idoso 66+',
    ultimaVisita: '2026-02-15',
    cadenciaLimiteDias: 90,
    ultimoEventoUpa: { data: '2026-05-18', local: 'UPA Rocinha' },
  },
```

- [ ] **Step 4: Build pra confirmar**

Run: `npm run build`
Expected: `✓ built in ...` sem erros.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/mockData.ts
git commit -m "feat(mock): adiciona ultimoEventoUpa em 3 pacientes-chave

Maria F. (5d), Francisca M. (3d) e Fernanda R. (6d) ganham eventos UPA
recentes pra demonstrar o banner de alerta + badges inline."
```

---

## Task 7: Componente `BadgeUpaRecente`

**Files:**
- Create: `frontend/src/components/BadgeUpaRecente.tsx`

- [ ] **Step 1: Criar componente**

Criar `frontend/src/components/BadgeUpaRecente.tsx`:

```tsx
interface Props {
  dias: number
}

export function BadgeUpaRecente({ dias }: Props) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-0.5">
      <span>⚠</span>
      UPA {dias}d
    </span>
  )
}
```

- [ ] **Step 2: Build pra garantir que compila**

Run: `npm run build`
Expected: `✓ built in ...`. O componente novo só compila quando for usado, mas o `tsc -b` cobre.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/BadgeUpaRecente.tsx
git commit -m "feat(components): BadgeUpaRecente — pill vermelha UPA Xd"
```

---

## Task 8: Componente `BadgeGapVencido`

**Files:**
- Create: `frontend/src/components/BadgeGapVencido.tsx`

- [ ] **Step 1: Criar componente**

Criar `frontend/src/components/BadgeGapVencido.tsx`:

```tsx
interface Props {
  diasAtraso: number
}

export function BadgeGapVencido({ diasAtraso }: Props) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 inline-flex items-center gap-0.5">
      <span>📅</span>
      Atrasada {diasAtraso}d
    </span>
  )
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built in ...`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/BadgeGapVencido.tsx
git commit -m "feat(components): BadgeGapVencido — pill laranja Atrasada Xd"
```

---

## Task 9: Componente `BannerAlertaUpa`

**Files:**
- Create: `frontend/src/components/BannerAlertaUpa.tsx`

- [ ] **Step 1: Criar componente**

Criar `frontend/src/components/BannerAlertaUpa.tsx`:

```tsx
interface Props {
  quantidade: number
  onVerPrimeiro: () => void
}

export function BannerAlertaUpa({ quantidade, onVerPrimeiro }: Props) {
  if (quantidade <= 0) return null
  return (
    <button
      onClick={onVerPrimeiro}
      className="w-full text-left bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 active:scale-[0.99] transition-transform"
    >
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl flex-shrink-0">
        🚨
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800 leading-tight">
          {quantidade} {quantidade === 1 ? 'paciente seu passou' : 'pacientes seus passaram'} na UPA esta semana
        </p>
        <p className="text-xs text-red-700 mt-1 leading-snug">
          Visitar com prioridade pra evitar nova internação.
        </p>
        <p className="text-xs font-semibold text-red-600 mt-1.5">Ver primeiro ›</p>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built in ...`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/BannerAlertaUpa.tsx
git commit -m "feat(components): BannerAlertaUpa — banner clicável no topo da Lista"
```

---

## Task 10: Componente `SecaoLista`

**Files:**
- Create: `frontend/src/components/SecaoLista.tsx`

- [ ] **Step 1: Criar componente**

Criar `frontend/src/components/SecaoLista.tsx`:

```tsx
import type { ReactNode } from 'react'

interface Props {
  titulo: string
  icone: string
  quantidade: number
  tone: 'reativo' | 'rotina'
  children: ReactNode
  innerRef?: React.RefObject<HTMLDivElement | null>
}

export function SecaoLista({ titulo, icone, quantidade, tone, children, innerRef }: Props) {
  if (quantidade <= 0) return null
  const corTitulo = tone === 'reativo' ? 'text-red-700' : 'text-slate-500'
  const corContador = tone === 'reativo' ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-100'
  return (
    <div ref={innerRef} className="space-y-3">
      <div className="flex items-center justify-between mt-1">
        <h3 className={`text-sm font-semibold uppercase tracking-wide flex items-center gap-1.5 ${corTitulo}`}>
          <span>{icone}</span>
          {titulo}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${corContador}`}>
          {quantidade}
        </span>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built in ...`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/SecaoLista.tsx
git commit -m "feat(components): SecaoLista — wrapper com cabeçalho e tone reativo/rotina"
```

---

## Task 11: Refator — extrair `PacienteCardLista`

**Files:**
- Create: `frontend/src/components/PacienteCardLista.tsx`
- Modify: `frontend/src/pages/ListaPage.tsx`

- [ ] **Step 1: Criar componente extraído com suporte aos novos badges**

Criar `frontend/src/components/PacienteCardLista.tsx`:

```tsx
import { CondicaoBadge } from './CondicaoBadge'
import { PrioridadeBadge } from './PrioridadeBadge'
import { BadgeUpaRecente } from './BadgeUpaRecente'
import { BadgeGapVencido } from './BadgeGapVencido'
import { diasDesdeEventoUpa, diasAtraso, temAlertaUpa, gapVencido } from '../alertas'
import type { Paciente } from '../types'

interface Props {
  paciente: Paciente
  ordem: number
  visitado: boolean
  onClick: () => void
  hoje?: Date
}

export function PacienteCardLista({ paciente, ordem, visitado, onClick, hoje }: Props) {
  const alertaUpa = temAlertaUpa(paciente, hoje)
  const dias = diasDesdeEventoUpa(paciente, hoje)
  const vencido = gapVencido(paciente, hoje)
  const atraso = diasAtraso(paciente, hoje)
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            visitado
              ? 'bg-green-100 text-green-600'
              : paciente.prioridade === 'critica'
                ? 'bg-red-100 text-red-600'
                : paciente.prioridade === 'alta'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-slate-100 text-slate-500'
          }`}
        >
          {visitado ? '✓' : ordem}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-base ${visitado ? 'text-slate-400' : 'text-slate-800'}`}>
              {paciente.nome}
            </span>
            {!visitado && <PrioridadeBadge prioridade={paciente.prioridade} />}
            {!visitado && alertaUpa && dias !== null && <BadgeUpaRecente dias={dias} />}
            {!visitado && vencido && !alertaUpa && atraso < 9999 && (
              <BadgeGapVencido diasAtraso={atraso} />
            )}
            {visitado && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                Visitado
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {paciente.condicoes.map((c) => (
              <CondicaoBadge key={c} condicao={c} />
            ))}
          </div>

          {!visitado && (
            <p className="text-xs text-slate-500 mt-1.5 leading-snug">{paciente.motivoPrioridade}</p>
          )}

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
```

Nota sobre o `9999`: `BadgeGapVencido` não aparece quando `ultimaVisita` é null (sentinel). Pacientes "nunca visitados" continuam aparecendo na seção reativa via `gapVencido=true`, mas sem badge numérico (não faz sentido mostrar "Atrasada 9999d").

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built in ...`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PacienteCardLista.tsx
git commit -m "refactor(lista): extrai PacienteCardLista pra componente próprio

Card com suporte a badges UPA recente + gap vencido."
```

---

## Task 12: `ListaPage` integra banner, seções e novo card

**Files:**
- Modify: `frontend/src/pages/ListaPage.tsx`

- [ ] **Step 1: Substituir imports e bloco de renderização da lista**

Editar `frontend/src/pages/ListaPage.tsx`. Trocar o bloco de imports do topo:

```ts
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrioridadeBadge } from '../components/PrioridadeBadge'
import { CondicaoBadge } from '../components/CondicaoBadge'
import { SyncBar } from '../components/SyncBar'
import { useSync } from '../hooks/useSync'
import { db } from '../db'
import { getPacientesSemana } from '../mockData'
import type { Paciente } from '../types'
```

Por:

```ts
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SyncBar } from '../components/SyncBar'
import { BannerAlertaUpa } from '../components/BannerAlertaUpa'
import { SecaoLista } from '../components/SecaoLista'
import { PacienteCardLista } from '../components/PacienteCardLista'
import { useSync } from '../hooks/useSync'
import { db } from '../db'
import { getPacientesSemana } from '../mockData'
import { particionarLista, temAlertaUpa } from '../alertas'
```

- [ ] **Step 2: Adicionar ref e particionamento dentro do componente**

Logo antes do `return (` do `ListaPage`, adicionar:

```ts
  const reativosRef = useRef<HTMLDivElement>(null)
  const { reativos, rotina } = particionarLista(pacientesDia)
  const qtdAlertasUpa = pacientesDia.filter((p) => temAlertaUpa(p)).length
  const scrollPraReativos = () => {
    reativosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
```

- [ ] **Step 3: Substituir o bloco da lista (linhas 141-164 do arquivo atual)**

Localizar o bloco que começa em `{/* Lista do dia */}` e termina depois do `.map` que renderiza os cards. Substituir todo o `<div className="flex-1 px-4 py-4 space-y-3">...</div>` por:

```tsx
      {/* Lista do dia */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <BannerAlertaUpa quantidade={qtdAlertasUpa} onVerPrimeiro={scrollPraReativos} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {pacientesDia.length} visitas planejadas
          </h2>
          <span className="text-xs text-slate-400">máx. 5/dia</span>
        </div>

        {pacientesDia.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhuma visita planejada para este dia.
          </div>
        )}

        <SecaoLista
          titulo="Por evento ou atraso"
          icone="🚨"
          quantidade={reativos.length}
          tone="reativo"
          innerRef={reativosRef}
        >
          {reativos.map((paciente, i) => (
            <PacienteCardLista
              key={paciente.id}
              paciente={paciente}
              ordem={i + 1}
              visitado={visitadosSemana.has(paciente.id)}
              onClick={() => navigate(`/visita/${paciente.id}`)}
            />
          ))}
        </SecaoLista>

        <SecaoLista
          titulo="Por cadência regular"
          icone="📋"
          quantidade={rotina.length}
          tone="rotina"
        >
          {rotina.map((paciente, i) => (
            <PacienteCardLista
              key={paciente.id}
              paciente={paciente}
              ordem={reativos.length + i + 1}
              visitado={visitadosSemana.has(paciente.id)}
              onClick={() => navigate(`/visita/${paciente.id}`)}
            />
          ))}
        </SecaoLista>
      </div>
```

- [ ] **Step 4: Remover o componente `PacienteCard` inline (final do arquivo, linhas 169-231)**

Apagar a interface `CardProps` e a função `PacienteCard` do final do arquivo. Apagar também o `import type { Paciente }` se ele não for mais usado em outro lugar do arquivo (o `useEffect` usa só `db.visitas`, então pode remover).

Após a edição, o final do arquivo deve ser só o `}` fechando `ListaPage`.

- [ ] **Step 5: Build pra confirmar que tudo compila**

Run: `npm run build`
Expected: `✓ built in ...`. Se aparecer "unused import Paciente", remover.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/ListaPage.tsx
git commit -m "feat(lista): banner UPA + seções reativo/rotina

Lista do dia agora separa pacientes com evento UPA recente ou cadência
vencida da rotina regular. Banner clicável no topo faz scroll suave
até a primeira seção quando houver alertas."
```

---

## Task 13: `VisitaPage` ganha banner contextual UPA

**Files:**
- Modify: `frontend/src/pages/VisitaPage.tsx`

- [ ] **Step 1: Adicionar import dos helpers**

No topo de `frontend/src/pages/VisitaPage.tsx`, adicionar após os imports existentes:

```ts
import { temAlertaUpa, diasDesdeEventoUpa } from '../alertas'
```

- [ ] **Step 2: Inserir banner contextual no JSX**

Localizar o bloco JSX onde o paciente é renderizado (depois do `if (!paciente) return ...`, antes do bloco do checkbox "Estava em casa"). Inserir, logo antes do primeiro elemento do form:

```tsx
      {temAlertaUpa(paciente) && diasDesdeEventoUpa(paciente) !== null && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mx-4 mt-3">
          <p className="font-semibold text-red-800 leading-tight">
            ⚠ Esteve na UPA há {diasDesdeEventoUpa(paciente)} dias
          </p>
          <p className="text-sm text-red-700 mt-1 leading-snug">
            {paciente.ultimoEventoUpa?.local}. Pergunte o que aconteceu antes de continuar.
          </p>
        </div>
      )}
```

A localização exata depende do JSX atual. Se necessário, abrir o arquivo com Read e identificar o local antes do form começar (depois do header do paciente, antes do primeiro `<label>` ou `<button>` do checkbox de presença).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ built in ...`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/VisitaPage.tsx
git commit -m "feat(visita): banner contextual UPA no topo do form

Quando paciente tem evento UPA <=7d, mostra alerta vermelho antes
do checkbox de presença pra ACS contextualizar a abordagem."
```

---

## Task 14: Smoke visual no Playwright

**Files:**
- Nenhum (apenas validação manual)

- [ ] **Step 1: Subir dev server**

Run em background: `npm run dev`
Aguardar a linha `Local: http://localhost:5173/`. Se a porta estiver em uso, anotar a porta que foi escolhida (ex: 5174).

- [ ] **Step 2: Navegar pra Lista do dia em viewport mobile**

Usar Playwright MCP:
1. `mcp__playwright__browser_resize` width=414 height=896
2. `mcp__playwright__browser_navigate` url=`http://localhost:<porta>/`
3. `mcp__playwright__browser_take_screenshot` filename=`lista-bonus2.png` fullPage=true

Conferir que aparecem:
- Banner vermelho topo com "🚨 N pacientes seus passaram na UPA esta semana"
- Seção "🚨 Por evento ou atraso" com cabeçalho vermelho e contador
- Pelo menos 1 card com badge `⚠ UPA Xd`
- Pelo menos 1 card com badge `📅 Atrasada Xd`
- Seção "📋 Por cadência regular" com cabeçalho neutro

- [ ] **Step 3: Validar console limpo**

Usar `mcp__playwright__browser_console_messages` level=`warning`. Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Abrir form de visita de paciente com UPA**

`mcp__playwright__browser_navigate` url=`http://localhost:<porta>/visita/p-001`
`mcp__playwright__browser_take_screenshot` filename=`visita-banner-upa.png` fullPage=false

Conferir que o banner contextual `⚠ Esteve na UPA há 5 dias / UPA Rocinha. Pergunte o que aconteceu...` aparece antes do checkbox de presença.

- [ ] **Step 5: Tap no banner faz scroll**

`mcp__playwright__browser_navigate` url=`http://localhost:<porta>/`
`mcp__playwright__browser_click` no banner UPA. Tirar screenshot e confirmar que a página rolou pra primeira seção reativa.

- [ ] **Step 6: Parar dev server e limpar screenshots**

`TaskStop` no task do `npm run dev`.
Apagar PNGs e `.playwright-mcp/` do worktree raiz (não devem ir pro commit):
```bash
rm -f ../lista-bonus2.png ../visita-banner-upa.png && rm -rf ../.playwright-mcp 2>/dev/null
```

- [ ] **Step 7: Atualizar `todo-front.md`**

Adicionar uma linha ao final da seção "Concluído" em `frontend/todo-front.md`:

```md
- [x] **Bônus 2 — Alertas UPA + distinção rotina/reativo** (ACS): banner vermelho topo + badges inline (⚠ UPA Xd e 📅 Atrasada Xd), lista particionada em "Por evento ou atraso" vs "Por cadência regular". Helpers puros em `src/alertas.ts` (28 testes). Banner contextual no form de visita quando paciente tem UPA recente.
```

- [ ] **Step 8: Commit final + push**

```bash
git add frontend/todo-front.md
git commit -m "docs(todo): marca bônus 2 (alertas UPA + rotina vs reativo) ✅"
git push
```

---

## Critérios de aceite (validar antes de fechar)

Da spec, todos devem estar verdes:

- [x] `npm run build` passa limpo (TS strict)
- [x] Lista do dia mostra banner UPA quando há ≥1 evento UPA recente
- [x] Pacientes alertados aparecem na seção "Por evento ou atraso" com badge `⚠ UPA Xd`
- [x] Pacientes com gap vencido aparecem na mesma seção com badge `📅 Atrasada Xd`
- [x] Pacientes sem evento e dentro da cadência aparecem em "Por cadência regular"
- [x] Tap no banner faz scroll pro primeiro card alertado
- [x] Form de visita mostra banner contextual quando paciente tem alerta UPA
- [x] Testes `alertas.test.ts` passam (28 casos)
- [x] Nada da Lista atual quebra (calendário semanal, contador no header, navegação pro form continuam)

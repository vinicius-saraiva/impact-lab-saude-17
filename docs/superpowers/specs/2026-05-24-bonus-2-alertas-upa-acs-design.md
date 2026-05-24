# Bônus 2 — Alertas UPA + Distinção Rotina/Reativo pro ACS

**Data:** 2026-05-24
**Autor:** Daniel + Claude (brainstorming session)
**Status:** Design aprovado, pronto pra implementation plan

---

## Contexto

O hackathon "Claude Impact Lab Rio — SMS" inclui um desafio bônus:

> **Para o ACS:** detectar lacunas de cuidado e melhorias em acompanhamentos que indiquem respostas mais rápidas (ou mesmo menos reativas).

A entrevista com Camila (ACS na Rocinha, transcrição em `docs/context/FIELD_NOTES_CAMILA_ACS.md`) identificou que sua **dor #2** é exatamente isso: ela não sabe quando um paciente da microárea dela vai à UPA ou interna.

> "Não existe muito bem essa comunicação entre os sistemas. Nosso prontuário não se comunica com o prontuário dos hospitais. Muitas vezes a gente não sabe o que aconteceu."

Hoje o backend (`scripts/gerar_lista_do_dia.py`) já calcula `evento_recente_60d` e `gap_vencido`, mas essa informação fica embutida no campo `motivoPrioridade` (texto plano) — Camila precisa **ler** a string toda pra perceber. O bônus 2 endereça: tornar essa informação **visualmente óbvia**.

## Escopo

Dois gaps endereçados:

**Gap 1 — Alerta UPA em destaque** (dor #2 direta da Camila)
- Banner no topo da Lista do dia: "🚨 N pacientes seus passaram na UPA esta semana"
- Badge inline nos cards: `⚠ UPA Xd`
- Banner contextual dentro do form de visita

**Gap 3 — Distinção rotina vs reativo**
- Lista do dia particionada em 2 seções:
  - **🚨 Por evento ou atraso** (UPA recente OU cadência vencida)
  - **📋 Por cadência regular** (apenas score, sem evento)
- Endereça o "menos reativas" do enunciado: ACS vê de relance se o paciente está aqui porque algo aconteceu ou porque é hora da rotina.

**Fora de escopo:**
- Gap 2 (tendência clínica) — exige enriquecer mock com histórico, descartado por complexidade
- Tela `/alertas` dedicada — banner + inline suficientes
- Notificação push — sync 15:30 (volta pra clínica) já cobre
- Botão "resolver alerta" — visita registrada resolve implicitamente

## UX

### Lista do dia (página `/`)

Ordem visual de cima pra baixo:

1. Header azul (existente, sem mudança estrutural)
2. **Banner UPA** (novo, condicional): só renderiza se ≥1 paciente com evento UPA nos últimos 7 dias
3. Calendário semanal (existente)
4. **Seção "🚨 Por evento ou atraso"** (nova): pacientes com `temAlertaUpa(p) || gapVencido(p)`
5. **Seção "📋 Por cadência regular"** (nova): demais pacientes do dia

Se 0 pacientes reativos: seção "Por evento ou atraso" não aparece, lista volta a ser plana só com cabeçalho "Por cadência regular".

### Banner UPA

- Aparência: card vermelho suave (`bg-red-50 border-red-200`), ícone 🚨, texto "{N} pacientes seus passaram na UPA esta semana", CTA "Ver primeiro ›"
- Comportamento: tap → scroll suave pro primeiro card da seção reativa
- Persistência: não dismissível pelo usuário — some quando todos os alertados forem visitados (visita sincronizada)

### Badges inline nos cards

- `⚠ UPA 5d` — vermelho (`bg-red-100 text-red-700`), aparece à direita da `PrioridadeBadge`
- `📅 Atrasada 14d` — laranja (`bg-orange-100 text-orange-700`), mesma posição
- Um paciente pode ter os dois (UPA recente + cadência vencida)

### Banner contextual no form de visita (página `/visita/:id`)

Se `temAlertaUpa(paciente)`:

```
┌─────────────────────────────────────────┐
│ ⚠ Esteve na UPA há 5 dias               │
│ UPA Rocinha. Pergunte o que aconteceu   │
│ antes de continuar.                     │
└─────────────────────────────────────────┘
```

Posição: logo após o header do paciente, antes do checkbox "Estava em casa".

## Arquitetura

### Camada de dados

**Novo no `Paciente` type** (`frontend/src/types.ts`):

```ts
export interface EventoUpa {
  data: string         // ISO YYYY-MM-DD
  local: string        // "UPA Rocinha", "Hospital Miguel Couto"
}

export interface Paciente {
  // ...campos existentes
  ultimoEventoUpa?: EventoUpa     // só se houve evento não-eletivo nos últimos 60d
  cadenciaLimiteDias: number      // 30 gestante / 45 criança 0-6 / 90 crônico / 180 outro
}
```

**Por que `cadenciaLimiteDias` no tipo e não derivado no front:**
O backend Python (`_gap_limit_for_row` em `scripts/gerar_lista_do_dia.py`) já calcula essa regra. Quando trocarmos mock por API real, vem pronto do servidor. Derivar no front duplicaria a regra.

**Mock enrichment** (`frontend/src/mockData.ts`):

| Paciente | Status atual | Enrichment |
|---|---|---|
| Maria F. (p-001) | crítico, 365d sem visita | + `ultimoEventoUpa: hoje - 5d, UPA Rocinha` |
| Ana S. (p-002) | crítico, 332d | (sem UPA → vai pra reativos via `gapVencido`) |
| Francisca M. (p-003) | crítico, 2 urgências | + `ultimoEventoUpa: hoje - 3d, Hospital Miguel Couto` |
| Fernanda R. (p-009) | alta, 6 urgências | + `ultimoEventoUpa: hoje - 6d, UPA Rocinha` |
| outros | rotina | sem enrichment |

`cadenciaLimiteDias` aplicado a todos via helper:
- `gestante` → 30
- `faixaEtaria === '0-6'` → 45
- `hipertenso || diabetico` → 90
- caso contrário → 180

Resultado esperado: 3 alertas UPA + 4-5 atrasados na seção reativa, restante na seção rotina.

### Camada de lógica

**Novo módulo `frontend/src/alertas.ts`** — funções puras:

```ts
export function temAlertaUpa(p: Paciente, hoje?: Date): boolean
export function diasDesdeEventoUpa(p: Paciente, hoje?: Date): number | null
export function gapVencido(p: Paciente, hoje?: Date): boolean
export function diasAtraso(p: Paciente, hoje?: Date): number  // 0 se não atrasou
export function ehReativo(p: Paciente, hoje?: Date): boolean  // UPA recente OU gap vencido
export function particionarLista(
  pacientes: Paciente[],
  hoje?: Date,
): { reativos: Paciente[]; rotina: Paciente[] }
```

Limites:
- `temAlertaUpa`: evento UPA ≤ 7 dias
- `gapVencido`: `(hoje - ultimaVisita) > cadenciaLimiteDias`
- `ehReativo`: `temAlertaUpa || gapVencido`

Todas as funções aceitam `hoje` opcional pra testabilidade.

### Camada de UI

**Novos componentes** (`frontend/src/components/`):

| Componente | Responsabilidade |
|---|---|
| `BannerAlertaUpa.tsx` | Banner vermelho no topo, condicional |
| `SecaoLista.tsx` | Wrapper de seção com cabeçalho + tone (reativo/rotina) |
| `BadgeUpaRecente.tsx` | Pill vermelha "⚠ UPA Xd" |
| `BadgeGapVencido.tsx` | Pill laranja "📅 Atrasada Xd" |
| `PacienteCardLista.tsx` | Extração do card inline atual + suporte aos novos badges |

**Modificações:**
- `ListaPage.tsx`: importa `particionarLista`, renderiza banner + 2 seções, delega card pra novo componente
- `VisitaPage.tsx`: adiciona banner contextual no topo do form se `temAlertaUpa(paciente)`

### Refator aproveitável

Extrair o card de paciente que hoje vive inline em `ListaPage.tsx` pra `<PacienteCardLista>` em `components/`. Justificativa: precisa receber badges como children/props e a lógica do card cresce. Sem essa extração, `ListaPage.tsx` fica complicado. Refator parte do escopo, não fora.

## Testes

**`frontend/src/test/alertas.test.ts`** (novo) — Vitest:
- `temAlertaUpa` com evento ≤7d, =7d, >7d, sem evento
- `diasDesdeEventoUpa` retorna `null` se não houver evento
- `gapVencido` com `ultimaVisita = null`, dentro, no limite, fora
- `particionarLista` com mix: só reativos, só rotina, ambos, vazio
- Casos de borda: paciente com UPA recente E gap vencido vai pra reativos (não duplicado)

**Componentes visuais:** não testados — não há infra de teste de componente. Build (`npm run build`) + smoke visual via Playwright em viewport mobile cobre.

## Edge Cases

- **0 alertas UPA, 0 atrasados:** banner não aparece, seção "Por evento ou atraso" não aparece, só "Por cadência regular"
- **Paciente sem `ultimaVisita`:** `gapVencido = true` (nunca foi visitado, conta como atrasado)
- **Paciente com múltiplos eventos UPA:** usa o mais recente (`ultimoEventoUpa` é singular no mock)
- **Evento UPA antigo (8-60d):** **não** gera alerta, mas continua influenciando o `motivoPrioridade` via score
- **Lista vazia (paciente sem nenhum agendamento no dia):** lógica de partição não roda, página mostra mensagem normal

## Critérios de aceite

1. `npm run build` passa limpo (TS strict)
2. Lista do dia mostra banner UPA quando há ≥1 evento UPA recente
3. Pacientes alertados aparecem na seção "Por evento ou atraso" com badge `⚠ UPA Xd`
4. Pacientes com gap vencido aparecem na mesma seção com badge `📅 Atrasada Xd`
5. Pacientes sem evento e dentro da cadência aparecem em "Por cadência regular"
6. Tap no banner faz scroll pro primeiro card alertado
7. Form de visita mostra banner contextual quando paciente tem alerta UPA
8. Testes `alertas.test.ts` passam (≥8 casos)
9. Nada da Lista atual quebra (calendário semanal, contador no header, navegação pro form continuam)

## Métrica de impacto (pro pitch)

> Hoje a Camila descobre que um paciente foi à UPA via WhatsApp da família, dias depois — quando descobre. Com alerta no app, ela vê no dia seguinte (sync 15:30). Cada visita pós-UPA evitando re-internação economiza ~R$ 1.500 (média SUS internação clínica) + reduz risco de morte por descompensação. Escalado pra 6.200 ACS × ~2 alertas/semana = ~13k alertas/semana de pacientes hoje invisíveis pra APS.

## Próximos passos

1. Implementation plan (próxima skill: `writing-plans`)
2. Implementação seguindo TDD pros helpers em `alertas.ts`
3. Smoke visual em mobile (Playwright 414x896)
4. PR atualiza o `feat(frontend): painel do médico` ou abre PR novo

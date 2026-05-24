# Desafios Bônus — O Que Entregamos

> **Data:** 2026-05-24
> **Branch:** `claude/keen-archimedes-a5d662`
> **PR:** [vinicius-saraiva/impact-lab-saude-17#6](https://github.com/vinicius-saraiva/impact-lab-saude-17/pull/6)

## Sumário

| Desafio | Pergunta original | Status | Onde está |
|---|---|---|---|
| **Bônus 1 — Gestão** | "Construir visualizações importantes para os gestores das unidades / gestor de área programática" | ✅ **Implementado** | Rota `/supervisor` |
| **Bônus 2 — ACS** | "Detectar lacunas de cuidado e melhorias em acompanhamentos que indiquem respostas mais rápidas (ou mesmo menos reativas)" | ✅ **Design + plano completos** · 🔄 implementação em execução | Spec, plano e código |
| **Extra — Painel médico** | (fora dos bônus, pedido em sessão) | ✅ **Implementado** | Rotas `/medico` e `/medico/paciente/:id` |

---

## Bônus 1 — Para o gestor da unidade

### Pergunta do desafio
> "Para gestão: construir visualizações importantes para os gestores das unidades? Ou mesmo o gestor da área programática"

### Pessoa-alvo
Gestor da Clínica da Família Rocinha (responsável por 49 equipes) e gestor de Área Programática da SMS-Rio.

### O que entregamos

Rota nova `/supervisor` com 4 blocos visuais:

1. **KPI gigante "Pacientes nunca visitados" — 34,1%** (355 de 1.042 cadastrados)
   - O número que faz a Carol Canedo levantar a sobrancelha
   - Vermelho, no topo, antes de qualquer outro indicador

2. **KPIs secundários:**
   - Cobertura geral: 60% (amber)
   - Previne Brasil: 11/15 indicadores batidos, ranking 3º de 49 equipes

3. **Cobertura por linha de cuidado** com semáforo (verde ≥85% / amber ≥65% / vermelho <65%):
   - Gestantes 88,2% — verde
   - Crianças 0–6 anos 42,0% — vermelho
   - Hipertensos 58,7% — vermelho
   - Diabéticos 66,7% — amber

4. **Alertas críticos:** 5 gestantes alto risco sem visita recente, com badge `⚠ UPA 60d` para quem teve evento não-eletivo no período

### Arquivos

| Arquivo | Responsabilidade |
|---|---|
| [`frontend/src/pages/SupervisorPage.tsx`](../frontend/src/pages/SupervisorPage.tsx) | UI completa do painel |
| [`frontend/src/dataSupervisor.ts`](../frontend/src/dataSupervisor.ts) | Dados tipados (espelha `out/dashboard_supervisor.json`) |
| [`frontend/src/App.tsx`](../frontend/src/App.tsx) | Rota `/supervisor` |
| [`frontend/src/pages/ListaPage.tsx`](../frontend/src/pages/ListaPage.tsx) | Botão "📊 Painel de gestão" no header da ACS |
| [`out/dashboard_supervisor.json`](../out/dashboard_supervisor.json) | Fonte de verdade (gerado pelo backend) |
| [`scripts/gerar_lista_do_dia.py`](../scripts/gerar_lista_do_dia.py) | Script Python que gera o JSON a partir dos parquets reais |

### Origem dos dados
- Equipe `0206636a` / Unidade `def3447c` da Clínica da Família Rocinha
- Parquets anonimizados (`data/raw/*_anonimizados.parquet`)
- Cobertura calculada com cadências oficiais SMS (gestante 30d, criança 45d, crônico 90d)

### Commit
[`b9081fd`](https://github.com/vinicius-saraiva/impact-lab-saude-17/commit/b9081fd) — *feat(frontend): painel de gestão (desafio bônus 1) em /supervisor*

### Como testar
1. `cd frontend && npm run dev`
2. Abrir `http://localhost:5173/supervisor` em viewport mobile (414×896)
3. Ou clicar no botão "📊 Painel de gestão" no header da Lista do ACS

---

## Bônus 2 — Para o ACS

### Pergunta do desafio
> "Para o ACS: detectar lacunas de cuidado e melhorias em acompanhamentos que indiquem respostas mais rápidas (ou mesmo menos reativas)"

### Pessoa-alvo
Camila (ACS na Rocinha, equipe da Lorena) — fonte primária da entrevista de campo em [FIELD_NOTES_CAMILA_ACS.md](context/FIELD_NOTES_CAMILA_ACS.md).

### Dor real que endereçamos
**Dor #2 da Camila** (literal, da transcrição):

> "Não existe muito bem essa comunicação entre os sistemas. Nosso prontuário não se comunica com o prontuário dos hospitais. Muitas vezes a gente não sabe o que aconteceu."

O ACS só descobre que um paciente foi à UPA via WhatsApp da família — quando descobre. Esta é a definição de "reativo". O bônus 2 pede o oposto: detectar **antes** que a família avise.

### Decisão de escopo (brainstorming session)

Identificamos 3 gaps possíveis:

| Gap | Decisão |
|---|---|
| **Gap 1 — Alerta UPA em destaque** | ✅ **Incluído** |
| **Gap 2 — Tendência clínica** (pressão subindo, adesão caindo) | ❌ Descartado (exige enriquecer mock com histórico, complexidade média-alta) |
| **Gap 3 — Distinção visual rotina vs reativo** | ✅ **Incluído** (endereça o "menos reativas" do enunciado) |

### O que entregamos

#### 1. Banner UPA no topo da Lista do dia
> 🚨 **3 pacientes seus passaram na UPA esta semana**
> Visitar com prioridade pra evitar nova internação.
> [Ver primeiro ›]

- Aparece só se ≥1 evento UPA nos últimos 7 dias
- Tap → scroll suave pro primeiro paciente alertado

#### 2. Badges inline nos cards
- `⚠ UPA 5d` (vermelho) — paciente teve evento UPA recente
- `📅 Atrasada 14d` (laranja) — paciente está fora da cadência da linha de cuidado

#### 3. Lista do dia particionada em 2 seções
- **🚨 Por evento ou atraso** — pacientes com UPA recente OU gap vencido
- **📋 Por cadência regular** — pacientes priorizados só por score

Camila bate ponto às 8h e, antes de sair pra campo, vê de relance se algo mudou desde ontem — separa o "vou na rotina" do "vou porque algo aconteceu".

#### 4. Banner contextual no form de visita
Quando ACS abre o form de um paciente alertado:
> ⚠ **Esteve na UPA há 5 dias** (UPA Rocinha). Pergunte o que aconteceu antes de continuar.

Aproveita o `script_abordagem` que o backend já gera adaptado pra esse caso.

### Arquitetura

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| **Tipos** | `frontend/src/types.ts` | `EventoUpa`, `ultimoEventoUpa?`, `cadenciaLimiteDias` |
| **Lógica pura** | `frontend/src/alertas.ts` | 7 funções puras (`cadenciaPadrao`, `temAlertaUpa`, `diasDesdeEventoUpa`, `gapVencido`, `diasAtraso`, `ehReativo`, `particionarLista`) |
| **Testes** | `frontend/src/test/alertas.test.ts` | 28 casos Vitest cobrindo todos os helpers |
| **Mock data** | `frontend/src/mockData.ts` | Enriquecido com `ultimoEventoUpa` em 3 pacientes-chave (Maria F., Francisca M., Fernanda R.) |
| **Componentes** | `frontend/src/components/` | `BannerAlertaUpa`, `SecaoLista`, `BadgeUpaRecente`, `BadgeGapVencido`, `PacienteCardLista` (refator) |
| **Páginas** | `frontend/src/pages/` | `ListaPage` integra banner + seções, `VisitaPage` ganha banner contextual |

### Documentação

| Doc | O que contém |
|---|---|
| [`docs/superpowers/specs/2026-05-24-bonus-2-alertas-upa-acs-design.md`](superpowers/specs/2026-05-24-bonus-2-alertas-upa-acs-design.md) | Design completo — UX, arquitetura, edge cases, critérios de aceite |
| [`docs/superpowers/plans/2026-05-24-bonus-2-alertas-upa-acs.md`](superpowers/plans/2026-05-24-bonus-2-alertas-upa-acs.md) | Plano de implementação em 14 tasks bite-sized (TDD nos helpers) |

### Commits
- [`688ffc9`](https://github.com/vinicius-saraiva/impact-lab-saude-17/commit/688ffc9) — *docs(specs): design bônus 2*
- [`9f722ca`](https://github.com/vinicius-saraiva/impact-lab-saude-17/commit/9f722ca) — *docs(plans): plano de implementação bônus 2*
- (commits de implementação serão anexados aqui conforme as 14 tasks rodarem)

### Métrica de impacto (pro pitch)
> Hoje a Camila descobre que um paciente foi à UPA via WhatsApp da família, dias depois — **quando descobre**. Com alerta no app, ela vê no dia seguinte (sync 15:30, janela em que ela volta pra clínica). Cada visita pós-UPA evitando re-internação economiza ~R$ 1.500 (média SUS internação clínica) + reduz risco de morte por descompensação. Escalado pra 6.200 ACS × ~2 alertas/semana = **~13k alertas/semana** de pacientes hoje invisíveis pra APS.

---

## Extra — Painel do Médico (fora dos bônus)

### Origem
Pedido explícito do Daniel em sessão. Não está nos desafios bônus oficiais, mas cobre o 3º persona (Dra. Laura M., médica de família na Rocinha) e fortalece o critério "impacto real" mostrando que a mesma fonte de dados serve **três** usuários distintos sem duplicação.

### O que entregamos

#### Rota `/medico` — lista filtrável
- 18 pacientes ordenados por PRIO-ACS desc
- Busca por nome + filtros (Crítico / HAS / DM / Crianças / Vulneráveis)
- Stats no header: total, prioridade crítica, com evento recente
- Cada card mostra próxima consulta agendada

#### Rota `/medico/paciente/:id` — painel detalhado
Camada de inteligência sobre o VitaCare APS:

1. **Score PRIO-ACS breakdown** — 4 componentes (ICSAP / ciclo de vida / lacuna de cuidado / vulnerabilidade social) com barra de progresso e citação da framework de cada
2. **Última visita ACS** — ACS responsável, observações, pressão aferida, adesão à medicação (com tom), risco identificado em campo
3. **Eventos clínicos** — timeline cronológica de urgências/internações (vermelho) e agendamentos (azul)
4. **Próxima consulta agendada** — data, motivo, profissional
5. **Sugestões clínicas** — 3-4 ações derivadas das condições (ex: "Solicitar HbA1c", "Inspecionar pés")
6. **Acompanhamento ACS 12m** — visitas vs cadência esperada

### Arquivos

| Arquivo | Responsabilidade |
|---|---|
| [`frontend/src/pages/MedicoPage.tsx`](../frontend/src/pages/MedicoPage.tsx) | Lista filtrável |
| [`frontend/src/pages/PacienteMedicoPage.tsx`](../frontend/src/pages/PacienteMedicoPage.tsx) | Painel detalhado |
| [`frontend/src/dataMedico.ts`](../frontend/src/dataMedico.ts) | Contexto clínico derivado deterministicamente do `MOCK_PACIENTES` |

### Commit
[`ad49552`](https://github.com/vinicius-saraiva/impact-lab-saude-17/commit/ad49552) — *feat(frontend): painel do médico — visão por paciente*

### Como testar
1. `cd frontend && npm run dev`
2. Botão "🩺 Modo médico" no header da Lista do ACS
3. Ou direto em `http://localhost:5173/medico`

---

## Navegação Entre os 3 Personas

```
┌─────────────────────────────────────┐
│        ACS (Camila)                  │
│        /                             │  ← entrada padrão
│   ┌──┴──┐                            │
│   ▼     ▼                            │
│ /visita/:id   "📊 Painel de gestão" "🩺 Modo médico"
│  (form)            │                    │
│                    ▼                    ▼
│             SUPERVISOR              MÉDICA (Laura)
│            (gestor)                  /medico
│           /supervisor               /medico/paciente/:id
└─────────────────────────────────────┘
```

Cada persona tem **botão de voltar pra Lista do ACS** ("← Modo ACS") — UX consistente entre as 3 rotas.

---

## Por Que Isso Soma Pra Avaliação

| Critério (peso) | Como esse trabalho contribui |
|---|---|
| **Impacto real (40%)** | 3 personas reais (ACS + gestor + médica) usando o produto amanhã, com dados reais dos parquets. Bônus 2 ataca a dor #2 da Camila citada na entrevista. |
| **Produto (20%)** | Design consistente entre 3 telas (mesma fonte, badges reaproveitados), mobile-first, offline-first (PWA), navegação fluida |
| **Engenharia (20%)** | Lógica pura testada (28 testes Vitest no `alertas.ts`), tipos rigorosos (`cadenciaLimiteDias` espelha backend Python), zero duplicação de regra (front consome JSON gerado pelo script Python) |
| **Ideia (10%)** | Distinção visual rotina vs reativo no bônus 2 — categoria nova de UX que sai da "lista linear" e ataca diretamente o "menos reativas" do enunciado |
| **Apresentação (10%)** | README + este doc + spec + plano + 6 commits descritivos + PR aberto pronto pra demo |

---

*Última atualização: 2026-05-24*

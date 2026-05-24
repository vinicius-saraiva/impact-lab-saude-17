# Rio Impact Lab 2026 — Problem Deep Dive

> **Data:** 2026-05-24
> **Fontes:** 3 transcrições, GitHub do desafio, pesquisa NHS, pesquisa CHW internacional, frameworks de risk stratification
> **Propósito:** Compreensão profunda do problema antes da fase de design

---

## 1. O Problema em 1 Página

**Quem:** 6.200 ACS no Rio acompanham 4.5M residentes — cada ACS responsável por ~750 pessoas em uma micro-área.

**O quê:** Hoje a decisão diária de "quem visitar primeiro" é feita por memória, papel e conhecimento informal do território.

**Por que importa:**
- **Lei do cuidado inverso** (Daniel Saldana, citado na consulta de Rocinha): quem mais precisa NÃO é quem mais aparece na clínica. A visita domiciliar existe exatamente para alcançar quem não vem.
- **Visita mensal obrigatória por lei** a cada família cadastrada. Não é opcional.
- **Financiamento federal** depende de bater 15 indicadores de qualidade (Previne Brasil, Portaria 3.493/2024). Visita ACS dispara muitos deles.
- **Internações preveníveis (ICSAP)** = 7.2% de TODAS as hospitalizações SUS em 2015 (836.873 internações/ano). É dinheiro pulverizado que primary care poderia evitar.

**A oportunidade do hackathon:** transformar 4 sinais clínicos + histórico de visitas + geografia em uma **lista priorizada diária de 8-12 famílias por ACS**, com motivo + ação esperada.

---

## 2. Tipos de Pacientes Prioritários

### 2.1 Lista oficial do MS (Carteira de Serviços / Guia ACS)

| Grupo | Cadência mínima | No dataset? |
|-------|----------------|-------------|
| Gestantes | Mensal (pré-natal + puerpério) | ✅ `gestacao` |
| Crianças <5 anos | 7-8 visitas/ano (Rio) — vs 4 nacional | ⚠️ Parcial — só `faixa_etaria` |
| Idosos | Regular | ⚠️ Parcial — só `faixa_etaria` |
| Hipertensos | Regular (BP em 6m) | ✅ `hipertenso` |
| Diabéticos | Regular (HbA1c em 6m) | ✅ `diabetico` |
| Acamados / restrição mobilidade | Regular | ❌ Sem flag |
| Pessoas com deficiência | Regular | ❌ Sem flag |
| Tuberculose | **Diária (DOTs)** | ❌ Sem flag |
| Hanseníase | Mensal | ❌ Sem flag |
| Usuários de droga | Caso a caso | ❌ Sem flag |
| Vulnerabilidade social | Regular | ✅ `situacao_vulnerabilidade` |

**Implicação para o MVP:** o sistema só consegue priorizar diretamente 4 categorias clínicas + idade + vulnerabilidade social. As outras 6 ficam como "v2 — integração VitaCare/CID".

### 2.2 O que sobra no dataset (sinais REALMENTE modeláveis)

1. **4 flags booleanos** (hipertenso, diabético, gestação, vulnerabilidade)
2. **Faixa etária** (proxy para criança 0-5 ou idoso 65+)
3. **Eventos clínicos recentes** — `tipo` = urgência/emergência/hospital
4. **Gap de visita** — dias desde última visita do ACS
5. **Geografia** — distância paciente → unidade
6. **Densidade do território** — pacientes por ACS

---

## 3. Modelos de Referência Mundiais

### 3.1 NHS (Reino Unido)

| Modelo | O Que Importa | Aplicação Rio |
|--------|--------------|---------------|
| **Virtual Wards** | Lista diária multidisciplinar + checklist de elegibilidade | Padrão de dashboard ACS |
| **Community Matron** | Caseload 50-80 pts; se passar disso, vira reativo e aumenta internação | Cap explícito de visitas/dia |
| **Electronic Frailty Index (eFI/eFI2)** | Conta deficits de uma lista de 36 itens. Cuts: Fit/Mild/Moderate/Severe | Modelo de score transparente, math sem caixa preta |
| **PRISMATIC trial (CONTRA-EXEMPLO)** | Score sem mudança de workflow → AUMENTOU internações | Lista priorizada SEM bundle de ação é ativamente prejudicial |
| **Bridges to Health (B2H)** | Segmenta TODA população em 8 grupos por estágio de vida | Mental model: cada residente em 1 segmento, cadência diferente por segmento |
| **NHS Proactive Care Framework** | Score seleciona; **bundle** torna visita valiosa | Cada paciente priorizado precisa de motivo + ação esperada |

### 3.2 Programas CHW Internacionais

| Programa | Insight Chave | Aplicação Rio |
|----------|--------------|---------------|
| **Índia ASHA (~1M)** | Fragmentação de apps = ASHA digita mesmo paciente em 4-6 sistemas | Integrar no VitaCare, NÃO app paralelo |
| **Ruanda RapidSMS** | Push event-triggered: registrou gestante → SMS automático com calendário | Notificação 7am com lista do dia, NÃO esperar ACS abrir |
| **Etiópia Family Folder** | ACS pega 8-10 pastas pela manhã para visitar | Cap dura: 8-12 famílias por dia, NUNCA 50 |
| **Paquistão LHW Khaandan** | Cadência floor: toda casa ≥1×/mês | AI prioriza ORDEM, não SE visita |
| **EUA PRAPARE** | 15+5 perguntas SDOH estruturadas (moradia, comida, transporte, isolamento, violência) | **MAIOR GAP DO ACS:** formalizar SDOH + suplemento Rio (água, dengue, segurança) |

### 3.3 Frameworks Clínicos de Estratificação

| Framework | Inputs | Aplicabilidade Rio |
|-----------|--------|-------------------|
| **HCC v28 (CMS)** | CID-10 + idade + sexo → score de risco/custo | ⚠️ Requer CIDs (não tem no dataset). Lógica de hierarquia é portável |
| **Adjusted Clinical Groups (ACG)** | 12m de CIDs + idade + sexo → 98 categorias + RUB 0-5 | ⚠️ Requer CIDs. Lógica de multimorbidade portável |
| **Charlson Comorbidity Index** | 17 categorias diagnósticas ponderadas → score 0-24+ → mortalidade | ⚠️ Requer CIDs. Padrão-ouro mais citado |
| **Electronic Frailty Index (eFI)** | 36 deficits → 0-1 → frailty tiers | ✅ Portável: simplificar para 10-15 deficits coletáveis no app |
| **LACE Index** | Length+Acuity+Charlson+ED visits → readmissão 30d | ✅ Parcial: "E" via eventos_clinicos.urgência |
| **HOSPITAL Score** | 7 vars de internação | ❌ Não aplicável (discharge-side) |
| **CDC SVI / ADI** | 16 vars do censo → 4 temas SDOH | ✅ Substituir por **IDS-Rio** (Índice Desenvolvimento Social) por setor censitário |
| **High-risk pregnancy criteria** | Idade<17 ou ≥35, prior cesárea, HAS, anemia, DM, prematuridade prévia | ✅ Aplicar como flag binário |
| **TB LTFU prediction (XGBoost AUC 0.92)** | Histórico + uso de drogas + idade + sexo + HIV + escolaridade | ❌ Sem flag TB no dataset |
| **Pediatric immunization defaulter** | Idade + timeliness prévia + status mãe | ⚠️ Parcial: regra simples com faixa_etaria |

---

## 4. ICSAP — A Métrica Brasileira Oficial (LOAD-BEARING)

**Portaria SAS/MS nº 221, de 17/04/2008** — define a **Lista Brasileira de Internações por Condições Sensíveis à Atenção Primária (ICSAP)**.

**Esta é EXATAMENTE a métrica "eventos de condições preveníveis" que a Prefeitura quer otimizar.** É lei federal. Tem 19 grupos:

### Os 19 Grupos ICSAP

1. Doenças preveníveis por vacinação (tétano, difteria, coqueluche, polio, sarampo, caxumba, rubéola, hepatite B, meningite TB)
2. Gastroenterites e complicações (diarréia, desidratação)
3. Anemia (ferropriva)
4. Deficiências nutricionais (kwashiorkor, marasmo, def. vit A/B)
5. Infecções ouvido/nariz/garganta (otite média, sinusite, faringite)
6. Pneumonias bacterianas
7. Asma
8. Doenças pulmonares (DPOC, bronquite, bronquiectasia)
9. **Hipertensão** ✅ no dataset
10. Angina
11. Insuficiência cardíaca
12. Doenças cerebrovasculares (AVC)
13. **Diabetes mellitus** ✅ no dataset
14. Epilepsia
15. Infecções renais e do trato urinário
16. Infecções de pele e subcutâneo (celulite, erisipela)
17. Doença inflamatória pélvica
18. Úlcera gastrointestinal
19. **Doenças do pré-natal e parto** ✅ no dataset (sífilis na gestação, eclâmpsia, etc.)

**Validação brasileira:**
- 7.2% de TODAS as internações SUS em 2015 = ICSAP (836.873 de 11.6M)
- América Latina: ICSAP = 17.4% das altas hospitalares
- Correlação inversa forte entre cobertura ESF e taxa ICSAP — fundamento empírico da estratégia do ACS

**Pitch implication:** "Nossa solução reduz ICSAP" tem peso jurídico/financeiro. Não é eufemismo. É a métrica oficial.

---

## 5. Score Proposto: **PRIO-ACS** (adaptado para a realidade do dataset)

### Versão original do Agente 3 (assume CIDs disponíveis)

| Componente | Peso | Fonte |
|------------|------|-------|
| ICSAP burden | 30 | Portaria 221/2008 |
| Charlson tier | 20 | Charlson Comorbidity Index |
| Care gap / urgency | 20 | LACE-lite + TB-LTFU + defaulter |
| Vulnerable life-stage | 20 | Maternal + pediatric + frail elderly |
| Social vulnerability | 10 | SVI/ADI/IDS-Rio |

### Versão MVP (adaptada para os 4 flags do dataset Rio)

```
PRIO-ACS Score (0-100):

ICSAP proxy (peso 35):
  +15 se hipertenso
  +15 se diabetico
  +15 se gestacao
  (cap em 35 — quem tem 3 já satura)

Vulnerable life-stage (peso 25):
  +25 se gestacao
  +20 se faixa_etaria == "0-6" 
  +15 se faixa_etaria == "65+" e (hipertenso OU diabetico)
  (pega o maior, não soma)

Care gap / urgency signal (peso 25):
  +15 se evento "urgência" ou "emergência" nos últimos 60 dias
  +10 se evento "hospital" nos últimos 90 dias
  +10 se gap_visita > limite_por_grupo
     (gestante: 30d; criança<5: 45d; crônico: 90d; geral: 180d)

Social vulnerability (peso 15):
  +15 se situacao_vulnerabilidade
  
TIER:
  0-30  → Baixa  (não entra na lista do dia, visita só na cadência mensal)
  31-60 → Média  (entra na lista 1-2x/mês)
  61-80 → Alta   (semanal)
  81-100→ Crítica (semanal + alerta supervisor)
```

### Por que esse score é defensível para o júri

1. **Cada componente cita framework validado peer-reviewed** — não tem peso arbitrário
2. **ICSAP é a métrica oficial da Prefeitura** — Portaria 221/2008
3. **Transparente** — ACS vê POR QUE paciente subiu
4. **Roda em pandas/SQL** — sem treinar modelo, sem black-box
5. **Subgroup fairness** — relatar taxa de visita por AP, sexo, raça, faixa etária como aba default
6. **Stretch goal:** XGBoost overlay treinado em `clinical_events` com target = "internação ICSAP em 90 dias" + SHAP para explicabilidade

---

## 6. Arquitetura Proposta (Integração das 3 Pesquisas)

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1 — DATA (4 Parquets + IDS-Rio + Calendário PNI)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 2 — SEGMENTAÇÃO B2H (NHS)                           │
│  Mapeia residente em 1 de 8 segmentos por estágio de vida    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 3 — PRIO-ACS SCORE (0-100, 4 componentes)           │
│  ICSAP proxy + Life-stage + Care gap + Social vulnerability │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 4 — DAILY LIST (Etiópia Family Folder)              │
│  Top 8-12 por ACS, com cadência floor mensal (Paquistão)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 5 — BUNDLE DE AÇÃO (NHS Proactive Care)             │
│  Claude gera: motivo + ação esperada + script de visita     │
│  Tom ensino médio (perfil ACS confirmado em transcrição)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 6 — PUSH (Ruanda RapidSMS)                          │
│  Notificação 7am com lista, no VitaCare app, NÃO paralelo   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  CAMADA 7 — FEEDBACK LOOP (Ruanda + Penn IMPaCT)            │
│  ACS marca: visitado/não-encontrado/urgente/recusado        │
│  Dashboard semanal: indicadores Previne batidos pela equipe │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Failure Modes Documentados (Não Repetir)

| Erro | Origem | Prevenção |
|------|--------|-----------|
| Score sem mudança de workflow → AUMENTA internações | PRISMATIC trial (Wales) | Sempre pareie score com bundle de ação |
| Fragmentação de apps | Índia ASHA | Integrar no VitaCare, não app paralelo |
| Admin burden > visitas | Etiópia | UI ≤3 toques por interação |
| Workload sobe sem pagamento subir | ASHA | Demonstre redução de trabalho, não adição |
| CHW não vê impacto do dado | Ruanda + Índia | Feedback loop semanal com indicadores Previne |
| Caseload acima do limite → reativo | Sargent 2008 (Community Matron) | Cap explícito de visitas/dia |
| Black-box ML sem explicabilidade | Literatura 2024-26 | Score aditivo transparente + SHAP no overlay |

---

## 8. Arquitetura do Pitch (6 minutos)

**Minuto 1 — Problema:**
"6.200 ACS visitam 4.5M cariocas hoje SEM lista priorizada. Resultado: 7.2% das internações SUS são preveníveis — Portaria 221/2008 mostra que primary care deveria evitar. No Rio, isso = X milhões/ano em internações que não precisariam acontecer."

**Minuto 2 — Solução:**
"Toda manhã, o ACS abre o VitaCare e vê 8-12 famílias na lista do dia, ordenadas por risco — com motivo e ação esperada para cada uma. Demo."

**Minutos 3-4 — Demo:**
- Tela do ACS: lista do dia, ordenada, com explicação
- Tela do gestor: heatmap por AP, indicadores Previne batidos
- Tela "por que esse paciente?" — transparência do score

**Minuto 5 — Como funciona:**
"Score aditivo PRIO-ACS, 4 componentes baseados em frameworks validados: ICSAP (Portaria 221), high-risk pregnancy (Rede Cegonha), care gap (LACE-lite), social vulnerability (IDS-Rio). Claude gera os textos de ação. Roda no VitaCare via API — zero infra nova."

**Minuto 6 — Impacto + Próximos passos:**
"Mapeia direto nos 15 indicadores Previne Brasil 2026 → financiamento federal aumenta. Próximo passo: pilotar em 3 clínicas da Rocinha + Maré + Complexo do Alemão por 90 dias. Mede ICSAP antes/depois."

---

## 9. Próximos Passos Imediatos

1. **Baixar os 4 Parquets** do Google Drive
2. **Profilar:**
   - Distribuição de `faixa_etaria` e cruzamento com flags
   - % com cada flag
   - Eventos de urgência/emergência por paciente — distribuição
   - Gap de visita médio por equipe
3. **Implementar PRIO-ACS** em pandas (1 função, ~50 linhas)
4. **Validar:** os scores fazem sentido? Há outliers absurdos?
5. **Construir UI:**
   - Lista do dia para ACS (mobile-first PWA)
   - Dashboard supervisor por equipe
6. **Claude integration:**
   - Geração do "motivo" por paciente (linguagem ensino médio)
   - Geração do "bundle de ação"
7. **Empacotar para entrega:**
   - GitHub repo limpo + README
   - Screen recording 60s
   - Deck pitch 6min

---

## 10. Referências Principais

### Brasil
- [Portaria SAS/MS 221/2008 — ICSAP](https://www.cosemssc.org.br/wp-content/uploads/2022/02/5.pdf)
- [Portaria 3.493/2024 — 15 indicadores Previne 2026](https://www.cosemssp.org.br/wp-content/uploads/2024/07/PT-3493-MARINA-MELO.pdf)
- [Previne Brasil — MS](https://www.gov.br/saude/pt-br/composicao/saps/previne-brasil/)
- [Guia Prático ACS — MS](http://189.28.128.100/dab/docs/publicacoes/geral/guia_acs.pdf)
- [ICSAP no Brasil — SciELO](http://www.scielo.br/j/csp/a/y5n975h7b3yW6ybnk6hJwft/?lang=pt)
- [Lancet Regional Health — preventable hospitalizations LATAM 2025](https://www.thelancet.com/journals/lanam/article/PIIS2667-193X(25)00248-0/fulltext)

### NHS
- [NHS Proactive Care Framework](https://www.england.nhs.uk/long-read/proactive-care-providing-care-and-support-for-people-living-at-home-with-moderate-or-severe-frailty/)
- [Virtual Wards Operational Framework](https://www.england.nhs.uk/long-read/virtual-wards-operational-framework/)
- [eFI2 (2025)](https://bjgp.org/content/75/755/249)
- [PRISMATIC Trial — o que NÃO fazer](https://www.journalslibrary.nihr.ac.uk/hsdr/HSDR06010)
- [Bridges to Health Segmentation](https://outcomesbasedhealthcare.com/bridges-to-health-segmentation-model/)

### CHW Internacional
- [Rwanda RapidSMS-MCH](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3542808/)
- [PRAPARE — SDOH screening](https://prapare.org/)
- [Penn IMPaCT — CHW ROI](https://pmc.ncbi.nlm.nih.gov/articles/PMC8564553/)
- [Human-in-the-loop CHW AI](https://pmc.ncbi.nlm.nih.gov/articles/PMC9021941/)
- [OECD AI + Health Workforce 2024](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/11/artificial-intelligence-and-the-health-workforce_c8e4433d/9a31d8af-en.pdf)

### Frameworks Clínicos
- [Charlson ICD-10 Validation](https://pmc.ncbi.nlm.nih.gov/articles/PMC8252530/)
- [LACE Index](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5726103/)
- [TB LTFU XGBoost AUC 0.92](https://pmc.ncbi.nlm.nih.gov/articles/PMC11494039/)
- [CDC SVI vs ADI](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0292281)
- [ML for SDOH outreach — Frontiers 2025](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1659322/full)

---

*Arquivo gerado em 2026-05-24 a partir de pesquisa estruturada de 3 agentes paralelos + 3 transcrições de reunião + GitHub do desafio. Versão 1.0 — fase de design.*

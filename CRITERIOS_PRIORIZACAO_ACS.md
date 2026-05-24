# Critérios de Priorização de Visita ACS — Consolidação

Documento único reunindo **todos os critérios** identificados nesta sessão de pesquisa, separados por origem, com fonte e página. Inclui, ao final, os critérios **já adotados no próprio repo** (algoritmo PRIO-ACS implementado em `main`).

> Aviso sobre páginas: `[p.N]` = página do PDF (índice 1-based). Para os CABs e a Carteira do Rio, conferir a página exata antes de usar em deck oficial — alguns desses números vêm de extração por agente e podem ter offset de 1-2 páginas em relação à numeração impressa.

---

## Parte 1 — Manuais do dataset (referenciados no README do desafio)

Cinco PDFs em `manuais/`, baixados das fontes oficiais listadas no [README do dataset](https://github.com/prefeitura-rio/claude-impact-lab-saude/blob/master/README.md). Extração reproduzível por `extract_criteria.py` → `criteria_raw.txt`.

### 1.1 Manual do Agente Comunitário de Saúde — Ministério da Saúde

Fonte: http://189.28.128.100/dab/docs/publicacoes/geral/manual_acs.pdf

| Página PDF | Critério |
|---|---|
| p.28 | "Identificar áreas e situações de risco individual e coletivo (…) **principalmente aquelas em situação de risco**" |
| p.29 | **Lista canônica de situações de risco**: bebês < 2,5 kg; crianças desnutridas; filhos de mães que fumam/bebem/usam drogas; gestantes sem pré-natal; gestantes fumantes; gestantes com DM ou HAS; acamados; pessoas que precisam de cuidadores e não têm; PCD sem acesso |
| p.30 | **Determinantes que aumentam o risco**: baixa renda; desemprego; sem água tratada; lixo inadequado; uso/automedicação; descontinuidade de tratamento |
| p.30 | **Barreiras de acesso**: localização da unidade com barreiras geográficas |
| p.47 | **Grupos prioritários para mapeamento de microárea**: gestantes, idosos, hipertensos, diabéticos, acamados, crianças < 5 anos, PCD, usuários de drogas, hanseníase, tuberculose |
| p.48 | Definição de **microárea de risco** (inundação, condições favoráveis a doenças/acidentes) |
| p.50 | **Regra de frequência por risco**: "situação de risco (…) demandará a realização de outras visitas com maior frequência" |
| p.65 | "Dando prioridade para aquelas famílias que necessitam ser acompanhadas com maior frequência" |
| p.77-79 | **Acompanhamento mensal por Ficha B**: B-GES (gestantes), B-HA (hipertensos), B-DIA (diabéticos), B-TB (tuberculose), B-HAN (hanseníase) |
| p.80 | **Ficha C — criança < 5 anos** |
| p.82-83 | **Acompanhamento intensificado**: crianças < 2 anos com diarreia ou IRA nos últimos 15 dias |

### 1.2 Guia Prático para o ACS — Ministério da Saúde

Fonte: http://189.28.128.100/dab/docs/publicacoes/geral/guia_acs.pdf

| Página PDF | Critério |
|---|---|
| p.31 | **Recém-nascidos de risco**: < 2,5 kg, prematuros, > 4 kg (sugere diabetes gestacional) — "acompanhados com mais frequência" |
| p.105-107 | **HAS — fatores de risco**: excesso de peso, alimentação rica em sal, álcool, tabagismo, sedentarismo, diabetes, familiares hipertensos. **Papel ACS**: Ficha B-HA, busca ativa de faltosos, adesão medicamentosa |
| p.108-110 | **DM — fatores de risco**: obesidade, histórico familiar, sedentarismo, HAS, dislipidemia. **Papel ACS**: Ficha B-DM, busca ativa, adesão |
| p.113 | **TB — populações de risco prioritárias**: tosse > 3 sem; tratamento anterior; contatos intradomiciliares; presídios/manicômios/abrigos; doenças debilitantes (DM, neoplasias); HIV; usuários de drogas; moradores de rua; trabalhadores de saúde |
| p.115 | **TB — DOT**: 3 observações/sem nos primeiros 2 meses; 2/sem até o fim |
| p.119 | **Hanseníase**: dose supervisionada a cada 28 dias; contatos intradomiciliares (5 anos) → encaminhar |
| p.143-145 | **Gestante faltosa** ao pré-natal → busca ativa; mínimo 6 consultas |
| p.147 | **Sinais de risco na gestação**: perda de líquido/sangue, edema, febre alta, vômitos frequentes, fortes dores de cabeça |
| p.154 | **Puerpério**: 2 consultas até o 42º dia pós-parto |
| p.161 | **Idoso — VD checklist**: com quem mora; AVD/AVDI; cuidador; vacinação; sinais de violência; risco de quedas; medicação contínua; idoso acamado |
| p.164-165 | **Idoso frágil** = dificuldade em uma ou mais AVD/AIVD |
| p.172 | **Polifarmácia** = fator de risco |
| **p.177** | ⭐ **Critérios explícitos para maior atenção e frequência de visitas ao idoso**: queda ou internação nos últimos 6 meses; DM/HAS sem acompanhamento; sem acompanhamento regular; idoso sozinho com várias crônicas; acamados ou com dificuldade de locomoção até UBS |
| p.193 | **Gestante/puérpera com depressão**: "visitar mais regularmente" |
| p.222 | **Acamado** — VD reforçada (decúbito, escara) |
| p.236 | **Mapeamento de famílias de risco para violência** |

### 1.3 Violências e Papel dos ACS — SMS Rio

Fonte: https://subpav.org/aps/uploads/publico/repositorio/SMS_ViolenciasPapelACS_A5_v2.pdf

| Página PDF | Critério |
|---|---|
| p.8 | Definições de violência (física/psicológica/sexual, trabalho infantil) — devem ser ativamente rastreadas em VD |
| p.10 | Violência sexual: "**acesso à eSF deve ser priorizado e imediato**" para profilaxia de IST |
| p.12 | **Risco de vida em violência doméstica** → Lei Maria da Penha, medidas protetivas, abrigo |
| p.18 | Refugiados/migrantes — "população vulnerabilizada" |

### 1.4 Câncer de Colo de Útero e Mama — SMS Rio

Fonte: https://subpav.org/aps/uploads/publico/repositorio/Livro_EnfrentamentoCancerColoUteroMama_PDFDigital_20221101_(2).pdf

| Página PDF | Critério |
|---|---|
| p.9 | **Risco elevado para câncer de mama**: parente 1º grau com CA mama < 50a; bilateral; em homem; CA de ovário em qualquer idade |
| p.10 | Busca ativa pelo ACS de mulheres faltosas a preventivo/mamografia |
| p.12 | Rastreamento organizado: colo 25-64a; mama 50-69a |

### 1.5 O ACS e o Controle do Tabagismo — INCA

Fonte: https://subpav.org/aps/uploads/publico/repositorio/cartilha-do-agente-comunitario-2014.pdf

| Página PDF | Critério |
|---|---|
| p.10 | Tabagismo = "mais importante fator de risco isolado de doenças graves e fatais" |
| p.12 | **Gestante fumante** = risco de placenta prévia, descolamento, prematuridade |
| p.16 | Protocolo de cessação: 4 sessões semanais no 1º mês; quinzenais no 2º; mensais a partir do 3º até completar 1 ano |

---

## Parte 2 — Outros guias oficiais (buscados externamente)

Documentos não listados no README do desafio, mas que fundamentam o algoritmo legalmente. **A Carteira de Serviços do Rio é a peça-chave** — fixa periodicidade quantitativa por estrato.

### 2.1 ⭐ Carteira de Serviços da APS — SMS Rio 2021

Fonte: https://subpav.org/download/impressos/Livro_CarteiraDeServicosAPS_2021_20211229.pdf

| Página PDF | Critério |
|---|---|
| **pp.46 e 87** | ⭐⭐ **Tabela canônica de periodicidade mínima por categoria**: **Diária**: tuberculose, hanseníase. **Semanal**: gestantes alto risco, crianças ≤ 30 dias. **Mensal**: gestantes risco habitual, crianças 1m-1a, acamados, Cartão Família Carioca. **Trimestral**: hipertensos, diabéticos, crianças 1-2a. **Semestral**: crianças 2-6a, idosos ≥ 60a, Auxílio Brasil |
| p.46 | Variáveis para estratificação domiciliar: idade, cuidados paliativos, multimorbidade, polifarmácia, mobilidade, dependência funcional |
| p.87 | Agente de Vigilância em Saúde: visita ≥ 2×/ano por domicílio |
| p.87 | SLA visita solicitada na unidade: 1ª avaliação em ≤ 30 dias |
| p.87 | CFC + Auxílio Brasil = "maior risco social, atenção especial" |
| pp.46-47 | **Priorização no agendamento**: gestantes, idosos > 60a, pessoas com necessidades especiais, crianças < 1a |
| p.47 | **Tempo máximo de agendamento de consulta**: 30 dias |

### 2.2 PNAB — Portaria GM/MS 2.436/2017

Fonte: https://abennacional.org.br/wp-content/uploads/2024/06/PNAB_portaria_2436-setembro_2017.pdf

| Localização | Critério |
|---|---|
| Anexo 3.3 | População por equipe 2.000-3.500; em áreas de risco/vulnerabilidade: **máximo 750 pessoas por ACS** |
| Anexo 3.4-e | Microárea de ACS ≤ 750 pessoas |
| **Anexo 3.4-f** | ⭐ "Priorização para população com maior grau de **vulnerabilidade e de risco epidemiológico**" |
| Anexo 4.2.6-III | "Visitas com periodicidade estabelecida no planejamento da equipe (…) **especial atenção às pessoas com agravos que necessitem de maior número de visitas**" |
| Anexo 4.2 | Atribuição do enfermeiro/médico: **estratificação de risco** + plano de cuidados para crônicos |

### 2.3 Lei nº 13.595/2018 (atualiza Lei 11.350/2006)

Fonte: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13595.htm

| Localização | Critério |
|---|---|
| Art. 3º §2º | VD "casa a casa" para busca de sinais/sintomas de agudos, crônicos, agravos |
| **Art. 3º §3º IV** | **Grupos legais de visita regular e periódica**: gestante (pré, parto, puerpério); lactante (6m pós-parto); criança; adolescente; idoso; pessoa em sofrimento psíquico; dependência química; cavidade bucal; homossexuais/transexuais; mulher e homem |
| Art. 3º §3º V | Identificação e acompanhamento: situações de risco familiar; grupos de risco c/ vulnerabilidade social; estado vacinal |
| Art. 3º §3º VI | Acompanhamento de condicionalidades de programas sociais (parceria CRAS) |
| Art. 9º-A §2º | 30h externas (visita) + 10h planejamento |

### 2.4 Portaria GM/MS 825/2016 + Caderno AD vol.2 (Melhor em Casa)

Fontes: https://bvsms.saude.gov.br/bvs/saudelegis/gm/2016/prt0825_25_04_2016.html · https://bvsms.saude.gov.br/bvs/publicacoes/caderno_atencao_domiciliar_melhor_casa.pdf

| Localização | Critério |
|---|---|
| Portaria art. 8º (AD1) | "Menor frequência e menor necessidade multiprofissional" → APS, frequência operacional **mensal** |
| Portaria art. 9º (AD2) | Afecções agudas/agudizadas; crônico-degenerativas com atendimento **≥ semanal**; **cuidados paliativos ≥ semanal**; prematuro/baixo peso em ganho ponderal |
| Portaria art. 10 (AD3) | AD2 + uso de equipamento ou cuidado multiprofissional mais frequente |
| Portaria art. 14 | Inelegibilidade para AD: monitorização contínua; enfermagem contínua |
| Caderno pp.37-38 | Variáveis clínicas (internações 12m, acamado, AVD/AVDI, drenos/feridas, paliativos) + sociais (drogadição, desemprego, cuidador, idoso sozinho, saneamento, segurança do profissional) |

### 2.5 CAB 32 — Pré-Natal de Baixo Risco (MS, 2012)

Fonte: https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf

| Página PDF | Critério |
|---|---|
| pp.57-58 (5.2.1) | Fatores que mantêm na APS mas exigem atenção: idade < 15 ou > 35; baixa escolaridade; situação conjugal insegura; IMC alterado; histórico obstétrico desfavorável; ganho ponderal inadequado |
| **pp.58-60 (5.2.2)** | ⭐ **Critérios de alto risco gestacional** (≈10% das gestações): cardiopatias; pneumopatias graves; nefropatias; DM/tireoidopatia; doenças hematológicas; HAS crônica; epilepsia; psiquiátricas; autoimunes; HIV/sífilis/hepatites; **hanseníase, TB**; dependência química; restrição de crescimento; polidrâmnio/oligoidrâmnio; gemelaridade; malformação; **distúrbios hipertensivos da gestação**; ITU de repetição; anemia grave; **DMG**; desnutrição/obesidade mórbida; adolescente c/ risco psicossocial |
| ≈p.57 (fluxograma) | Baixo risco → visitas mensais pelo ACS |

### 2.6 CAB 33 — Saúde da Criança: Crescimento e Desenvolvimento (MS, 2012)

Fonte: https://bvsms.saude.gov.br/bvs/publicacoes/saude_crianca_crescimento_desenvolvimento.pdf

| Página PDF | Critério |
|---|---|
| p.36 | VD recomendada na 1ª semana pós-parto; periodicidade pactuada pelos fatores de risco/proteção |
| **p.61 (4.1)** | **Cronograma de consultas**: 7 no 1º ano (1ª semana, 1m, 2m, 4m, 6m, 9m, 12m); 2 no 2º ano (18m, 24m); anuais depois — "crianças que necessitem de maior atenção devem ser vistas com maior frequência" |
| ≈p.37 | Sinais de perigo < 2 meses (encaminhamento imediato): recusa alimentar, vômitos importantes, convulsão/apneia, FC < 100, letargia, FR > 60 |

### 2.7 CAB 36 — Diabetes Mellitus (MS, 2013)

Fonte: https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_diabetes_mellitus_cab36.pdf

| Página PDF | Critério |
|---|---|
| **pp.60-61 (Quadro 10)** | **Estratificação em 4 estratos**: **Baixo** (glicemia alterada/intolerância); **Médio** (DM, HbA1c < 7,5, sem internações, sem complicações); **Alto** (HbA1c 7,5-9 ou pressão inadequada, internações em 12m ou complicações crônicas); **Muito alto** (HbA1c > 9; síndrome arterial aguda < 12m; DRC 4-5; pé diabético ulcerado/infectado; comorbidades severas) — gestão de caso |

### 2.8 CAB 37 — Hipertensão Arterial Sistêmica (MS, 2014)

Fonte: https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf

| Página PDF | Critério |
|---|---|
| p.39 (Quadro 5) | **Alto risco** = AVC/IAM prévio, lesão de órgão-alvo, AIT, HVE, nefro/retinopatia, aneurisma aorta abdominal, estenose carótida sintomática, DM, idade > 65a |
| pp.39-40 (2.7.4) | Estratificação Framingham: baixo (< 10% em 10a), intermediário (10-20%), alto (> 20% ou LOA) |
| **p.74 (Tabela 5)** | ⭐ **Periodicidade de consulta médica/enfermagem**: baixo → **anual**; moderado → **semestral**; alto → **quadrimestral** |

---

## Parte 3 — Critérios já adotados NO REPO (algoritmo PRIO-ACS implementado)

A branch `main` do `vinicius-saraiva/impact-lab-saude-17` já tem o algoritmo de ranqueamento implementado, com schema explícito documentado em `MASTER_CONTEXT.md` §6.4 e codificado em `scripts/gerar_lista_do_dia.py`. **Esta é a baseline a partir da qual os critérios das Partes 1-2 podem refinar o score.**

> ### ⚠️ Aviso de proveniência (importante para o pitch)
>
> O título da seção 6.4 no `MASTER_CONTEXT.md` é **"Síntese: Score PRIO-ACS — Adaptado ao Framework Oficial"**. A palavra **"Síntese"** é literal: **os pesos numéricos (35/25/25/15), os incrementos (+15/+20/+25) e os cortes de tier (0-30 / 31-60 / 61-100) foram engenheirados pela equipe**, calibrados pelos achados do dataset. **Não saíram verbatim de nenhuma portaria, manual ou DOCX.**
>
> O que é **oficial e auditável** são os **frameworks de origem** que a equipe sintetizou: ICSAP (Portaria SAS/MS 221/2008), Escala de Risco Familiar (Ficha A SIAB/SISAB) e as cadências por linha de cuidado (DOCX SMS-Rio 8 linhas de cuidado).
>
> Para o pitch (regra Rio Impact Lab "honesto hoje vs próximo"): **v1 = regras transparentes derivadas de Portaria 221 + Ficha A + Carteira Rio; v2 = ML calibrado em dados reais com supervisão clínica.**

### 3.1 Score PRIO-ACS (0-100, aditivo) — `scripts/gerar_lista_do_dia.py` + `MASTER_CONTEXT.md` §6.4

**4 componentes aditivos:**

```
ICSAP proxy (cap 35):
  +15 hipertenso     [ICSAP grupo 9]    ← grupo: REAL · peso: SÍNTESE
  +15 diabético      [ICSAP grupo 13]   ← grupo: REAL · peso: SÍNTESE
  +15 gestação       [ICSAP grupo 19]   ← grupo: REAL · peso: SÍNTESE

Vulnerable life-stage (cap 25, pega o maior — não soma):
  25 gestante                            ← peso: SÍNTESE
  20 faixa_etaria "0-6"                  ← peso: SÍNTESE
  15 idoso (65+) com crônica             ← peso: SÍNTESE

Care gap / urgency (cap 25):
  +15 evento não-eletivo nos últimos 60d ← peso e janela 60d: SÍNTESE
  +10 gap_visita > limite_por_grupo      ← peso: SÍNTESE

Social vulnerability (cap 15):
  +15 situacao_vulnerabilidade           ← flag: REAL (campo do dataset) · peso: SÍNTESE
```

**Detalhamento da proveniência:**

| Elemento | Origem | Evidência |
|---|---|---|
| Existência dos 19 grupos ICSAP; grupo 9 = HAS; grupo 13 = DM; grupo 19 = gestação | ✅ **Real** — Portaria SAS/MS nº 221/2008 | `MASTER_CONTEXT.md:357` |
| Caps 35 / 25 / 25 / 15 e incrementos +15 / +20 / +25 | ⚙️ **Síntese da equipe** | Inventados na seção 6.4 do `MASTER_CONTEXT.md`, criada em 2026-05-24 12:19 |
| Janela de 60 dias para "evento recente" | ⚙️ **Síntese da equipe** | Não está em nenhum documento oficial citado |
| Flag `situacao_vulnerabilidade` | ✅ **Real** — campo do dataset anonimizado | README do dataset |

### 3.2 Limites de gap por grupo (em dias) — `_gap_limit_for_row` no script

| Condição | Gap máximo aceitável | Origem | Proveniência |
|---|---|---|---|
| Gestante | 30 dias | Carteira Rio p.46/87 (mensal) + DOCX SMS-Rio 8 linhas de cuidado | ✅ **Real** |
| Criança 0-6 | 45 dias | Aproximação da Carteira Rio (mensal 1m-1a, trimestral 1-2a, semestral 2-6a) | ⚠️ **Mistura**: cadências por faixa são REAIS, mas o valor único 45d é SÍNTESE para acomodar a faixa agregada `0-6` do dataset |
| Hipertenso ou Diabético | 90 dias | Carteira Rio p.46/87 (trimestral) | ✅ **Real** |
| Geral | 180 dias | Carteira Rio p.46/87 (semestral para idoso/adulto) | ✅ **Real** |

### 3.3 Tradução score → tier da Escala de Risco Familiar (SIAB/SISAB)

| Score | Tier | Cadência oficial | Proveniência |
|---|---|---|---|
| 0-30 | habitual | Mensal | Tier + cadência: ✅ **Real** (Ficha A SIAB/SISAB) · Corte numérico 30: ⚙️ **Síntese** |
| 31-60 | médio | Quinzenal a mensal | Tier + cadência: ✅ **Real** · Cortes 31/60: ⚙️ **Síntese** |
| 61-100 | alto | Semanal a quinzenal | Tier + cadência: ✅ **Real** · Corte 61: ⚙️ **Síntese** |

> A **existência** dos 3 tiers ("habitual / médio / alto") e suas cadências mensais/quinzenais/semanais é oficial — Ficha A SIAB/SISAB (Ministério da Saúde) e `OFFICIAL_SMS_RIO_FRAMEWORK.md`. **Onde cortar o score (30 e 60)** é decisão da equipe — não existe norma que diga "score ≥ 61 = alto".

### 3.4 Tradução score → prioridade UI — `scripts/gerar_realdata_frontend.py`

| Score | Prioridade (badge) | Cor | Proveniência |
|---|---|---|---|
| ≥ 70 | crítica | vermelho | ⚙️ **Síntese** — corte UI puramente da equipe |
| 50-69 | alta | laranja | ⚙️ **Síntese** |
| 30-49 | média | amarelo | ⚙️ **Síntese** |
| < 30 | baixa | cinza | ⚙️ **Síntese** |

> Esta camada não tem correspondência oficial — é uma convenção visual interna do app que tenta dar contraste maior do que os 3 tiers SIAB.

### 3.5 Linha de cuidado primária → qual Ficha aplica — `_linha` no script

| Condição do paciente | Linha de cuidado | JSON ficha | Proveniência |
|---|---|---|---|
| Gestação | Pré-natal/Puerpério | `ficha_b_gestante.json` | ✅ **Real** — Ficha oficial SMS-Rio v1.0 2022 (código `SMSRIO013_FICHA_B`) |
| Faixa etária 0-6 | Primeira infância | `ficha_c_primeira_infancia.json` | ✅ **Real** — Ficha oficial SMS-Rio (`SMSRIO001_FICHA_C`) |
| HAS ou DM | Crônico | `ficha_b_cronico.json` | ✅ **Real** — Ficha oficial SMS-Rio (`SMSRIO019_FICHA_B`) |
| Demais | Cadastro família | `ficha_a_cadastro_familia.json` | ✅ **Real** — Ficha oficial SIAB (`SMSDC008_SIAB`) |

> A **escolha de qual paciente entra em qual ficha** segue a estrutura oficial das fichas SMS-Rio versão 1.0 (2022). A regra de desempate (gestante vence 0-6, que vence HAS/DM, que vence cadastro) é convenção implícita da equipe — não documentada externamente, mas defensável porque cada ficha mais específica subsume a anterior.

### 3.6 Triggers críticos por Ficha — `MASTER_CONTEXT.md` §6.2

Sinais que disparam **escalonamento de prioridade** ao serem captados durante a visita:

| Ficha | Trigger | Proveniência |
|---|---|---|
| FICHA B Crônico | P6 = S (foi à UPA/emergência); P7 = S (machucado no pé em DM) | ✅ **Real** — campos das Fichas SMS-Rio v1.0 2022 |
| FICHA B Gestante | P5 = S (sangramento < 12 sem); P9 = N (não sentiu o bebê > 25 sem); PA ≥ 140/90 | ✅ **Real** — campos da Ficha + corte PA da CAB 32 (alto risco) |
| FICHA C Primeira Infância | P1 = N (sem 1ª consulta em 7d); P6 inclui gemido/cansaço respirar; P9 = S (insegurança alimentar) | ✅ **Real** — campos da Ficha + sinais de perigo CAB 33 |
| FICHA B TB | 2+ doses TDO faltando; P2 inclui urina escura/pele amarelada (hepatotoxicidade) | ✅ **Real** — campos da Ficha + sinais clínicos de hepatotoxicidade |
| FICHA A | Horário de visita mais conveniente captado | ✅ **Real** — campo da Ficha A |

> **A identificação dos triggers críticos é real** — sai dos campos das fichas oficiais SMS-Rio v1.0 2022 e da literatura clínica (CAB 32 e CAB 33). A **decisão de transformá-los em escalonamento de score** é arquitetura da equipe.

### 3.7 Mapeamento Ficha → boost no score — `MASTER_CONTEXT.md` §6.2

```
FICHA A → cadastra base (4 flags + situacao_vulnerabilidade)
FICHA B Gestante → +25 life-stage + 35 ICSAP grupo 19
FICHA B Crônico → +15 ICSAP grupo 9 (HAS) ou 13 (DM)
FICHA C → +20 life-stage (criança 0-6) + indicadores Previne crianças
FICHA B TB → linha de cuidado diária (TDO) — fora da escala normal
```

> Os **boosts numéricos** acima vêm direto dos pesos do §3.1, portanto carregam a mesma proveniência: **grupos ICSAP REAIS, valores SINTÉTICOS**.

### 3.8 ⭐ Auditoria de proveniência — o que é oficial vs. o que é síntese da equipe

Tabela única para defesa no audit/pitch — espelha o que a equipe já reconheceu internamente (`MASTER_CONTEXT.md` §6.4 título + `FRONTEND_EVALUATION.md:75`):

| Componente | Origem | Evidência |
|---|---|---|
| Existência dos 19 grupos ICSAP; mapeamento grupo 9 = HAS, 13 = DM, 19 = gestação | ✅ **Real** — Portaria SAS/MS 221/2008 | `MASTER_CONTEXT.md:357` |
| Escala de Risco Familiar com 3 categorias (habitual / médio / alto) e cadências mensal/quinzenal/semanal | ✅ **Real** — Ficha A SIAB/SISAB (MS) | `MASTER_CONTEXT.md:355` + `OFFICIAL_SMS_RIO_FRAMEWORK.md` |
| Cadências mínimas por grupo: gestante 30d, criança/grupos pediátricos por faixa, crônicos 90d, geral 180d | ✅ **Real** — DOCX SMS-Rio "8 linhas de cuidado" + Carteira de Serviços APS Rio 2021 pp.46/87 | `MASTER_CONTEXT.md:356` + Parte 2.1 deste doc |
| Fichas oficiais SMS-Rio v1.0 2022 (A, B Crônico, B Gestante, B TB, C) | ✅ **Real** — SMS-Rio publicou em PDF + JSON dev-ready em `FICHAS/` | `MASTER_CONTEXT.md` §6.2 |
| Achados do dataset: 49,9% pacientes nunca visitados; 43% gestantes com urgência | ✅ **Real** — perfilagem do dataset anonimizado | `data_profile.json` |
| **Pesos 35 / 25 / 25 / 15** (caps por componente do score) | ⚙️ **Síntese da equipe** | Não existe em fonte externa — `MASTER_CONTEXT.md` §6.4 criada 2026-05-24 12:19 |
| **Incrementos +15 / +20 / +25** dentro de cada componente | ⚙️ **Síntese da equipe** | Não existe em fonte externa |
| **Cortes de tier 0-30 / 31-60 / 61-100** (mapeamento score → tier SIAB) | ⚙️ **Síntese da equipe** | Não existe em fonte externa — o SIAB define as 3 categorias mas não o corte numérico |
| **Cortes de prioridade UI ≥70 / 50-69 / 30-49 / <30** | ⚙️ **Síntese da equipe** | Camada visual interna — `scripts/gerar_realdata_frontend.py` |
| **Janela de 60 dias** para "evento não-eletivo recente" | ⚙️ **Síntese da equipe** | Hoje é genérica; Guia ACS p.177 sugere janela específica de 6 meses para queda/internação de idoso |
| **Limite de gap 45d para criança 0-6** | ⚠️ **Mistura** | Cadências por subfaixa são REAIS na Carteira Rio (mensal/trimestral/semestral); o número único 45d é compromisso para a faixa agregada do dataset |

#### Como apresentar isso no pitch (3 atos: hoje vs próximo)

- **Hoje (v1)** — Score com regras transparentes, auditáveis, derivadas de **Portaria 221/2008 + Ficha A SIAB + Carteira APS Rio 2021**. Pesos calibrados pelos achados empíricos do dataset. Toda decisão de visita pode citar a portaria/manual que a sustenta.
- **Próximo (v2)** — Calibração dos pesos por ML supervisionado com feedback dos supervisores de equipe; janela do "evento recente" parametrizada por grupo (60d genérico → 6 meses para idoso, 30d para gestante, etc.); separação de gestante alto risco (CAB 32 §5.2.2) vs habitual; captura de TB/Hanseníase e acamado via Ficha para visita diária/mensal.

---

## Parte 4 — Lacunas e oportunidades de refinamento

Comparando o que o repo já implementa (Parte 3) com o que os manuais oficiais autorizam (Partes 1-2):

### 4.1 Critérios já cobertos pelo algoritmo

✅ Gestante (life-stage 25 + ICSAP 15)
✅ Criança 0-6 (life-stage 20)
✅ Idoso + crônica (life-stage 15)
✅ HAS / DM (ICSAP 15 cada)
✅ Vulnerabilidade social (15)
✅ Evento de urgência recente (15)
✅ Gap de visita vencido (10)

### 4.2 Critérios oficiais ainda **não** capturados pelo dataset/algoritmo atual

Estes critérios estão nos manuais mas dependem de campos que **não existem hoje** no schema dos parquets — são candidatos a evolução v2 ou enriquecimento via Ficha:

| Critério oficial | Fonte | Como capturar |
|---|---|---|
| **TB / Hanseníase ativa** → visita diária | Carteira Rio p.46/87 | Não há flag no `pacientes.parquet`; capturar via Ficha B-TB / B-HAN |
| **Recém-nascido ≤ 30 dias** → visita semanal | Carteira Rio p.46/87 | Hoje só temos faixa etária "0-6"; precisa idade em dias |
| **Gestante alto risco** (CAB 32 §5.2.2) → semanal | Carteira Rio + CAB 32 | Dataset só tem flag `gestacao`; precisaria de comorbidades concomitantes |
| **Idoso queda/internação últimos 6 meses** → maior frequência | Guia ACS p.177 | Inferível dos `eventos_clinicos` agregados com `tipo = urgência` e janela 6m (atualmente o algoritmo usa janela 60d genérica) |
| **Idoso sozinho c/ múltiplas crônicas** | Guia ACS p.177 | Sem campo "mora sozinho" / "tem cuidador" — Ficha A capta |
| **Acamado** → mensal | Carteira Rio p.46/87 | Capturar via Ficha B-Crônico (acamado é flag de risco) |
| **Cartão Família Carioca / Auxílio Brasil** | Carteira Rio p.87 | Não tem flag; aproximar por `situacao_vulnerabilidade` |
| **Polifarmácia, multimorbidade, dependência AVD** | Carteira Rio p.46; Caderno AD pp.37-38 | Capturar via Ficha B-Crônico ou registro clínico |
| **Sintomático respiratório ≥ 3 sem (busca ativa TB)** | Guia ACS p.113 | Capturar via Ficha A em pergunta de saúde |
| **Contato intradomiciliar TB/Hanseníase** | Guia ACS p.113, p.119 | Inferível por endereço compartilhado com paciente índice |
| **Mulher 25-64 atrasada no preventivo / 50-69 na mamografia** | Cancer Colo/Mama p.10/12 | Não há flag de "fez exame em ano X"; precisa integração com VitaCare |
| **DM "Muito Alto" CAB 36** (HbA1c > 9, IAM/AVC < 12m, DRC 4-5, pé ulcerado) | CAB 36 pp.60-61 | Sem HbA1c no dataset; gera via Ficha B-Crônico P6/P7 |
| **HAS Framingham Alto** | CAB 37 p.74 | Sem dados de Framingham — derivável de idade + DM + lesão órgão-alvo |
| **AD1/AD2/AD3** (status de atenção domiciliar) | Portaria 825/2016 | Sem campo; capturar via Ficha A ou registro do enfermeiro |

### 4.3 Sugestões diretas de evolução do algoritmo

1. **Subir o gap_limite para crianças**: hoje é 45d para 0-6; segundo Carteira Rio + CAB 33, deveria ser **30d para crianças ≤ 30 dias** (não capturável só com faixa etária — exige idade em dias derivada da data de nascimento).
2. **Adicionar TB/Hanseníase como override max**: paciente com flag de TB ativa deve ter `gap_limite = 1 dia` e `tier = alto` automaticamente — supera qualquer score.
3. **Refinar evento urgência por janela ajustada**: hoje é 60d genérico; idoso com queda/internação tem regra própria de **6 meses** (Guia ACS p.177) — pode virar componente separado de care_gap.
4. **Distinguir gestante alto risco vs habitual**: hoje gestante ganha 25 life-stage e 15 ICSAP fixo (40 pts) independente de risco; deveria escalar para 60+ se algum critério CAB 32 §5.2.2 estiver presente (exige enriquecimento via Ficha B-Gestante).
5. **Capturar acamado no score**: hoje não é coberto; segundo Carteira Rio é categoria mensal (visita mensal igual gestante) — merece life-stage ou care_gap próprio.

---

## Apêndice A — Referências canônicas

| Documento | URL canônica |
|---|---|
| Manual do ACS (MS) | http://189.28.128.100/dab/docs/publicacoes/geral/manual_acs.pdf |
| Guia Prático do ACS (MS) | http://189.28.128.100/dab/docs/publicacoes/geral/guia_acs.pdf |
| Violências e Papel dos ACS (SMS Rio) | https://subpav.org/aps/uploads/publico/repositorio/SMS_ViolenciasPapelACS_A5_v2.pdf |
| Câncer Colo/Mama (SMS Rio) | https://subpav.org/aps/uploads/publico/repositorio/Livro_EnfrentamentoCancerColoUteroMama_PDFDigital_20221101_(2).pdf |
| Tabagismo (INCA) | https://subpav.org/aps/uploads/publico/repositorio/cartilha-do-agente-comunitario-2014.pdf |
| ⭐ Carteira de Serviços APS — SMS Rio 2021 | https://subpav.org/download/impressos/Livro_CarteiraDeServicosAPS_2021_20211229.pdf |
| PNAB — Portaria 2.436/2017 | https://abennacional.org.br/wp-content/uploads/2024/06/PNAB_portaria_2436-setembro_2017.pdf |
| Lei 13.595/2018 | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13595.htm |
| Portaria GM/MS 825/2016 (Melhor em Casa) | https://bvsms.saude.gov.br/bvs/saudelegis/gm/2016/prt0825_25_04_2016.html |
| Caderno de Atenção Domiciliar vol.2 | https://bvsms.saude.gov.br/bvs/publicacoes/caderno_atencao_domiciliar_melhor_casa.pdf |
| CAB 32 — Pré-Natal de Baixo Risco | https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf |
| CAB 33 — Saúde da Criança | https://bvsms.saude.gov.br/bvs/publicacoes/saude_crianca_crescimento_desenvolvimento.pdf |
| CAB 36 — Diabetes Mellitus | https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_diabetes_mellitus_cab36.pdf |
| CAB 37 — Hipertensão Arterial Sistêmica | https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf |

## Apêndice B — Arquivos do repo consultados

| Arquivo | Conteúdo relevante |
|---|---|
| `scripts/gerar_lista_do_dia.py` | Implementação do score PRIO-ACS, gap_limit, tier, linha de cuidado |
| `scripts/gerar_realdata_frontend.py` | Mapeamento score → prioridade (critica/alta/média/baixa) do UI |
| `MASTER_CONTEXT.md` (§6.1 a §6.4) | Frameworks oficiais usados, Fichas SMS-Rio, score formalizado |
| `BUILD_THIS.md` | Contrato dos JSONs de output |
| `docs/PRD.md` | Requisitos do produto |
| `FICHAS/*.json` | Schemas oficiais SMS-Rio das 5 fichas (ficha A, B crônico, B gestante, B TB, C) |
| `extract_criteria.py` + `criteria_raw.txt` | Extração reproduzível dos critérios das Partes 1.1-1.5 |

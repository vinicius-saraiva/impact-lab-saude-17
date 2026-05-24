# Frontend TODOs — ACS Visitas

## Em foco agora
- [x] Lista semanal (Seg–Sex, máx 5/dia, default segunda)
- [x] Formulário condicional por tipo de paciente (hipertenso, gestante, diabético, criança, vulnerável)
- [x] Dados gerais do paciente (raça/cor, vulnerabilidade)
- [x] Offline-first com IndexedDB (Dexie) + sync bar
- [x] PWA configurável para instalar no Android
- [x] **Form hipertensão** — sub-form dedicado com borda azul, ficha histórica (pressão, medicação, sintomas) + perguntas simuladas
- [x] **Dados pré-existentes do paciente** — card "Último registro" com 150/95 · medicação · sintomas acima das perguntas
- [x] **Testes de IndexedDB** — 23 testes com fake-indexeddb + Vitest (persistência, sync, campos clínicos, fluxo offline→sync)

---

## Forms — Fichas Oficiais SMS-Rio 2022

### Ficha B Crônico (HAS / DM / Asma / DPOC / Idoso) — `ficha_b_cronico.json`
Cadência: mensal (quinzenal se descompensado). 14 perguntas por visita.

- [ ] **P1** — Nas duas últimas semanas você esqueceu alguma dose da medicação? (Sim/Não)
- [ ] **P2** — Com que frequência você sente que é difícil lembrar de tomar o remédio? (Sempre / Quase sempre / Às vezes / Quase nunca / Nunca)
- [ ] **P3** — Você sente algum desconforto causado pela medicação? (Sim/Não)
- [ ] **P4** — Você tem alguma dificuldade ou dúvida em relação ao tratamento? (Sim/Não)
- [ ] **P5** — Você está passando por alguma mudança de estilo de vida? (Não / Cessando tabagismo / Iniciando atividade física / Mudando a alimentação)
- [ ] **P6** — Você precisou ser atendido em UPA ou Emergência? (Sim/Não) ⚠️ **SIM → alerta imediato + bundle visita urgente**
- [ ] **P7** (DM) — Você está com algum machucado no pé? (Sim/Não) → SIM: encaminhamento prioritário
- [ ] **P8** (Asma/DPOC) — Sua tosse piorou nas últimas semanas? (Sim/Não)
- [ ] **P9–P14** (Idoso vulnerável) — cuidador presente, consegue responder, deixou tomar dose, refeições/dia (0–4+), ferida
- [ ] Campo livre "Informações / observações da visita" (1000 chars)

Enums novos necessários em `types.ts`:
- `frequencia_5pt`: Sempre / Quase sempre / Às vezes / Quase nunca / Nunca
- `mudancaEstiloVida`: Não / Cessando tabagismo / Iniciando atividade física / Mudando a alimentação

Regras de escalonamento (RN004–RN007):
- P6 == Sim → visita imediata + alerta supervisor
- P1 == Sim OU P12 == Sim por 2+ visitas seguidas → bundle de adesão
- P7 == Sim (DM) → encaminhamento + foto se possível
- 2+ alertas seguidos → cadência quinzenal

### Ficha B Gestante — `ficha_b_gestante.json`
Cadência: mensal (risco habitual) · semanal (alto risco). Até 48 visitas.

- [ ] Campos de marcos: DUM + DPP (calculado: DUM + 280 dias)
- [ ] Semana gestacional calculada automaticamente: `Math.floor((dataVisita − DUM) / 7)`
- [ ] **P1** (0–41sem) — Você mediu a pressão? (Sim/Não)
- [ ] **P2** (0–41sem) — Precisou ir à UPA ou maternidade este mês? (Sim/Não) ⚠️ **SIM → indicação de gravidez de risco**
- [ ] **P3** (0–41sem) — Realizou os exames solicitados? (Sim/Não)
- [ ] **P4** (0–12sem) — Está enjoando? (Sim/Não)
- [ ] **P5** (0–12sem) — Teve algum sangramento? (Sim/Não) ⚠️ **SIM < 12sem → URGÊNCIA risco de aborto**
- [ ] **P6** (0–24sem) — Teve ardência ao urinar? (Sim/Não) → SIM: triagem ITU
- [ ] **P7** (13–41sem) — Ganho de peso: Adequado / Muito peso / Pouco peso
- [ ] **P8** (13–41sem) — Tem inchaço nas pernas? (Sim/Não) → triagem pré-eclâmpsia se SIM + PA elevada
- [ ] **P9** (25–41sem) — Sentiu o bebê mexer nas últimas 24h? (Sim/Não) ⚠️ **NÃO → URGÊNCIA encaminhamento imediato**
- [ ] **P10** (25–41sem) — Visitou a maternidade de referência? (Sim/Não)
- [ ] Fatores de risco (multi-select → classifica alto risco → cadência semanal):
  - Pressão alta / Diabetes / 40 anos ou mais / Menos de 15 anos
  - 6 ou mais gestações / Tentativa de aborto nesta gestação / Parto prematuro/Aborto prévio
- [ ] PA sistólica/diastólica (campos opcionais) + alert PA ≥ 140/90

### Ficha C Primeira Infância (0–6 anos) — `ficha_c_primeira_infancia.json`
Cadência: mensal (≥7 visitas/ano para <1 ano). Até 30 visitas.

- [ ] Idade em meses calculada automaticamente: `Math.floor((dataVisita − dataNascimento) / 30.44)`
- [ ] **P1** (0–28 dias) — Realizou a primeira consulta em até 7 dias? ⚠️ **NÃO → URGÊNCIA encaminhamento**
- [ ] **P2** (0–5m) — Onde dorme a criança? (Berço / Chão / Cama com outras pessoas / Sofá) → triagem SMSL
- [ ] **P3** (0–6a) — Está comparecendo às consultas? (Sim/Não + justificativa se Não)
- [ ] **P4** (0–6a) — Vacinação em dia? (Sim/Não) → NÃO: encaminhar para campanha
- [ ] **P5** (0–6a) — Alimentação: LM Exclusivo / LM+água/chá / LM+outro leite / Outro leite / etc.
- [ ] **P6** (0–6a) — Sinais de risco (multi-select): Cansaço / Febre / Tosse / Diarreia / Cansaço ao respirar / Gemido / Não suga/engole / Vômitos / Internação / Lesões de pele ⚠️ **sinais críticos → URGÊNCIA**
- [ ] **P7** (0–6a) — Mãe percebeu alteração no desenvolvimento? → SIM: puericultura especializada
- [ ] **P8** (0–6a) — Perfil BPC mas não está recebendo? → SIM: assistente social
- [ ] **P9** (0–6a) — Comida acabou antes de ter dinheiro no último mês? → SIM: CRAS + Bolsa Família
- [ ] **P10** (6m–6a) — Matriculada em creche/pré-escola?
- [ ] **P11** (6m–6a) — Faltou creche? (motivo se Sim)
- [ ] **P12** (4–6a) — Tem acesso a atividade de contraturno?
- [ ] Calendário vacinal completo (BCG, Hep B, Pentavalente, Polio, Pneumo, Rotavírus, Meningo, etc.)

### Ficha A — Cadastro Família (`ficha_a_cadastro_familia.json`)
- [ ] Campos de moradia: tipo_domicilio, tipo_acesso, material_paredes, abastecimento_agua, tratamento_agua, escoamento_sanitario, destino_lixo
- [ ] Renda familiar faixa: Até ½ SM / Mais de ½–1 SM / 1–2 SM / 2–5 SM / >5 SM / Doações
- [ ] Horário disponível para visita: Manhã / Tarde / Noite / Sábado / Domingo (multi-select)
- [ ] situacao_familiar (6 opções de arranjo domiciliar)
- [ ] procura_em_caso_doenca (multi-select: farmácia / UBS / hospital público / rede privada / etc.)

### Enums — corrigir `types.ts`
- [ ] `RacaCor` está incompleto — adicionar `'Amarela'` e `'Indígena'` (código oficial SMS-Rio tem 5 valores)
- [ ] Adicionar `frequencia_5pt`, `mudancaEstiloVida`, `ganhoPersoGestante`, `alimentacaoCrianca`, `sinaisRiscoCrianca`, `ondeDormeCrianca`

---

## Escalação e Alertas (lógica de negócio — MASTER_CONTEXT)

Estes padrões devem virar badges/alertas visuais na UI, nunca texto diagnóstico:

- [ ] **P6 Crônico Sim** → badge "⚠️ Urgência — UPA/Emergência" + notificar supervisor
- [ ] **P9 Gestante Não** (>25sem) → badge "🚨 Não sentiu bebê mexer — encaminhar imediato"
- [ ] **P5 Gestante Sim** (<12sem) → badge "🚨 Sangramento — risco de aborto"
- [ ] **P6 Criança sinais críticos** → badge "🚨 Sinal de risco — atendimento imediato"
- [ ] **Adesão medicamentosa** (P1/P2 Crônico) flagged 2+ visitas → badge "Adesão irregular"
- [ ] **Pé diabético** (P7 DM) → badge "🦶 Ferida no pé — encaminhamento + foto"
- [ ] Anti-pattern PRISMATIC: **nunca mostrar score sem action bundle** — cada alerta precisa de instrução concreta (o que fazer, não só o score)

---

## PRIO-ACS Score (backend — MASTER_CONTEXT)

Score aditivo 0–100, 4 componentes:
- ICSAP proxy (35pts) — diagnósticos sensíveis à atenção primária (HAS, DM, asma)
- Life-stage (25pts) — gestante alto risco, criança <1 ano, idoso ≥75 anos
- Care gap (25pts) — dias desde última consulta × tipo (urgência vs rotina)
- Social vulnerability (15pts) — renda ≤½ SM, situação de rua, violência doméstica

- [ ] Implementar cálculo no frontend (mockData.ts) com os 4 componentes
- [ ] Badge de prioridade na lista de pacientes (cor = score range: verde/amarelo/laranja/vermelho)
- [ ] `motivoPrioridade` na VisitaPage deve vir do score, não de texto diagnóstico hardcoded

---

## Dados / API

- [ ] Substituir mockData.ts por dados reais da API (filtrado por equipe_id do ACS logado)
- [ ] Login por profissional_id (simples, sem OAuth por ora)
- [ ] Score engine no backend (FastAPI + DuckDB sobre parquets — 97,938 pacientes, 100,503 eventos)
- [ ] Endpoint `/visitas/semana?profissional_id=X&semana=YYYY-WW` — lista priorizada
- [ ] Endpoint `/sync` — recebe fila offline e envia ao Vitacare (mock por ora)
- [ ] 49.9% dos pacientes nunca receberam visita — priorizar no algoritmo de lista

---

## Offline / PWA

- [x] Testes de IndexedDB (23 testes — persistência, sync, campos clínicos, fluxo offline→sync)
- [ ] Background Sync API — sync automático quando volta internet
- [ ] Conflito de sync — mesmo paciente editado por dois ACS offline
- [ ] Indicador "dados atualizados em X" vs "cache da semana anterior"
- [ ] Service Worker: cache de lista da semana toda manhã
- [ ] Campos de gestante: calcular semana_gestacional offline a partir da DUM armazenada

---

## UX / Interface (constraints Camila — MASTER_CONTEXT)

Restrições validadas em campo:
- ≤3 taps para registrar uma visita simples
- ACS não quer que o app dite a rota (ela conhece o bairro) — sugerir, nunca impor
- Offline obrigatório — não pode depender de 4G na comunidade

- [ ] Feedback visual ao salvar (toast de confirmação)
- [ ] Mapa / direções para o endereço do paciente (link Google Maps — abre app externo)
- [ ] Modo escuro (acessibilidade ao sol)
- [ ] Indicador claro de status offline/online (sync bar já existe — refinir)
- [ ] Notificação "paciente tem consulta amanhã — avisar durante visita"

---

## Deploy

- [x] Deploy frontend — **https://frontend-psi-black-9cdy0n3cqq.vercel.app** (Vercel, HTTPS, PWA pronto)
- [ ] Deploy backend FastAPI (Fly.io ou Railway)
- [ ] README do hackathon: demo video, link do app, arquitetura, impacto (1.55M horas/ano)

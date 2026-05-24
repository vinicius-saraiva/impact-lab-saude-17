# Frontend TODOs — ACS Visitas

## Concluído
- [x] Lista semanal (Seg–Sex, visão semanal completa, sem filtro diário)
- [x] Formulário condicional por tipo de paciente (hipertenso, gestante, diabético, criança, vulnerável)
- [x] Dados gerais do paciente (raça/cor, vulnerabilidade)
- [x] Offline-first com IndexedDB (Dexie) + sync bar
- [x] PWA configurável para instalar no Android
- [x] Form hipertensão — Ficha B Crônico SMS-Rio P1–P7 oficial
- [x] Dados pré-existentes do paciente — card "Último registro" acima das perguntas
- [x] Testes de IndexedDB — 23 testes (persistência, sync, campos clínicos, offline→sync)
- [x] PRIO-ACS score calculado dos parquets reais (18 pacientes, equipe 0206636a)
- [x] `motivoPrioridade` factual — sem texto diagnóstico
- [x] Distância do ACS para o paciente na lista (km) — ACS decide a rota
- [x] Link Google Maps no formulário — endereço do paciente (sem sugestão de rota)
- [x] `RacaCor` corrigido — Branca / Preta / Parda / Amarela / Indígena / Outros
- [x] Deploy Vercel — https://frontend-psi-black-9cdy0n3cqq.vercel.app
- [x] **Painel de gestão** (`/supervisor`): KPIs, cobertura por linha de cuidado, ranking Previne, alertas críticos
- [x] **Ficha B Crônico completa** — P1–P7 (P7 só DM), campo observações
- [x] **Ficha B Gestante completa** — DUM + semana gestacional calculada + P1–P10 condicionais por semana
- [x] **Ficha C Criança completa** — P1–P9 com condicionais por idade em meses
- [x] **"Não sei"** — OpcaoSN (Sim/Não/Não sei) em todos os campos clínicos
- [x] **`precisaEncaminhamento`** — auto-computed quando qualquer `nao_sei` ou urgência; modal pós-salvar
- [x] **Enums** — `RespostaSN`, `Frequencia5pt`, `MudancaEstiloVida`, `GanhoPesoGestante`, `AlimentacaoCrianca`, `SinalRiscoCrianca`, `OndeDormeCrianca`
- [x] **Alertas/banners** — P6 Crônico Sim, P5 Gestante Sim, P9 Gestante Não, sinais críticos criança, pé diabético
- [x] **Leaflet + OpenStreetMap** — `MapaVisitas`, tab Lista/Mapa, pins coloridos por prioridade, bottom sheet ao clicar no pin
- [x] **Tela de paciente** (`/paciente/:id`) — dados demográficos, score, localização, último registro, botão "Começar visita"
- [x] **Validação de campos obrigatórios** — botão "Salvar" bloqueado com lista de campos faltando por perfil
- [x] **Login mock** — tela `/login` com ID + senha, credenciais hardcoded, rotas protegidas
- [x] **Pin da ACS no mapa** — posição mock (Cláudia) próxima aos pacientes priorizados
- [x] **Bottom sheet no mapa** — clique no pin abre card do paciente na base da tela; toque no card navega para /paciente/:id
- [x] **Bug Maria F.** — SecaoCronico agora recebe `isHAS` prop; título correto "Hipertensão + Diabetes"
- [x] **Draft de visita** — rascunho salvo no localStorage ao preencher; carregado ao reabrir; apagado ao salvar
- [x] **Modal de saída** — ao clicar Voltar com dados preenchidos: Salvar rascunho / Descartar / Continuar
- [x] **"Continuar visita"** — PacientePage mostra botão diferente e aviso de rascunho se draft existir

---

## 🔴 Must have — ainda pendente

### Mapa
- [ ] `navigator.geolocation` para posição real da ACS (hoje usa lat/lng mock hardcoded)

### Dados / API
- [ ] Substituir `mockData.ts` por dados reais da API Supabase (`priorizacao_pacientes` RPC)
- [ ] Integrar `salvarVisita` com `supabase.from('visitas_capturadas').insert()`
- [ ] Substituir `useSync` mock por chamada Supabase real

### Apresentação / entrega
- [ ] README hackathon: demo video, link do app, arquitetura, impacto (1.55M horas/ano)

---

## 🟡 Nice to have

### Testes offline
- [ ] Vitest: mockar `navigator.onLine = false` → salvar → voltar online → sync → `synced = true`
- [ ] Vitest `useSync` hook — fila pendente acumula offline, sync dispara ao voltar online

### PWA / offline avançado
- [ ] Background Sync API — sync automático ao voltar online
- [ ] Indicador "dados atualizados em X" vs "cache da semana anterior"
- [ ] Service Worker: pré-cache da lista toda manhã

### Dados
- [ ] DPP calculado a partir da DUM (hoje só semana gestacional é calculada)

---

## Deploy
- [x] Deploy frontend — https://frontend-psi-black-9cdy0n3cqq.vercel.app
- [ ] Integração Supabase (backend dev está fazendo)

# Rio Impact Lab — Índice da Engenharia de Contexto

> **Status:** Fase de engenharia de contexto — pré-design
> **Data:** 2026-05-24
> **Princípio:** Compreensão profunda do problema ANTES da solução

---

## Mapa dos Documentos

### 📌 Verdades de Campo (fonte primária)

1. **[FIELD_NOTES_CAMILA_ACS.md](FIELD_NOTES_CAMILA_ACS.md)** ⭐
   - Entrevista direta com Camila (ACS Rocinha)
   - Pain points reais, validações de hipótese, citações
   - **Sobrepõe** hipóteses anteriores quando conflita

2. **[OFFICIAL_SMS_RIO_FRAMEWORK.md](OFFICIAL_SMS_RIO_FRAMEWORK.md)** ⭐⭐
   - Framework oficial entregue pela Secretaria Municipal de Saúde
   - Escala de Risco Familiar (Ficha A SIAB/SISAB)
   - Cadências oficiais por linha de cuidado
   - Schema oficial de registro de visita
   - **É a fonte de verdade ao desenhar a solução**

### 🌐 Pesquisa de Referência (benchmarks externos)

3. **[PROBLEM_ANALYSIS.md](PROBLEM_ANALYSIS.md)**
   - Análise consolidada do problema + 3 frentes de pesquisa
   - NHS, CHW internacional, frameworks clínicos
   - Score PRIO-ACS proposto (precisa atualização para alinhar com Escala de Risco Familiar oficial)
   - ICSAP, Previne Brasil 15 indicadores, ACSC

### 💰 Análise de Impacto Econômico e Saúde Pública

4. **[ROI.md](../ROI.md)** ⭐
   - Análise completa de retorno sobre investimento (Rio + upside Brasil)
   - Custos detalhados (CAPEX + OPEX), benefícios em ICSAP + Previne Brasil
   - Sensibilidade (pessimista 17× / base 47× / otimista 98× / stress 1×)
   - Benefícios em saúde pública (15-30 mortes infantis evitadas/ano em Rio)
   - **Extrato pronto para o pitch (3 frases + parágrafo de 6 min)**

---

## Hierarquia de Autoridade

Quando houver conflito entre fontes:

```
1. DOCX oficial SMS-Rio (Hackaton SMS RIO_ACS.docx)     ← Mais alto
2. Transcrição da Camila (ACS em campo)
3. Transcrição da Lorena (médica supervisora)
4. Reunião SMS Monitor da Gestante
5. Briefing GitHub (apresentação)
6. Pesquisa externa (NHS, CHW, frameworks clínicos)      ← Mais baixo
```

---

## O Que Sabemos Agora — Resumo Executivo

### O Problema
- 6.200 ACS / 1.240 equipes / 4.5M residentes
- Cada ACS: 750 pessoas em 250-300 domicílios em uma microárea
- Decisão de "quem visitar" hoje = memória + intuição + planilhas Excel
- Registro duplo (papel em campo → digitação no VitaCare ao voltar) consome ~1h/dia

### O Que o SMS-Rio Pediu (oficial)
- App que mostra **quem visitar, em qual ordem, por qual motivo**
- Baseado em risco real + lacunas de cuidado
- Critério #1 do júri: **impacto real** (40%) — "a Prefeitura usa amanhã?"
- Métrica explícita: redução de **mortalidade materno-infantil** (prioridade zero declarada)

### O Que Já Existe
- **VitaCare** (prontuário eletrônico) — todas as clínicas, tem API
- **Monitor da Gestante** — painel novo em rollout, complementa
- **Planilhas Excel** por equipe (gestantes, idosos acamados, vigilância)
- **WhatsApp do grupo** da equipe + WhatsApp pessoal do ACS
- **Tablet compartilhado** por equipe
- **Fichas de papel** em campo (OCR foi abandonado)

### O Que NÃO Existe (gaps)
- Lista priorizada do dia para o ACS
- Alerta automático de cadência vencida
- Notificação quando paciente vai à UPA/hospital
- Formulário móvel em campo (toda anotação é em papel/WhatsApp)
- Integração entre prontuário APS e prontuário hospitalar
- Mapeamento digital das favelas (Google Maps incompleto)

---

## Datasets Disponíveis (validação pendente)

Versão consolidada das duas fontes (GitHub README + DOCX SMS-Rio):

| Dataset | Campos confirmados | Campos a validar |
|---------|-------------------|------------------|
| **pacientes** | UUID, equipe_id, unidade_id, faixa_etaria, sexo, raca_cor, situacao_vulnerabilidade, lat/lon, hipertenso, diabetico, gestacao | — |
| **eventos_clinicos** | UUID, tipo (agendamento/...), data_referencia | **Tipo inclui: Vacinação, Emergência, Consulta?** |
| **visitas** | profissional_id, registrados_em, ordem_visita_dia, UUID paciente | — |
| **agendamentos** (DOCX) | UUID, data, data_agendamento, **comparecimento S/N** | **Existe como dataset separado?** |
| **equipes** | equipe_id, endereco_latitude, endereco_longitude | — |

**Pendência:** baixar os Parquets do Google Drive e validar schema real.

---

## Personas Identificadas

| Persona | Quem | Característica | Relevância |
|---------|------|---------------|-----------|
| **Camila** | ACS Rocinha (validada em entrevista) | Tech-savvy, usa WhatsApp+Notes | Persona principal — UX deve servir ela |
| **Odete** | ACS idosa (mencionada por Camila e Lorena) | Esquece campos, deixa cadastro pra depois | **Persona limite** — UX baixíssimo atrito |
| **Lorena** | Médica de família | Supervisora, gera demandas em reunião | Persona secundária — dashboard supervisor |
| **Gestor de Área (AP)** | Coordenador AP (mencionado, não entrevistado) | Quer ver indicadores Previne | Persona terciária — dashboard gestão |

---

## Frameworks Oficiais Aplicáveis

| Framework | Origem | Status no MVP |
|-----------|--------|---------------|
| **Escala de Risco Familiar** (Ficha A SIAB/SISAB) | Ministério da Saúde | ✅ Base do score |
| **8 linhas de cuidado** com cadências | DOCX SMS-Rio | ✅ Base do bundle de ação |
| **15 indicadores Previne Brasil** (Portaria 3.493/2024) | MS | ✅ Mapeamento para dashboard |
| **ICSAP** (Portaria SAS/MS 221/2008) | MS | ✅ Métrica de impacto |
| **Carteira de Serviços APS** | MS | ✅ Catálogo de prioridade |

---

## Frameworks Externos Aplicáveis

| Framework | Origem | Como usar |
|-----------|--------|-----------|
| **Bridges to Health (B2H)** | NHS England | Mental model de 8 segmentos populacionais |
| **Electronic Frailty Index (eFI)** | NHS UK | Pattern de "contar deficits", math transparente |
| **PRAPARE** | EUA | Estrutura de captura SDOH (gap não preenchido pelo ACS) |
| **Family Folder model** | Etiópia | Cap de 8-12 famílias/dia |
| **RapidSMS push pattern** | Ruanda | Notificação 7am com lista |
| **PRISMATIC trial** | Wales | **CONTRA-EXEMPLO** — score sem bundle de ação aumentou internações |

---

## Próximas Captações de Contexto (pendente)

### Técnicas (Leo está pesquisando)
- [ ] VitaCare API — auth, endpoints, schema, rate limits
- [ ] Parquets reais — schema, distribuição, qualidade
- [ ] Infra de deployment — onde a Prefeitura roda os apps?
- [ ] LGPD — exigências para dados de saúde
- [ ] e-SUS-AP / PEC compatibilidade
- [ ] Monitor da Gestante — API ou ponto de integração

### De campo
- [ ] Demo com Camila gravada (citações em vídeo)
- [ ] Gestor de Área entrevistado (perspectiva da gestão)
- [ ] Equipe de asfalto (para validar diferenças)

---

## Status da Engenharia de Contexto

| Pergunta original | Status |
|-------------------|--------|
| Tipos de pacientes prioritários | ✅ Confirmado (3 categorias + 8 linhas) |
| Rotina real do ACS | ✅ Confirmado (Camila + DOCX) |
| Pior parte do trabalho | ✅ Identificado (registro duplo) |
| Como avalia o ACS | ✅ Confirmado (registro + problemas resolvidos) |
| Asfalto vs Favela | ✅ Confirmado (diferenças sistêmicas) |
| Conectividade | ✅ Confirmado (offline-first mandatório) |
| Demandas da reunião de equipe | ✅ Confirmado |
| Schema do dataset | ⚠️ Parcial (precisa validar Parquets) |
| VitaCare API | ❌ Pendente |
| Monitor da Gestante integração | ⚠️ Parcial |

---

*Atualizado em 2026-05-24 — fase de engenharia de contexto continua*

# Motor de Priorização PRIO-ACS

**Como o app decide quem a Claudia deve visitar primeiro.**

---

## O problema que o motor resolve

A Claudia tem ~2.000 pacientes na sua área de cobertura. Ela não consegue visitar todos na mesma semana. A pergunta é simples: **quem visitar primeiro?**

O motor responde isso com um score de 0 a 100 por paciente, calculado automaticamente toda vez que ela abre o app.

---

## Princípio fundamental

**Heurística determinística — sem LLM.**

Os manuais do SUS (Ministério da Saúde + SMS-Rio) já codificam quem deve ser priorizado e com qual frequência. O motor é SQL puro: qualquer pessoa pode inspecionar, auditar e questionar a regra. Decisão clínica exige rastreabilidade — não pode ser uma caixa preta.

Fontes oficiais consultadas:
- Portaria SAS/MS 221/2008 (ICSAP — Internações por Condições Sensíveis à Atenção Primária)
- Manual do ACS — Ministério da Saúde
- Fichas A, B-Crônico, B-Gestante, C-Primeira Infância — SMS-Rio
- Carteira de Serviços APS 2021 / PNAB

---

## Arquitetura do score

O score é composto de **4 parcelas aditivas**, cada uma com um teto:

```
Score final = S_ICSAP + S_LIFE_STAGE + S_CARE_GAP + S_SOCIAL
```

| Parcela | Teto | O que mede |
|---|---|---|
| ICSAP proxy | 35 | Carga de doença crônica |
| Life-stage | 25 | Fase de vida vulnerável |
| Care gap | 25 | Atraso na visita + urgência recente |
| Social | 15 | Vulnerabilidade socioeconômica |
| **Total** | **100** | |

---

## Parcela 1 — ICSAP proxy (teto 35)

**Base:** Portaria SAS/MS 221/2008 — lista de condições sensíveis à atenção primária, ou seja, situações em que a APS bem feita evita internação.

```
+15  se é hipertenso
+15  se é diabético
+15  se está em gestação
─────────────────────
máx 35 (teto aplicado com LEAST)
```

Quem tem HAS + DM + gestação ao mesmo tempo chega no teto 35 nessa parcela.

---

## Parcela 2 — Fase de vida vulnerável (teto 25)

**Regra:** pega o **maior** entre os casos — não soma.

```
25  gestante
20  criança 0-6 anos
15  idoso 66+ com HAS ou DM
 0  demais
```

Gestante sempre bate idoso crônico. Criança pequena bate idoso. Lógica: risco de desfecho grave é maior nessas fases.

---

## Parcela 3 — Gap de cuidado / urgência (teto 25)

**O que é gap:** dias desde a última visita vs. cadência esperada para aquele perfil.

**Cadência esperada (gap_limite):**

| Perfil | Limite de dias |
|---|---|
| Gestante | 30 dias |
| Criança 0–6 | 45 dias |
| Hipertenso ou Diabético | 90 dias |
| Demais | 180 dias |

**Pontuação:**

```
+15  evento não-eletivo nos últimos 60 dias
     (urgência/internação no Vitacare OU sinal agudo no form do ACS:
      foi à UPA, sangramento gestante, bebê não mexeu)
+10  gap > limite — visita atrasada para aquele perfil
─────────────────────────────────────────────────────
máx 25
```

**Detalhe importante:** o "última visita" considera tanto as visitas registradas no Vitacare quanto as capturas do próprio app. Então se a Claudia visitou hoje, o gap zera imediatamente — sem esperar o Vitacare sincronizar.

---

## Parcela 4 — Vulnerabilidade social (teto 15)

```
+15  se situação de vulnerabilidade social = sim
  0  caso contrário
```

Flag vinda do cadastro Vitacare, sobreescrevível pelo ACS no form se ela identificar vulnerabilidade não cadastrada.

---

## Resultado: tier + cadência sugerida

| Score | Tier | Cadência sugerida |
|---|---|---|
| ≥ 61 | 🔴 Alto | Semanal |
| 31–60 | 🟡 Médio | Quinzenal a mensal |
| ≤ 30 | 🟢 Habitual | Mensal |

---

## Linha de cuidado → qual ficha preencher

O motor também decide automaticamente qual ficha abrir na visita:

| Condição | Ficha |
|---|---|
| Gestação | Ficha B-Gestante |
| Criança 0–6 | Ficha C-Primeira Infância |
| HAS ou DM | Ficha B-Crônico |
| Demais | Ficha A-Cadastro Família |

---

## Loop fechado: captura → score → lista reordena

```
Claudia termina visita no app
   ↓
INSERT em visitas_capturadas (form com 60+ campos)
   ↓
Supabase Realtime emite evento WebSocket
   ↓
Todos os clients refazem priorizacao_pacientes()
   ↓
Motor recalcula:
   - ultima_visita = MAX(visitas_vitacare, capturado_em) → gap zera
   - se form reportou UPA → evento_recente_60d = TRUE
   - motivo_curto atualiza: "Visitada hoje pelo ACS."
   ↓
Lista se reordena sozinha, em tempo real
```

Isso resolve o problema clássico: "visitei a paciente mas ela continua vermelha no sistema porque o Vitacare ainda não sincronizou."

---

## Exemplo concreto

**Dona Maria, 68 anos, diabética e hipertensa, última visita há 110 dias.**

```
ICSAP:      15 (HAS) + 15 (DM) = 30  (teto 35 → 30)
Life-stage: 15  (idosa 66+ com crônico)
Care gap:   10  (110 dias > 90 dias = gap vencido)
Social:      0
────────────────
Score: 55  → Tier MÉDIO, cadência quinzenal a mensal
```

**Motivo curto gerado:** "Diabetico e hipertenso, sem visita ha 110 dias."

Se no dia seguinte chega evento de urgência dela no Vitacare:
```
Care gap:   15 (urgência) + 10 (gap) = 25
Score: 70  → Tier ALTO, semanal
```

---

## O que o motor NÃO faz

- **Não decide sozinho** — a Claudia sempre decide a ordem final. O motor é insumo, não comando.
- **Não usa IA generativa em produção** — zero LLM em runtime. Auditável, determinístico, sem alucinação.
- **Não acessa dados fora da equipe** — queries são bound por equipe_id. Multi-tenant nativo.

---

## Implementação técnica

```
Função SQL:  priorizacao_pacientes(equipe_id, ref_date)
Linguagem:   SQL puro, STABLE (sem side-effects)
Banco:       Supabase Postgres 17 (sa-east-1)
Exposta via: supabase.rpc() — PostgREST auto-gerado
Realtime:    visitas_capturadas + eventos → trigger reconvoca a função
```

O código completo está em `db/migrations/001_priorization.sql` + `003_ficha_extendida.sql`.

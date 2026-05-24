# Field Notes — Entrevista com Camila (ACS em campo)

> **Fonte:** Transcrição da consulta ao vivo em 2026-05-24 durante o hackathon
> **Quem:** Camila, ACS na Rocinha (equipe da Lorena, médica de família)
> **Status:** Verdade de campo — sobreescreve hipóteses anteriores quando conflita

---

## 1. Rotina Real (não a do manual)

### Início do dia
1. Vai na clínica → bate ponto
2. Relembra o que precisa fazer
3. Verifica encaminhamentos do dia
4. Confere se tem **busca ativa** específica
5. Se não tem demanda → vai "aleatório" em pacientes já conhecidos (preferência: diabético, hipertenso, casos crônicos)

### Visita
- Entre **1-2 horas em campo por dia**
- **Mais de 5 visitas/dia** quando não tem cadastro (cadastro novo de família demora ~1h)
- Volta às **15:30** para bater ponto e digitar tudo
- Rota geográfica: "vou por baixo" ou "vou por cima" — desce a área, **nunca sobe-desce-sobe**

### Caseload
- **40-70 pacientes** sob responsabilidade dela
- Famílias variam de 1 a 7 pessoas
- Conhece de cabeça onde cada um mora

---

## 2. Como Decide HOJE Quem Visitar

| Sinal | Como ela usa |
|-------|--------------|
| Encaminhamento da equipe | Reunião de equipe gera demanda específica |
| Busca ativa | Médico/enfermeiro pede para verificar paciente X |
| Memória / familiaridade | "Aleatório em paciente que já esteve no cuidado" |
| Frequência de gestante | Planilha de gestantes (Excel) — abre todo mês |
| Crônicos (diabético, hipertenso) | "De cabeça" sabe quem precisa |
| Ficha do paciente | Abre no Vita pra ver dieta, insulina, ferida no pé |

**Não usa:** lista priorizada por sistema. Não existe.

### Regras de cadência que ela citou de memória
- **Gestante:**
  - 1º trimestre: mensal
  - 2º trimestre: mensal até 28 semanas
  - 3º trimestre: quinzenal
  - **Gestante de risco: semanal**
- **Criança até 1 ano:** 6 consultas/ano (1º, 2º, 4º, 6º, 9º, 12º mês — Rio pede mais que isso, mas Camila citou esse padrão)
- **Tuberculose:** diário (DOTs supervisionados)
- **Crônicos:** "aleatório" — sem regra fixa de frequência

---

## 3. Pior Parte do Trabalho — RANKED

### #1 — Registro Duplo
> "Eu prefiro lançar no dia, tudo... uma hora só pra digitar antes."

- Em campo: anota no caderno + manda áudio pra si mesma no WhatsApp ("igual a Odete")
- Na clínica no final do dia: **digita tudo de novo** no VitaCare
- **~1h+ por dia gasta nesse re-trabalho**
- Cadastro novo de família = 1 hora só de digitação

**Quote da Camila (validação direta):**
> "Se desse para fazer isso na hora que você está visitando e exportar depois, seria muito mais rápido, né?"

### #2 — Não Sabe Quando Paciente Foi à Emergência
> "Não existe muito bem essa comunicação entre os sistemas. Nosso prontuário não se comunica com o prontuário dos hospitais."

- Quando paciente vai à UPA/hospital, ACS só sabe se família avisar (geralmente via WhatsApp)
- "Muitas vezes a gente não sabe o que aconteceu, se ele não souber explicar"
- **Esta É a dor da "evento prevenível":** se Camila soubesse no dia seguinte que fulano internou, conseguiria reagir

### #3 — WhatsApp Como Canal Pessoal
> "Eles trabalham o dia inteiro no WhatsApp. Pô, imagina você trabalhar e dar o seu número pras pessoas, aí fica o fim de semana e eles tendo que responder mensagem."

- ACS dá número PESSOAL para pacientes
- Fim de semana = continua trabalhando informalmente
- Chip não é separado (custo proibitivo)
- Equipe tem WhatsApp do grupo

### #4 — Pacientes Que Nunca Alcança
- Quem trabalha em horário comercial (saem antes da ACS chegar)
- Idosos cuja família trabalha (cuidador ausente durante o dia)
- **Padrão:** essas pessoas precisariam de visita em outro horário ou noturno — fora do escopo atual

### #5 — Esquece Perguntas
> "Eu já tenho [as perguntas] na minha cabeça... Esqueço... Aí eu faço a próxima visita pra perguntar."

- Para diabético: tem que verificar dieta prescrita, insulina, ferida no pé
- Mas às vezes esquece um item → próxima visita

---

## 4. O Que Ela Validou Sobre Nossa Hipótese

Apresentamos o conceito: "app mostra de manhã quem visitar, em qual ordem, por qual motivo, com base em risco."

### Resposta da Camila — destrinchada

| Hipótese nossa | Reação dela | Decisão |
|---------------|-------------|---------|
| **Lista do dia** | ✅ "É bom, é útil. Eu lembro. E tem pacientes também que eu não lembro" | **MANTER** |
| **Ordem de visitas (roteirização)** | ⚠️ "Eu passo na ordem que eu falei. Eu sei onde moram." | **MUDAR:** não dite ordem. Mostre a lista + ela define rota |
| **Por qual motivo** | ✅ Validou implicitamente | **MANTER** com motivo + ação esperada |
| **Ficha sim/não no celular** | ✅✅ "Claro que sim. Você tira a ficha de lá." | **PRIORIDADE ALTA** — formulário móvel resolve dor #1 |
| **Lembrete de gestante atrasada** | ✅ "Eu lembro. E tem pacientes também que eu não lembro" | **MANTER** — alerta de cadência |
| **Aplicativo no celular** | ✅ Equipe tem tablet compartilhado | **MULTIPLATAFORMA** — tablet equipe + celular pessoal |
| **Offline** | ✅ Camila não tem internet própria, só wifi | **OFFLINE-FIRST mandatório** |

---

## 5. Implicações Que Mudam o MVP

### 5.1 Reordenar prioridades do produto

**Antes** (nossa hipótese pré-Camila): lista priorizada + ordem otimizada + dashboard supervisor

**Depois da Camila:**

| # | Feature | Justificativa do campo |
|---|---------|------------------------|
| **1** | **Formulário móvel sim/não em campo** | Resolve dor #1 (~1h/dia economizada) |
| **2** | **Lista priorizada do dia** + lembretes de cadência | "eu lembro. E tem pacientes que não lembro" |
| **3** | **Alerta de evento clínico** (UPA/hospital nos últimos 7d) | Resolve dor #2 (gap de comunicação entre sistemas) |
| **4** | **Sync offline → online no final do dia** | Camila bate ponto sempre na clínica = janela de sync |
| **5** | Otimização de rota | ❌ **DESPRIORIZAR** — Camila não usa, tem rota mental fixa |

### 5.2 Padrão de UX validado

- **Sim/Não checkbox** — Camila explicitamente pediu
- **Ficha por condição** — diabético tem 4 perguntas (dieta, insulina, ferida no pé, +outras)
- **"Tira a ficha de lá"** — ela quer abrir o paciente e ver os campos auto-preenchidos da última visita

### 5.3 Padrão de campo validado

- **Áudio para texto** (gravar voz, transcrever) — ela já faz isso informalmente via WhatsApp
- **Hardware:** tablet compartilhado da equipe + celular pessoal
- **Conectividade:** wifi inconfiável + 4G às vezes pega
- **Janela de sync:** 15:30 (volta pra bater ponto) — não precisa real-time

### 5.4 Métricas de impacto que SOAM no campo

Para o pitch, usar números da Camila:

- **1h/dia economizada em digitação** × 6.200 ACS × 22 dias úteis = **1.364.000 horas/ano** liberadas para visitas
- A 5-10 visitas/h, isso é **6.8M–13.6M visitas adicionais/ano**
- Convertendo via ICSAP: cada visita extra reduz X% de internação prevenível

---

## 6. Personagens Identificados

| Nome | Função | Relevância |
|------|--------|-----------|
| **Camila** | ACS, equipe da Rocinha | Fonte primária. Validou conceito + apareceu na demo |
| **Lorena** | Médica de família, supervisora da Camila | Tem visão de conjunto, foi a entrevistadora |
| **Odete** | ACS idosa da equipe | Persona "low-tech" — não usa Vita direito, faz cadastro em farmácia, esquece. Sistema PRECISA funcionar pra ela |

---

## 7. Anti-Padrões Que a Camila Confirmou

1. **NÃO** mandar ela seguir uma ordem fixa de visitas — ela sabe a geografia
2. **NÃO** substituir o WhatsApp da equipe — usar como canal complementar
3. **NÃO** exigir conectividade real-time — sync no final do dia funciona
4. **NÃO** criar app paralelo ao VitaCare — exporta para o Vita
5. **NÃO** burocratizar registro — checkbox sim/não, ficha mínima
6. **NÃO** tirar a autonomia da ACS — ela conhece o território melhor que qualquer algoritmo

---

## 8. Citações Para o Pitch

> "É bom, é útil. Porque, tipo assim, eu lembro. E tem pacientes também que eu não lembro."
> — Camila, sobre a lista priorizada

> "Se desse para fazer isso na hora que você está visitando e exportar depois, seria muito mais rápido, né?"
> — Camila, sobre registro em campo

> "Claro que sim. Você tira a ficha de lá, né?"
> — Camila, sobre formulário sim/não no celular

> "Não existe muito bem essa comunicação entre os sistemas. Nosso prontuário não se comunica com o prontuário dos hospitais."
> — Camila, sobre o gap de informação de internações

---

*Arquivo gerado em 2026-05-24 com base em transcrição direta. Subordina hipóteses anteriores quando há conflito.*

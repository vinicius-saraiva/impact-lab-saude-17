# Framework Oficial SMS-Rio para o Hackathon ACS

> **Fonte:** Documento oficial `Hackaton SMS RIO_ACS.docx` entregue pela Secretaria Municipal de Saúde do Rio
> **Status:** Verdade ofical — sobrepõe inferências de qualquer outra fonte
> **Última atualização:** 2026-05-24

---

## 1. Quem é o ACS — Definição Oficial

> "O ACS é o principal elo entre as unidades de Atenção Primária à Saúde (APS) e a população. O trabalho do ACS caracteriza-se pelo exercício de atividades de prevenção de doenças e promoção da saúde, mediante ações domiciliares ou comunitárias, desenvolvidas em conformidade com as diretrizes do SUS."

### Escala oficial

- **6.200 ACS** distribuídos em **1.240 equipes de Saúde da Família (eSF)**
- Cobertura: **4.5M pessoas** em todas as áreas programáticas
- Cada ACS responsável por **até 750 pessoas / 250-300 domicílios** em sua **microárea**
- Atendimento: **100% da população cadastrada** em sua microárea

> **Nota de reconciliação:** Camila citou 40-70 "pacientes" — isso é o subgrupo ATIVO/CRÔNICO que ela monitora de perto. 750 = total cadastrado. Ambas as métricas existem.

### Atribuições oficiais (8)

1. Trabalhar com adscrição de famílias em base geográfica definida (microárea)
2. Cadastrar todas as pessoas e manter cadastros atualizados
3. Realizar visitas domiciliares regulares e periódicas
4. Participar do processo de territorialização e mapeamento
5. Identificar grupos, famílias e indivíduos expostos a riscos epidemiológicos ou sociais
6. **Realizar busca ativa de pacientes faltosos em consultas, exames e vacinações**
7. Orientar famílias quanto à utilização dos serviços de saúde
8. Registrar dados das visitas para controle e planejamento

---

## 2. Fluxo Diário Oficial (Tabela SMS-Rio)

| Momento | O que acontece | Ferramenta usada |
|---------|----------------|------------------|
| Início turno (clínica) | Reunião breve, consulta pendências, organização mental do roteiro | Fichas físicas, caderno, memória |
| Saída para território | Percurso a pé/transporte, priorizando quem visitar primeiro | **Sem suporte tecnológico de rotas** |
| Visita domiciliar | Abordagem família, verificação saúde, coleta dados, orientações | Fichas de acompanhamento em papel |
| Registro da visita | Preenchimento: motivo, busca ativa, acompanhamento, desfecho | Fichas de acompanhamento em papel |
| Retorno à UBS | Registro das visitas no prontuário, comunicação de urgências | Prontuário eletrônico (VitaCare) |
| Planejamento próximo dia | Revisão de quem ficou sem visita, prioridades de amanhã | Memória, caderno, lista manual |

### Problema central — palavras oficiais

> **"O ACS decide o roteiro do dia com base em memória e intuição, sem acesso a dados consolidados sobre risco, lacunas de visitação ou eventos recentes dos pacientes."**

---

## 3. Escala de Risco Familiar (Ficha A SIAB/SISAB) — Framework Oficial

**Esta é a tabela de priorização oficial brasileira. Não precisa inventar.**

| Categoria | Exemplos de marcadores | Frequência |
|-----------|------------------------|------------|
| **Alto risco** | Acamado, deficiente, gestante alto risco, criança desnutrida, usuário de droga, família sem renda | **Semanal ou quinzenal** |
| **Médio risco** | Idoso frágil, doença crônica descompensada, família monoparental vulnerável | **Quinzenal a mensal** |
| **Risco habitual** | Família sem condições especiais de vulnerabilidade | **Mensal** |

**Implicação para o MVP:** o PRIO-ACS score que projetei deve **mapear para essas 3 categorias** (não inventar tiers próprios). Output do score = "Alto / Médio / Habitual" + frequência recomendada.

---

## 4. Cadências por Linha de Cuidado (Tabela Oficial)

| Linha de cuidado | Frequência mínima | Situações de alerta |
|------------------|-------------------|---------------------|
| **Gestante – risco habitual** | Mensal | Falta em consulta pré-natal |
| **Gestante – alto risco** | **Semanal** | Sinal clínico, falta consulta |
| **Puerpério (pós-parto)** | 1 visita na 1ª semana pós-alta | RN sem teste pezinho, internação prolongada |
| **Tuberculose em tratamento** | **Diário (TDO)** | Falta à dose, efeitos adversos |
| **Criança 0-2 anos** | Mensal | Atraso vacinal, curva de peso descendente |
| **Hipertensão / Diabetes** | Mensal (descompensado: quinzenal) | Falta consulta, internação recente |
| **Idoso frágil / acamado** | Quinzenal | Quedas, isolamento, internação hospitalar |
| **Saúde mental** | Conforme plano terapêutico | Crise, abandono de medicação |

**Implicação para o MVP:** essas cadências viram o **bundle de ação** que Claude gera por paciente. Cada visita tem "motivo" alinhado à linha de cuidado oficial.

---

## 5. O Que ACS Registra Por Visita (Schema Oficial)

| Campo | Valores |
|-------|---------|
| **Visita realizada** | Sim / Não (recusada / ausente) |
| **Motivo da visita** | Cadastramento / Atualização / Busca ativa / Acompanhamento / Egresso de internação / Convite campanha / Orientação-prevenção |
| **Busca ativa** | Consultas / Exames / Vacinas / Gestante / RN / Puericultura / DM/HAS / TB / Hanseníase |
| **Acompanhamento** | Qual condição de saúde |
| **Desfecho** | Realizada / Ausente / Recusada |

**Implicação para o MVP:** essa é a estrutura **exata** do formulário móvel da Camila. Não precisa desenhar — só replicar. ~6 campos com dropdowns/checkboxes.

---

## 6. Gaps Oficiais Identificados pela SMS-Rio

| Gap | Impacto prático |
|-----|-----------------|
| Planejamento por memória | ACS visita quem lembra, não quem mais precisa |
| Sem alerta de lacunas | Pacientes ficam sem visita por semanas sem que ninguém perceba |
| Rota ineficiente | Distâncias desnecessárias reduzem o número de visitas/dia |
| Priorização não sistematizada | Gestante de alto risco pode ser visitada com mesma frequência que família saudável |
| Busca ativa sem dados | ACS não sabe quem faltou à consulta ou exame |
| **Comunicação fragmentada** | **Informações de internação, alta, emergência chegam sem registro sistemático** |

**Confirmação cruzada:** o último gap (comunicação fragmentada) é exatamente o que a Camila reclamou — "nosso prontuário não se comunica com o prontuário dos hospitais."

---

## 7. Datasets Oficiais — Descrição da SMS-Rio (DOCX)

| Dataset | Campos disponíveis | Utilidade |
|---------|---------------------|-----------|
| **Cadastros de Pacientes** | UUID do paciente, Endereço | Base de quem deve ser visitado; geocodificação para rotas |
| **Histórico de Visitas** | Data, Hora, UUID do Paciente | Identificar lacunas: tempo desde última visita |
| **Eventos de Saúde** | Data, Hora, UUID, **Tipo: Vacinação / Emergência / Consulta** | Identificar alertas: internação recente, consulta perdida, vacina em atraso |
| **Agendamentos** | Data, Hora, UUID, Data Agendamento, **Comparecimento (S/N)** | Busca ativa: identificar faltosos |

### Reconciliação com o GitHub README

O DOCX descreve campos que NÃO apareceram explicitamente no README do GitHub:

| Campo do DOCX | Status no GitHub |
|---------------|------------------|
| `Eventos de Saúde.Tipo` = Vacinação/Emergência/Consulta | Confirmado parcialmente — README diz `tipo` (ex: agendamento) |
| `Agendamentos.Comparecimento` (S/N) | **NÃO listado no README** — preciso verificar nos Parquets reais |
| `Cadastros.faixa_etaria`, `sexo`, `raca_cor`, flags clínicos | Tem no GitHub, **NÃO no DOCX** |
| `Equipes` (latitude/longitude da unidade) | Tem no GitHub, **NÃO no DOCX** |

**Ação:** baixar os Parquets e validar o schema real antes de codificar. Provavelmente o dataset é a UNIÃO do GitHub README + DOCX, mas só `head()` confirma.

---

## 8. Insights Cruzados (DOCX + Camila + Reunião Equipe + Reunião Gestante)

### 8.1 Como a equipe gera demanda pra ACS

Da Reunião com Lorena (médica):

> "Demandas levadas para o ACS na reunião de equipe são a partir do que a gente identifica em consulta, pacientes que vão lá com algum problema, ou consulta de pré-natal, ou puericultura que a gente fez, que a gente identificou alguma coisa de risco maior."

**Fluxo:** consulta clínica → médico identifica risco → reunião de equipe → ACS recebe tarefa de "vai lá ver fulano"

**Implicação:** o app precisa de um **botão "demanda da equipe"** para inputar essas tarefas geradas em reunião.

### 8.2 Como a equipe avalia o ACS

> "O ACS é avaliado em relação ao registro, em relação a problemas levados para a equipe que conseguem ser resolvidos."

E:
> "A meta é pelas nossas planilhas de vigilância — a gente sabe quem é de cada linha de cuidado e se essa pessoa está bem acompanhada."

**Implicação:** dashboard do supervisor mostra:
- Cobertura por linha de cuidado (gestante, HAS, DM, TB, criança, idoso)
- Visitas registradas vs cadência mínima
- Problemas escalados que resultaram em resolução

### 8.3 Asfalto vs Favela — diferença sistêmica

Da Reunião com Lorena:

| Aspecto | Asfalto | Favela |
|---------|---------|--------|
| Mapeamento digital | Google Maps + satélite completos | Não mapeada (becos, vielas) |
| SUS usa geolocation | Sim | Limitado |
| Índice de vulnerabilidade | Menor | Maior |
| **Concentração de TB** | Distribuída | **Becos sem sol = focos de TB** |
| Dinâmica de visita | Casa em casa, rua linear | Subida/descida da área, beco a beco |

**Implicação para o MVP:**
- Rota algorítmica NÃO funciona em favela (Google Maps incompleto)
- Score deve considerar **risco territorial** (Rocinha, Maré, Complexo do Alemão = boost de TB/respiratórias)
- IDS-Rio (Índice Desenvolvimento Social) por setor censitário é o proxy

### 8.4 Prioridade Zero do Município (Reunião Gestante)

> "Uma mulher morrer é sempre ruim, uma mulher em idade fértil morrer é muito ruim, uma mulher grávida morrer é pior ainda — a pior catástrofe que a gente pode ter pensando em população. Prioridade zero do município: reduzir mortalidade materna e infantil."

**É META OFICIAL EM DOCUMENTOS PÚBLICOS.**

**Combo crítico identificado pela própria equipe SMS:**
> "Mulher grávida + sem benefício social + diabética = vai subindo o score, prioridade alta, precisa de constante acompanhamento."

**Implicação para o pitch:** abertura emocional + técnica:
> "A prioridade zero da Prefeitura é reduzir mortalidade materno-infantil. Nossa solução identifica em segundos as gestantes em combo de risco — diabéticas, hipertensas, sem benefício social, sem visita há semanas — que hoje só são lembradas se o ACS lembrar. Demo."

### 8.5 Monitor da Gestante (Sistema Novo Sendo Implantado)

> "A gente evoluiu agora para o monitor da gestante, que é um painel onde você consegue acompanhar as gestantes, saber como elas estão. Mas isso tem pouco tempo, ainda está sendo disseminado nas equipes."

**Implicação estratégica:**
- **Não substitua** o Monitor da Gestante
- **Complemente:** o Monitor olha o universo gestante; sua solução olha TUDO, integrando dados do Monitor quando relevante
- No pitch: "complementa o Monitor da Gestante já em rollout"

### 8.6 Persona Odete (confirmada de novo)

Lorena (médica) confirmou:
> "Odete... esquece do que é exigido como coisa obrigatória pra fechar o cadastro, às vezes tem que deixar o cadastro para depois e esquece de fazer, porque o preenchimento precisa ser feito posterior à visita."

**Implicação:** o formulário móvel ELIMINA esse problema — preenchimento em campo, validação em tempo real ("você esqueceu de marcar peso/altura da criança"), zero re-trabalho.

---

## 9. Reconciliação Final do MVP

### Score PRIO-ACS adaptado ao framework oficial

```
Output do score → mapeia para Escala de Risco Familiar oficial:

  Score 0-30    → Risco habitual    → Cadência mensal
  Score 31-60   → Risco médio       → Quinzenal a mensal
  Score 61-100  → Risco alto        → Semanal ou quinzenal

Bundle de ação por paciente = cadência por linha de cuidado:
  Gestante alto risco      → semanal
  TB em tratamento         → diário (TDO)
  Criança 0-2 anos         → mensal
  HAS/DM descompensado     → quinzenal
  Idoso frágil/acamado     → quinzenal
  ... (8 linhas)

Motivo da visita (motivo + busca ativa) = vocabulário oficial:
  Cadastramento / Busca ativa / Acompanhamento / Egresso internação /
  Convite campanha / Orientação-prevenção
```

### Formulário móvel = schema oficial

6 campos do registro de visita (Seção 5 deste documento) viram a tela principal do app.

### Métricas de impacto para o pitch

1. **Mortalidade materno-infantil** (prioridade zero declarada)
2. **ICSAP** (Portaria SAS/MS 221/2008 — 7.2% das internações SUS)
3. **15 indicadores Previne Brasil 2026** (financiamento federal)
4. **Horas/ACS/dia** liberadas (Camila: ~1h economizada × 6.200 ACS × 22 dias)

---

## 10. Citações Para o Pitch (oficiais)

> "O ACS decide o roteiro do dia com base em memória e intuição, sem acesso a dados consolidados sobre risco, lacunas de visitação ou eventos recentes dos pacientes."
> — Documento oficial SMS-Rio, problema central declarado

> "Uma mulher grávida morrer é a pior catástrofe que a gente pode ter pensando em população. Prioridade zero do município: reduzir mortalidade materna e infantil."
> — Reunião SMS-Rio sobre Monitor da Gestante, 2026-05-24

> "Nosso prontuário não se comunica com o prontuário dos hospitais. Muitas vezes a gente não sabe o que aconteceu."
> — Camila, ACS Rocinha (confirma gap oficial #6 do SMS)

---

*Arquivo gerado em 2026-05-24 com base no DOCX oficial SMS-Rio + 4 transcrições + análise cruzada.*

## Apresentação de saúde

Inteligencia no territorio

Apresentadores:

- carol (gerente de dados)
- pedro

A jornada dos ACS

Agente comunitario de saude - fazem visitas domiciliares ativas.

6200 ACS no Rio

Repsonsaveis por 4500000 habitantes

Hoje, planejamento de visitas diarias ainda depende muito de :

- memoria dos agentes
- papel
- conhecimento informal do territorio

[ ver com laura se podemos ligar pra uma ACS, gravar a videochamada, pra usar no video final - pode ser audio do whatsapp também, se preciso ]

Desafio

Transformar os dados em inteligencia para os ACS

- Quem visitar
- Em qual ordem
- Por qual motivo?

Outros stakeholders?

- farmaceutico
- medico
- gerente

O que acontece se resolvermos?

- Presença no territorio mais direcionada
- Cuidado mais preventivo e menos reativo
- Familias de alto risco sao alcançadas mais rapidamente
- Condicoes detectaveis podem ser identificados mais cedo
- Emergencias e hospitalizacoes evitaveis tendem a diminuir na cidade

Rio é divido em 10 territórios: áreas programáticas

Pra cada território, vc tem equipes.

Pra cada equipe vc tem um ACS que cuida de 750 pessoas.

Assumirmos que ACS sai sempre da unidade de saúde, então o trajeto que ele vai fazer é importante ser calculado pra ser o mais eficiente possível.

Vamos ter os dados das visitas do ACS que são imputados em papel e depois passados para o sistema. Teremos uma data la, mas é a data de input no sistema, nao a data que a informação foi escrita no papel.

Temos manuais e guias de regra de visita para o município do Rio. Ex: 7 a 8 visitar por ano para crianças. Ex: paciente de tuberculose revisto diariamente.

Dados disponibilizados:

Cadastros, Consultas agendadas, atendimentos de urgencia, visitas dos ACS, profissionais ACS

Consulta agendada - o ACS precisa comunicar isso para o paciente.

Se um paciente que tem que visitar teve atendimento de urgencia, nao deveria subir a prioridade pra ele visitar?

Histórico de visitas: noção de como é feito, padrões do passado

Profissionais ACS: lista das equipes nos dados

Tecnicas de anonimização

- amostragem cadastral uniforme
- date shifting (a sequencia dos eventos tá mantida, mas o dia tá diferente do verdadeiro)
- anonimizacao geografica
- randomizacao de enderecos (enderecoes fazem sentido no territorio mas tem ruido de 100m)
- generalizacao e agregacao
- supressoes de eventos raros

O que representa a realidade

- sequencia temporal dos eventos
- logica territorial (com ruido)
- dinamica do sistema
- relacoes entre tabelas
- principais padroes de comportamento

Repositorio com dados

[github.com/prefeitura-rio/claude-impact-lab-saude](https://github.com/prefeitura-rio/claude-impact-lab-saude)

## VitaCare API (TI da Prefeitura / SMS)

TI da SMS vai publicar os detalhes técnicos do **VitaCare API** (auth, endpoints, schema) no mesmo README:
https://github.com/prefeitura-rio/claude-impact-lab-saude/blob/master/README.md

Status (2026-05-24): README ainda só tem o dataset — VitaCare API ainda não publicado. Rechecar.

Por que importa: se a API existir e for chamável em produção, dá pra ir além do dataset estático — solução pode ler/escrever no prontuário real (VitaCare é o prontuário eletrônico da APS no Rio), o que sobe muito o eixo "Impacto real - usaria isso hoje?" (40% da nota).
export type Condicao = 'gestante' | 'diabetico' | 'hipertenso' | 'vulneravel' | 'crianca'

export type Prioridade = 'critica' | 'alta' | 'media' | 'baixa'

export type RacaCor = 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena' | 'Outros'
export type FaixaEtaria = '0-6' | '6-18' | '19-45' | '45-65' | '66+'

export interface RegistroHipertensao {
  tomaMedicacao: boolean
  pressao: string
  sintomas: string
  dataRegistro: string
}

export interface Paciente {
  id: string
  nome: string
  // campos do modelo de dados do README
  equipeId: string
  unidadeId: string
  faixaEtaria: FaixaEtaria
  sexo: 'Masculino' | 'Feminino'
  racaCor: RacaCor
  situacaoVulnerabilidade: boolean
  lat: number
  lng: number
  distanciaKm: number
  hipertenso: boolean
  diabetico: boolean
  gestante: boolean
  // campos derivados para UI
  condicoes: Condicao[]
  prioridade: Prioridade
  prioScore: number
  motivoPrioridade: string
  ultimaVisita: string | null
  enderecoDescricao: string
  // dados históricos opcionais
  ultimoRegistroHipertensao?: RegistroHipertensao
}

export interface RegistroVisita {
  id?: number
  pacienteId: string
  profissionalId: string
  dataVisita: string // YYYY-MM-DD
  hora: string // HH:MM
  synced: boolean
  createdAt: number

  // presença
  estavaCasa: boolean
  recusouVisita: boolean

  // dados gerais observados na visita (atualização do cadastro)
  racaCorAtualizada?: RacaCor
  situacaoVulnerabilidadeAtualizada?: boolean
  observacoesGerais: string

  // gestante
  semanaGestacional?: number
  preNatalEmDia?: boolean
  riscoGestacional?: 'baixo' | 'alto'
  edema?: boolean

  // diabético
  tomaMedicacaoDiabetes?: boolean
  tomaInsulina?: boolean
  fazDieta?: boolean
  ultimaGlicemia?: string
  peDiabetico?: boolean

  // hipertenso — sub-form dedicado
  tomaMedicacaoHipertensao?: boolean
  adesaoMedicacaoHipertensao?: 'regular' | 'irregular' | 'nao_toma'
  pressaoAferidaHoje?: boolean
  valorPressao?: string
  sintomas?: string // cefaleia, tontura, etc.

  // criança
  pesoCrianca?: string
  vacinasEmDia?: boolean
  aleitamentoMaterno?: boolean
  desenvolvimentoNormal?: boolean

  // vulnerável
  situacaoRisco?: boolean
  precisaEncaminhamento?: boolean
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error'

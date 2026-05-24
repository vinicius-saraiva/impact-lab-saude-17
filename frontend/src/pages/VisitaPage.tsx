import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CondicaoBadge } from '../components/CondicaoBadge'
import { PrioridadeBadge } from '../components/PrioridadeBadge'
import { salvarVisita } from '../db'
import { MOCK_PACIENTES, googleMapsUrl } from '../mockData'
import type { RegistroVisita, RacaCor } from '../types'

const PROFISSIONAL_ID = 'acs-demo-001'

const RACAS: RacaCor[] = ['Branca', 'Preta', 'Parda', 'Outros']

export function VisitaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const paciente = MOCK_PACIENTES.find((p) => p.id === id)

  const [estavaCasa, setEstavaCasa] = useState<boolean | null>(null)
  const [recusouVisita, setRecusouVisita] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<Partial<RegistroVisita>>({})

  if (!paciente) {
    return (
      <div className="p-8 text-center text-slate-500">
        Paciente não encontrado.
        <button onClick={() => navigate('/')} className="block mx-auto mt-4 text-blue-600 underline">
          Voltar
        </button>
      </div>
    )
  }

  const set = (field: keyof RegistroVisita, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSalvar = async () => {
    if (estavaCasa === null) return
    setSalvando(true)
    const agora = new Date()
    const registro: Omit<RegistroVisita, 'id'> = {
      pacienteId: paciente.id,
      profissionalId: PROFISSIONAL_ID,
      dataVisita: agora.toISOString().split('T')[0],
      hora: agora.toTimeString().slice(0, 5),
      synced: false,
      createdAt: Date.now(),
      estavaCasa,
      recusouVisita,
      observacoesGerais: (form.observacoesGerais as string) || '',
      ...form,
    }
    await salvarVisita(registro)
    setSalvando(false)
    navigate('/', { replace: true })
  }

  const foiAtendido = estavaCasa && !recusouVisita

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header fixo */}
      <div className="bg-white border-b border-slate-200 px-4 pt-10 pb-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-3 flex items-center gap-1">
          ← Voltar
        </button>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{paciente.nome}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {paciente.sexo} · {paciente.faixaEtaria} anos · {paciente.racaCor}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {paciente.condicoes.map((c) => (
                <CondicaoBadge key={c} condicao={c} />
              ))}
              <PrioridadeBadge prioridade={paciente.prioridade} />
            </div>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 leading-snug">
          {paciente.motivoPrioridade}
        </p>
        <a
          href={googleMapsUrl(paciente)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 mt-2"
        >
          📍 {paciente.distanciaKm.toFixed(1).replace('.', ',')} km da unidade — abrir no Maps
        </a>
      </div>

      {/* Formulário */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-36">

        {/* 1. Estava em casa? */}
        <Section titulo="Presença na visita">
          <div className="grid grid-cols-2 gap-3">
            <OpcaoBtn label="✅ Estava em casa" ativo={estavaCasa === true} onClick={() => { setEstavaCasa(true); setRecusouVisita(false) }} />
            <OpcaoBtn label="🚪 Não estava" ativo={estavaCasa === false} onClick={() => setEstavaCasa(false)} />
          </div>
          {estavaCasa === true && (
            <div className="mt-2">
              <OpcaoBtn
                label="🚫 Recusou a visita"
                ativo={recusouVisita}
                onClick={() => setRecusouVisita((v) => !v)}
                fullWidth
              />
            </div>
          )}
        </Section>

        {/* 2. Dados gerais do paciente — atualização de cadastro */}
        {foiAtendido && (
          <Section titulo="Dados gerais do paciente">
            <div className="space-y-3">
              <Campo label="Raça/cor (confirmar ou atualizar)">
                <div className="grid grid-cols-2 gap-2">
                  {RACAS.map((r) => (
                    <OpcaoBtn
                      key={r}
                      label={r}
                      ativo={
                        form.racaCorAtualizada === r ||
                        (form.racaCorAtualizada === undefined && paciente.racaCor === r)
                      }
                      onClick={() => set('racaCorAtualizada', r)}
                    />
                  ))}
                </div>
              </Campo>

              <Campo label="Situação de vulnerabilidade?">
                <div className="grid grid-cols-2 gap-2">
                  <OpcaoBtn
                    label="✅ Sim"
                    ativo={
                      form.situacaoVulnerabilidadeAtualizada === true ||
                      (form.situacaoVulnerabilidadeAtualizada === undefined && paciente.situacaoVulnerabilidade)
                    }
                    onClick={() => set('situacaoVulnerabilidadeAtualizada', true)}
                  />
                  <OpcaoBtn
                    label="❌ Não"
                    ativo={
                      form.situacaoVulnerabilidadeAtualizada === false ||
                      (form.situacaoVulnerabilidadeAtualizada === undefined && !paciente.situacaoVulnerabilidade)
                    }
                    onClick={() => set('situacaoVulnerabilidadeAtualizada', false)}
                  />
                </div>
              </Campo>
            </div>
          </Section>
        )}

        {/* 3. Sub-forms condicionais */}
        {foiAtendido && paciente.hipertenso && (
          <SecaoHipertensao
            form={form}
            set={set}
            historico={paciente.ultimoRegistroHipertensao}
          />
        )}
        {foiAtendido && paciente.gestante && (
          <SecaoGestante form={form} set={set} />
        )}
        {foiAtendido && paciente.diabetico && (
          <SecaoDiabetico form={form} set={set} />
        )}
        {foiAtendido && paciente.faixaEtaria === '0-6' && (
          <SecaoCrianca form={form} set={set} />
        )}
        {foiAtendido && paciente.situacaoVulnerabilidade && (
          <SecaoVulneravel form={form} set={set} />
        )}

        {/* Observações gerais */}
        {estavaCasa !== null && (
          <Section titulo="Observações gerais">
            <textarea
              className={inputCls + ' resize-none'}
              rows={3}
              placeholder="Anotações adicionais sobre a visita..."
              value={(form.observacoesGerais as string) || ''}
              onChange={(e) => set('observacoesGerais', e.target.value)}
            />
          </Section>
        )}
      </div>

      {/* Botão salvar fixo */}
      {estavaCasa !== null && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 max-w-md mx-auto">
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="w-full bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-60 transition-colors"
          >
            {salvando ? 'Salvando...' : foiAtendido ? 'Salvar visita' : 'Registrar ocorrência'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-form Hipertensão (dedicado, separado) ─────────────────────────────

function SecaoHipertensao({
  form,
  set,
  historico,
}: FormSectionProps & { historico?: import('../types').RegistroHipertensao }) {
  return (
    <div className="rounded-2xl shadow-sm border-2 border-blue-300 overflow-hidden">
      {/* Título */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
        <h3 className="font-semibold text-blue-800 flex items-center gap-1.5">
          ❤️ Hipertensão
        </h3>
      </div>

      {/* Ficha histórica — último registro */}
      {historico && (
        <div className="bg-blue-50 px-4 pb-3 border-b border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Último registro · {new Date(historico.dataRegistro + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-xl py-2 px-1 border border-blue-100">
              <div className="text-base font-bold text-slate-800">{historico.pressao}</div>
              <div className="text-xs text-slate-400">mmHg</div>
            </div>
            <div className="bg-white rounded-xl py-2 px-1 border border-blue-100">
              <div className="text-base font-bold text-slate-800">
                {historico.tomaMedicacao ? '✅' : '❌'}
              </div>
              <div className="text-xs text-slate-400">Medicação</div>
            </div>
            <div className="bg-white rounded-xl py-2 px-1 border border-blue-100">
              <div className="text-xs font-semibold text-slate-700 leading-tight mt-1">
                {historico.sintomas || 'Nenhum'}
              </div>
              <div className="text-xs text-slate-400">Sintomas</div>
            </div>
          </div>
        </div>
      )}

      {/* Perguntas da visita atual */}
      {/* TODO: perguntas definitivas a validar com Laura/ACS — estas são simuladas */}
      <div className="bg-white px-4 py-4 space-y-4">
        <Campo label="Está tomando a medicação?">
          <div className="grid grid-cols-3 gap-2">
            {(['regular', 'irregular', 'nao_toma'] as const).map((v) => (
              <OpcaoBtn
                key={v}
                label={v === 'regular' ? '✅ Sim' : v === 'irregular' ? '⚠️ Às vezes' : '❌ Não'}
                ativo={form.adesaoMedicacaoHipertensao === v}
                onClick={() => set('adesaoMedicacaoHipertensao', v)}
              />
            ))}
          </div>
        </Campo>

        <Campo label="Aferiu pressão arterial hoje?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.pressaoAferidaHoje === true} onClick={() => set('pressaoAferidaHoje', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.pressaoAferidaHoje === false} onClick={() => set('pressaoAferidaHoje', false)} />
          </div>
        </Campo>

        {form.pressaoAferidaHoje && (
          <Campo label="Valor aferido (mmHg)">
            <input
              type="text"
              placeholder="Ex: 130/85"
              className={inputCls}
              value={(form.valorPressao as string) || ''}
              onChange={(e) => set('valorPressao', e.target.value)}
            />
          </Campo>
        )}

        <Campo label="Relatou sintomas?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="❌ Nenhum" ativo={form.sintomas === ''} onClick={() => set('sintomas', '')} />
            <OpcaoBtn label="⚠️ Sim" ativo={form.sintomas !== '' && form.sintomas !== undefined} onClick={() => set('sintomas', ' ')} />
          </div>
          {form.sintomas !== '' && form.sintomas !== undefined && (
            <input
              type="text"
              placeholder="Descreva: cefaleia, tontura, visão turva..."
              className={`${inputCls} mt-2`}
              value={(form.sintomas as string).trim()}
              onChange={(e) => set('sintomas', e.target.value)}
            />
          )}
        </Campo>

        <Campo label="Tem receita médica atualizada?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.tomaMedicacaoHipertensao === true} onClick={() => set('tomaMedicacaoHipertensao', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.tomaMedicacaoHipertensao === false} onClick={() => set('tomaMedicacaoHipertensao', false)} />
          </div>
        </Campo>
      </div>
    </div>
  )
}

// ─── Outros sub-forms ──────────────────────────────────────────────────────

function SecaoGestante({ form, set }: FormSectionProps) {
  return (
    <Section titulo="🤰 Gestação">
      <div className="space-y-3">
        <Campo label="Semana gestacional">
          <input type="number" min={1} max={42} placeholder="Ex: 28" className={inputCls}
            value={(form.semanaGestacional as number) || ''}
            onChange={(e) => set('semanaGestacional', Number(e.target.value))} />
        </Campo>
        <Campo label="Pré-natal em dia?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.preNatalEmDia === true} onClick={() => set('preNatalEmDia', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.preNatalEmDia === false} onClick={() => set('preNatalEmDia', false)} />
          </div>
        </Campo>
        <Campo label="Risco gestacional">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="🟢 Baixo" ativo={form.riscoGestacional === 'baixo'} onClick={() => set('riscoGestacional', 'baixo')} />
            <OpcaoBtn label="🔴 Alto" ativo={form.riscoGestacional === 'alto'} onClick={() => set('riscoGestacional', 'alto')} />
          </div>
        </Campo>
        <Campo label="Edema (inchaço)?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.edema === true} onClick={() => set('edema', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.edema === false} onClick={() => set('edema', false)} />
          </div>
        </Campo>
      </div>
    </Section>
  )
}

function SecaoDiabetico({ form, set }: FormSectionProps) {
  return (
    <Section titulo="💉 Diabetes">
      <div className="space-y-3">
        <Campo label="Toma medicação?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.tomaMedicacaoDiabetes === true} onClick={() => set('tomaMedicacaoDiabetes', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.tomaMedicacaoDiabetes === false} onClick={() => set('tomaMedicacaoDiabetes', false)} />
          </div>
        </Campo>
        <Campo label="Usa insulina?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.tomaInsulina === true} onClick={() => set('tomaInsulina', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.tomaInsulina === false} onClick={() => set('tomaInsulina', false)} />
          </div>
        </Campo>
        <Campo label="Faz dieta?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.fazDieta === true} onClick={() => set('fazDieta', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.fazDieta === false} onClick={() => set('fazDieta', false)} />
          </div>
        </Campo>
        <Campo label="Última glicemia">
          <input type="text" placeholder="Ex: 145 mg/dL em 15/05" className={inputCls}
            value={(form.ultimaGlicemia as string) || ''}
            onChange={(e) => set('ultimaGlicemia', e.target.value)} />
        </Campo>
        <Campo label="Sinal de pé diabético?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.peDiabetico === true} onClick={() => set('peDiabetico', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.peDiabetico === false} onClick={() => set('peDiabetico', false)} />
          </div>
        </Campo>
      </div>
    </Section>
  )
}

function SecaoCrianca({ form, set }: FormSectionProps) {
  return (
    <Section titulo="👶 Criança (0–6 anos)">
      <div className="space-y-3">
        <Campo label="Peso (kg)">
          <input type="text" placeholder="Ex: 4.5" className={inputCls}
            value={(form.pesoCrianca as string) || ''}
            onChange={(e) => set('pesoCrianca', e.target.value)} />
        </Campo>
        <Campo label="Vacinas em dia?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.vacinasEmDia === true} onClick={() => set('vacinasEmDia', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.vacinasEmDia === false} onClick={() => set('vacinasEmDia', false)} />
          </div>
        </Campo>
        <Campo label="Aleitamento materno?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.aleitamentoMaterno === true} onClick={() => set('aleitamentoMaterno', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.aleitamentoMaterno === false} onClick={() => set('aleitamentoMaterno', false)} />
          </div>
        </Campo>
        <Campo label="Desenvolvimento normal?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.desenvolvimentoNormal === true} onClick={() => set('desenvolvimentoNormal', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.desenvolvimentoNormal === false} onClick={() => set('desenvolvimentoNormal', false)} />
          </div>
        </Campo>
      </div>
    </Section>
  )
}

function SecaoVulneravel({ form, set }: FormSectionProps) {
  return (
    <Section titulo="🛡️ Vulnerabilidade">
      <div className="space-y-3">
        <Campo label="Situação de risco?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.situacaoRisco === true} onClick={() => set('situacaoRisco', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.situacaoRisco === false} onClick={() => set('situacaoRisco', false)} />
          </div>
        </Campo>
        <Campo label="Precisa encaminhamento?">
          <div className="grid grid-cols-2 gap-2">
            <OpcaoBtn label="✅ Sim" ativo={form.precisaEncaminhamento === true} onClick={() => set('precisaEncaminhamento', true)} />
            <OpcaoBtn label="❌ Não" ativo={form.precisaEncaminhamento === false} onClick={() => set('precisaEncaminhamento', false)} />
          </div>
        </Campo>
      </div>
    </Section>
  )
}

// ─── Primitivos ─────────────────────────────────────────────────────────────

type FormSectionProps = {
  form: Partial<RegistroVisita>
  set: (k: keyof RegistroVisita, v: unknown) => void
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-700 mb-3">{titulo}</h3>
      {children}
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function OpcaoBtn({
  label,
  ativo,
  onClick,
  fullWidth,
}: {
  label: string
  ativo: boolean
  onClick: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-3 rounded-xl text-sm font-medium border transition-colors text-center leading-tight ${fullWidth ? 'w-full' : ''} ${
        ativo
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-slate-200 text-slate-700 active:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

const inputCls =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'

import { useCallback, useEffect, useState } from 'react'
import type { Paciente } from '../types'
import {
  DEMO_EQUIPE_ID,
  REF_DATE,
  supabase,
} from '../lib/supabase'
import {
  distribuirSemana,
  fetchPacientesPriorizados,
} from '../lib/supabaseAdapter'

interface State {
  semana: Map<string, Paciente[]>
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
}

export function usePacientesSemana(equipeId: string = DEMO_EQUIPE_ID) {
  const [state, setState] = useState<State>({
    semana: new Map(),
    pacientes: [],
    loading: true,
    error: null,
  })

  const carregar = useCallback(async () => {
    try {
      const pacientes = await fetchPacientesPriorizados(equipeId, REF_DATE)
      setState({
        semana: distribuirSemana(pacientes),
        pacientes,
        loading: false,
        error: null,
      })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e as Error }))
    }
  }, [equipeId])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Realtime: qualquer INSERT em visitas_capturadas ou mudança em
  // eventos/visitas dispara recarregamento. O score recomputa server-side.
  useEffect(() => {
    const channel = supabase
      .channel(`equipe-${equipeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visitas_capturadas' },
        () => carregar(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        () => carregar(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitas' },
        () => carregar(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [equipeId, carregar])

  return { ...state, recarregar: carregar }
}

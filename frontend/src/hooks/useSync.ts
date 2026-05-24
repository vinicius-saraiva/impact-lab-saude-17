import { useState, useEffect, useCallback } from 'react'
import { getVisitasPendentes, marcarComoSynced } from '../db'
import type { SyncStatus } from '../types'

export function useSync() {
  const [pendentes, setPendentes] = useState(0)
  const [status, setStatus] = useState<SyncStatus>('synced')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const atualizarPendentes = useCallback(async () => {
    const lista = await getVisitasPendentes()
    const syncUrl = import.meta.env.VITE_SYNC_URL as string | undefined
    setPendentes(lista.length)
    // Sem backend configurado → sempre "synced" para a UI (dados salvos localmente)
    setStatus(lista.length > 0 && !!syncUrl ? 'pending' : 'synced')
  }, [])

  useEffect(() => {
    atualizarPendentes()

    const onOnline = () => {
      setIsOnline(true)
      sincronizar()
    }
    const onOffline = () => setIsOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const sincronizar = useCallback(async () => {
    const lista = await getVisitasPendentes()
    if (lista.length === 0) return

    // URL configurável via env; quando não configurada, dados ficam só no dispositivo
    const syncUrl = import.meta.env.VITE_SYNC_URL as string | undefined

    if (!syncUrl) {
      // Sem backend → tratar como "salvo localmente", não como pendente de envio
      setStatus('synced')
      return
    }

    setStatus('syncing')
    try {
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros: lista }),
      })

      if (res.ok) {
        const ids = lista.map((v) => v.id!).filter(Boolean)
        await marcarComoSynced(ids)
        setPendentes(0)
        setStatus('synced')
      } else {
        // Backend retornou erro HTTP — mantém na fila para tentar depois
        setStatus('pending')
      }
    } catch {
      // Offline ou backend indisponível — esperado
      setStatus('pending')
    }
  }, [])

  return { pendentes, status, isOnline, sincronizar, atualizarPendentes }
}

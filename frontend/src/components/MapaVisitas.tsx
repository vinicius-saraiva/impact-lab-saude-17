import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import type { Paciente, Prioridade } from '../types'
import { EQUIPE_LAT, EQUIPE_LNG } from '../mockData'

const CORES: Record<Prioridade, string> = {
  critica: '#dc2626',
  alta: '#ea580c',
  media: '#ca8a04',
  baixa: '#16a34a',
}

function pinPaciente(prioridade: Prioridade, visitado: boolean) {
  const cor = visitado ? '#94a3b8' : CORES[prioridade]
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${cor};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

const PIN_UNIDADE = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#1d4ed8;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:10px">🏥</div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
})

interface Props {
  pacientes: Paciente[]
  visitados: Set<string>
}

export function MapaVisitas({ pacientes, visitados }: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([EQUIPE_LAT, EQUIPE_LNG], 15)
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([EQUIPE_LAT, EQUIPE_LNG], { icon: PIN_UNIDADE })
      .addTo(map)
      .bindPopup('<b>Clínica da Família</b><br><span style="font-size:11px;color:#64748b">Ponto de partida</span>')

    for (const p of pacientes) {
      const visitado = visitados.has(p.id)
      const popup = document.createElement('div')
      popup.style.minWidth = '160px'
      popup.innerHTML = `
        <div style="font-weight:600;font-size:14px">${p.nome}</div>
        <div style="font-size:11px;color:#64748b;margin:2px 0">${p.faixaEtaria}a · ${p.distanciaKm.toFixed(1).replace('.', ',')} km</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:6px;line-height:1.3">${p.motivoPrioridade}</div>
        ${visitado
          ? '<span style="font-size:11px;color:#16a34a;font-weight:600">✓ Visitado</span>'
          : `<button id="ir-${p.id}" style="background:#1d4ed8;color:white;border:none;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer;width:100%">Registrar visita →</button>`
        }
      `
      const btn = popup.querySelector<HTMLButtonElement>(`#ir-${p.id}`)
      if (btn) {
        L.DomEvent.on(btn, 'click', () => {
          map.closePopup()
          navigate(`/visita/${p.id}`)
        })
      }
      L.marker([p.lat, p.lng], { icon: pinPaciente(p.prioridade, visitado) })
        .addTo(map)
        .bindPopup(L.popup().setContent(popup))
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* Legenda */}
      <div className="flex gap-3 px-4 py-2 bg-white border-b border-slate-100 text-xs text-slate-500 flex-wrap">
        {(['critica', 'alta', 'media', 'baixa'] as Prioridade[]).map((p) => (
          <span key={p} className="flex items-center gap-1">
            <span style={{ background: CORES[p] }} className="inline-block w-2.5 h-2.5 rounded-full" />
            {p === 'critica' ? 'Crítica' : p === 'alta' ? 'Alta' : p === 'media' ? 'Média' : 'Baixa'}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span style={{ background: '#94a3b8' }} className="inline-block w-2.5 h-2.5 rounded-full" />
          Visitado
        </span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}

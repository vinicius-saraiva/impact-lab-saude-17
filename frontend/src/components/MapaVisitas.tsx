import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Paciente, Prioridade } from '../types'
import { EQUIPE_LAT, EQUIPE_LNG, ACS_LAT, ACS_LNG } from '../mockData'

const CORES: Record<Prioridade, string> = {
  critica: '#dc2626',
  alta: '#ea580c',
  media: '#ca8a04',
  baixa: '#16a34a',
}

function pinPaciente(prioridade: Prioridade, visitado: boolean) {
  const cor = visitado ? '#94a3b8' : CORES[prioridade]
  return L.divIcon({
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${cor};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    className: 'leaflet-div-icon-paciente',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  })
}

const PIN_UNIDADE = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#1d4ed8;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:14px">🏥</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
})

const PIN_ACS = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#059669;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:14px">👩</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
})

interface Props {
  pacientes: Paciente[]
  visitados: Set<string>
  onSelectPaciente: (p: Paciente) => void
}

export function MapaVisitas({ pacientes, visitados, onSelectPaciente }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onSelectRef = useRef(onSelectPaciente)
  const pacientesRef = useRef(pacientes)

  useEffect(() => { onSelectRef.current = onSelectPaciente }, [onSelectPaciente])
  useEffect(() => { pacientesRef.current = pacientes }, [pacientes])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([EQUIPE_LAT, EQUIPE_LNG], 15)
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    // Pin da unidade de saúde
    L.marker([EQUIPE_LAT, EQUIPE_LNG], { icon: PIN_UNIDADE })
      .addTo(map)
      .bindPopup('<b>Clínica da Família</b><br><span style="font-size:11px;color:#64748b">Ponto de partida</span>')

    // Pin da ACS
    L.marker([ACS_LAT, ACS_LNG], { icon: PIN_ACS })
      .addTo(map)
      .bindPopup('<b>Cláudia (você)</b><br><span style="font-size:11px;color:#64748b">Sua posição atual</span>')

    // Pins dos pacientes — clique abre bottom sheet via callback
    for (const p of pacientes) {
      const visitado = visitados.has(p.id)
      L.marker([p.lat, p.lng], { icon: pinPaciente(p.prioridade, visitado) })
        .addTo(map)
        .on('click', () => {
          const pac = pacientesRef.current.find((x) => x.id === p.id) ?? p
          onSelectRef.current(pac)
        })
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
            <span style={{ background: CORES[p] }} className="inline-block w-3 h-3 rounded-full" />
            {p === 'critica' ? 'Crítica' : p === 'alta' ? 'Alta' : p === 'media' ? 'Média' : 'Baixa'}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span style={{ background: '#94a3b8' }} className="inline-block w-3 h-3 rounded-full" />
          Visitado
        </span>
        <span className="flex items-center gap-1">
          <span style={{ background: '#059669' }} className="inline-block w-3 h-3 rounded-full" />
          Você
        </span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Problem } from '@/types/problem'

// ── Fix Leaflet icons broken in Next.js / Webpack ─────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ── Custom SVG pin icons ───────────────────────────────────────────────────
function makeIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  })
}

const icons: Record<1 | 2 | 3, L.DivIcon> = {
  1: makeIcon('#059669'),
  2: makeIcon('#D97706'),
  3: makeIcon('#DC2626'),
}

const previewIcon = makeIcon('#1A56DB')

// ── Props ─────────────────────────────────────────────────────────────────
interface LeafletMapWrapperProps {
  problems:      Problem[]
  onMapClick?:   (lat: number, lng: number) => void
  clickEnabled?: boolean
  previewPin?:   { lat: number; lng: number } | null
}

// ── Component ─────────────────────────────────────────────────────────────
export default function LeafletMapWrapper({
  problems,
  onMapClick,
  clickEnabled = false,
  previewPin = null,
}: LeafletMapWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Attach / detach click handler ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handler = (e: L.LeafletMouseEvent) => {
      if (clickEnabled) onMapClick?.(e.latlng.lat, e.latlng.lng)
    }

    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [clickEnabled, onMapClick])

  // ── Cursor style ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const container = map.getContainer()
    container.style.cursor = clickEnabled ? 'crosshair' : ''
  }, [clickEnabled])

  if (!mounted) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: '#94a3b8',
      }}>
        A carregar mapa...
      </div>
    )
  }

  return (
    <MapContainer
      key="streetviz-map"
      center={[41.1579, -8.6291]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      ref={(map: L.Map | null) => {
        mapRef.current = map
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Preview pin */}
      {previewPin && (
        <Marker position={[previewPin.lat, previewPin.lng]} icon={previewIcon}>
          <Popup>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              📍 Localização selecionada
            </span>
          </Popup>
        </Marker>
      )}

      {/* Problems */}
      {problems.map((p) => {
        if (p.latitude == null || p.longitude == null) return null

        const sevLabel =
          p.gravidade === 3 ? 'Alto' :
          p.gravidade === 2 ? 'Médio' :
          'Baixo'

        const sevColor =
          p.gravidade === 3 ? '#DC2626' :
          p.gravidade === 2 ? '#D97706' :
          '#059669'

        return (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={icons[p.gravidade as 1 | 2 | 3]}
          >
            <Popup>
              <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 170 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6, lineHeight: 1.5 }}>
                  {p.description}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                  📍 {p.location}
                </div>
                <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: sevColor
                  }} />
                  <strong>{sevLabel}</strong>
                  <span style={{ color: '#94a3b8' }}>·</span>
                  <span>{p.confirmacoes} confirmações</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
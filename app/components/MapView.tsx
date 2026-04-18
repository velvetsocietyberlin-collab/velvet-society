'use client'

import { useEffect, useRef, useState } from 'react'
import type { Brand } from '@/lib/supabase'

type Props = {
  brands: Brand[]
}

const BERLIN_CENTER: [number, number] = [52.520, 13.405]
const DEFAULT_ZOOM = 13

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error'

// Haversine-Formel: Entfernung zwischen zwei GPS-Koordinaten in Kilometern
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Erdradius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDistance(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000)
    return `${m} m`
  }
  return `${km.toFixed(1)} km`
}

export default function MapView({ brands }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [nearestBrand, setNearestBrand] = useState<(Brand & { distKm: number }) | null>(null)

  // 1) Karte initialisieren (einmalig beim Mount)
  useEffect(() => {
    const container = mapContainer.current
    if (!container) return

    let cancelled = false

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      if (cancelled) return

      if ((container as any)._leaflet_id) {
        container.innerHTML = ''
        ;(container as any)._leaflet_id = null
      }

      LRef.current = L

      const map = L.map(container, {
        center: BERLIN_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OSM · © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Brand-Pins (ohne Popup-Inhalt — den setzen wir später dynamisch)
      brands.forEach((brand, idx) => {
        if (!brand.lat || !brand.lng) return

        const icon = L.divIcon({
          className: '',
          html: `
            <div class="velvet-pin ${idx === 0 ? 'primary' : 'other'}">
              <div class="dot">${getCategoryIconSvg(brand.category)}</div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })

        const marker = L.marker([brand.lat, brand.lng], { icon }).addTo(map)
        marker.bindPopup(
          `<div class="velvet-popup">
            <div class="popup-brand">${brand.name}</div>
            <div class="popup-cat">${brand.category.toUpperCase()}</div>
          </div>`,
          { closeButton: false }
        )
        markersRef.current.set(brand.id, marker)
      })

      mapRef.current = map
    })

  return () => {
      cancelled = true
      markersRef.current.clear()
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (e) {
          // Map war schon entfernt oder in ungültigem Zustand
          console.warn('Map cleanup error:', e)
        }
        mapRef.current = null
      }
      userMarkerRef.current = null
      LRef.current = null
    }
  }, [brands])

  // 2) User-Position per Geolocation API anfragen
  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setLocationStatus('error')
      return
    }
    setLocationStatus('loading')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserPos(coords)
        setLocationStatus('granted')
      },
      (err) => {
        console.warn('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied')
        } else {
          setLocationStatus('error')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    const t = setTimeout(() => requestLocation(), 500)
    return () => clearTimeout(t)
  }, [])

  // 3) Wenn userPos gesetzt: Marker setzen, Entfernungen berechnen, Popups aktualisieren
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L || !userPos) return

    // Alten User-Marker entfernen
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }

    // Neuen User-Marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="velvet-me"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
    userMarkerRef.current = L.marker(userPos, { icon: userIcon }).addTo(map)

    // Entfernungen berechnen + Popups mit Distanz updaten
    const withDist = brands
      .filter((b) => b.lat && b.lng)
      .map((b) => ({
        ...b,
        distKm: distanceKm(userPos[0], userPos[1], b.lat!, b.lng!),
      }))
      .sort((a, b) => a.distKm - b.distKm)

    // Popup-Inhalte mit Entfernung aktualisieren
    withDist.forEach((b) => {
      const marker = markersRef.current.get(b.id)
      if (marker) {
        marker.setPopupContent(
          `<div class="velvet-popup">
            <div class="popup-brand">${b.name}</div>
            <div class="popup-cat">
              <span>${b.category.toUpperCase()}</span>
              <span class="popup-dist">${formatDistance(b.distKm)}</span>
            </div>
          </div>`
        )
      }
    })

    // Nächsten Brand setzen (für die Karte unten)
    if (withDist.length > 0) {
      setNearestBrand(withDist[0])
    }

    // Map-Bounds: User + alle Pins sichtbar
    const points: [number, number][] = [userPos]
    brands.forEach((b) => {
      if (b.lat && b.lng) points.push([b.lat, b.lng])
    })
    if (points.length > 1) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
    } else {
      map.setView(userPos, 15)
    }
  }, [userPos, brands])

  // Klick auf "nächster Pin"-Karte → Marker popup öffnen + map dorthin
  function focusNearestBrand() {
    if (!nearestBrand || !mapRef.current) return
    const marker = markersRef.current.get(nearestBrand.id)
    if (marker) {
      mapRef.current.flyTo([nearestBrand.lat!, nearestBrand.lng!], 16, {
        duration: 0.8,
      })
      setTimeout(() => marker.openPopup(), 900)
    }
  }

  return (
    <>
      <div ref={mapContainer} id="leafletMap" />

      {/* Location Button */}
      <button
        className="map-location-btn"
        onClick={requestLocation}
        disabled={locationStatus === 'loading'}
        aria-label="Standort neu laden"
      >
        {locationStatus === 'loading' ? (
          <div className="loc-spinner" />
        ) : (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        )}
      </button>

      {/* Banner bei Fehler / Denied */}
      {locationStatus === 'denied' && (
        <div className="map-info-banner">
          <strong>Standort nicht erlaubt</strong>
          <span>Erlaube Location in deinen Browser-Settings, um deine Position zu sehen.</span>
        </div>
      )}
      {locationStatus === 'error' && (
        <div className="map-info-banner">
          <strong>Standort nicht verfügbar</strong>
          <span>Position konnte nicht ermittelt werden.</span>
        </div>
      )}

      {/* Nearest-Brand-Karte unten (nur wenn Location aktiv und Brand vorhanden) */}
      {locationStatus === 'granted' && nearestBrand && (
        <div className="map-nearest-card" onClick={focusNearestBrand}>
          <div className="nearest-top">
            <span className="nearest-label">Nächster Spot</span>
            <span className="nearest-dist">{formatDistance(nearestBrand.distKm)}</span>
          </div>
          <div className="nearest-name">{nearestBrand.name}</div>
          <div className="nearest-cat">{nearestBrand.category.toUpperCase()}</div>
        </div>
      )}
    </>
  )
}

function getCategoryIconSvg(category: string): string {
  const icons: Record<string, string> = {
    food: '<svg viewBox="0 0 24 24"><path d="M3 11c.4-5 3-8 9-8s8.6 3 9 8m-18 0v4a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-4m-18 0h18"/></svg>',
    event: '<svg viewBox="0 0 24 24"><path d="M21 8l-9 13-9-13 9-5z"/></svg>',
    car: '<svg viewBox="0 0 24 24"><path d="M4 18V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v11M4 18l-2 3h20l-2-3M4 18h16"/></svg>',
    fitness: '<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>',
    beauty: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>',
    fashion: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
  }
  return icons[category] || icons.food
}
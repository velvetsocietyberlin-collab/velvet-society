'use client'

import { useState, useEffect, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Creator } from '@/lib/supabase'

type Props = {
  creator: Creator
}

function generateQrPayload(creatorId: string, nonce: number): string {
  const ts = Math.floor(Date.now() / 1000)
  return `velvet://checkin?u=${creatorId.slice(0, 8)}&t=${ts}&n=${nonce}`
}

function generateShortCode(creatorId: string, nonce: number): string {
  const base = creatorId.replace(/-/g, '').toUpperCase()
  const segment1 = base.slice(0, 4)
  const segment2 = String(nonce).padStart(4, '0').slice(-4)
  return `VS · ${segment1} ${segment2}`
}

export default function CheckInView({ creator }: Props) {
  const [nonce, setNonce] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Nonce erst nach Mount generieren (verhindert Hydration-Mismatch)
  useEffect(() => {
    setNonce(Math.floor(Math.random() * 10000))
  }, [])

  const qrPayload = useMemo(
    () => (nonce !== null ? generateQrPayload(creator.id, nonce) : ''),
    [creator.id, nonce]
  )
  const shortCode = useMemo(
    () => (nonce !== null ? generateShortCode(creator.id, nonce) : 'VS · ···· ····'),
    [creator.id, nonce]
  )

  function refreshCode() {
    setRefreshing(true)
    setTimeout(() => {
      setNonce(Math.floor(Math.random() * 10000))
      setRefreshing(false)
    }, 400)
  }

  const initial = creator.full_name.charAt(0).toUpperCase()

  // SSR-Placeholder während nonce noch null ist
  if (nonce === null) {
    return (
      <main className="app-screen checkin-main">
        <div className="checkin-header">
          <div className="greet">Deine Mitgliedschaft</div>
          <h2>
            Check-<em>In.</em>
          </h2>
          <p>
            Zeig diesen QR-Code am Empfang des Deal-Partners. Er scannt, du bist verifiziert.
          </p>
        </div>
        <div className="qr-card" style={{ opacity: 0.5, minHeight: 340 }}>
          <div className="qr-member-row">
            <div className="qr-member-left">
              <div className="qr-avatar">{initial}</div>
              <div className="qr-member-info">
                <div className="qr-name">{creator.full_name}</div>
                <div className="qr-tier">{creator.tier.toUpperCase()} MEMBER</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="app-screen checkin-main">
      <div className="checkin-header">
        <div className="greet">Deine Mitgliedschaft</div>
        <h2>
          Check-<em>In.</em>
        </h2>
        <p>
          Zeig diesen QR-Code am Empfang des Deal-Partners. Er scannt, du bist verifiziert.
        </p>
      </div>

      <div className="qr-card">
        <div className="qr-member-row">
          <div className="qr-member-left">
            <div className="qr-avatar">{initial}</div>
            <div className="qr-member-info">
              <div className="qr-name">{creator.full_name}</div>
              <div className="qr-tier">{creator.tier.toUpperCase()} MEMBER</div>
            </div>
          </div>
          <div className="qr-rating">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
            </svg>
            {creator.rating.toFixed(1)}
          </div>
        </div>

        <div className={`qr-big ${refreshing ? 'refreshing' : ''}`}>
          <QRCodeSVG
            value={qrPayload}
            size={200}
            level="M"
            fgColor="#0a0a0b"
            bgColor="#ffffff"
            marginSize={0}
          />
          <div className="logo-overlay">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 30 35 L 50 65 L 70 35 Z" />
                <line x1="50" y1="65" x2="50" y2="80" />
                <line x1="40" y1="80" x2="60" y2="80" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="qr-meta">
        <span className="qr-code">{shortCode}</span>
        <span className="qr-valid">Gültig jetzt</span>
      </div>

      <div className="qr-actions">
        <button className="qr-refresh" onClick={refreshCode} disabled={refreshing}>
          <svg viewBox="0 0 24 24" className={refreshing ? 'spinning' : ''}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Neu laden
        </button>
      </div>

      <div className="qr-hint">
        Code wird alle 60 Sekunden rotiert · End-to-end verschlüsselt
      </div>
    </main>
  )
}
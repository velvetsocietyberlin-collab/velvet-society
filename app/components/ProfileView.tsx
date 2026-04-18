'use client'

import { useState } from 'react'
import type { Creator } from '@/lib/supabase'

type Props = {
  creator: Creator
}

type TabKey = 'active' | 'history' | 'reviews'

// Mock-Daten — werden später durch echte DB-Queries ersetzt
const MOCK_ACTIVE_DEALS = [
  {
    id: 'a1',
    brand: 'The Coral',
    title: 'Dinner für 2',
    status: 'Stories fällig',
    dueIn: '18h',
    category: 'RESTAURANT',
  },
  {
    id: 'a2',
    brand: 'Bentley Berlin',
    title: 'Continental GT · 3 Tage',
    status: 'Content-Upload offen',
    dueIn: '2 Tage',
    category: 'AUTO',
  },
]

const MOCK_HISTORY = [
  {
    id: 'h1',
    brand: 'Waldorf Astoria',
    title: 'Guerlain Spa Session',
    date: '2 Wochen her',
    status: 'Abgeschlossen',
    rating: 5,
  },
  {
    id: 'h2',
    brand: 'Resonance Nights',
    title: 'VIP-Entry +1',
    date: '1 Monat her',
    status: 'Abgeschlossen',
    rating: 5,
  },
  {
    id: 'h3',
    brand: "D'Brunch Berlin",
    title: 'Weekend Brunch',
    date: '1 Monat her',
    status: 'Abgeschlossen',
    rating: 4,
  },
  {
    id: 'h4',
    brand: 'PadelBros Berlin',
    title: 'Padel-Session +3',
    date: '2 Monate her',
    status: 'Abgeschlossen',
    rating: 5,
  },
]

const MOCK_REVIEWS = [
  {
    id: 'r1',
    brand: 'Waldorf Astoria',
    rating: 5,
    text: 'Sehr professionell, Content kam on time und sehr ästhetisch. Gerne wieder!',
    date: 'Vor 2 Wochen',
  },
  {
    id: 'r2',
    brand: 'Resonance Nights',
    rating: 5,
    text: 'Lena hat eine großartige Story-Arbeit geliefert. Ihre Community ist extrem engaged — sehen wir im Check-In-Uplift.',
    date: 'Vor 1 Monat',
  },
  {
    id: 'r3',
    brand: "D'Brunch Berlin",
    rating: 4,
    text: 'Content solide, Story ein Tag später als abgesprochen. Aber insgesamt gerne.',
    date: 'Vor 1 Monat',
  },
]

function formatFollowers(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace('.0', '')}K`
  }
  return String(n)
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ opacity: i <= count ? 1 : 0.25 }}
        >
          <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProfileView({ creator }: Props) {
  const [tab, setTab] = useState<TabKey>('active')
  const initial = creator.full_name.charAt(0).toUpperCase()

  return (
    <main className="app-screen profile-main">
      {/* Header mit Avatar */}
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-name-row">
          <h1 className="profile-name">
            {creator.full_name.split(' ')[0]} <em>{creator.full_name.split(' ').slice(1).join(' ')}</em>
          </h1>
          <div className="profile-handle">@{creator.instagram_handle || 'lena.mare'}</div>
        </div>
        <div className="profile-tier-badge">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
          </svg>
          {creator.tier.toUpperCase()} MEMBER
        </div>
        <button className="profile-edit-btn">Profil bearbeiten</button>
      </div>

      {/* Stats-Row */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">{formatFollowers(creator.followers || 12400)}</div>
          <div className="stat-label">Follower</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-value">
            <svg viewBox="0 0 16 16" fill="currentColor" className="stat-star">
              <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
            </svg>
            {creator.rating.toFixed(1)}
          </div>
          <div className="stat-label">Rating</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-value">{creator.reviews_count || 23}</div>
          <div className="stat-label">Deals</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          Aktiv <span className="tab-count">{MOCK_ACTIVE_DEALS.length}</span>
        </button>
        <button
          className={`profile-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Historie
        </button>
        <button
          className={`profile-tab ${tab === 'reviews' ? 'active' : ''}`}
          onClick={() => setTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* Tab-Inhalte */}
      <div className="profile-tab-content">
        {tab === 'active' && (
          <div className="profile-list">
            {MOCK_ACTIVE_DEALS.length === 0 ? (
              <div className="profile-empty">
                <p>Keine aktiven Deals gerade.</p>
              </div>
            ) : (
              MOCK_ACTIVE_DEALS.map((deal) => (
                <div key={deal.id} className="profile-card">
                  <div className="profile-card-head">
                    <div>
                      <div className="profile-card-brand">{deal.category}</div>
                      <div className="profile-card-title">{deal.brand} — {deal.title}</div>
                    </div>
                    <div className="profile-card-due">
                      <span>In</span>
                      <strong>{deal.dueIn}</strong>
                    </div>
                  </div>
                  <div className="profile-card-status active-status">
                    {deal.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="profile-list">
            {MOCK_HISTORY.map((item) => (
              <div key={item.id} className="profile-card history">
                <div className="profile-card-head">
                  <div>
                    <div className="profile-card-brand">{item.brand}</div>
                    <div className="profile-card-title">{item.title}</div>
                  </div>
                  <StarRow count={item.rating} />
                </div>
                <div className="profile-card-meta">
                  <span>{item.status}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="profile-list">
            {MOCK_REVIEWS.map((rev) => (
              <div key={rev.id} className="profile-card review">
                <div className="profile-card-head">
                  <div className="profile-card-brand">{rev.brand}</div>
                  <StarRow count={rev.rating} />
                </div>
                <p className="review-text">{rev.text}</p>
                <div className="review-date">{rev.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — Settings + Logout */}
      <div className="profile-footer">
        <button className="profile-footer-btn">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.65 1.65 0 0 0-1.8-.3 1.65 1.65 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.65 1.65 0 0 0 .3-1.8 1.65 1.65 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.65 1.65 0 0 0 1.8.3h.1a1.65 1.65 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.65 1.65 0 0 0 1 1.5 1.65 1.65 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.65 1.65 0 0 0-.3 1.8v.1a1.65 1.65 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1.5 1z" />
          </svg>
          <span>Einstellungen</span>
          <svg viewBox="0 0 24 24" className="arrow">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button className="profile-footer-btn logout">
          <svg viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </main>
  )
}
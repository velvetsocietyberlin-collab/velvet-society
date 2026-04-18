import { supabase, type Deal } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const BRAND_IMAGES: Record<string, string> = {
  'the-coral': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
  'resonance-nights': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
  'dbrunch-berlin': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&q=80',
  'bentley-berlin': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80',
  'padelbros-berlin': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80',
  'waldorf-astoria-berlin': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
  'schlosshotel-berlin': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'kilians-munich': 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=1200&q=80',
  'blitz-munich': 'https://images.unsplash.com/photo-1571266028243-d220c6a6c0c5?w=1200&q=80',
  'nikkei-nine-hh': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
  'ubel-gefahrlich': 'https://images.unsplash.com/photo-1598387180725-98b3957c9e9f?w=1200&q=80',
  'ox-klee-koeln': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  'jaguars-frankfurt': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80',
  'nagaya-duesseldorf': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=80',
}

async function getDeal(id: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, brands(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error loading deal:', error)
    return null
  }
  return data
}

function formatEuro(value: number | null): string {
  if (!value) return '–'
  return `€ ${value.toLocaleString('de-DE')}`
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDeal(id)

  if (!deal) {
    notFound()
  }

  const image = deal.brands ? BRAND_IMAGES[deal.brands.slug] : ''
  const missions = (deal.missions as string[]) || []

  return (
    <main className="app-screen deal-detail">
      <div
        className="deal-hero"
        style={{ backgroundImage: `url(${image})` }}
      >
        <Link href="/" className="deal-back">
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        {deal.badge && <div className="deal-hero-badge">{deal.badge}</div>}
        <div className="deal-hero-value">{formatEuro(deal.value_eur)}</div>
      </div>

      <div className="deal-info">
        <div className="deal-brand-name">{deal.brands?.name}</div>
        <h1 className="deal-headline">{deal.title}</h1>
        {deal.subtitle && <p className="deal-subtitle">{deal.subtitle}</p>}
      </div>

      {deal.about && (
        <section className="deal-section">
          <h3>Über den Deal</h3>
          <p className="deal-prose">{deal.about}</p>
        </section>
      )}

      {missions.length > 0 && (
        <section className="deal-section">
          <h3>Deine Missions</h3>
          <div className="deal-mission-list">
            {missions.map((m, i) => (
              <div key={i} className="deal-mission-item">
                <div className="mission-num">{i + 1}</div>
                <div className="mission-text">{m}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {deal.credit_description && (
        <section className="deal-section">
          <h3>Was du bekommst</h3>
          <p className="deal-prose">{deal.credit_description}</p>
        </section>
      )}

      {deal.slots_description && (
        <section className="deal-section">
          <h3>Verfügbarkeit</h3>
          <p className="deal-prose">{deal.slots_description}</p>
        </section>
      )}

      <section className="deal-section deal-meta-grid">
        {deal.deadline && (
          <div className="deal-meta-item">
            <div className="meta-label">Deadline</div>
            <div className="meta-value">{deal.deadline}</div>
          </div>
        )}
        {deal.min_rating && (
          <div className="deal-meta-item">
            <div className="meta-label">Min. Rating</div>
            <div className="meta-value">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
              </svg>
              {deal.min_rating}
            </div>
          </div>
        )}
        {deal.requirements && (
          <div className="deal-meta-item full">
            <div className="meta-label">Content</div>
            <div className="meta-value">{deal.requirements}</div>
          </div>
        )}
      </section>

      <div className="deal-sticky-cta">
        <button className="deal-book-btn">
          Jetzt anfragen
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  )
}
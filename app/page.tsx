import { supabase, type Deal } from '@/lib/supabase'
import CityPicker from './components/CityPicker'

const DEFAULT_CITIES = ['Berlin']

async function getDeals(cities: string[]): Promise<Deal[]> {
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id')
    .in('city', cities)

  if (brandsError) {
    console.error('Error loading brands:', brandsError)
    return []
  }

  const brandIds = brands?.map((b) => b.id) || []
  if (brandIds.length === 0) return []

  const { data, error } = await supabase
    .from('deals')
    .select('*, brands(*)')
    .eq('is_active', true)
    .in('brand_id', brandIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading deals:', error)
    return []
  }
  return data || []
}

async function getCityCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('brands')
    .select('city, deals(count)')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const brand of data as { city: string; deals: { count: number }[] }[]) {
    const dealCount = brand.deals?.[0]?.count || 0
    counts[brand.city] = (counts[brand.city] || 0) + dealCount
  }
  return counts
}

const BRAND_IMAGES: Record<string, string> = {
  'the-coral': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'resonance-nights': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'dbrunch-berlin': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80',
  'bentley-berlin': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'padelbros-berlin': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
  'waldorf-astoria-berlin': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  'schlosshotel-berlin': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'kilians-munich': 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=800&q=80',
  'blitz-munich': 'https://images.unsplash.com/photo-1571266028243-d220c6a6c0c5?w=800&q=80',
  'nikkei-nine-hh': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  'ubel-gefahrlich': 'https://images.unsplash.com/photo-1598387180725-98b3957c9e9f?w=800&q=80',
  'ox-klee-koeln': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'jaguars-frankfurt': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
  'nagaya-duesseldorf': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
}

function formatEuro(value: number | null): string {
  if (!value) return '–'
  return `€ ${value.toLocaleString('de-DE')}`
}

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const citiesParam = typeof params.cities === 'string' ? params.cities : ''
  const selectedCities = citiesParam ? citiesParam.split(',') : DEFAULT_CITIES

  const [deals, cityCounts] = await Promise.all([
    getDeals(selectedCities),
    getCityCounts(),
  ])

  return (
    <main className="app-screen">
      <header className="home-header">
        <div className="greet">
          <span>Donnerstag</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <CityPicker selectedCities={selectedCities} cityCounts={cityCounts} />
        </div>
        <div className="name">
          Willkommen, <em>Lena</em>
        </div>
      </header>

      <div className="creator-card">
        <div className="creator-card-top">
          <div className="card-brand">
            <svg viewBox="0 0 100 100" width="24" height="24" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 30 35 L 50 65 L 70 35 Z" />
                <line x1="50" y1="65" x2="50" y2="80" />
                <line x1="40" y1="80" x2="60" y2="80" />
                <line x1="60" y1="30" x2="68" y2="20" strokeWidth="2" />
              </g>
              <circle cx="68" cy="18" r="4" fill="var(--accent)" />
            </svg>
            <div className="card-brand-text">
              <span>VELVET</span>
              <small>SOCIETY · MEMBER</small>
            </div>
          </div>
          <div className="card-tier-badge">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor">
              <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
            </svg>
            <span>GOLD</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-name">
            Lena Mare
            <small>Member Name</small>
          </div>
          <div className="card-rating">
            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
              <path d="M8 0l2.2 5.3L16 6l-4.5 3.9L13 16 8 12.9 3 16l1.5-6.1L0 6l5.8-.7z" />
            </svg>
            <span>4.9</span>
            <small>23 Reviews</small>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>
          Deals <em>in deiner Nähe</em>
        </h2>
        <a>Alle {deals.length} →</a>
      </div>

      {deals.length === 0 ? (
        <div className="loading">Keine Deals in den ausgewählten Städten</div>
      ) : (
        <div className="deals-grid">
          {deals.map((deal) => (
            <a key={deal.id} href={`/deal/${deal.id}`} className="deal deal-link">
              <div
                className="deal-media"
                style={{
                  backgroundImage: deal.brands
                    ? `url(${BRAND_IMAGES[deal.brands.slug] || ''})`
                    : undefined,
                }}
              >
                {deal.badge && <div className="deal-badge">{deal.badge}</div>}
                <div className="deal-value">{formatEuro(deal.value_eur)}</div>
              </div>
              <div className="deal-body">
                <div className="deal-brand">{deal.brands?.name || '—'}</div>
                <div className="deal-title">{deal.title}</div>
                <div className="deal-req">{deal.requirements}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
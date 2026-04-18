import { supabase, type Brand } from '@/lib/supabase'
import MapView from '../components/MapView'

async function getBrandsWithCoords(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('city', 'Berlin')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .eq('is_active', true)

  if (error) {
    console.error('Error loading brands for map:', error)
    return []
  }
  return data || []
}

export default async function KartePage() {
  const brands = await getBrandsWithCoords()

  return (
    <>
      {/* Floating Search-Header über der Map */}
      <div className="map-floating-header">
        <div className="map-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>In Berlin suchen …</span>
        </div>
      </div>

      {/* Die Karte füllt den gesamten Screen */}
      <MapView brands={brands} />
    </>
  )
}
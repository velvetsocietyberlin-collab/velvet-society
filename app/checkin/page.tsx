import { supabase, type Creator } from '@/lib/supabase'
import CheckInView from '@/app/components/CheckInView'

async function getCreator(): Promise<Creator | null> {
  // Für's MVP: Erste approved Creator nehmen (später: via Auth)
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('status', 'approved')
    .limit(1)
    .single()

  if (error) {
    console.error('Error loading creator:', error)
    return null
  }
  return data
}

export default async function CheckinPage() {
  const creator = await getCreator()

  if (!creator) {
    return (
      <main className="app-screen">
        <div className="placeholder-screen">
          <h2>Kein <em>Creator-Profil</em></h2>
          <p>Bitte logge dich ein, um deinen Check-In-Code zu sehen.</p>
        </div>
      </main>
    )
  }

  return <CheckInView creator={creator} />
}
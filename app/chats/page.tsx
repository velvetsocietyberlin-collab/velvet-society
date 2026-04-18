import { supabase, type Creator } from '@/lib/supabase'
import ProfileView from '../components/ProfileView'

async function getCreator(): Promise<Creator | null> {
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

export default async function ProfilPage() {
  const creator = await getCreator()

  if (!creator) {
    return (
      <main className="app-screen">
        <div className="placeholder-screen">
          <h2>Kein <em>Profil</em></h2>
          <p>Bitte logge dich ein, um dein Profil zu sehen.</p>
        </div>
      </main>
    )
  }

  return <ProfileView creator={creator} />
}
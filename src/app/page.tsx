import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginHome from "@/components/LoginHome";

export default async function HomePage() {
  const supabase = createClient()

  // Sprawdzamy, czy jest zalogowany użytkownik (po stronie serwera)
  const { data: { user } } = await supabase.auth.getUser()

  // Jeśli użytkownik JEST zalogowany...
  if (user) {
    // ...przekieruj go natychmiast na /kontakty
    // (Zauważ, że zmieniam na '/kontakty', aby pasowało do Twojego formularza)
    redirect('/kontakty')
  }

  // Jeśli użytkownik NIE jest zalogowany...
  // ...renderuj komponent z formularzem logowania
  return (
      <LoginHome />
  )
}
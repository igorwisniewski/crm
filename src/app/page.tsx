
import LoginHome from "@/components/LoginHome";

export default async function HomePage() {


  // Jeśli użytkownik NIE jest zalogowany...
  // ...renderuj komponent z formularzem logowania
  return (
      <LoginHome />
  )
}
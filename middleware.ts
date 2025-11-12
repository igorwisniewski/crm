import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware' // Ważne: import z /middleware

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)

    // Odświeża sesję - to ważne, aby była aktualna
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // --- Logika dla użytkownika NIEZALOGOWANEGO ---
    if (!session) {
        // Jeśli niezalogowany user próbuje wejść na /kontakty (lub cokolwiek w środku),
        // przekieruj go na stronę główną (logowanie)
        if (pathname.startsWith('/kontakty')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // --- Logika dla użytkownika ZALOGOWANEGO ---
    if (session) {
        // Jeśli zalogowany user jest na stronie głównej ('/')...
        if (pathname === '/') {
            // ...przekieruj go do /kontakty
            return NextResponse.redirect(new URL('/kontakty', request.url))
        }
    }

    // Jeśli żadna z powyższych reguł nie pasuje, po prostu kontynuuj
    return response
}

// Konfiguracja - które ścieżki ma obserwować middleware
export const config = {
    matcher: [
        '/',
        '/kontakty/:path*', // Obserwuj /kontakty i wszystko, co po nim
    ],
}
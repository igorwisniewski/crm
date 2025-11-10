import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Ta funkcja jest sercem zarządzania sesją
async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Tworzymy klienta Supabase specjalnie dla middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // 'request.cookies.set' jest potrzebne do aktualizacji
                    // plików cookie w tym żądaniu
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    // 'response.cookies.set' wysyła zaktualizowane
                    // cookie z powrotem do przeglądarki
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Najważniejsza linia: odświeża sesję, jeśli jest taka potrzeba.
    await supabase.auth.getUser()

    return response
}

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Dopasuj wszystkie ścieżki z wyjątkiem:
         * - _next/static (pliki statyczne)
         * - _next/image (optymalizacja obrazów)
         * - favicon.ico (plik favicon)
         * Możesz tu dodać np. ścieżki do API
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
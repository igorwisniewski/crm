// src/app/api/contacts/[id]/route.ts
export const dynamic = 'force-dynamic' // <-- DODAJ TĘ LINIĘ

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Ta funkcja wyciągnie ID z URL, np. /api/contacts/XYZ -> XYZ
function getIdFromUrl(request: Request) {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    // Ostatni segment to ID
    const id = pathParts[pathParts.length - 1]
    return id
}

// Typ 'Params' jest teraz ignorowany, ale go zostawiamy
interface Params {
    params: { id: string }
}

// --- POBIERANIE 1 KONTAKTU (dla strony edycji) ---
export async function GET(request: Request, { params }: Params) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        // --- NOWY WORKAROUND ---
        const id = getIdFromUrl(request)
        console.log(`API (GET): Ręcznie sparsowane ID: ${id}`)
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }
        // --- KONIEC WORKAROUNDU ---

        const contact = await prisma.contact.findUnique({
            where: { id: id } // Używamy naszego ID
        })

        if (!contact) {
            return NextResponse.json({ error: 'Nie znaleziono kontaktu' }, { status: 404 });
        }
        return NextResponse.json(contact);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// --- AKTUALIZACJA 1 KONTAKTU ---
export async function PATCH(request: Request, { params }: Params) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    try {
        // --- NOWY WORKAROUND ---
        const id = getIdFromUrl(request)
        console.log(`API (PATCH): Ręcznie sparsowane ID: ${id}`)
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }
        // --- KONIEC WORKAROUNDU ---

        const body = await request.json()
        const updatedContact = await prisma.contact.update({
            where: { id: id }, // Używamy naszego ID
            data: body,
        })
        return NextResponse.json(updatedContact, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    const userProfile = await prisma.user.findUnique({ where: { id: user.id }})
    if (userProfile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Brak uprawnień Admina' }, { status: 403 })
    }

    try {
        const id = getIdFromUrl(request) // Używamy naszego workaroundu
        console.log(`API (DELETE): Ręcznie sparsowane ID: ${id}`)
        if (!id) {
            return NextResponse.json({ error: 'Brak ID w adresie URL' }, { status: 400 });
        }

        // --- NOWA LOGIKA: Transakcja ---
        // Musimy najpierw usunąć powiązane zadania, a potem kontakt
        const deleteTasks = prisma.task.deleteMany({
            where: { contactId: id },
        })

        const deleteContact = prisma.contact.delete({
            where: { id: id },
        })

        // Uruchom obie operacje jako jedną transakcję
        await prisma.$transaction([
            deleteTasks,
            deleteContact
        ])
        // --- KONIEC NOWEJ LOGIKI ---

        return NextResponse.json({ message: 'Usunięto' }, { status: 200 })

    } catch (error: any) {
        // Logowanie błędu na serwerze
        console.error("Błąd podczas usuwania kontaktu:", error)

        // Sprawdź, czy to błąd Prismy
        if (error.code) {
            return NextResponse.json({ error: `Błąd Prismy ${error.code}: ${error.message}` }, { status: 500 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
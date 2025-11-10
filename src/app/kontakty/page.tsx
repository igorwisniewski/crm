// src/app/kontakty/page.tsx

// FIX 1: Naprawia cache, aby wyszukiwarka i filtry działały
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import KontaktyFiltry from '@/components/KontaktyFiltry'
import DeleteContactButton from "@/components/DeleteContactButton";

// Definiujemy typy dla strony (propsy przekazywane z URL)
interface KontaktyPageProps {
    // FIX 2: searchParams to teraz Obietnica (Promise)
    searchParams: Promise<{
        etap?: string;
        szukaj?: string;
    }>
}

// Funkcja pomocnicza do formatowania daty
function formatDate(date: Date) {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

// Główny komponent strony (Komponent Serwerowy)
export default async function KontaktyPage({ searchParams }: KontaktyPageProps) {
    const supabase = createClient()

    // 1. Uwierzytelnianie
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id }
    })
    if (!userProfile) {
        redirect('/login')
    }

    // 2. Budowanie zapytania (WHERE) dla Prismy

    // FIX 2 (kontynuacja): Musimy 'await' na searchParams
    const params = await searchParams;
    const { etap, szukaj } = params; // Teraz pracujemy na obiekcie

    const where: Prisma.ContactWhereInput = {}

    // B. Filtr etapu
    if (etap && etap !== 'wszystkie') {
        where.etap = etap
    }

    // C. Filtr wyszukiwania
    if (szukaj) {
        where.OR = [
            { imie: { contains: szukaj, mode: 'insensitive' } },
            { email: { contains: szukaj, mode: 'insensitive' } },
            { telefon: { contains: szukaj, mode: 'insensitive' } },
            { nazwaFirmy: { contains: szukaj, mode: 'insensitive' } },
        ]
    }

    // 3. Pobranie kontaktów
    const kontakty = await prisma.contact.findMany({
        where: where,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            createdAt: true,
            imie: true,
            etap: true,
            nazwaFirmy: true,
            telefon: true,
        }
    })

    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>
                    Kontakty ({kontakty.length})
                    {userProfile.role === 'ADMIN' && ' (Admin)'}
                </h1>
                <Link href="/kontakty/nowy" style={{ padding: '10px 15px', background: 'green', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    + Dodaj nowy
                </Link>
            </div>

            <KontaktyFiltry />

            {/* --- POCZĄTEK TABELI --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Data dodania</th>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Imię</th>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Firma</th>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Telefon</th>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Etap</th>
                    <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Akcje</th>
                </tr>
                </thead>
                <tbody>
                {kontakty.map((kontakt) => (
                    <tr key={kontakt.id}>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{formatDate(kontakt.createdAt)}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                            {/* ZMIANA: Link prowadzi do strony szczegółów */}
                            <Link href={`/kontakty/${kontakt.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                                {kontakt.imie}
                            </Link>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{kontakt.nazwaFirmy}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{kontakt.telefon}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{kontakt.etap}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc', display: 'flex', gap: '5px' }}>
                            {/* NOWY LINK "Edytuj" */}
                            <Link href={`/kontakty/edycja/${kontakt.id}`} style={{ padding: '5px', background: 'orange', color: 'white' }}>
                                Edytuj
                            </Link>
                            <DeleteContactButton contactId={kontakt.id} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {/* --- KONIEC TABELI --- */}
            {kontakty.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '30px' }}>Nie znaleziono kontaktów.</p>
            )}
        </div>
    )
}
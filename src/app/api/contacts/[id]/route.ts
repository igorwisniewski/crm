// src/app/api/tasks/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // <-- POPRAWKA 1: Typ musi być Promise
) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        // POPRAWKA 2: Użyj "await", aby dostać się do id
        // Możesz też od razu zmienić nazwę zmiennej na taskId
        const { id: taskId } = await params;

        // Ten warunek jest teraz mniej potrzebny, bo Next.js gwarantuje,
        // że params będą dostępne w dynamicznym roucie.
        if (!taskId) {
            return NextResponse.json({ error: 'Brak ID zadania w adresie URL' }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id: taskId },
        })

        return NextResponse.json({ message: 'Usunięto zadanie' }, { status: 200 })

    } catch (error: any) {
        console.error("Błąd podczas usuwania zadania:", error)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Nie znaleziono zadania do usunięcia' }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
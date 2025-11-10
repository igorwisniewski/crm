// src/app/api/tasks/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server' // ZMIANA
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Usunięto funkcję getIdFromUrl

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) { // ZMIANA
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
        }

        const taskId = params.id // ZMIANA
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
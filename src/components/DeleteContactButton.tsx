// src/components/DeleteContactButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteContactButton({ contactId }: { contactId: string }) {
    const router = useRouter()
    const [error, setError] = useState('')

    const handleDelete = async () => {
        setError('')
        if (window.confirm('Czy na pewno chcesz usunąć ten kontakt?')) {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.refresh() // Odśwież tabelę
            } else {
                const data = await res.json()
                setError(data.error || 'Nie udało się usunąć.')
                alert(`BŁĄD: ${data.error}`)
            }
        }
    }

    return (
        <button
            onClick={handleDelete}
            style={{ background: 'red', color: 'white', padding: '5px', border: 'none' }}
        >
            Usuń
        </button>
    )
}
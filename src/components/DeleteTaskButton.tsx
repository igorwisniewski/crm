// src/components/DeleteTaskButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setError('')
        if (isDeleting) return;

        // Resetujemy konsolę, aby widzieć tylko nowy błąd
        console.clear();
        console.log(`Próba usunięcia zadania o ID: ${taskId}`);
        console.log(`Wysyłanie żądania DELETE do: /api/tasks/${taskId}`);

        if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            setIsDeleting(true);
            try {
                const res = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                })

                // --- ULEPSZONE LOGOWANIE BŁĘDU ---
                if (res.ok) {
                    console.log('Sukces! Odpowiedź serwera:', res);
                    router.refresh();
                } else {
                    // Jeśli odpowiedź NIE JEST OK (np. 404, 500)
                    console.error('Błąd! Odpowiedź serwera NIE była OK.');
                    console.log('Status odpowiedzi:', res.status, res.statusText);

                    // Próbujemy odczytać odpowiedź jako JSON
                    try {
                        const data = await res.json();
                        console.error('Treść błędu (JSON):', data);
                        setError(data.error || 'Nieznany błąd serwera.');
                        alert(`BŁĄD: ${data.error}`);
                    } catch (jsonError) {
                        // Jeśli odpowiedź nie jest JSON-em (np. HTML błędu 500)
                        console.error('Odpowiedź serwera nie jest JSON-em. Odczyt jako tekst...');
                        const textData = await res.text();
                        console.error('Treść błędu (Tekst):', textData);
                        setError('Błąd serwera, odpowiedź nie była w formacie JSON.');
                        alert(`BŁĄD SERWERA: Odpowiedź nie była w formacie JSON.`);
                    }
                }
                // --- KONIEC ULEPSZONEGO LOGOWANIA ---

            } catch (err: any) {
                console.error('Błąd sieciowy (fetch):', err);
                setError('Błąd sieciowy.')
                alert(`BŁĄD SIECIOWY: ${err.message}`)
            } finally {
                setIsDeleting(false);
            }
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                background: 'red',
                color: 'white',
                padding: '3px 8px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: isDeleting ? 0.5 : 1
            }}
        >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
        </button>
    )
}
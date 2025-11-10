// src/app/kontakty/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AddTaskForm from '@/components/AddTaskForm'
import { Contact, Task, User, Prisma } from '@prisma/client' // Importujemy Prisma
import DisplayField from '@/components/DisplayField' // Nasz nowy komponent
import DisplayZobowiazania from '@/components/DisplayZobowiazania' // Nasz nowy komponent
import DeleteTaskButton from '@/components/DeleteTaskButton'; // <-- NOWY IMPORT

// Rozszerzony typ dla zadania (z danymi usera)
type TaskWithUser = Task & {
    assignedTo: {
        email: string | null;
        kolor: string | null;
    }
}

// Rozszerzony typ dla kontaktu, aby poprawnie obsłużyć JSON
type ContactWithDetails = Contact & {
    zobowiazania: Prisma.JsonValue | null;
}

// Funkcja do formatowania terminu
function formatTermin(date: Date) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date));
}

// Style dla sekcji
const sectionStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    background: '#fff',
    marginBottom: '20px'
};

export default function ContactDetailsPage() {
    const params = useParams()
    const contactId = params.id as string

    // Stany do przechowywania danych
    const [contact, setContact] = useState<ContactWithDetails | null>(null)
    const [tasks, setTasks] = useState<TaskWithUser[]>([])
    const [users, setUsers] = useState<{ id: string, email: string | null }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!contactId) return;

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/contact-details/${contactId}`)

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Nie udało się pobrać danych')
                }

                const data = await res.json()
                setContact(data.contact)
                setTasks(data.tasks)
                setUsers(data.users)

            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [contactId])

    if (loading) {
        return <p style={{ textAlign: 'center', padding: '50px' }}>Ładowanie danych...</p>
    }

    if (error) {
        return <p style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Błąd: {error}</p>
    }

    if (!contact) {
        return <p>Nie znaleziono kontaktu.</p>
    }

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>

            {/* Kolumna lewa: Szczegóły i Zadania */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>{contact.imie}</h1>
                    <Link href={`/kontakty/edycja/${contact.id}`} style={{ padding: '8px 12px', background: 'orange', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                        Edytuj Kontakt
                    </Link>
                </div>

                {/* --- NOWA SEKCJA: Wszystkie Dane Kontaktu --- */}
                <div style={sectionStyle}>
                    <h2>Dane Podstawowe</h2>
                    <DisplayField label="Etap" value={contact.etap} />
                    <DisplayField label="Email" value={contact.email} />
                    <DisplayField label="Telefon" value={contact.telefon} />
                    <DisplayField label="Branża" value={contact.branza} />
                    <DisplayField label="Źródło" value={contact.zrodlo} />
                    <DisplayField label="Opis" value={contact.opis} />
                </div>

                <div style={sectionStyle}>
                    <h2>Dane Firmy</h2>
                    <DisplayField label="Nazwa firmy" value={contact.nazwaFirmy} />
                    <DisplayField label="Rodzaj działki" value={contact.rodzajDzialki} />
                    <DisplayField label="Forma opodatkowania" value={contact.formaOpodatkowania} />
                    <DisplayField label="Majątek firmy" value={contact.majatekFirmy} />
                    <DisplayField label="Potrzeba klienta" value={contact.potrzebaKlienta} />
                    <DisplayField label="Plan na rozwój" value={contact.planNaRozwoj} />
                    <DisplayField label="Zatrudnia pracowników" value={contact.czyZatrudniaPracownikow} />
                    <DisplayField label="Opóźnienia w płatnościach" value={contact.opoznieniaWPlatnosciach} />
                    {/* Specjalny komponent dla JSON */}
                    <DisplayZobowiazania data={contact.zobowiazania} />
                </div>

                <div style={sectionStyle}>
                    <h2>Dane Prywatne</h2>
                    <DisplayField label="Stan cywilny" value={contact.stanCywilny} />
                    <DisplayField label="Majątek prywatny" value={contact.majatekPrywatny} />
                    <DisplayField label="Rozdzielność majątkowa" value={contact.rozdzielnoscMajatkowa} />
                    <DisplayField label="Kredyt w ciągu 10 lat" value={contact.czyBralKredyt10Lat} />
                </div>
                {/* --- KONIEC NOWEJ SEKCJI --- */}


                <hr style={{ margin: '20px 0' }} />

                <h2>Zadania ({tasks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.map(task => (
                        <div key={task.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', background: '#fff' }}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h2>Zadania ({tasks.length})</h2>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    {tasks.map(task => (
                                        <div key={task.id} style={{
                                            border: '1px solid #ddd',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            background: '#fff'
                                        }}>
                                            {/* Górna część: Nazwa i Termin */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '5px'
                                            }}>
                                                <strong style={{fontSize: '1.1rem'}}>{task.nazwa}</strong>
                                                <span style={{fontWeight: 'bold'}}>
                  {formatTermin(task.termin)}
                </span>
                                            </div>
                                            {/* Opis */}
                                            <p style={{margin: '5px 0'}}>{task.opis}</p>
                                            {/* Dolna część: Przypisany User i Przycisk Usuń */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: '5px'
                                                                            }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                    color: 'white',
                                                    background: task.assignedTo.kolor || '#808080'
                                                }}>
                                                  {task.assignedTo.email}
                                                </span>
                                                {/* --- NOWY PRZYCISK --- */}
                                                <DeleteTaskButton taskId={task.id}/>
                                                {/* -------------------- */}
                                            </div>
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <p>Brak zadań dla tego kontaktu.</p>}
                                </div>
                            </div>
                            <p style={{margin: '5px 0'}}>{task.opis}</p>
                            <span style={{
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                color: 'white',
                                background: task.assignedTo.kolor || '#808080'
                            }}>
                {task.assignedTo.email}
              </span>
                        </div>
                    ))}
                    {tasks.length === 0 && <p>Brak zadań dla tego kontaktu.</p>}
                </div>
            </div>

            {/* Kolumna prawa: Formularz dodawania */}
            <div style={{paddingTop: '50px'}}> {/* Dodany padding, aby formularz był niżej */}
                <AddTaskForm contactId={contact.id} users={users}/>
            </div>

        </div>
    )
}
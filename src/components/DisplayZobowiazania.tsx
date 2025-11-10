// src/components/DisplayZobowiazania.tsx
import React from 'react'
import { Prisma } from '@prisma/client'

interface Zobowiazania {
    zus?: string;
    us?: string;
    kredyty?: string;
    faktury?: string;
    inne?: string;
}

export default function DisplayZobowiazania({ data }: { data: Prisma.JsonValue | null | undefined }) {
    if (!data) return null;

    // Bezpieczne parsowanie danych
    const zobowiazania = data as Zobowiazania;

    // Sprawdzamy, czy którekolwiek pole ma wartość
    const hasData = Object.values(zobowiazania).some(val => val && val.length > 0);
    if (!hasData) return null;

    return (
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}>
            <legend>Zobowiązania</legend>
            {zobowiazania.zus && <p><strong>ZUS:</strong> {zobowiazania.zus}</p>}
            {zobowiazania.us && <p><strong>US:</strong> {zobowiazania.us}</p>}
            {zobowiazania.kredyty && <p><strong>Kredyty:</strong> {zobowiazania.kredyty}</p>}
            {zobowiazania.faktury && <p><strong>Faktury:</strong> {zobowiazania.faktury}</p>}
            {zobowiazania.inne && <p><strong>Inne:</strong> {zobowiazania.inne}</p>}
        </fieldset>
    )
}
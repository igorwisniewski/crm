// src/components/DisplayField.tsx
import React from 'react'

interface DisplayFieldProps {
    label: string;
    value: string | null | undefined;
}

// Prosty styl, aby pola były w jednej linii
const style = {
    padding: '5px 0',
    borderBottom: '1px solid #eee'
};

export default function DisplayField({ label, value }: DisplayFieldProps) {
    // Nie renderuj nic, jeśli nie ma wartości
    if (!value) {
        return null;
    }

    return (
        <div style={style}>
            <strong style={{ minWidth: '150px', display: 'inline-block' }}>{label}:</strong>
            <span>{value}</span>
        </div>
    )
}
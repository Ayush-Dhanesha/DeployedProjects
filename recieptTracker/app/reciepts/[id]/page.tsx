'use client';
import React from 'react';
import { useParams } from 'next/navigation';

function Reciept() {
    const params = useParams();
    const id = params.id;
    return (
        <div>Reciept: {id}</div>
    );
}

export default Reciept;
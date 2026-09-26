
"use client"

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// El reloj es el unico elemento del encabezado que cambia cada segundo. Va en
// JetBrains Mono con cifras tabulares (ver globals.css / tailwind.config.ts):
// en Roboto un reloj que se recompone cada tick empuja el layout.
export function LiveClock() {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const timeZone = 'Africa/Nouakchott';
        const tick = () => {
            const now = new Date();
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone });
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone, hour12: false });
            setCurrentTime(`${date}, ${time}`);
        };

        // Primer render sincrono: evita el hueco de un segundo en el que el
        // encabezado aparece sin reloj.
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!currentTime) {
        return null;
    }

    return (
        <div className="hidden items-center gap-1.5 rounded-md border border-wood bg-ink-2 px-2.5 py-1 xl:flex">
            <Clock className="h-3.5 w-3.5 shrink-0 text-parch-300" aria-hidden="true" />
            <time className="font-mono text-xs tabular-nums text-parch-200">{currentTime}</time>
        </div>
    );
}

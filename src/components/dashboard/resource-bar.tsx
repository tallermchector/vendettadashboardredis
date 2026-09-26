
'use client'

import type { UserWithProgress } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';
import { calculateStorageCapacity } from "@/lib/formulas/room-formulas";
import { cn } from "@/lib/utils";
import type { LucideIcon } from 'lucide-react';
import { Crosshair, CircleDot, Wine, Banknote } from 'lucide-react';

type ResourceKey = 'armas' | 'municion' | 'alcohol' | 'dolares';

type ResourceMeta = {
  /** Nombre completo. Visible solo con espacio para el (`lg`). */
  name: string;
  /** Acronimo de 3 letras para el rail angosto (`sm`). */
  short: string;
  icon: LucideIcon;
  value: number;
  capacity: number;
};

function formatNumber(num: number | undefined) {
    if (typeof num !== 'number') return '0';
    return Math.floor(num).toLocaleString('de-DE');
}

/** DESIGN.md "Resource Gauges & Meters" — el color del medidor es informacion:
 *  oro en rendimiento normal, ambar pasado el 80% de almacen, carmin pasado
 *  el 95% o por encima del techo fisico. */
function fillTone(percentage: number) {
    if (percentage > 95) return 'bg-crimson';
    if (percentage > 80) return 'bg-amber-500';
    return 'bg-gold';
}

function valueTone(percentage: number) {
    if (percentage > 95) return 'text-crimson-light';
    if (percentage > 80) return 'text-amber-400';
    return 'text-gold';
}

function percentageOf(value: number, capacity: number) {
    return capacity > 0 ? Math.min(100, (value / capacity) * 100) : 0;
}

interface ResourceBarProps {
    user: UserWithProgress | null;
}

export function ResourceBar({ user }: ResourceBarProps) {
    const { selectedProperty } = useProperty();

    if (!user || !selectedProperty) {
        return (
            <div className="flex min-w-0 flex-1 items-center border-l border-wood/60 pl-3">
                <p className="truncate text-[10px] uppercase tracking-[.14em] text-parch-400">
                    Selecciona una propiedad
                </p>
            </div>
        );
    }

    const capacity = calculateStorageCapacity(selectedProperty);

    const resources: ResourceMeta[] = [
        { name: 'Armas',    short: 'ARM', icon: Crosshair, value: selectedProperty.armas,    capacity: capacity.armas },
        { name: 'Munición', short: 'MUN', icon: CircleDot, value: selectedProperty.municion, capacity: capacity.municion },
        { name: 'Alcohol',  short: 'ALC', icon: Wine,      value: selectedProperty.alcohol,  capacity: capacity.alcohol },
        { name: 'Dólares',  short: 'DOL', icon: Banknote,  value: selectedProperty.dolares,  capacity: capacity.dolares },
    ];

    return (
        <div
            className="no-sb flex min-w-0 flex-1 items-center gap-1 overflow-x-auto border-l border-wood/60 pl-2 md:gap-3 md:pl-3"
            // Lectura por hovering del medidor completo: valor actual, techo y
            // porcentaje, sin Roboto (fuente tabular) en un numero que cambia.
            aria-label={`Recursos de ${selectedProperty.nombre}`}
        >
            {resources.map((res) => {
                const pct = percentageOf(res.value, res.capacity);
                const over = res.capacity > 0 && res.value > res.capacity;
                const Icon = res.icon;
                const tone = valueTone(pct);

                return (
                    <div
                        key={res.name}
                        className="min-w-0 shrink-0 sm:min-w-[4.5rem] sm:flex-1"
                        title={`${res.name}: ${formatNumber(res.value)} / ${formatNumber(res.capacity)}${over ? ' — por encima del techo' : ''}`}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1.5">
                            <span className={cn('hidden shrink-0 lg:inline', over ? 'text-crimson-light' : 'text-gold/80')}>
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="hidden text-[9px] font-bold uppercase leading-none tracking-[.14em] text-parch-400 lg:inline">
                                {res.name}
                            </span>
                            {/* Rail angosto: el nombre completo no cabe, y
                                "12500" sin unidad de contexto es un numero
                                suelto. El acronimo lo hace legible. */}
                            <span className="text-[8px] font-bold uppercase leading-none tracking-[.1em] text-parch-400/70 lg:hidden">
                                {res.short}
                            </span>
                            <span className={cn(
                                'font-mono text-[11px] font-bold tabular-nums leading-none whitespace-nowrap sm:text-xs lg:ml-auto lg:text-[11px] lg:leading-normal',
                                tone
                            )}>
                                {formatNumber(res.value)}
                            </span>
                        </div>
                        <div className="mt-0.5 h-[2px] overflow-hidden rounded-full bg-ink-1 md:mt-1 md:h-[3px]">
                            <div className={cn('h-full', fillTone(pct))} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

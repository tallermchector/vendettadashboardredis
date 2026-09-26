
'use client'

/**
 * Piezas compartidas por los cuatro paneles de cola.
 *
 * Las hojas de pergamino son LA FIRMA del sistema (.stitch/DESIGN.md): la unica
 * superficie que se invierte a papel con tinta de maquina. Se usan aqui y
 * solo aqui, con contencion. Si manchan mas superficies, dejan de significar
 * "esto es una orden en curso" y pasan a ser decoracion.
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/* ── Cuenta regresiva compartida ──────────────────────────────────────────── */

/** `HH:MM:SS`, con ceros a la izquierda. Nunca negativo. */
function formatCountdown(totalSeconds: number): string {
    const s = totalSeconds < 0 ? 0 : totalSeconds
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}

/**
 * Cuenta regresiva de una orden en curso.
 *
 * Existian cuatro copias de esto (construccion, reclutamiento, entrenamiento y
 * misiones) y las cuatro tenian el mismo defecto: `onFinish` llegaba como
 * funcion del padre, que en un re-render es una arrow nueva, asi que la
 * dependencia del `useEffect` cambiaba cada segundo y el intervalo se creaba y
 * se destruia sixty veces por minuto. Aqui el callback viaja en un ref: el
 * efecto depende solo de `endDate`.
 *
 * Un segundo de gracia antes de disparar `onFinish`. Las versiones anteriores
 * no coincidian entre si —reclutamiento disparaba en `difference <= 0`, es
 * decir en el ultimo segundo aun visible—; ahora las cuatro son la misma regla.
 *
 * El primer tick es sincrono: sin el, la celda nace vacia y el ancho de la hoja
 * salta un frame en cada montaje.
 */
export function useQueueCountdown(
    endDate: string | number | Date,
    onFinish?: () => void
): string {
    const [timeLeft, setTimeLeft] = useState(() => {
        const end = new Date(endDate).getTime()
        return formatCountdown(Math.floor((end - Date.now()) / 1000))
    })

    const finishRef = useRef(onFinish)
    useEffect(() => { finishRef.current = onFinish })

    useEffect(() => {
        const end = new Date(endDate).getTime()
        if (Number.isNaN(end)) {
            setTimeLeft('00:00:00')
            return
        }

        let fired = false
        const tick = () => {
            const difference = Math.floor((end - Date.now()) / 1000)
            setTimeLeft(formatCountdown(difference))
            if (difference < -1 && !fired) {
                fired = true
                finishRef.current?.()
            }
        }

        tick()
        const intervalId = setInterval(tick, 1000)
        return () => clearInterval(intervalId)
    }, [endDate])

    return timeLeft
}

/**
 * Cabecera del panel: titulo en Bebas Neue sobre madera, con el contador de
 * ranuras como chip monoespaciado. El titulo es texto, no un badge de estado:
 * el estado de cada orden vive en su propia fila.
 */
export function QueueHeader({ title, slots }: { title: string, slots: string }) {
    return (
        <div className="flex items-center justify-between gap-2 px-4 py-2">
            <h3 className="truncate font-heading text-lg leading-none tracking-wide text-parch-50">
                {title}
            </h3>
            <span className="shrink-0 rounded border border-wood bg-ink-1/60 px-2 py-0.5 font-mono text-xs font-bold text-parch-50 tabular-nums">
                ({slots})
            </span>
        </div>
    )
}

/** Estructura comun: cabecera sobre madera + hoja de pergamino. */
export function QueuePanel({ title, slots, className, children }: {
    title: string
    slots: string
    className?: string
    children: React.ReactNode
}) {
    return (
        <section className={cn('dossier overflow-hidden', className)}>
            <QueueHeader title={title} slots={slots} />
            <div className="parchment space-y-2.5 p-3">{children}</div>
        </section>
    )
}

/**
 * Estado vacio. No es un adorno: es la respuesta a "no tengo nada en marcha
 * aqui". Una raya sola no dice nada, asi que se nombra la cola y se dice que
 * este vacia.
 */
export function QueueEmpty({ children }: { children: React.ReactNode }) {
    return (
        <p className="py-1 text-center text-xs text-umber/60">
            {children}
        </p>
    )
}

/**
 * Fila de orden en curso: icono, que se esta haciendo, en que propiedad, y la
 * cuenta regresiva.
 *
 * La barra de 3px a la izquierda NO es decorativa: codifica el tipo de orden
 * con el mismo color que usan los iconos y que el jugador ya aprendio en las
 * demas pantallas. Es la unica lectura de la fila que no requiere leer texto,
 * asi que la fila tiene que ser legible escaneando solo las barras.
 */
export function QueueRow({ tone, icon, label, sub, tag, timer, action }: {
    /** Color de la barra de estado Y del icono, p. ej.
     *  `"border-l-emerald-400 text-emerald-400"`. Un solo parametro para que
     *  nunca puedan desincronizarse. */
    tone: string
    icon: React.ReactNode
    /** Que se esta haciendo. Umber, 13px, lo mas importante de la fila. */
    label: string
    /** Donde. Monoespaciado y atenuado: es contexto, no el titular. */
    sub: string
    /** Fase de la orden ("Llegada", "Obra", "Alistamiento"). */
    tag: string
    /** Cuenta regresiva. */
    timer: React.ReactNode
    /** Accion secundaria opcional (cancelar). */
    action?: React.ReactNode
}) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={cn('flex min-w-0 flex-1 items-center gap-2.5 border-l-[3px] pl-2.5', tone)}>
                <span className="shrink-0">{icon}</span>
                <div className="min-w-0 flex-1">
                    <p className="parchment-ink-strong truncate text-[13px] leading-tight">{label}</p>
                    <p className="parchment-ink-muted truncate font-mono text-[10px]">{sub}</p>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-[9px] uppercase tracking-[.14em] text-umber/50">{tag}</p>
                {timer}
            </div>
            {action}
        </div>
    )
}

/**
 * Cuenta regresiva. `text-crimson` sobre pergamino es el color de un sello de
 * tinta roja: la fila mas urgente de la hoja. Monoespaciada y con cifras
 * tabulares para que el ancho no cambie en cada tick.
 */
export function CountdownText({ time, muted = false }: { time: string, muted?: boolean }) {
    return (
        <p className={cn(
            'font-mono text-sm font-bold tabular-nums',
            muted ? 'text-umber' : 'parchment-ink-accent'
        )}>
            {time}
        </p>
    )
}

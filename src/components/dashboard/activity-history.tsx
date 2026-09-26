'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
    Building2,
    Users,
    Swords,
    FlaskConical,
    ShieldAlert,
    History,
    Clock,
    CheckCircle2,
    Compass,
    ExternalLink,
    Calendar,
    MapPin,
    ArrowUpRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ActivityItem, ActivityType, ActivityStatus } from '@/lib/data';

interface ActivityHistoryProps {
    activities: ActivityItem[];
}

function formatRelativeTime(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatExactDateTime(dateInput: Date | string): string {
    const date = new Date(dateInput);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Color por tipo de orden. Deliberadamente el MISMO color que usa la barra de
 * 3px de las colas de arriba: ambar = obra, esmeralda = reclutamiento, azul =
 * entrenamiento, carmin = guerra. Es el unico modo de que la vista general
 * funcione como un indice — se lee el color de un vistazo y se sabe de que
 * modulo hay que ir.
 *
 * `bar` e `ink` van separados porque aqui aterrizan en elementos distintos: la
 * barra en la fila, el color en el icono. En `QueueRow` viven juntos porque
 * alli comparten nodo. Unirlos aqui dejaria la barra sin pintar — un
 * `border-l-*` sobre un `<span>` que no la declara no hace nada.
 *
 * Nota de tinta: sobre pergamino los iconos van en tonos profundos, no en los
 * `-500`/-`400` de pantalla. Un ambar claro sobre papel no tiene contraste.
 *
 * SISTEMA baja a madera. El morado del original no existe en el sistema de
 * diseno, y un aviso del sistema no es una accion del jugador: no debe
 * competir en saturacion con una orden de guerra.
 */
const ACTIVITY_TONES: Record<ActivityType, {
    label: string;
    icon: LucideIcon;
    /** Color de la barra de 3px de la fila. */
    bar: string;
    /** Color del icono. */
    ink: string;
    route: string;
    routeLabel: string;
}> = {
    CONSTRUCCION:  { label: 'Construcción',    icon: Building2,    bar: 'border-l-amber-600',   ink: 'text-amber-700',       route: '/rooms',      routeLabel: 'Ir a habitaciones' },
    RECLUTAMIENTO: { label: 'Reclutamiento',   icon: Users,        bar: 'border-l-emerald-700', ink: 'text-emerald-800',    route: '/recruitment', routeLabel: 'Ir a reclutamiento' },
    ATAQUE:        { label: 'Ataques',         icon: Swords,       bar: 'border-l-crimson',     ink: 'text-crimson-deep',   route: '/missions',   routeLabel: 'Ir a misiones' },
    ENTRENAMIENTO: { label: 'Investigación',   icon: FlaskConical, bar: 'border-l-blue-700',    ink: 'text-blue-800',       route: '/training',   routeLabel: 'Ir a entrenamiento' },
    SISTEMA:       { label: 'Sistema',         icon: ShieldAlert,  bar: 'border-l-umber/25',    ink: 'text-umber-lighter',  route: '/messages',   routeLabel: 'Ir a mensajes' },
};

/** Orden de las pestañas. `TODAS` no es un tipo: es la ausencia de filtro. */
const TABS = ['TODAS', 'CONSTRUCCION', 'RECLUTAMIENTO', 'ATAQUE', 'ENTRENAMIENTO'] as const;
type TabKey = typeof TABS[number];

/**
 * Estado del asiento. Sobre pergamino el color va en tinta, no en luz: un
 * sello carmin profundo (`crimson-deep`) es un tampón de tinta, no un LED.
 * COMPLETADO se apaga a umber porque una orden cerrada ya no exige atención.
 */
const STATUS_TONES: Record<ActivityStatus, { label: string, icon: LucideIcon, className: string }> = {
    COMPLETADO: { label: 'Completado', icon: CheckCircle2, className: 'text-umber/70' },
    EN_CURSO:   { label: 'En curso',   icon: Clock,         className: 'text-gold-deep' },
    DESPLEGADO: { label: 'Desplegado', icon: Compass,       className: 'text-crimson-deep' },
};

function StatusStamp({ status }: { status: ActivityStatus }) {
    const { label, icon: Icon, className } = STATUS_TONES[status];
    return (
        <span className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[.1em]', className)}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {label}
        </span>
    );
}

/** Pestaña de filtro. Una sola implementacion para las cinco secciones. */
function FilterTab({ id, selected, count, icon: Icon, children, onClick }: {
    id: string;
    selected: boolean;
    count: number;
    icon?: LucideIcon;
    children: string;
    onClick: () => void;
}) {
    return (
        <button
            id={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={onClick}
            className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
                selected
                    ? 'border-gold/60 bg-gold/15 text-gold-light'
                    : 'border-transparent text-parch-400 hover:bg-ink-1 hover:text-parch-200'
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {children}
            <span className={cn(
                'rounded px-1 font-mono text-[10px] tabular-nums',
                selected ? 'bg-gold/25 text-gold-light' : 'bg-ink-1 text-parch-400'
            )}>
                {count}
            </span>
        </button>
    );
}

export function ActivityHistoryCard({ activities }: ActivityHistoryProps) {
    const [selectedTab, setSelectedTab] = useState<TabKey>('TODAS');
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false);

    // Una sola pasada en vez de seis `filter` sobre el mismo array (uno por
    // conteo, otro por el filtro activo).
    const counts = activities.reduce<Record<string, number>>((acc, a) => {
        acc.TODAS = (acc.TODAS ?? 0) + 1;
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
    }, {});

    const filteredActivities = selectedTab === 'TODAS'
        ? activities
        : activities.filter(a => a.type === selectedTab);

    const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 6);

    const activeConfig = selectedActivity ? ACTIVITY_TONES[selectedActivity.type] : null;

    return (
        <div id="activity-history-card" className="dossier anim-view overflow-hidden">
            <div className="ribbon ribbon-gold" />

            {/* Cabecera del libro mayor */}
            <div className="flex flex-col gap-2 border-b border-wood p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border-2 border-wood bg-ink-1 text-gold">
                        <History className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="flex items-center gap-2 font-heading text-lg leading-none text-parch-50">
                            Libro mayor
                            <span className="rounded border border-wood bg-ink-1 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-parch-300">
                                {activities.length}
                            </span>
                        </h3>
                        <p className="mt-1 text-[11px] text-parch-400">
                            Ordenes iniciadas y cerradas por la casa
                        </p>
                    </div>
                </div>

                <Button asChild variant="outline" size="sm" className="h-8 shrink-0 self-start font-heading text-xs uppercase tracking-wider sm:self-auto">
                    <Link href="/messages?categoria=CONSTRUCCION">
                        Mensajes
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>

            {/* Filtros */}
            <div className="no-sb flex items-center gap-1 overflow-x-auto border-b border-wood px-3 py-2" role="tablist" aria-label="Filtrar el libro mayor">
                {TABS.map(tab => (
                    <FilterTab
                        key={tab}
                        id={`tab-${tab.toLowerCase()}`}
                        selected={selectedTab === tab}
                        count={counts[tab] ?? 0}
                        icon={tab === 'TODAS' ? undefined : ACTIVITY_TONES[tab].icon}
                        onClick={() => { setSelectedTab(tab); setShowAll(false); }}
                    >
                        {tab === 'TODAS' ? 'Todas' : ACTIVITY_TONES[tab].label}
                    </FilterTab>
                ))}
            </div>

            {/* ── Hoja del libro mayor ───────────────────────────────────────
                DESIGN.md "Physical Paperwork": un libro de asientos es papel.
                No es una excepcion a la regla de las colas, es la misma regla:
                el pergamino significa "esto es una orden, con su nombre y su
                sello". Por eso las filas repiten la barra de 3px de QueueRow. */}
            <div className="p-3">
                {displayedActivities.length === 0 ? (
                    <div className="parchment flex flex-col items-center gap-3 px-6 py-10 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-umber/30 text-umber/50">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="parchment-ink-strong text-sm">El libro esta en blanco</p>
                            <p className="parchment-ink-muted mt-1 max-w-sm text-xs leading-relaxed">
                                Las ordenes que inicies y finalices quedan asentadas aqui automaticamente.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                            <Button asChild variant="outline" size="sm" className="h-8 font-heading text-xs uppercase tracking-wider">
                                <Link href="/rooms">Construir</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="h-8 font-heading text-xs uppercase tracking-wider">
                                <Link href="/recruitment">Reclutar</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="h-8 font-heading text-xs uppercase tracking-wider">
                                <Link href="/map">Explorar mapa</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="parchment space-y-2.5 p-3">
                        {displayedActivities.map((activity) => {
                            const config = ACTIVITY_TONES[activity.type];
                            const Icon = config.icon;

                            return (
                                <button
                                    type="button"
                                    id={`activity-item-${activity.id}`}
                                    key={activity.id}
                                    onClick={() => setSelectedActivity(activity)}
                                    className={cn(
                                        'group flex w-full items-start justify-between gap-3 border-l-[3px] pl-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-crimson',
                                        config.bar
                                    )}
                                >
                                    <div className="flex min-w-0 items-start gap-2.5">
                                        <span className={cn('mt-0.5 shrink-0', config.ink)}>
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className="parchment-ink-strong truncate text-[13px] leading-tight">{activity.title}</span>
                                                <StatusStamp status={activity.status} />
                                            </div>
                                            <p className="parchment-ink-muted line-clamp-1 text-[11px]">
                                                {activity.description}
                                            </p>
                                            {(activity.propertyName || activity.coordinates) && (
                                                <div className="flex items-center gap-2 pt-0.5 font-mono text-[10px] text-umber/55">
                                                    {activity.propertyName && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" aria-hidden="true" />
                                                            {activity.propertyName}
                                                        </span>
                                                    )}
                                                    {activity.coordinates && <span>{activity.coordinates}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-0.5 pl-2">
                                        <span
                                            className="whitespace-nowrap font-mono text-[10px] text-umber/55"
                                            title={formatExactDateTime(activity.timestamp)}
                                        >
                                            {formatRelativeTime(activity.timestamp)}
                                        </span>
                                        <ArrowUpRight
                                            className="h-3 w-3 text-umber/30 opacity-0 transition-opacity group-hover:opacity-100"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">Ver detalle de {activity.title}</span>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredActivities.length > 6 && (
                            <div className="pt-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowAll(!showAll)}
                                    aria-expanded={showAll}
                                    className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-[.1em] text-umber/60 transition-colors hover:bg-umber/10 hover:text-umber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-umber"
                                >
                                    {showAll ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
                                    {showAll
                                        ? 'Mostrar menos'
                                        : `Ver las ${filteredActivities.length} asientos`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Ficha del asiento */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                {selectedActivity && activeConfig && (
                    <DialogContent className="border-2 border-wood bg-card sm:max-w-md">
                        <DialogHeader>
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className={cn('rounded border border-umber/30 bg-ink-1 p-1.5', activeConfig.ink)}>
                                    <activeConfig.icon className="h-4 w-4" />
                                </span>
                                <span className="eyebrow">{activeConfig.label}</span>
                                <StatusStamp status={selectedActivity.status} />
                            </div>
                            <DialogTitle className="font-heading text-xl leading-tight text-parch-50">
                                {selectedActivity.title}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-1.5 pt-1 font-mono text-[11px] text-parch-400">
                                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                {formatExactDateTime(selectedActivity.timestamp)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-1">
                            <div className="parchment p-3 text-xs leading-relaxed">
                                <p className="parchment-ink">{selectedActivity.description}</p>
                            </div>

                            {(selectedActivity.propertyName || selectedActivity.coordinates) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedActivity.propertyName && (
                                        <div className="rounded border border-wood bg-ink-1 p-2.5">
                                            <span className="eyebrow block">Propiedad</span>
                                            <span className="mt-0.5 block text-sm text-parch-100">{selectedActivity.propertyName}</span>
                                        </div>
                                    )}
                                    {selectedActivity.coordinates && (
                                        <div className="rounded border border-wood bg-ink-1 p-2.5">
                                            <span className="eyebrow block">Coordenadas</span>
                                            <span className="mt-0.5 block font-mono text-sm text-gold">{selectedActivity.coordinates}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 border-t border-wood pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedActivity(null)}
                                    className="h-8 font-heading text-xs uppercase tracking-wider"
                                >
                                    Cerrar
                                </Button>

                                <Button asChild size="sm" className="h-8 gap-1 font-heading text-xs uppercase tracking-wider">
                                    <Link href={activeConfig.route}>
                                        {activeConfig.routeLabel}
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

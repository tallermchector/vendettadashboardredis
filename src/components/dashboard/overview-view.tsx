
import { getSessionUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Users2, UserPlus } from "lucide-react";
import { QueueStatusCard } from "./queue-status-card";
import { ActivityHistoryCard } from "./activity-history";
import { CityNewsCard } from "./city-news-ticker";
import { PropertyPlate } from "./property-plate";
import { getRoomConfigurations, getUserActivityHistory } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

/**
 * Accesos directos. Antes vivian flotando sobre la tarjeta de familia, con un
 * badge de 4x4 px: cualquier cantidad de dos digitos se cortaba a la mitad.
 * Ahora el badge es un pastilla de ancho minimo, y los tres botones comparten
 * un unico TooltipProvider en vez de uno por boton.
 */
function ActionIcons({ unreadMessages, inFamily }: { unreadMessages: number, inFamily: boolean }) {
    const actions = [
        { href: "/messages?categoria=SISTEMA", icon: <Bell className="h-4 w-4" />, notification: 0, label: "Notificaciones del sistema" },
        { href: "/messages", icon: <MessageSquare className="h-4 w-4" />, notification: unreadMessages, label: unreadMessages > 0 ? `Mensajes, ${unreadMessages} sin leer` : "Mensajes" },
        { href: "/family", icon: inFamily ? <Users2 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />, notification: 0, label: inFamily ? "Familia" : "Unirse o crear familia" },
    ]

    return (
        <TooltipProvider delayDuration={0}>
            <div className="absolute right-3 top-3 flex flex-col items-center gap-2">
                {actions.map((action) => (
                    <Tooltip key={action.href + action.label}>
                        <TooltipTrigger asChild>
                            <Button
                                asChild
                                variant="outline"
                                size="icon"
                                className="relative h-9 w-9 border-white/15 bg-ink-1/60 text-parch-100 hover:border-crimson hover:bg-crimson/30 hover:text-parch-50"
                            >
                                <Link href={action.href}>
                                    {action.icon}
                                    <span className="sr-only">{action.label}</span>
                                    {action.notification > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-crimson-light bg-crimson px-1 font-mono text-[9px] font-bold leading-none text-parch-50 tabular-nums">
                                            {action.notification > 99 ? "99+" : action.notification}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                            {action.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    )
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

/**
 * Barra de puntos. Los numeros van en JetBrains Mono con cifras tabulares: son
 * datos contables, y en una sans con cifras proporcionales un "1.234" que
 * aparece y desaparece cada vez que la puntuacion sube desplaza toda la fila.
 *
 * Cada etiqueta tiene tres escalas porque el nombre completo no cabe en un
 * renglon de cinco celdas y abreviado a "Puntos (Edificios)" es incomprensible:
 * por debajo de `sm` se queda solo con el inicial.
 */
type StatCell = readonly [full: string, mid: string, short: string, value: string];

function StatBar({ cells }: { cells: readonly StatCell[] }) {
    return (
        <div className="dossier overflow-hidden">
            <div className="ribbon ribbon-crimson-gold" />
            <div className="flex items-center gap-x-1 p-2 sm:gap-x-4 sm:p-3">
                {cells.map(([full, mid, short, value], i) => (
                    <div key={full} className="flex min-w-0 flex-1 items-center gap-x-1 sm:gap-x-4">
                        {i > 0 && <div className="h-5 w-px shrink-0 bg-wood/70 sm:h-8" aria-hidden="true" />}
                        <div className="min-w-0 flex-1 text-center">
                            <p className="whitespace-nowrap text-[8px] font-bold uppercase leading-none tracking-[.08em] text-parch-400/80 sm:text-[9px] sm:tracking-[.12em] xl:text-[10px]">
                                <span className="sm:hidden">{short}</span>
                                <span className="hidden sm:inline xl:hidden">{mid}</span>
                                <span className="hidden xl:inline">{full}</span>
                            </p>
                            <p className="mt-1 font-heading text-[15px] leading-none text-gold tabular-nums sm:text-lg lg:text-xl xl:text-2xl">
                                {value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export async function OverviewView() {
    const user = await getSessionUser();

    if (!user) {
        return <div>Usuario no encontrado.</div>
    }

    const { puntuacion, familyMember } = user;
    const [allRoomConfigs, activities] = await Promise.all([
        getRoomConfigurations(),
        getUserActivityHistory(user.id)
    ]);
    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre }));
    const unreadMessages = user._count?.receivedMessages || 0;

    const stats: readonly StatCell[] = [
        ['Puntos (Entrenamiento)', 'Entrenamiento', 'ENT', formatPoints(puntuacion?.puntosEntrenamientos)],
        ['Puntos (Edificios)', 'Edificios', 'EDI', formatPoints(puntuacion?.puntosHabitaciones)],
        ['Puntos (Tropas)', 'Tropas', 'TRO', formatPoints(puntuacion?.puntosTropas)],
        ['Propiedades', 'Propiedades', 'PRO', String(user.propiedades.length)],
        ['Lealtad', 'Lealtad', 'LEA', '99%'],
    ];

    return (
        <div className="anim-view mx-auto w-full max-w-7xl space-y-4 px-4 py-4 md:px-6 md:py-5">

            {/* ── Identidad del imperio ──────────────────────────────────────
                Tres modulos, misma altura, cada uno con su cinta de acento:
                carmin = vos, oro = familia. La placa cartografica del centro
                la aporta PropertyPlate (cliente) para seguir la propiedad
                seleccionada. */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                <div className="dossier anim-view overflow-hidden">
                    <div className="ribbon ribbon-crimson" />
                    <div className="flex h-full items-center gap-4 p-4">
                        <Avatar className="h-16 w-16 shrink-0 border-2 border-crimson">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="eyebrow mb-1">Jugador</p>
                            <p className="truncate font-heading text-2xl leading-none text-parch-50">{user.name}</p>
                            <p className="mt-1.5 truncate text-[11px] text-parch-400">{user.title ?? 'Capo'}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <PropertyPlate />
                </div>

                <div className="dossier anim-view relative overflow-hidden">
                    <div className="ribbon ribbon-gold" />
                    <ActionIcons unreadMessages={unreadMessages} inFamily={!!familyMember} />

                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-4 pt-16">
                        {familyMember ? (
                            <>
                                <Avatar className="h-24 w-24 shrink-0 border-2 border-gold">
                                    <AvatarImage src={familyMember.family.avatarUrl || ''} alt={familyMember.family.name} data-ai-hint="family crest" />
                                    <AvatarFallback>{familyMember.family.tag}</AvatarFallback>
                                </Avatar>
                                <p className="eyebrow mt-1">Familia</p>
                                <p className="text-center font-heading text-2xl leading-none text-parch-50">{familyMember.family.name}</p>
                                {/* Chip de coordenadas, en madera profunda con
                                    texto dorado (--secondary / --secondary-foreground). */}
                                <Badge variant="secondary" className="mt-1 rounded border border-wood px-2 py-0.5 font-mono text-[10px] font-medium">
                                    [{familyMember.family.tag}]
                                </Badge>
                            </>
                        ) : (
                            <>
                                <Users2 className="h-16 w-16 text-parch-400" aria-hidden="true" />
                                <p className="eyebrow mt-1">Sin familia</p>
                                <p className="max-w-[28ch] text-center text-sm leading-snug text-parch-300">
                                    Unite a una familia o fundá la tuya: territorio
                                    compartido, parte del botín y prioridad en los
                                    enlaces.
                                </p>
                                <Button asChild size="sm" className="mt-1 font-heading uppercase tracking-wider">
                                    <Link href="/family">Unirse o crear</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Colas de estado ───────────────────────────────────────────
                Primer bloque bajo la identidad a proposito: son las cuatro
                cuentas regresivas de la pagina, lo unico que cambia cada
                segundo. Estaban debajo del teletipo, que es informativo y
                estatico, asi que quedaban fuera de pantalla en movil. */}
            <QueueStatusCard user={user} allRooms={simpleRoomConfigs} />

            <CityNewsCard />

            <ActivityHistoryCard activities={activities} />

            <StatBar cells={stats} />
        </div>
    );
}


'use client'

import type { ColaMisiones } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeftRight, Check, Shield, Swords, Undo2, X } from "lucide-react";
import { cancelarMision } from "@/lib/actions/cancel-mission.action";
import { useToast } from "@/hooks/use-toast";
import { CountdownText, QueueEmpty, QueuePanel, QueueRow } from "./queue-panel";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

type MissionStatusProps = {
    missions: ColaMisiones[];
};

// El color de la barra de la fila es el del icono: carmin = ataque (hostil),
// azul = defensa, verde = transporte, ambar = espionaje, oro = ocupar,
// gris = regreso. La retirada no compite por la atencion con un ataque en
// curso, asi que se apaga.
const missionTones: { [key: string]: { tone: string, icon: React.ReactNode } } = {
    ATAQUE:    { tone: 'border-l-crimson text-crimson',        icon: <Swords className="h-4 w-4" /> },
    DEFENDER:  { tone: 'border-l-blue-500 text-blue-500',      icon: <Shield className="h-4 w-4" /> },
    TRANSPORTE:{ tone: 'border-l-emerald-500 text-emerald-500',icon: <ArrowLeftRight className="h-4 w-4" /> },
    ESPIONAJE: { tone: 'border-l-amber-500 text-amber-500',    icon: <ArrowLeftRight className="h-4 w-4" /> },
    OCUPAR:    { tone: 'border-l-gold text-gold',              icon: <Check className="h-4 w-4" /> },
    REGRESO:   { tone: 'border-l-umber/30 text-umber/50',      icon: <Undo2 className="h-4 w-4" /> },
};

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

/**
 * `ColaMisiones.tropas` es un JSON crudo `{ id, cantidad }[]` escrito dentro de
 * la columna de texto. Cuantas tropas viajan bajo la bandera no sale del
 * schema, asi que se deriva. Un parseo fallido no puede tumbar el panel de
 * cola —degrada a null y la fila dice "Flota en ruta"—, asi que esta funcion
 * no lanza nunca.
 */
function troopStrength(tropas: string): string | null {
    try {
        const parsed: unknown = JSON.parse(tropas);
        if (!Array.isArray(parsed)) return null;
        const total = parsed.reduce(
            (sum, entry) => sum + (Number((entry as { cantidad?: unknown })?.cantidad) || 0),
            0
        );
        return total > 0 ? `${total} ${total === 1 ? 'tropo' : 'tropos'}` : null;
    } catch {
        return null;
    }
}

function MissionCountdown({ mission }: { mission: ColaMisiones }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [status, setStatus] = useState<{label: string, endDate: Date | null, timeLeft: string}>({
        label: "Calculando...",
        endDate: null,
        timeLeft: ""
    });

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            
            let currentLabel = "Llegando";
            let currentEndDate: number | null = mission.fechaLlegada?.getTime();

            if (mission.tipoMision === 'REGRESO') {
                currentLabel = "Regresando";
                currentEndDate = mission.fechaRegreso?.getTime() || null;
            } else if (now > mission.fechaLlegada.getTime()) {
                if (mission.fechaRegreso) {
                    currentLabel = "Regresando";
                    currentEndDate = mission.fechaRegreso.getTime();
                } else {
                    setStatus({ label: "Finalizada", endDate: null, timeLeft: "" });
                    router.refresh();
                    return;
                }
            }
            
            if (!currentEndDate) {
                setStatus({ label: "Completada", endDate: null, timeLeft: "" });
                 router.refresh();
                return;
            }

            const difference = Math.floor((currentEndDate - now) / 1000);
            
            if (difference < -2) { // Allow a 2-second grace period
                setStatus({ label: "Completada", endDate: null, timeLeft: "" });
                router.refresh();
            } else {
                setStatus({ label: currentLabel, endDate: new Date(currentEndDate), timeLeft: formatTime(difference) });
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);

    }, [mission, router]);

    const handleCancel = () => {
        startTransition(async () => {
            const result = await cancelarMision(mission.id);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Misión cancelada', description: result.success });
            }
        });
    };

    if (!status.endDate && mission.tipoMision !== 'REGRESO') return null;

    const { tone, icon } = missionTones[mission.tipoMision] ?? missionTones.REGRESO;
    const isReturning = mission.tipoMision === 'REGRESO' || status.label === "Regresando";
    const canCancel = mission.tipoMision !== 'REGRESO' && new Date() < new Date(mission.fechaLlegada);

    return (
        <QueueRow
            tone={tone}
            icon={icon}
            label={`${mission.tipoMision} a ${mission.destinoCiudad}:${mission.destinoBarrio}:${mission.destinoEdificio}`}
            sub={isReturning
                ? "Flota en retirada"
                : troopStrength(mission.tropas) ?? "Flota en ruta"}
            tag={status.label}
            // Una retirada no es una cuenta regresiva urgente: el carmin queda
            // reservado a lo que se puede cambiar (un ataque que llega).
            timer={<CountdownText time={status.timeLeft} muted={isReturning} />}
            action={canCancel ? (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-umber/50 transition-colors hover:bg-crimson/15 hover:text-crimson focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-crimson"
                            disabled={isPending}
                        >
                            <X className="h-3.5 w-3.5" />
                            <span className="sr-only">Cancelar misión a {mission.destinoCiudad}:{mission.destinoBarrio}:{mission.destinoEdificio}</span>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar misión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La flota regresará a su propiedad de origen. El viaje de vuelta tardará lo mismo que tardó en llegar. No hay forma de acelerar el regreso.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>No, continuar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} disabled={isPending}>
                            {isPending ? 'Cancelando…' : 'Sí, cancelar misión'}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : undefined}
        />
    );
}


export function MissionStatus({ missions }: MissionStatusProps) {
    return (
        <QueuePanel title="Misiones" slots={`${missions.length}/1`}>
            {missions.length > 0 ? (
                missions.map(mission => (
                    <MissionCountdown key={mission.id} mission={mission} />
                ))
            ) : (
                <QueueEmpty>Ninguna flota en movimiento.</QueueEmpty>
            )}
        </QueuePanel>
    )
}

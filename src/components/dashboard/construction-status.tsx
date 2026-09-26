
'use client'

import type { ColaConstruccion } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Hammer } from "lucide-react";
import { CountdownText, QueueEmpty, QueuePanel, QueueRow, useQueueCountdown } from "./queue-panel";

type ConstructionStatusProps = {
    constructions: (ColaConstruccion & { propiedadNombre: string })[];
    totalSlots: number;
    allRooms: { id: string; nombre: string; }[];
};

/** Un item sin habitacion resuelta o sin fecha no se puede mostrar: se omite. */
function ConstructionCountdown({ item, roomName, endDate }: {
    item: ColaConstruccion & { propiedadNombre: string },
    roomName: string,
    endDate: Date,
}) {
    const router = useRouter();
    // `router.refresh` es estable, asi que el intervalo del hook no se recrea
    // en cada tick. Ver la nota de useQueueCountdown.
    const timeLeft = useQueueCountdown(endDate, () => router.refresh());

    return (
        <QueueRow
            tone="border-l-amber-600 text-amber-600"
            icon={<Hammer className="h-4 w-4" />}
            label={`${roomName} · Nvl ${item.nivelDestino}`}
            sub={item.propiedadNombre}
            tag="Obra"
            timer={<CountdownText time={timeLeft} />}
        />
    )
}

export function ConstructionStatus({ constructions, totalSlots, allRooms }: ConstructionStatusProps) {
    // Las habitaciones se resuelven una vez por render en vez de un `find` por
    // fila: la lista es corta pero `allRooms` no lo es, y `find` es O(n·m).
    const roomsById = new Map(allRooms.map(r => [r.id, r.nombre]));

    return (
        <QueuePanel title="Obras" slots={`${constructions.length}/${totalSlots}`}>
            {constructions.length > 0 ? (
                constructions.map(item => {
                    const roomName = roomsById.get(item.habitacionId);
                    if (!roomName || !item.fechaFinalizacion) return null;
                    return (
                        <ConstructionCountdown
                            key={item.id}
                            item={item}
                            roomName={roomName}
                            endDate={new Date(item.fechaFinalizacion)}
                        />
                    )
                })
            ) : (
                <QueueEmpty>Ninguna habitacion en obra.</QueueEmpty>
            )}
        </QueuePanel>
    )
}

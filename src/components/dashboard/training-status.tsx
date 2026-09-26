
'use client'

import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import type { FullColaEntrenamiento } from "@/lib/data";
import { CountdownText, QueueEmpty, QueuePanel, QueueRow, useQueueCountdown } from "./queue-panel";

type TrainingStatusProps = {
    trainings: FullColaEntrenamiento[];
    totalSlots: number;
};

function TrainingCountdown({ item }: { item: FullColaEntrenamiento }) {
    const router = useRouter();
    const timeLeft = useQueueCountdown(item.fechaFinalizacion, () => router.refresh());

    return (
        <QueueRow
            tone="border-l-blue-600 text-blue-600"
            icon={<Dumbbell className="h-4 w-4" />}
            label={`${item.entrenamiento.nombre} · Nvl ${item.nivelDestino}`}
            sub={item.propiedad.nombre}
            tag="Entrenamiento"
            timer={<CountdownText time={timeLeft} />}
        />
    )
}

export function TrainingStatus({ trainings, totalSlots }: TrainingStatusProps) {
    return (
        <QueuePanel title="Entrenamiento" slots={`${trainings.length}/${totalSlots}`}>
            {trainings.length > 0 ? (
                trainings.map(item => (
                    <TrainingCountdown key={item.id} item={item} />
                ))
            ) : (
                <QueueEmpty>Nadie en el campo de tiro.</QueueEmpty>
            )}
        </QueuePanel>
    )
}

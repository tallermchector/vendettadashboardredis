
'use client'

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { FullColaReclutamiento } from "@/lib/data";
import { CountdownText, QueueEmpty, QueuePanel, QueueRow, useQueueCountdown } from "./queue-panel";

type RecruitmentStatusProps = {
    recruitments: (FullColaReclutamiento & { propiedadNombre: string })[];
    totalSlots: number;
};

function RecruitmentCountdown({ item }: { item: FullColaReclutamiento & { propiedadNombre: string } }) {
    const router = useRouter();
    const timeLeft = useQueueCountdown(item.fechaFinalizacion, () => router.refresh());

    return (
        <QueueRow
            tone="border-l-emerald-600 text-emerald-600"
            icon={<Users className="h-4 w-4" />}
            label={`${item.cantidad} × ${item.tropaConfig.nombre}`}
            sub={item.propiedadNombre}
            tag="Alistamiento"
            timer={<CountdownText time={timeLeft} />}
        />
    )
}

export function RecruitmentStatus({ recruitments, totalSlots }: RecruitmentStatusProps) {
    return (
        <QueuePanel title="Reclutamiento" slots={`${recruitments.length}/${totalSlots}`}>
            {recruitments.length > 0 ? (
                recruitments.map(item => (
                    <RecruitmentCountdown key={item.id} item={item} />
                ))
            ) : (
                <QueueEmpty>Ningun soldado en el cuartel.</QueueEmpty>
            )}
        </QueuePanel>
    )
}

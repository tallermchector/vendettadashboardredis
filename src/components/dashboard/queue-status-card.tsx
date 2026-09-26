
'use client';

import type { UserWithProgress } from '@/lib/data';
import { MissionStatus } from './mission-status';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';
import { TrainingStatus } from './training-status';

type QueueCardProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
};

export function QueueStatusCard({ user, allRooms }: QueueCardProps) {

    // Filtra para obtener solo las construcciones que están activamente en cuenta regresiva.
    const activeConstructions = user.propiedades
        .flatMap(p =>
            p.colaConstruccion.map(c => ({ ...c, propiedadNombre: p.nombre }))
        )
        .filter(c => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());

    const activeRecruitments = user.propiedades
        .filter(p => p.colaReclutamiento)
        .map(p => ({ ...p.colaReclutamiento!, propiedadNombre: p.nombre }));

    return (
        // Las cuatro colas comparten la retícula de dos columnas desde `md`.
        // Antes era una sola columna de ancho completo: cuatro paneles
        // apilados de 1280px, cada uno con una sola etiqueta de texto y una
        // cuenta regresiva, separados por metros de pergamino vacio. En dos
        // columnas la hoja tiene ancho util para su contenido y dos colas
        // quedan visibles a la vez.
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MissionStatus missions={user.misiones} />
            <ConstructionStatus constructions={activeConstructions} totalSlots={user.propiedades.length * 5} allRooms={allRooms} />
            <RecruitmentStatus recruitments={activeRecruitments} totalSlots={user.propiedades.length} />
            <TrainingStatus trainings={user.colaEntrenamientos} totalSlots={user.propiedades.length} />
        </div>
    );
}

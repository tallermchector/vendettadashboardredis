
'use client';

import type { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, HabitacionUsuario, EntrenamientoUsuario } from "@prisma/client";
import { UserWithProgress } from "@/lib/data";
import { StatTableCard } from "./stat-table-card";

interface TroopStat {
    userId: string;
    total: number;
    configuracionTropaId: string;
}

interface ResourceStat {
    name: string;
    maxValue: number;
}

interface StatisticsViewProps {
    currentUser: UserWithProgress;
    allRoomConfigs: ConfiguracionHabitacion[];
    allTrainingConfigs: ConfiguracionEntrenamiento[];
    allTroopConfigs: ConfiguracionTropa[];
    roomStats: HabitacionUsuario[];
    trainingStats: EntrenamientoUsuario[];
    troopStats: TroopStat[];
    resourceStats: ResourceStat[];
}

export function StatisticsView({
    currentUser,
    allRoomConfigs,
    allTrainingConfigs,
    allTroopConfigs,
    roomStats,
    trainingStats,
    troopStats,
    resourceStats
}: StatisticsViewProps) {

    // Process room stats
    const maxRoomLevels = new Map<string, number>();
    roomStats.forEach(stat => {
        const currentMax = maxRoomLevels.get(stat.configuracionHabitacionId) || 0;
        if (stat.nivel > currentMax) {
            maxRoomLevels.set(stat.configuracionHabitacionId, stat.nivel);
        }
    });

    const currentUserRoomLevels = new Map<string, number>();
    currentUser.propiedades.forEach(p => {
        p.habitaciones.forEach(h => {
            const currentLevel = currentUserRoomLevels.get(h.configuracionHabitacionId) || 0;
            if (h.nivel > currentLevel) {
                 currentUserRoomLevels.set(h.configuracionHabitacionId, h.nivel);
            }
        });
    });

    const roomStatData = allRoomConfigs.map(config => ([
        config.nombre,
        currentUserRoomLevels.get(config.id) || 0,
        maxRoomLevels.get(config.id) || 0,
    ]));

    // Process training stats
    const maxTrainingLevels = new Map<string, number>();
    trainingStats.forEach(stat => {
        const currentMax = maxTrainingLevels.get(stat.configuracionEntrenamientoId) || 0;
        if (stat.nivel > currentMax) {
            maxTrainingLevels.set(stat.configuracionEntrenamientoId, stat.nivel);
        }
    });
    const currentUserTrainingLevels = new Map(currentUser.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
    
    const trainingStatData = allTrainingConfigs.map(config => ([
        config.nombre,
        currentUserTrainingLevels.get(config.id) || 0,
        maxTrainingLevels.get(config.id) || 0,
    ]));

    // Process troop stats
    const maxTroopCounts = new Map<string, number>();
    troopStats.forEach(stat => {
        const currentMax = maxTroopCounts.get(stat.configuracionTropaId) || 0;
        if (stat.total > currentMax) {
            maxTroopCounts.set(stat.configuracionTropaId, stat.total);
        }
    });

    const currentUserTroopCounts = new Map<string, number>();
    troopStats.filter(t => t.userId === currentUser.id).forEach(t => {
        currentUserTroopCounts.set(t.configuracionTropaId, t.total);
    });

    const troopStatData = allTroopConfigs.map(config => ([
        config.nombre,
        currentUserTroopCounts.get(config.id) || 0,
        maxTroopCounts.get(config.id) || 0,
    ]));

    const resourceStatData = resourceStats.map(stat => ([
        stat.name,
        stat.maxValue
    ]));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Estadísticas Globales</h2>
                    <p className="text-muted-foreground">
                        Compara tu progreso con los mejores jugadores del servidor.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatTableCard title="ESTADÍSTICAS DE RECURSOS" headers={['Recurso', 'Máximo por edificio']} data={resourceStatData} />
                <StatTableCard title="ESTADÍSTICAS DE HABITACIONES" headers={['Habitación', 'Mi Nivel', 'Nivel Máximo']} data={roomStatData} />
                <StatTableCard title="ESTADÍSTICAS DE ENTRENAMIENTOS" headers={['Entrenamiento', 'Mi Nivel', 'Nivel Máximo']} data={trainingStatData} />
                <StatTableCard title="ESTADÍSTICAS DE TROPAS" headers={['Tropa', 'Mis Unidades', 'Unidades Máximas']} data={troopStatData} />
            </div>
        </div>
    );
}

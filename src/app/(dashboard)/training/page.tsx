
import { TrainingView } from "@/components/dashboard/training-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTrainingConfigurations } from "@/lib/data"
import { calcularCostosEntrenamiento, calcularTiempoEntrenamiento } from "@/lib/formulas/training-formulas"

function TrainingLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="border rounded-lg p-0">
            <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center space-x-4">
                        <Skeleton className="h-16 w-20 rounded-md shimmer" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 shimmer" />
                            <Skeleton className="h-4 w-1/2 shimmer" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-md shimmer" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
  }

export default async function TrainingPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const allTrainingConfigs = await getTrainingConfigurations();

  // Pre-calculate data on the server
  const userTrainingsMap = new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
  const nivelEscuela = user.propiedades.flatMap(p => p.habitaciones).find(h => h.configuracionHabitacionId === 'escuela_especializacion')?.nivel || 0;
  
  const desiredOrder = [
    "rutas", "encargos", "extorsion", "administracion", "contrabando", "espionaje", "seguridad",
    "proteccion", "combate", "armas", "tiro", "explosivos", "guerrilla", "psicologico", "quimico", "honor"
  ];

  const sortedTrainingsData = desiredOrder.map(id => {
      const config = allTrainingConfigs.find(c => c.id === id);
      if (!config) return null;

      const userTraining = userTrainingsMap.get(id);
      // El Map guarda el nivel directamente (no el objeto), ver userTrainingsMap arriba.
      const nivel = userTraining ?? 0;
      
      const costosSiguienteNivel = calcularCostosEntrenamiento(nivel + 1, config);
      const tiempoSiguienteNivel = calcularTiempoEntrenamiento(nivel + 1, config, nivelEscuela);
      
      const requirements = config.requirements || [];
      const meetsRequirements = requirements.every(req => (userTrainingsMap.get(req.requiredTrainingId) || 0) >= req.requiredLevel);
      const requirementsText = !meetsRequirements 
        ? requirements
            .map(req => {
                const reqConfig = allTrainingConfigs.find(c => c.id === req.requiredTrainingId);
                return `${reqConfig?.nombre || req.requiredTrainingId} (Nvl ${req.requiredLevel})`
            })
            .join(', ')
        : null;


      return {
          ...config,
          nivel,
          costos: costosSiguienteNivel,
          tiempo: tiempoSiguienteNivel,
          meetsRequirements,
          requirementsText
      };
  }).filter((t): t is NonNullable<typeof t> => t !== null);


  return (
    <div className="main-view">
      <Suspense fallback={<TrainingLoading />}>
          <TrainingView user={user} trainingsData={sortedTrainingsData} />
      </Suspense>
    </div>
  );
}

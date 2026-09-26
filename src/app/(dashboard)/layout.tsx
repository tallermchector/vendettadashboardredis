
import { Suspense } from "react"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { verificarYFinalizarConstruccion, verificarYFinalizarReclutamiento, verificarYFinalizarEntrenamientos, actualizarPuntuacionUsuario, obtenerEstadoJuegoActualizado, verificarYFinalizarMisiones } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyProvider } from "@/contexts/property-context";

export const dynamic = 'force-dynamic';

function ResourceBarFallback() {
    return (
        <div className="w-full bg-black/80 text-white p-2 sticky top-14 sm:top-16 z-10">
            <div className="container mx-auto flex items-center justify-between h-8">
                <Skeleton className="h-5 w-full bg-muted shimmer" />
            </div>
        </div>
    )
}

export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  // Se ejecutan en paralelo para optimizar la carga
  const [userAfterConstructionCheck, userAfterRecruitmentCheck, userAfterMissionCheck, userAfterTrainingCheck] = await Promise.all([
    verificarYFinalizarConstruccion(sessionUser),
    verificarYFinalizarReclutamiento(sessionUser),
    verificarYFinalizarMisiones(sessionUser),
    verificarYFinalizarEntrenamientos(sessionUser),
  ]);

  // Combina los resultados. Si no hubo cambios, usa la versión anterior.
  let combinedUser = { ...sessionUser, ...userAfterConstructionCheck, ...userAfterRecruitmentCheck, ...userAfterMissionCheck, ...userAfterTrainingCheck };

  const userWithUpdatedProgress = await obtenerEstadoJuegoActualizado(combinedUser);
  const finalUser = await actualizarPuntuacionUsuario(userWithUpdatedProgress);

  if (!finalUser.propiedades || finalUser.propiedades.length === 0) {
      // Redirect to a page to create the first property if none exist
      // For now, just show an error message or redirect to overview with a message
      return (
        <DashboardClientLayout user={finalUser}>
            <main className="p-4 md:p-6">
              <h2 className="text-2xl font-bold">Sin propiedades</h2>
              <p>No tienes ninguna propiedad. ¡Crea una para empezar!</p>
            </main>
        </DashboardClientLayout>
      )
  }

  const sortedProperties = [...finalUser.propiedades].sort((a, b) => {
    if (a.nombre === 'Propiedad Principal') return -1;
    if (b.nombre === 'Propiedad Principal') return 1;
    return 0;
  });


  return (
    <Suspense>
      <PropertyProvider initialProperties={sortedProperties}>
          <DashboardClientLayout user={finalUser}>
              <div className="sticky top-14 sm:top-16 z-20">
                  <Suspense fallback={<ResourceBarFallback />}>
                      <ResourceBar user={finalUser} />
                  </Suspense>
              </div>
              <div className="flex-1">
                <main className="p-4 md:p-6">
                  {children}
                </main>
              </div>
          </DashboardClientLayout>
      </PropertyProvider>
    </Suspense>
  )
}

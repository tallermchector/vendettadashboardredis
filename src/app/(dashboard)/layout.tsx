import { Suspense } from "react"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { verificarYFinalizarConstruccion, verificarYFinalizarReclutamiento, verificarYFinalizarEntrenamientos, actualizarPuntuacionUsuario, obtenerEstadoJuegoActualizado, verificarYFinalizarMisiones } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Building2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyProvider } from "@/contexts/property-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

// El rail de recursos se dibuja a la derecha del titulo de la vista, dentro de
// la misma barra. Antes era un <div sticky top-14 sm:top-16> aparte, colgado
// debajo de un header que solo contenia el disparador movil: dos barras
// apiladas y un desplazamiento magico para que la segunda no tapara la
// primera. Ahora es una sola fila.
function ResourceBarFallback() {
    return (
        <div className="flex flex-1 items-center gap-4 overflow-hidden border-l border-wood/60 pl-3">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex min-w-0 flex-1 flex-col gap-1">
                    <Skeleton className="shimmer h-2.5 w-2/3 bg-ink-3" />
                    <Skeleton className="shimmer h-1 w-full rounded-full bg-ink-3" />
                </div>
            ))}
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

  // Sin propiedades no hay imperio que administrar: se dice que falta que hacer
  // y se ofrece la accion, en vez de un h2 suelto.
  if (!finalUser.propiedades || finalUser.propiedades.length === 0) {
      return (
        <DashboardClientLayout user={finalUser}>
            <div className="flex flex-1 items-center justify-center p-4 md:p-8">
                <div className="dossier anim-view w-full max-w-md overflow-hidden">
                    <div className="ribbon ribbon-crimson" />
                    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-crimson bg-crimson-deep text-gold shadow-inner">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="eyebrow">Sin propiedades</p>
                            <h2 className="font-heading text-3xl text-parch-50">
                                Todo imperio arranca por un sótano
                            </h2>
                            <p className="text-sm leading-relaxed text-parch-300">
                                Registrá tu primera propiedad para empezar a construir,
                                reclutar tropas y mandar flotas sobre la ciudad.
                            </p>
                        </div>
                        <Link
                            href="/rooms"
                            className={cn(buttonVariants(), "font-heading uppercase tracking-wider")}
                        >
                            <Plus className="h-4 w-4" />
                            Registrar propiedad
                        </Link>
                    </div>
                </div>
            </div>
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
          <DashboardClientLayout
              user={finalUser}
              header={
                  <Suspense fallback={<ResourceBarFallback />}>
                      <ResourceBar user={finalUser} />
                  </Suspense>
              }
          >
              {/* El landmark <main> lo aporta `SidebarInset` (que ya envuelve a
                  `children`). Poner un segundo <main> aqui anidaba dos
                  landmarks de contenido en la misma pagina, que es HTML
                  invalido y duplica la entrada "main" en la navegacion por
                  landmarks del lector de pantalla. Este <div> existe solo para
                  poner el sello de la lampara sobre la superficie que se ve. */}
              <div className="desk-vignette flex-1">
                {children}
              </div>
          </DashboardClientLayout>
      </PropertyProvider>
    </Suspense>
  )
}

import { OverviewView } from "@/components/dashboard/overview-view";
import { Suspense } from "react";

/**
 * Esqueleto de carga. No es un bloque gris generico: reproduce la retícula
 * real para que la pagina no salte cuando entra el contenido.
 *
 * Las colas se dibujan ya en pergamino porque es lo que va a aparecer. Un
 * esqueleto de madera oscura que se convierte en papel produce un destello de
 * blanco del tamaño de un tercio de la pantalla; uno que ya es papel, solo
 * cambia el texto por texto.
 */
function DossierSkeleton({ ribbon, className, children }: {
    ribbon?: "crimson" | "gold" | "crimson-gold"
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={`dossier overflow-hidden ${className ?? ""}`}>
            {ribbon && <div className={`ribbon ribbon-${ribbon}`} />}
            {children}
        </div>
    )
}

/** Barra de carga. `ink-3` es maderaIntermediate: visible sobre madera, no
 *  sobre el negro del escritorio. */
function Bar({ className }: { className?: string }) {
    return <div className={`shimmer animate-pulse rounded bg-ink-3 ${className ?? ""}`} />
}

/** Un panel de cola en esqueleto: cabecera de madera + hoja de pergamino con
 *  dos asientos sin tinta. */
function QueueSkeleton({ title }: { title: string }) {
    return (
        <DossierSkeleton>
            <div className="flex items-center justify-between px-4 py-2">
                <Bar className="h-4 w-24" />
                <Bar className="h-3.5 w-9" />
            </div>
            <div className="parchment space-y-2.5 p-3">
                <p className="sr-only">Cargando cola de {title}</p>
                {[0, 1].map(i => (
                    <div key={i} className="flex items-center gap-2.5 border-l-[3px] border-l-umber/10 pl-2.5">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-umber/15" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Bar className="h-2.5 w-3/4 bg-umber/20" />
                            <Bar className="h-2 w-1/3 bg-umber/15" />
                        </div>
                        <Bar className="h-3.5 w-14 shrink-0 bg-umber/20" />
                    </div>
                ))}
            </div>
        </DossierSkeleton>
    )
}

function OverviewLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4 md:px-6 md:py-5">
            {/* Identidad: jugador · placa cartografica · familia */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DossierSkeleton ribbon="crimson" className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 rounded-full border-2 border-crimson/40 bg-ink-3" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Bar className="h-2 w-10" />
                            <Bar className="h-6 w-2/3" />
                            <Bar className="h-2.5 w-1/3" />
                        </div>
                    </div>
                </DossierSkeleton>

                <DossierSkeleton className="p-4">
                    <div className="grid-dots flex h-full flex-col justify-between gap-3">
                        <div className="space-y-2">
                            <Bar className="h-2 w-16" />
                            <Bar className="h-5 w-3/5" />
                        </div>
                        <div className="space-y-2">
                            <Bar className="h-2.5 w-full" />
                            <Bar className="h-2.5 w-2/3" />
                        </div>
                    </div>
                </DossierSkeleton>

                <DossierSkeleton ribbon="gold" className="p-4">
                    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2">
                        <div className="h-24 w-24 rounded-full border-2 border-gold/40 bg-ink-3" />
                        <Bar className="h-2 w-14" />
                        <Bar className="h-5 w-2/5" />
                    </div>
                </DossierSkeleton>
            </div>

            {/* Colas: 2 x 2 desde md */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <QueueSkeleton title="misiones" />
                <QueueSkeleton title="obras" />
                <QueueSkeleton title="reclutamiento" />
                <QueueSkeleton title="entrenamiento" />
            </div>

            {/* Teletipo */}
            <DossierSkeleton ribbon="crimson-gold" className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded border-2 border-wood bg-ink-3" />
                        <div className="flex-1 space-y-2">
                            <Bar className="h-4 w-56" />
                            <Bar className="h-2.5 w-72 max-w-full" />
                        </div>
                    </div>
                    <div className="rounded border border-wood bg-ink-1/70 p-3.5">
                        <div className="mb-2 flex gap-2">
                            <Bar className="h-3.5 w-16" />
                            <Bar className="h-3.5 w-20" />
                        </div>
                        <div className="space-y-2">
                            <Bar className="h-3.5 w-4/5" />
                            <Bar className="h-2.5 w-full" />
                            <Bar className="h-2.5 w-2/3" />
                        </div>
                    </div>
                </div>
            </DossierSkeleton>

            {/* Libro mayor */}
            <DossierSkeleton ribbon="gold" className="p-3">
                <div className="parchment space-y-2.5 p-3">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-2.5 border-l-[3px] border-l-umber/10 pl-2.5">
                            <div className="h-2 w-2 shrink-0 rounded-full bg-umber/15" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <Bar className="h-2.5 w-2/5 bg-umber/20" />
                                <Bar className="h-2 w-4/5 bg-umber/15" />
                            </div>
                            <Bar className="h-2.5 w-12 shrink-0 bg-umber/20" />
                        </div>
                    ))}
                </div>
            </DossierSkeleton>

            {/* Barra de puntuacion */}
            <DossierSkeleton ribbon="crimson-gold" className="p-3">
                <div className="flex items-center gap-1 sm:gap-x-4">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            {i > 0 && <div className="hidden h-8 w-px bg-wood/70 sm:block" aria-hidden="true" />}
                            <Bar className="h-2 w-12" />
                            <Bar className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </DossierSkeleton>
        </div>
    )
}

export default function OverviewPage() {
    return (
        // Sin envoltorio: `OverviewView` ya trae su propio contenedor
        // (`max-w-7xl px-4 py-4`), igual que este esqueleto. El antiguo
        // `div.main-view` anadia una segunda capa de padding y flex encima.
        <Suspense fallback={<OverviewLoading />}>
            <OverviewView />
        </Suspense>
    )
}


'use client'

import { Building2, Crosshair } from 'lucide-react'
import { useProperty } from '@/contexts/property-context'

/**
 * Placa cartografica del puesto activo.
 *
 * Antes era una foto de stock de un edificio: el elemento mas plantilla de la
 * pagina, y ademas incongruente con una mesa de 1930. Se reemplaza por una
 * lamina de trabajo —retícula de puntos, marcas de esquina y cartucho de
 * coordenadas— que hace el mismo trabajo mejor.
 *
 * Que sea cliente es deliberado: la barra de recursos y la navegacion lateral
 * ya siguen la propiedad *seleccionada* via `PropertyContext`, y esta placa se
 * suma al mismo patron. Antes leia `propiedades[0]` del servidor, asi que
 * cambiar de propiedad dejaba el recurso actualizado pero el titulo apuntando
 * al primer inmueble.
 */
export function PropertyPlate() {
    const { selectedProperty } = useProperty()

    const coords = selectedProperty
        ? `${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`
        : '—'

    return (
        <div className="dossier anim-view relative flex h-full min-h-[200px] flex-col justify-end overflow-hidden">
            {/* Lamina cartografica: el vacio util es un plano de trabajo. */}
            <div className="grid-dots absolute inset-0" aria-hidden="true" />
            {/* Sello de la lampara: la luz cae desde arriba y se apaga en el
                borde inferior, donde va el texto. */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent"
                aria-hidden="true"
            />

            {/* Marcas de esquina: la lamina esta fijada a la mesa. */}
            <div className="pointer-events-none absolute inset-3" aria-hidden="true">
                <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-gold/25" />
                <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-gold/25" />
                <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-gold/25" />
                <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-gold/25" />
            </div>

            <div className="relative p-4">
                <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
                    <div className="min-w-0">
                        {/* El titulo de la vista ya lo lleva la barra del
                            encabezado; aqui se identifica el puesto, no la
                            pantalla. */}
                        <p className="eyebrow mb-1">Puesto activo</p>
                        <p className="truncate font-heading text-xl leading-none text-parch-50">
                            {selectedProperty?.nombre ?? 'Sin propiedad seleccionada'}
                        </p>
                    </div>
                </div>

                {/* Cartucho de coordenadas. DESIGN.md reserva JetBrains Mono
                    para coordenadas y datos tabulares. */}
                <p className="mt-2.5 inline-flex items-center gap-1.5 rounded border border-wood bg-ink-1/80 px-2 py-1">
                    <Crosshair className="h-3 w-3 shrink-0 text-gold" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-gold-light">
                        [{coords}]
                    </span>
                </p>
            </div>
        </div>
    )
}

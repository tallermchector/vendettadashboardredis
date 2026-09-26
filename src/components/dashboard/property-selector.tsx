
'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building, Check, ChevronsUpDown } from 'lucide-react'
import type { FullPropiedad } from '@/lib/data'
import { useProperty } from '@/contexts/property-context'

interface PropertySelectorProps {
  properties: FullPropiedad[]
}

function coords(property: FullPropiedad) {
  return `${property.ciudad}:${property.barrio}:${property.edificio}`
}

export function PropertySelector({ properties }: PropertySelectorProps) {
  const { selectedProperty, setSelectedPropertyById } = useProperty()

  // Con una sola propiedad no hay nada que elegir: el chip solo ocuparia
  // espacio de decision y sugeriría que hay un menu detras.
  if (!properties || properties.length <= 1) {
    return null
  }

  return (
    <div className="px-2 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md border border-wood bg-ink-2 px-3 py-2 text-left transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Building className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="eyebrow mb-0.5 block text-gold/60">Propiedad activa</span>
              <span className="block truncate text-sm font-medium leading-tight text-parch-50">
                {selectedProperty?.nombre ?? 'Seleccionar…'}
              </span>
              <span className="block truncate font-mono text-[10px] text-parch-400">
                {selectedProperty ? coords(selectedProperty) : '—'}
              </span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-parch-400" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--sidebar-width)]">
          <DropdownMenuLabel className="eyebrow">Tus propiedades</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {properties.map((property) => {
            const isSelected = selectedProperty?.id === property.id
            return (
              <DropdownMenuItem
                key={property.id}
                onSelect={() => setSelectedPropertyById(property.id)}
                className={isSelected ? 'bg-crimson/20' : undefined}
              >
                <Check
                  className={`mr-2 h-4 w-4 shrink-0 ${isSelected ? 'text-gold-light' : 'opacity-0'}`}
                  aria-hidden="true"
                />
                {/* El menu de eleccion es el unico lugar donde nombre y
                    coordenadas pueden convivir sin truncarse: cada fila tiene
                    el ancho completo del menu. */}
                <span className="min-w-0">
                  <span className="block truncate text-xs text-parch-50">{property.nombre}</span>
                  <span className="block font-mono text-[10px] text-parch-400">
                    [{coords(property)}]
                  </span>
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

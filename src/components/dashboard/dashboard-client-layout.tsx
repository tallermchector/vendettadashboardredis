
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { LiveClock } from "@/components/dashboard/live-clock"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Swords } from "lucide-react"
import { useMemo } from "react"
import type { UserWithProgress } from "@/lib/data"
import { logout } from "@/lib/actions/session.actions"
import { useRouter } from "next/navigation"

// El eyebrow del encabezado no decora: nombra la seccion del imperio a la que
// pertenece la vista, y el titulo nombra la vista. El par es la barra de
// navegacion secundaria del sistema.
const SECTION_LABEL = 'Imperio'

// Mismo orden que `sidebar-nav.tsx`. La coincidencia es por prefijo de ruta,
// igual que el `isActive` del menu, para que titulo y item resaltado no puedan
// discrepar.
const VIEW_TITLES: ReadonlyArray<readonly [prefix: string, title: string]> = [
  ['/overview', 'Visión General'],
  ['/rooms', 'Habitaciones'],
  ['/recruitment', 'Reclutamiento'],
  ['/training', 'Entrenamiento'],
  ['/security', 'Seguridad'],
  ['/technologies', 'Tecnologías'],
  ['/family', 'Familia'],
  ['/resources', 'Recursos'],
  ['/map', 'Mapa'],
  ['/missions', 'Misiones'],
  ['/simulator', 'Simulador'],
  ['/farms', 'Lista de Granjas'],
  ['/messages', 'Mensajes'],
  ['/statistics', 'Estadísticas'],
  ['/rankings', 'Clasificaciones'],
  ['/search', 'Buscar'],
  ['/settings', 'Ajustes'],
  ['/profile', 'Perfil'],
]

export function DashboardClientLayout({
    user,
    header,
    children,
  }: {
    user: UserWithProgress | null;
    /** Relleno de la barra de recursos. Se inyecta desde el layout de servidor
     *  para no perder el corte de Suspense que lo envuelve. */
    header?: React.ReactNode;
    children: React.ReactNode
  }) {
  const router = useRouter();
  const pathname = usePathname();

  const viewTitle = useMemo(
    () => VIEW_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Imperio',
    [pathname]
  );

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    // Sin `desk-vignette` aqui: este contenedor es el padre de `SidebarInset`,
    // que pinta `bg-ink` opaco ENCIMA. El sello de la lampara de banquero
    // quedaria literalmente tapado. Va en el lienzo de contenido, en
    // `(dashboard)/layout.tsx`, que es la superficie que si se ve.
    <SidebarProvider>
      <Sidebar className="woodgrain border-r-2 border-wood">
        <SidebarHeader className="h-16 border-b border-wood p-0">
           <Link href="/overview" className="flex h-16 items-center gap-2.5 px-4">
             <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-crimson/50 bg-crimson-deep text-gold shadow-inner">
               <Swords className="h-5 w-5" />
             </span>
             <span className="min-w-0">
               <span className="block truncate font-heading text-2xl leading-none tracking-wider text-parch-50">
                 VENDETTA
               </span>
               <span className="eyebrow mt-1 block text-gold/60">Consiglio 2026</span>
             </span>
           </Link>
        </SidebarHeader>
        <SidebarContent className="scroll-wood">
          <SidebarNav user={user} />
        </SidebarContent>
        <SidebarFooter className="border-t border-wood p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 shrink-0 border-2 border-crimson">
              <AvatarImage src={user?.avatarUrl || "https://placehold.co/40x40.png"} alt={user?.name || "Boss"} data-ai-hint="mafia boss" />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold leading-tight text-parch-50">{user?.name || "El Padrino"}</span>
                <span className="truncate text-[10px] text-gold/70">{user?.title || "Capo"}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 border-wood bg-ink-2 text-parch-400 hover:border-crimson/60 hover:text-crimson"
              onClick={handleLogout}
            >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-ink">
        {/* Barra de libro mayor. Una sola fila: disparador · seccion · vista ·
            recursos · reloj · identidad. Todo lo que el sistema llama "Top
            Ledger Header" vive aqui, no repartido en dos barras apiladas. */}
        <header className="sticky top-0 z-30 shrink-0 border-b border-wood bg-ink-1/95 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 md:h-16 md:gap-3 md:px-6">

                <SidebarTrigger className="h-9 w-9 shrink-0 rounded-md border border-wood bg-ink-2 text-parch-300 hover:text-gold md:hidden" />

                <div className="min-w-0 shrink">
                    <p className="eyebrow hidden text-gold/60 sm:block">
                        {SECTION_LABEL} / Dashboard
                    </p>
                    <h2 className="truncate font-heading text-lg leading-tight text-parch-50 md:text-xl lg:text-2xl">
                        {viewTitle}
                    </h2>
                </div>

                {/* Jamba de madera: separa el titulo de los medidores. */}
                {header ? <div className="min-w-0 flex-1">{header}</div> : <div className="flex-1" />}

                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <LiveClock />
                    <Avatar className="h-8 w-8 shrink-0 border-2 border-crimson">
                        <AvatarImage src={user?.avatarUrl || "https://placehold.co/40x40.png"} alt={user?.name || "Boss"} data-ai-hint="mafia boss" />
                        <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
                    </Avatar>
                </div>

            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}



"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
    Home, 
    DoorOpen, 
    Users, 
    Shield, 
    Target, 
    Search, 
    FlaskConical, 
    Users2, 
    Package, 
    Map, 
    ClipboardList, 
    Calculator, 
    List, 
    Mail, 
    BarChart, 
    Trophy,
    Settings
} from "lucide-react"
import { PropertySelector } from "./property-selector"
import type { UserWithProgress } from "@/lib/data"
import { useProperty } from "@/contexts/property-context"
import { ComponentProps } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarNavProps {
    user: UserWithProgress | null;
}

const mainNav: NavItem[] = [
  { href: "/overview", label: "Visión General", icon: <Home /> },
  { href: "/rooms", label: "Habitaciones", icon: <DoorOpen /> },
  { href: "/recruitment", label: "Reclutamiento", icon: <Users /> },
  { href: "/training", label: "Entrenamiento", icon: <Target /> },
  { href: "/security", label: "Seguridad", icon: <Shield /> },
]

const secondaryNav: NavItem[] = [
    { href: "/technologies", label: "Tecnologías", icon: <FlaskConical /> },
    { href: "/family", label: "Familia", icon: <Users2 /> },
    { href: "/resources", label: "Recursos", icon: <Package /> },
    { href: "/map", label: "Mapa", icon: <Map /> },
    { href: "/missions", label: "Misiones", icon: <ClipboardList /> },
    { href: "/simulator", label: "Simulador", icon: <Calculator /> },
    { href: "/farms", label: "Lista de granjas", icon: <List /> },
]

const tertiaryNav: NavItem[] = [
    { href: "/messages", label: "Mensajes", icon: <Mail /> },
    { href: "/statistics", label: "Estadísticas", icon: <BarChart /> },
    { href: "/rankings", label: "Clasificaciones", icon: <Trophy /> },
    { href: "/settings", label: "Ajustes", icon: <Settings /> },
    { href: "/search", label: "Buscar", icon: <Search /> },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
        setOpenMobile(false)
    }
  }

  const renderNav = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const params = new URLSearchParams(searchParams);
        if (selectedProperty?.id) {
            params.set('propertyId', selectedProperty.id);
        } else {
            params.delete('propertyId');
        }
        
        let finalHref = item.href;
        if(item.href === '/rooms' && selectedProperty) {
            finalHref = `/rooms/${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`;
        } else {
            finalHref = `${item.href}?${params.toString()}`;
        }

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
              onClick={handleClick}
            >
              <Link href={finalHref}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )

  return (
    <>
      <SidebarGroup>
        {renderNav(mainNav)}
      </SidebarGroup>
      
      {user && user.propiedades.length > 0 && <PropertySelector properties={user.propiedades} />}

      <SidebarGroup>
        {renderNav(secondaryNav)}
      </SidebarGroup>
      
      <SidebarGroup>
        {renderNav(tertiaryNav)}
      </SidebarGroup>
    </>
  )
}


'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullFamily } from "@/lib/data";
import { FamilyRole } from "@/types/enums";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Shield, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FamilyMembersViewProps {
    family: FullFamily;
}

const roleTranslations: Record<FamilyRole, string> = {
    [FamilyRole.LEADER]: "Líder",
    [FamilyRole.CO_LEADER]: "Co-Líder",
    [FamilyRole.MEMBER]: "Miembro",
};

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <UserIcon className="h-4 w-4 text-muted-foreground" />,
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

function formatLastSeen(lastSeen: Date | null): { text: string; isOnline: boolean } {
    if (!lastSeen) return { text: "Nunca", isOnline: false };
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(lastSeen).getTime()) / 1000);

    if (diffSeconds < 300) { // 5 minutes threshold for 'Online'
        return { text: "En Línea", isOnline: true };
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return { text: `Hace ${diffDays}d`, isOnline: false };
    if (diffHours > 0) return { text: `Hace ${diffHours}h`, isOnline: false };
    if (diffMinutes > 0) return { text: `Hace ${diffMinutes}m`, isOnline: false };
    return { text: "Hace un momento", isOnline: true };
}


export function FamilyMembersView({ family }: FamilyMembersViewProps) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000); 
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Miembros de {family.name}</h2>
                    <p className="text-muted-foreground">
                        Lista de todos los jugadores de tu familia.
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/family">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Familia
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                     {/* Desktop Table */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">#</TableHead>
                                <TableHead>Jugador</TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">Puntos</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {family.members.map(({ user, role }, index) => {
                                const status = formatLastSeen(user.lastSeen);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell>
                                            <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">{user.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {roleIcons[role]}
                                                <span>{roleTranslations[role]}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatPoints(user.puntuacion?.puntosTotales)}</TableCell>
                                        <TableCell className={cn("text-right font-mono text-sm", status.isOnline ? "text-green-500" : "text-muted-foreground")}>
                                            {status.text}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                     {/* Mobile Cards */}
                    <div className="md:hidden p-2 space-y-2">
                        {family.members.map(({user, role}, index) => {
                             const status = formatLastSeen(user.lastSeen);
                             return (
                                <Card key={user.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                                            <div>
                                                 <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">{user.name}</Link>
                                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    {roleIcons[role]}
                                                    <span>{roleTranslations[role]}</span>
                                                </div>
                                            </div>
                                        </div>
                                         <div className={cn("text-xs font-bold px-2 py-1 rounded-full", status.isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/10 text-red-400")}>
                                            {status.text}
                                        </div>
                                    </div>
                                    <Separator className="my-3"/>
                                    <div className="text-center">
                                        <p className="text-xl font-bold font-mono text-primary">{formatPoints(user.puntuacion?.puntosTotales)}</p>
                                        <p className="text-xs text-muted-foreground">Puntos</p>
                                    </div>
                                </Card>
                             )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

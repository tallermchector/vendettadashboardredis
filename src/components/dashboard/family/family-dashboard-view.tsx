
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FullFamily, UserWithProgress } from "@/lib/data";
import { FamilyRole } from "@/types/enums";
import { Crown, Shield, User, Users, Loader2, UserPlus, MailPlus, HandMetal } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { leaveFamily } from "@/lib/actions/family.actions";
import Image from "next/image";
import Link from "next/link";
import { InviteMemberDialog } from "./invite-member-dialog";


interface FamilyDashboardViewProps {
    family: FullFamily;
    currentUser: UserWithProgress;
    allUsers: { id: string; name: string; familyMember: { familyId: string; } | null; }[];
    pendingRequests: number;
}

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <User className="h-4 w-4 text-muted-foreground" />,
}

export function FamilyDashboardView({ family, currentUser, allUsers, pendingRequests }: FamilyDashboardViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleLeaveFamily = () => {
        startTransition(async () => {
            const result = await leaveFamily();
             if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Has abandonado la familia', description: result.success });
            }
        });
    }
    
    const userRole = currentUser.familyMember?.role;
    const canManage = userRole === FamilyRole.LEADER || userRole === FamilyRole.CO_LEADER;

    const usersNotInFamily = allUsers.filter(u => !u.familyMember && u.id !== currentUser.id);

    return (
        <div className="main-view space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                    <Image src="/img/login_bg.jpg" alt="Family Banner" fill className="object-cover" data-ai-hint="mafia pattern" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-end gap-4">
                         <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
                            <AvatarImage src={family.avatarUrl || ''} alt={family.name} data-ai-hint="family crest" />
                            <AvatarFallback>{family.tag}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white shadow-lg">[{family.tag}] {family.name}</h2>
                             <p className="text-muted-foreground text-white/80 max-w-2xl truncate text-sm sm:text-base">{family.description}</p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 border-t bg-muted/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && <InviteMemberDialog familyId={family.id} allUsers={usersNotInFamily} />}
                        {canManage && (
                             <Button asChild size="sm" variant="outline">
                                <Link href={`/family/requests`}>
                                    <HandMetal className="mr-2 h-4 w-4" />
                                    Solicitudes
                                    {pendingRequests > 0 && <Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>}
                                </Link>
                            </Button>
                        )}
                        <Button asChild size="sm" variant="outline">
                            <Link href={`/family/members?id=${family.id}`}>
                                <Users className="mr-2 h-4 w-4" />
                                Ver Lista de Miembros
                            </Link>
                        </Button>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Abandonar Familia</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres abandonar la familia?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Perderás todos los beneficios y la protección de la familia.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveFamily} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sí, abandonar familia
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Anuncios y Novedades</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-center text-muted-foreground py-8">No hay anuncios de la familia.</p>
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Miembros</span>
                                <span className="font-bold">{family.members.length}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Puntos Totales</span>
                                <span className="font-bold">--</span>
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Posición Ranking</span>
                                <span className="font-bold">--</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )

}

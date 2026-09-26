
'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomConfigForm } from "./forms/room-config-form";
import { deleteRoomConfig } from "@/lib/actions/admin.actions";
import { DeleteConfigButton } from "./delete-config-button";
import type { ConfiguracionHabitacion } from "@prisma/client";

interface RoomConfigTableProps {
    initialData: (ConfiguracionHabitacion & { requirements: { requiredRoomId: string; requiredLevel: number }[] })[];
}

function formatRequirements(requirements: RoomConfigTableProps['initialData'][0]['requirements'], allRooms: RoomConfigTableProps['initialData']) {
    if (!requirements || requirements.length === 0) return '-';
    const allRoomsMap = new Map(allRooms.map(r => [r.id, r.nombre]));
    return requirements.map(req => `${allRoomsMap.get(req.requiredRoomId) || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ');
}


export function RoomConfigTable({ initialData }: RoomConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<(ConfiguracionHabitacion & { requirements: { requiredRoomId: string; requiredLevel: number }[] }) | null>(null);

    const handleEdit = (room: ConfiguracionHabitacion & { requirements: { requiredRoomId: string; requiredLevel: number }[] }) => {
        setSelectedRoom(room);
        setIsOpen(true);
    };

    const handleCreate = () => {
        setSelectedRoom(null);
        setIsOpen(true);
    }
    
    return (
        <Card>
            <div className="p-4">
                <Button onClick={handleCreate}>Crear Nueva Habitación</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Requisitos</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead className="text-right">Armas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.map(room => (
                        <TableRow key={room.id}>
                            <TableCell className="font-mono text-xs">{room.id}</TableCell>
                            <TableCell className="font-medium">{room.nombre}</TableCell>
                            <TableCell className="text-xs">{formatRequirements(room.requirements, initialData)}</TableCell>
                            <TableCell>{room.puntos}</TableCell>
                            <TableCell className="text-right">{room.costoArmas.toLocaleString('de-DE')}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>Editar</Button>
                                <DeleteConfigButton id={room.id} action={deleteRoomConfig} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedRoom ? 'Editar' : 'Crear'} Habitación</DialogTitle>
                    </DialogHeader>
                    <RoomConfigForm 
                        room={selectedRoom} 
                        allRooms={initialData}
                        onFinished={() => setIsOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

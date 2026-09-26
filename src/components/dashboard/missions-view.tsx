
'use client'

import { useState, useTransition, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { UserWithProgress } from '@/lib/data';
import { debounce } from 'lodash';
import { Loader2, User, UserX, Clock } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { enviarMision, consultarDueñoDePropiedad } from '@/lib/actions/mission.actions';
import { useToast } from '@/hooks/use-toast';
import { useProperty } from '@/contexts/property-context';
import type { ConfiguracionTropa } from '@prisma/client';
import { calcularDistancia, calcularDuracionViaje, calcularVelocidadFlota } from '@/lib/formulas/mission-formulas';
import { useSearchParams } from 'next/navigation';

type TroopInput = {
    id: string;
    cantidad: number;
}

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;

    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 3) {
            const amount = Math.floor(remainingSeconds / unit.seconds);
            if (amount > 0) {
                result += `${amount}${unit.name} `;
                remainingSeconds %= unit.seconds;
                parts++;
            }
        }
    }

    return result.trim() || '0s';
}


export function MissionsView({ user, troopConfigs }: { user: UserWithProgress, troopConfigs: ConfiguracionTropa[] }) {
    const { selectedProperty } = useProperty();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    const [coordinates, setCoordinates] = useState({ 
        ciudad: searchParams.get('ciudad') || selectedProperty?.ciudad.toString() || '', 
        barrio: searchParams.get('barrio') || selectedProperty?.barrio.toString() || '', 
        edificio: searchParams.get('edificio') || '' 
    });

    const [targetOwner, setTargetOwner] = useState<{ id: string, name: string } | null | undefined>(undefined);
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);
    const [missionType, setMissionType] = useState('ATAQUE');
    const [tropas, setTropas] = useState<TroopInput[]>([]);
    const [travelTime, setTravelTime] = useState<number>(0);
    
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));

    useEffect(() => {
        const ciudad = searchParams.get('ciudad');
        const barrio = searchParams.get('barrio');
        const edificio = searchParams.get('edificio');

        const newCoords = {
            ciudad: ciudad || selectedProperty?.ciudad.toString() || '',
            barrio: barrio || selectedProperty?.barrio.toString() || '',
            edificio: edificio || ''
        }
        setCoordinates(newCoords);

        if (newCoords.ciudad && newCoords.barrio && newCoords.edificio) {
            setIsLoadingTarget(true);
            debouncedFetchOwner(parseInt(newCoords.ciudad), parseInt(newCoords.barrio), parseInt(newCoords.edificio));
        }

    }, [searchParams, selectedProperty]);

    const calculateTravelTime = useCallback(async () => {
        if (!selectedProperty || tropas.length === 0 || !coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
            setTravelTime(0);
            return;
        }

        const activeTroops = tropas.filter(t => t.cantidad > 0);
        if(activeTroops.length === 0) {
            setTravelTime(0);
            return;
        }

        const velocidad = await calcularVelocidadFlota(activeTroops, troopConfigsMap);
        const distancia = calcularDistancia(selectedProperty, {
            ciudad: parseInt(coordinates.ciudad, 10),
            barrio: parseInt(coordinates.barrio, 10),
            edificio: parseInt(coordinates.edificio, 10),
        });
        const duracion = calcularDuracionViaje(distancia, velocidad);
        setTravelTime(duracion);
    }, [tropas, coordinates, selectedProperty, troopConfigsMap]);
    
    useEffect(() => {
        calculateTravelTime();
    }, [calculateTravelTime]);
    

    const debouncedFetchOwner = useCallback(
        debounce(async (ciudad: number, barrio: number, edificio: number) => {
            if (!ciudad || !barrio || !edificio) {
                setTargetOwner(undefined);
                setIsLoadingTarget(false);
                return;
            };
            // `targetOwner` es triestado: undefined = sin buscar todavia,
            // null = buscado y sin dueno. No colapsarlos.
            const result = await consultarDueñoDePropiedad({ ciudad, barrio, edificio });
            setTargetOwner('error' in result ? undefined : result.owner);
            setIsLoadingTarget(false);
        }, 500),
        []
    );

    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newCoords = { ...coordinates, [name]: value };
        setCoordinates(newCoords);
        
        const { ciudad, barrio, edificio } = newCoords;
        if (ciudad && barrio && edificio) {
            setIsLoadingTarget(true);
            debouncedFetchOwner(parseInt(ciudad), parseInt(barrio), parseInt(edificio));
        } else {
            setTargetOwner(undefined);
        }
    };
    
    const handleTroopChange = (troopId: string, cantidad: number) => {
        setTropas(prev => {
            const existing = prev.find(t => t.id === troopId);
            if (existing) {
                if (cantidad > 0) {
                    return prev.map(t => t.id === troopId ? { ...t, cantidad } : t);
                } else {
                    return prev.filter(t => t.id !== troopId);
                }
            } else if (cantidad > 0) {
                return [...prev, { id: troopId, cantidad }];
            }
            return prev;
        })
    }

    const setMaxTroops = (troopId: string) => {
        const available = selectedProperty?.TropaUsuario.find(t => t.configuracionTropaId === troopId)?.cantidad || 0;
        handleTroopChange(troopId, available);
    };

    const setAllMaxTroops = () => {
        const newTroopInputs = selectedProperty?.TropaUsuario
            .filter(tropa => tropa.configuracion.tipo !== 'DEFENSA')
            .map(tropa => ({
                id: tropa.configuracionTropaId,
                cantidad: tropa.cantidad,
            })) || [];
        setTropas(newTroopInputs);
    };
    
    const handleSubmit = async () => {
        if (!selectedProperty) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay una propiedad de origen seleccionada.' });
            return;
        }

        startTransition(async () => {
            const result = await enviarMision({
                origenPropiedadId: selectedProperty.id,
                coordinates: {
                    ciudad: parseInt(coordinates.ciudad),
                    barrio: parseInt(coordinates.barrio),
                    edificio: parseInt(coordinates.edificio)
                },
                tropas: tropas.filter(t => t.cantidad > 0),
                tipo: missionType
            });

            if (result.error) {
                toast({ variant: 'destructive', title: 'Error en la misión', description: result.error });
            } else {
                toast({ title: '¡Misión enviada!', description: result.success });
                setTropas([]);
            }
        });
    }

    if (!selectedProperty) {
        return <p>Selecciona una propiedad para enviar misiones.</p>
    }

    const desiredOrder = [
        "maton", "portero", "acuchillador", "pistolero", "ocupacion", "espia", "porteador", "cia", "fbi",
        "transportista", "tactico", "francotirador", "asesino", "ninja", "demoliciones", "mercenario"
    ];

    const availableTroops = selectedProperty.TropaUsuario
        .filter(t => t.cantidad > 0 && t.configuracion.tipo !== 'DEFENSA')
        .sort((a,b) => {
            const indexA = desiredOrder.indexOf(a.configuracionTropaId);
            const indexB = desiredOrder.indexOf(b.configuracionTropaId);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Configuración de la Misión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className='space-y-2'>
                            <Label htmlFor='ciudad'>Ciudad</Label>
                            <Input id='ciudad' name='ciudad' placeholder='1' value={coordinates.ciudad} onChange={handleCoordinateChange} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='barrio'>Barrio</Label>
                            <Input id='barrio' name='barrio' placeholder='1' value={coordinates.barrio} onChange={handleCoordinateChange} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='edificio'>Edificio</Label>
                            <Input id='edificio' name='edificio' placeholder='1' value={coordinates.edificio} onChange={handleCoordinateChange} />
                        </div>
                    </div>

                    <Card className='p-4'>
                        <div className='flex items-center gap-4'>
                            {isLoadingTarget ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : targetOwner === undefined ? (
                                 <UserX className="h-6 w-6 text-muted-foreground" />
                            ) : targetOwner === null ? (
                                 <UserX className="h-6 w-6 text-green-500" />
                            ) : (
                                <User className="h-6 w-6 text-destructive" />
                            )}
                            <div>
                                <p className='text-sm text-muted-foreground'>Objetivo</p>
                                <p className='font-bold'>
                                    {isLoadingTarget ? 'Buscando...' : targetOwner?.name || 'Nadie'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                     <div className='space-y-2'>
                        <Label htmlFor='missionType'>Tipo de Misión</Label>
                        <Select onValueChange={setMissionType} defaultValue={missionType}>
                            <SelectTrigger id='missionType'>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ATAQUE">Ataque</SelectItem>
                                <SelectItem value="OCUPAR">Ocupar</SelectItem>
                                <SelectItem value="DEFENDER">Defender</SelectItem>
                                <SelectItem value="TRANSPORTE">Transporte</SelectItem>
                                <SelectItem value="ESPIONAJE">Espionaje</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tropas de {selectedProperty.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-2'>
                        {availableTroops.length > 0 ? availableTroops.map(tropa => (
                            <div key={tropa.configuracionTropaId} className='p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center gap-4'>
                                <div className='flex items-center gap-3 flex-1'>
                                    <div className="w-12 h-10 relative rounded-md overflow-hidden border flex-shrink-0">
                                        <Image src={tropa.configuracion.urlImagen} alt={tropa.configuracion.nombre} fill className='object-contain' />
                                    </div>
                                    <div>
                                        <p className='font-semibold'>{tropa.configuracion.nombre}</p>
                                        <p className='text-xs text-muted-foreground'>Disponibles: {tropa.cantidad}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Input 
                                        type='number'
                                        min="0"
                                        max={tropa.cantidad}
                                        value={tropas.find(t => t.id === tropa.configuracionTropaId)?.cantidad || 0}
                                        onChange={(e) => handleTroopChange(tropa.configuracionTropaId, parseInt(e.target.value) || 0)}
                                        className='h-9 w-24 text-center'
                                    />
                                    <Button variant="outline" size="sm" className='h-9' onClick={() => setMaxTroops(tropa.configuracionTropaId)}>
                                        Máx
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No tienes tropas de ataque en esta propiedad.</p>
                        )}
                    </div>

                    {availableTroops.length > 0 && (
                        <Button variant="secondary" className='w-full mt-4' onClick={setAllMaxTroops}>Seleccionar Todas las Tropas</Button>
                    )}
                    
                    <div className="mt-4 p-2 text-center bg-muted rounded-md text-sm font-semibold flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-primary"/>
                        <span>Tiempo de Viaje (ida):</span>
                        <span className="font-bold">{formatDuration(travelTime)}</span>
                    </div>

                    <Button onClick={handleSubmit} disabled={isPending || tropas.length === 0} className='w-full mt-4'>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Misión
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

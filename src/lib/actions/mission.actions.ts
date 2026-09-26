
'use server'

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getPropertyOwner, getTroopConfigurations } from "../data";
import { calcularDistancia, calcularDuracionViaje, calcularVelocidadFlota } from "../formulas/mission-formulas";

const coordsSchema = z.object({
  ciudad: z.number().int().min(1).max(100),
  barrio: z.number().int().min(1).max(100),
  edificio: z.number().int().min(1).max(225),
});

/**
 * Dueño de una propiedad, para mostrar el objetivo en el formulario de misión.
 *
 * Vivir en `data.ts` convertía esta lectura en un endpoint público sin sesión
 * (ver el `"use server"` de ese modulo). Acá exige autenticación y valida la
 * entrada, y solo devuelve los dos campos que la vista necesita.
 */
export async function consultarDueñoDePropiedad(input: unknown) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Usuario no autenticado." };
  }

  const parsed = coordsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Coordenadas invalidas." };
  }

  const owner = await getPropertyOwner(parsed.data);
  return { owner };
}

interface MissionInput {
    origenPropiedadId: string;
    coordinates: {
        ciudad: number;
        barrio: number;
        edificio: number;
    },
    tropas: { id: string, cantidad: number }[];
    tipo: string;
}

const MISIONES_SIN_RETORNO = ['OCUPAR'];

export async function enviarMision(input: MissionInput) {
    const user = await getSessionUser();
    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    const { origenPropiedadId, coordinates, tropas, tipo } = input;
    const origenPropiedad = user.propiedades.find(p => p.id === origenPropiedadId);

    if (!origenPropiedad) {
        return { error: "Propiedad de origen no encontrada." };
    }

    if (!coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
        return { error: "Coordenadas incompletas." };
    }
     if (tropas.length === 0 || tropas.every(t => t.cantidad === 0)) {
        return { error: "Debes seleccionar al menos una tropa." };
    }

    const tropasPropiedadMap = new Map(origenPropiedad.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad]));

    for (const tropa of tropas) {
        if ((tropasPropiedadMap.get(tropa.id) || 0) < tropa.cantidad) {
            return { error: `No tienes suficientes unidades de una de las tropas seleccionadas en ${origenPropiedad.nombre}.` };
        }
    }
    
    // Validaciones específicas del tipo de misión
    if (tipo === 'ESPIONAJE') {
        const tropaEspia = tropas.find(t => t.id === 'espia' && t.cantidad > 0);
        if (!tropaEspia) {
            return { error: "Necesitas enviar al menos una tropa de Espionaje para esta misión." };
        }
    }
    
    if (tipo === 'OCUPAR') {
        const tropaOcupacion = tropas.find(t => t.id === 'ocupacion' && t.cantidad > 0);
        if (!tropaOcupacion) {
            return { error: "Necesitas enviar al menos una Tropa de Ocupación para esta misión." };
        }
        const targetOwner = await getPropertyOwner(coordinates);
        if (targetOwner) {
            return { error: "No puedes ocupar una propiedad que ya tiene dueño." };
        }
        
        try {
            await prisma.$transaction(async (tx) => {
                const allRoomConfigs = await tx.configuracionHabitacion.findMany();
                await tx.propiedad.create({
                    data: {
                        userId: user.id,
                        nombre: `Colonia en ${coordinates.ciudad}:${coordinates.barrio}`,
                        ciudad: coordinates.ciudad,
                        barrio: coordinates.barrio,
                        edificio: coordinates.edificio,
                        armas: 10000,
                        municion: 10000,
                        alcohol: 10000,
                        dolares: 10000,
                        habitaciones: {
                            create: allRoomConfigs.map(config => ({
                                configuracionHabitacionId: config.id,
                                nivel: 1
                            }))
                        }
                    }
                });

                await tx.tropaUsuario.update({
                    where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: 'ocupacion' } },
                    data: { cantidad: { decrement: tropaOcupacion.cantidad } }
                });
            });
            
            revalidatePath('/overview');
            revalidatePath('/map');
            return { success: `¡Has ocupado exitosamente la propiedad en ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}!` };

        } catch (error) {
            console.error(error);
            return { error: "Error al crear la nueva propiedad." };
        }
    }


    // Calcular distancia y duración con las nuevas fórmulas
    const troopConfigs = await getTroopConfigurations();
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));
    
    const velocidadFlota = await calcularVelocidadFlota(tropas, troopConfigsMap);
    const distancia = calcularDistancia(origenPropiedad, coordinates);
    const duracionViaje = calcularDuracionViaje(distancia, velocidadFlota);
    
    const fechaInicio = new Date();
    const fechaLlegada = new Date(fechaInicio.getTime() + duracionViaje * 1000);
    const requiereRetorno = !MISIONES_SIN_RETORNO.includes(tipo);
    const fechaRegreso = requiereRetorno ? new Date(fechaLlegada.getTime() + duracionViaje * 1000) : null;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.colaMisiones.create({
                data: {
                    userId: user.id,
                    propiedadOrigenId: origenPropiedadId,
                    tipoMision: tipo,
                    tropas: JSON.stringify(tropas),
                    origenCiudad: origenPropiedad.ciudad,
                    origenBarrio: origenPropiedad.barrio,
                    origenEdificio: origenPropiedad.edificio,
                    destinoCiudad: coordinates.ciudad,
                    destinoBarrio: coordinates.barrio,
                    destinoEdificio: coordinates.edificio,
                    fechaInicio: fechaInicio,
                    fechaLlegada: fechaLlegada,
                    fechaRegreso: fechaRegreso,
                    velocidadFlota,
                    duracionViaje,
                }
            });

            for (const t of tropas) {
                if (t.cantidad > 0) {
                    await tx.tropaUsuario.update({
                        where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: t.id } },
                        data: { cantidad: { decrement: t.cantidad } }
                    });
                }
            }

            const tropasDesplegadas = tropas.filter(t => t.cantidad > 0).map(t => `${t.cantidad}x ${t.id}`).join(', ');
            await tx.message.create({
                data: {
                    recipientId: user.id,
                    subject: `Despliegue militar: Misión de ${tipo}`,
                    content: `Has ordenado el despliegue de una misión de ${tipo} hacia [${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}] desde la propiedad "${origenPropiedad.nombre}". Tropas asignadas: ${tropasDesplegadas}.`,
                    category: 'BATALLA',
                }
            });
        });

    } catch (error) {
        console.error("Error al crear la misión:", error);
        return { error: "No se pudo enviar la misión." };
    }
    
    revalidatePath('/missions');
    revalidatePath('/overview');

    return { success: `Misión de ${tipo} enviada a ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}.` };
}

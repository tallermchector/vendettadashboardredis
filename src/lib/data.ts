
/**
 * Data Access Layer. SOLO SERVIDOR.
 *
 * Esta cabecera NO lleva la directiva "use server" a proposito. Con ella,
 * Next.js registraba las ~19 funciones exportadas de este archivo como
 * endpoints RPC publicos: cualquiera podia invocarlas sin sesion y sin
 * validacion, y `getUserByUsername` ademas devolvia el hash de la contrasena.
 *
 * Sin la directiva, estas funciones son alcance de servidor: los Server
 * Actions las pueden seguir llamando directamente, pero el navegador no.
 *
 * Si un componente cliente necesita una lectura de aca, hay dos caminos:
 * resolverla en el Server Component padre y pasarla por props, o exponer una
 * accion autenticada en src/lib/actions/ (ver `consultarDueñoDePropiedad`).
 * Importar un VALOR de runtime desde un 'use client' rompe el build a proposito.
 *
 * Los imports de tipos desde el cliente son seguros: se borran al compilar.
 */

import { User, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa, Propiedad, PuntuacionUsuario, ColaMisiones, Family, FamilyMember, TrainingRequirement, RoomRequirement, TropaBonusContrincante, Message, MessageCategory, ColaEntrenamiento, FamilyInvitation, InvitationStatus, InvitationType, Prisma } from '@prisma/client'
import { cache } from 'react';
import { calculateStorageCapacity } from './formulas/room-formulas';
import prisma from './prisma/prisma';

export type FullConfiguracionHabitacion = ConfiguracionHabitacion & {
  requirements: RoomRequirement[];
};

export type FullConfiguracionEntrenamiento = ConfiguracionEntrenamiento & {
    requirements: TrainingRequirement[];
}

export type FullConfiguracionTropa = ConfiguracionTropa & {
    bonusContrincante: TropaBonusContrincante[];
}

export type FullHabitacionUsuario = HabitacionUsuario & { 
  configuracion: FullConfiguracionHabitacion 
};

export type FullColaReclutamiento = ColaReclutamiento & {
  tropaConfig: ConfiguracionTropa;
};

export type FullColaEntrenamiento = ColaEntrenamiento & {
    entrenamiento: ConfiguracionEntrenamiento;
    propiedad: { nombre: string };
}

export type FullTropaUsuario = TropaUsuario & {
    configuracion: ConfiguracionTropa;
}

export type FullPropiedad = Propiedad & {
    habitaciones: FullHabitacionUsuario[];
    colaConstruccion: ColaConstruccion[];
    colaReclutamiento: FullColaReclutamiento | null;
    TropaUsuario: FullTropaUsuario[];
}

export type FullFamilyMember = FamilyMember & { 
    user: { 
        id: string;
        name: string;
        puntuacion: PuntuacionUsuario | null;
        lastSeen: Date;
    } 
};

export type FullFamily = Family & {
    members: FullFamilyMember[]
}

export type FullFamilyInvitation = FamilyInvitation & {
    user: { id: string; name: string; puntuacion: PuntuacionUsuario | null; avatarUrl: string | null };
    family: { id: string; name: string; tag: string; avatarUrl: string | null; };
}

export type FullMessage = Message & {
    sender: { name: string; id: string } | null;
}

export type UserWithProgress = User & {
    propiedades: FullPropiedad[];
    entrenamientos: (EntrenamientoUsuario & { configuracion: ConfiguracionEntrenamiento })[];
    puntuacion: PuntuacionUsuario | null;
    misiones: ColaMisiones[];
    colaEntrenamientos: FullColaEntrenamiento[];
    familyMember: (FamilyMember & { family: Family }) | null;
    _count?: {
        receivedMessages?: number;
    }
};

export type UserProfileData = User & {
    puntuacion: PuntuacionUsuario | null;
    propiedades: {
        id: string;
        nombre: string;
        ciudad: number;
        barrio: number;
        edificio: number;
    }[];
}

export type UserForRanking = User & {
    puntuacion: PuntuacionUsuario | null;
    _count: {
        propiedades: number;
    }
}

export const getTroopBonusConfig = cache(async (): Promise<TropaBonusContrincante[]> => {
    try {
        const bonusConfig = await prisma.tropaBonusContrincante.findMany();
        return bonusConfig;
    } catch (e) {
        console.error("Error fetching troop bonus config", e);
        return [];
    }
});

export const getMessagesForUser = cache(async (userId: string): Promise<FullMessage[]> => {
    try {
        const messages = await prisma.message.findMany({
            where: { recipientId: userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return messages as FullMessage[];
    } catch (e) {
        console.error("Error fetching messages for user", e);
        return [];
    }
});


export const getFamilyById = cache(async(id: string) => {
    try {
        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                puntuacion: true,
                                lastSeen: true,
                            }
                        }
                    },
                    orderBy: {
                        user: {
                           puntuacion: {
                             puntosTotales: 'desc'
                           }
                        }
                    }
                }
            }
        });
        return family as FullFamily | null;
    } catch (e) {
        console.error("Error fetching family by id", e);
        return null;
    }
});

export const getUserFamily = cache(async(userId: string) => {
    try {
        const familyMember = await prisma.familyMember.findUnique({
            where: { userId },
        });
        if (!familyMember) return null;
        return getFamilyById(familyMember.familyId);
    } catch(e) {
        console.error("Error fetching user family", e);
        return null;
    }
});


export const getPropertyOwner = cache(async (coords: { ciudad: number, barrio: number, edificio: number }): Promise<{id: string, name: string} | null> => {
    try {
        const property = await prisma.propiedad.findUnique({
            where: {
                ciudad_barrio_edificio: coords
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return property?.user || null;
    } catch(e) {
        return null;
    }
});

export const getPropertiesByLocation = cache(async (ciudad: number, barrio: number) => {
    try {
        const properties = await prisma.propiedad.findMany({
            where: {
                ciudad,
                barrio,
            },
            include: {
                user: {
                    include: {
                        familyMember: {
                            include: {
                                family: true
                            }
                        }
                    }
                }
            }
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties by location:", error);
        return [];
    }
});

export const getUsersForRanking = cache(async (): Promise<UserForRanking[]> => {
    try {
        const users = await prisma.user.findMany({
            include: {
                puntuacion: true,
                _count: {
                    select: { propiedades: true },
                }
            },
            orderBy: {
                puntuacion: {
                    puntosTotales: 'desc'
                }
            }
        });
        return users as UserForRanking[];
    } catch (error) {
        console.error("Error fetching users for ranking:", error);
        return [];
    }
});

export const getFamiliesForRanking = cache(async (): Promise<FullFamily[]> => {
    try {
        const families = await prisma.family.findMany({
            include: {
                members: {
                    include: {
                        user: {
                           select: {
                                id: true,
                                name: true,
                                puntuacion: true,
                                lastSeen: true,
                           }
                        }
                    }
                }
            }
        });
        // You might want to calculate and sort by total points here in the future
        return families as FullFamily[];
    } catch (error) {
        console.error("Error fetching families for ranking:", error);
        return [];
    }
});

export const getRoomConfigurations = cache(async (): Promise<FullConfiguracionHabitacion[]> => {
  try {
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
        include: {
            requirements: true,
        },
      orderBy: { id: 'asc' },
    });
    return roomConfigurations as FullConfiguracionHabitacion[];
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    return [];
  }
});

export const getTroopConfigurations = cache(async (): Promise<FullConfiguracionTropa[]> => {
    try {
        const troopConfigurations = await prisma.configuracionTropa.findMany({
            include: {
                bonusContrincante: true,
            }
        });
        return troopConfigurations as FullConfiguracionTropa[];
    } catch (error) {
        console.error("Error fetching troop configurations:", error);
        return [];
    }
});

export const getTrainingConfigurations = cache(async (): Promise<FullConfiguracionEntrenamiento[]> => {
    try {
        const trainingConfigurations = await prisma.configuracionEntrenamiento.findMany({
            include: {
                requirements: true
            }
        });
        return trainingConfigurations as FullConfiguracionEntrenamiento[];
    } catch (error) {
        console.error("Error fetching training configurations:", error);
        return [];
    }
});


export const getUsers = cache(async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                familyMember: {
                    select: {
                        familyId: true
                    }
                }
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
});

const userInclude = {
    propiedades: {
        include: {
            habitaciones: {
                include: {
                    configuracion: {
                      include: {
                        requirements: true
                      }
                    }
                },
                 orderBy: {
                    configuracionHabitacionId: 'asc' as Prisma.SortOrder
                }
            },
            TropaUsuario: {
                include: {
                    configuracion: true
                }
            },
            colaConstruccion: {
                orderBy: {
                    createdAt: 'asc' as Prisma.SortOrder
                }
            },
            colaReclutamiento: {
                include: {
                    tropaConfig: true
                }
            }
        }
    },
    entrenamientos: {
        include: {
            configuracion: true
        },
        orderBy: {
            configuracionEntrenamientoId: 'asc' as Prisma.SortOrder
        }
    },
    puntuacion: true,
    misiones: {
        orderBy: {
            fechaLlegada: 'asc' as Prisma.SortOrder
        }
    },
    colaEntrenamientos: {
        include: {
            entrenamiento: true,
            propiedad: {
                select: { nombre: true }
            }
        },
        orderBy: {
            fechaFinalizacion: 'asc' as Prisma.SortOrder
        }
    },
    familyMember: {
        include: {
            family: true
        }
    },
    _count: {
        select: {
            receivedMessages: {
                where: { isRead: false }
            }
        }
    }
};

export const getUserProfileById = cache(async (userId: string): Promise<UserProfileData | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                puntuacion: true,
                propiedades: {
                    select: {
                        id: true,
                        nombre: true,
                        ciudad: true,
                        barrio: true,
                        edificio: true,
                    },
                    orderBy: {
                        nombre: 'asc'
                    }
                }
            }
        });
        return user as UserProfileData | null;
    } catch(e) {
        console.error(`Error fetching profile for user ${userId}`, e);
        return null;
    }
})

export const getMaximumResourceCapacity = cache(async () => {
    const properties = await prisma.propiedad.findMany({
        include: { habitaciones: { include: { configuracion: true } } }
    });
    return [
        { name: "Armas", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).armas)) },
        { name: "Munición", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).municion)) },
        { name: "Alcohol", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).alcohol)) },
        { name: "Dólares", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).dolares)) },
    ];
});

export const getGlobalStatistics = cache(async () => {
    try {
        const [
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            rawTroopStats,
        ] = await Promise.all([
            getRoomConfigurations(),
            getTrainingConfigurations(),
            getTroopConfigurations(),
            prisma.habitacionUsuario.findMany(),
            prisma.entrenamientoUsuario.findMany(),
            prisma.tropaUsuario.findMany({
                where: {
                    propiedadId: { not: null }
                },
                include: {
                    propiedad: {
                        select: {
                            userId: true
                        }
                    }
                }
            }),
        ]);

        const troopStatsMap = new Map<string, number>();
        rawTroopStats.forEach(stat => {
            if (stat.propiedad) { // Check if propiedad is not null
                const key = `${stat.propiedad.userId}-${stat.configuracionTropaId}`;
                const currentTotal = troopStatsMap.get(key) || 0;
                troopStatsMap.set(key, currentTotal + stat.cantidad);
            }
        });
        
        const troopStats = Array.from(troopStatsMap.entries()).map(([key, total]) => {
            const [userId, configuracionTropaId] = key.split('-');
            return { userId, configuracionTropaId, total };
        });

        return {
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            troopStats,
        };

    } catch (e) {
        console.error("Error fetching global statistics", e);
        throw new Error("Could not fetch global statistics");
    }
});

export const getFamilyRequests = cache(async (familyId: string): Promise<FullFamilyInvitation[]> => {
    try {
        const requests = await prisma.familyInvitation.findMany({
            where: {
                familyId: familyId,
                type: 'REQUEST',
                status: InvitationStatus.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        puntuacion: true,
                        avatarUrl: true
                    }
                },
                family: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        avatarUrl: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return requests as FullFamilyInvitation[];
    } catch(e) {
        console.error(`Error fetching requests for family ${familyId}`, e);
        return [];
    }
});


export const getInvitationsForUser = cache(async (userId: string): Promise<FullFamilyInvitation[]> => {
    try {
        const invitations = await prisma.familyInvitation.findMany({
            where: {
                userId: userId,
                status: InvitationStatus.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        puntuacion: true,
                        avatarUrl: true
                    }
                },
                family: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return invitations as FullFamilyInvitation[];
    } catch(e) {
        console.error(`Error fetching invitations for user ${userId}`, e);
        return [];
    }
});


/**
 * Fetch memoizado del usuario con todo su progreso.
 *
 * Esta consulta es la mas pesada del proyecto (include anidado de
 * propiedades -> habitaciones -> requirements, tropas, colas, misiones,
 * family's y conteo de mensajes). Sin `cache()` se ejecuta una vez por cada
 * consumidor dentro del mismo request: el layout del dashboard y la pagina
 * la piden ambos, lo que duplicaba ~2.6s de render por navegacion.
 */
export const getUserWithProgressByUsername = cache(async (username: string): Promise<UserWithProgress | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: userInclude
        });
        return user as UserWithProgress | null;
    } catch (error) {
        console.error(`Error fetching user ${username} with progress:`, error);
        return null;
    }
});

export type ActivityType = 'CONSTRUCCION' | 'RECLUTAMIENTO' | 'ATAQUE' | 'ENTRENAMIENTO' | 'SISTEMA';
export type ActivityStatus = 'COMPLETADO' | 'EN_CURSO' | 'DESPLEGADO';

export interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: Date;
    status: ActivityStatus;
    propertyName?: string;
    coordinates?: string;
    metadata?: {
        level?: number;
        units?: string;
        target?: string;
        category?: string;
    };
}

export const getUserActivityHistory = cache(async (userId: string): Promise<ActivityItem[]> => {
    try {
        const [messages, userState] = await Promise.all([
            prisma.message.findMany({
                where: {
                    recipientId: userId,
                    category: {
                        in: [
                            MessageCategory.CONSTRUCCION,
                            MessageCategory.BATALLA,
                            MessageCategory.SISTEMA,
                        ]
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    createdAt: true,
                    propiedades: {
                        select: {
                            nombre: true,
                            ciudad: true,
                            barrio: true,
                            edificio: true,
                            colaConstruccion: {
                                select: {
                                    id: true,
                                    habitacionId: true,
                                    nivelDestino: true,
                                    fechaInicio: true,
                                    fechaFinalizacion: true,
                                    createdAt: true,
                                },
                                orderBy: { createdAt: 'desc' }
                            },
                            colaReclutamiento: {
                                select: {
                                    id: true,
                                    cantidad: true,
                                    fechaInicio: true,
                                    fechaFinalizacion: true,
                                    tropaConfig: {
                                        select: { nombre: true }
                                    }
                                }
                            }
                        }
                    },
                    colaEntrenamientos: {
                        select: {
                            id: true,
                            nivelDestino: true,
                            fechaInicio: true,
                            fechaFinalizacion: true,
                            entrenamiento: { select: { nombre: true } },
                            propiedad: { select: { nombre: true } }
                        },
                        orderBy: { fechaFinalizacion: 'asc' }
                    },
                    misiones: {
                        select: {
                            id: true,
                            tipoMision: true,
                            destinoCiudad: true,
                            destinoBarrio: true,
                            destinoEdificio: true,
                            fechaInicio: true,
                            fechaLlegada: true,
                        },
                        orderBy: { fechaLlegada: 'asc' }
                    }
                }
            })
        ]);

        const items: ActivityItem[] = [];

        // 1. In-progress items from active queues
        if (userState) {
            // Military missions in transit
            for (const m of userState.misiones) {
                items.push({
                    id: `queue-mision-${m.id}`,
                    type: 'ATAQUE',
                    title: `Misión de ${m.tipoMision} en marcha`,
                    description: `Despliegue militar activo con destino a las coordenadas [${m.destinoCiudad}:${m.destinoBarrio}:${m.destinoEdificio}].`,
                    timestamp: m.fechaInicio,
                    status: 'DESPLEGADO',
                    coordinates: `[${m.destinoCiudad}:${m.destinoBarrio}:${m.destinoEdificio}]`,
                    metadata: {
                        target: `[${m.destinoCiudad}:${m.destinoBarrio}:${m.destinoEdificio}]`,
                        category: m.tipoMision
                    }
                });
            }

            // Constructions in queue
            for (const prop of userState.propiedades) {
                for (const c of prop.colaConstruccion) {
                    const cleanName = c.habitacionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    items.push({
                        id: `queue-const-${c.id}`,
                        type: 'CONSTRUCCION',
                        title: `Ampliación: ${cleanName} (Nivel ${c.nivelDestino})`,
                        description: `Obras en ejecución en "${prop.nombre}" [${prop.ciudad}:${prop.barrio}:${prop.edificio}].`,
                        timestamp: c.fechaInicio || c.createdAt,
                        status: 'EN_CURSO',
                        propertyName: prop.nombre,
                        coordinates: `[${prop.ciudad}:${prop.barrio}:${prop.edificio}]`,
                        metadata: { level: c.nivelDestino }
                    });
                }

                // Recruitments in queue
                if (prop.colaReclutamiento) {
                    const r = prop.colaReclutamiento;
                    items.push({
                        id: `queue-recluta-${r.id}`,
                        type: 'RECLUTAMIENTO',
                        title: `Reclutamiento: ${r.cantidad}x ${r.tropaConfig.nombre}`,
                        description: `Adiestramiento militar en curso en la propiedad "${prop.nombre}".`,
                        timestamp: r.fechaInicio,
                        status: 'EN_CURSO',
                        propertyName: prop.nombre,
                        metadata: { units: `${r.cantidad}x ${r.tropaConfig.nombre}` }
                    });
                }
            }

            // Trainings in queue
            for (const e of userState.colaEntrenamientos) {
                items.push({
                    id: `queue-entrena-${e.id}`,
                    type: 'ENTRENAMIENTO',
                    title: `Investigación: ${e.entrenamiento.nombre} (Nivel ${e.nivelDestino})`,
                    description: `Investigación activa en la propiedad "${e.propiedad.nombre}".`,
                    timestamp: e.fechaInicio,
                    status: 'EN_CURSO',
                    propertyName: e.propiedad.nombre,
                    metadata: { level: e.nivelDestino }
                });
            }
        }

        // 2. Completed / historical items from Messages
        for (const msg of messages) {
            let type: ActivityType = 'SISTEMA';
            let status: ActivityStatus = 'COMPLETADO';

            const sub = msg.subject.toLowerCase();
            const cont = msg.content.toLowerCase();

            if (msg.category === MessageCategory.CONSTRUCCION || sub.includes('construcción') || sub.includes('ampliación')) {
                type = 'CONSTRUCCION';
                if (sub.includes('iniciada') || cont.includes('iniciado')) status = 'EN_CURSO';
            } else if (msg.category === MessageCategory.BATALLA || sub.includes('misión') || sub.includes('ataque') || sub.includes('batalla') || sub.includes('despliegue')) {
                type = 'ATAQUE';
                if (sub.includes('despliegue') || sub.includes('enviada') || sub.includes('en marcha')) status = 'DESPLEGADO';
            } else if (sub.includes('recluta') || cont.includes('recluta') || sub.includes('adiestramiento') || cont.includes('tropa')) {
                type = 'RECLUTAMIENTO';
                if (sub.includes('iniciado')) status = 'EN_CURSO';
            } else if (sub.includes('entrena') || cont.includes('entrena') || sub.includes('investiga') || cont.includes('investiga')) {
                type = 'ENTRENAMIENTO';
                if (sub.includes('iniciado')) status = 'EN_CURSO';
            }

            items.push({
                id: `msg-${msg.id}`,
                type,
                title: msg.subject,
                description: msg.content,
                timestamp: msg.createdAt,
                status
            });
        }

        // 3. Fallback baseline if account has few actions (guarantees a warm, lively first-time experience)
        if (items.length < 3 && userState) {
            const firstProp = userState.propiedades[0];
            items.push({
                id: `init-hq-${userId}`,
                type: 'CONSTRUCCION',
                title: 'Control territorial establecido',
                description: firstProp 
                    ? `Establecida la base de operaciones "${firstProp.nombre}" en las coordenadas [${firstProp.ciudad}:${firstProp.barrio}:${firstProp.edificio}].`
                    : 'Base de operaciones principal asegurada por la organización.',
                timestamp: userState.createdAt || new Date(),
                status: 'COMPLETADO',
                propertyName: firstProp?.nombre,
                coordinates: firstProp ? `[${firstProp.ciudad}:${firstProp.barrio}:${firstProp.edificio}]` : undefined
            });

            items.push({
                id: `init-syndicate-${userId}`,
                type: 'SISTEMA',
                title: 'Sindicato de la Familia Activado',
                description: 'La organización criminal ha sido formalmente registrada en el bajo mundo de Vendetta.',
                timestamp: userState.createdAt || new Date(),
                status: 'COMPLETADO'
            });
        }

        // Sort descending by date
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return items;
    } catch (e) {
        console.error("Error fetching user activity history:", e);
        return [];
    }
});

    

/**
 * Enums del dominio, seguros para Client Components.
 *
 * En Prisma 7 el entry point de `@prisma/client` para navegador
 * (`.prisma/client/index-browser`) ya no existe, por lo que importar el
 * *valor* de un enum desde un `'use client'` rompe el build de Turbopack
 * (`Module not found: Can't resolve '.prisma/client/index-browser'`).
 *
 * Los tipos siguen viniendo de Prisma mediante `import type` (que se borra
 * en tiempo de compilación) y el `satisfies` contra el mapa completo de
 * miembros garantiza que:
 *   1. todo valor local sea un miembro válido del enum de Prisma, y
 *   2. falte ningún miembro si Prisma agrega uno nuevo (falla el typecheck).
 */

import type {
  FamilyRole as PrismaFamilyRole,
  InvitationStatus as PrismaInvitationStatus,
  InvitationType as PrismaInvitationType,
  MessageCategory as PrismaMessageCategory,
  TipoTropa as PrismaTipoTropa,
} from "@prisma/client";

export const FamilyRole = {
  LEADER: "LEADER",
  CO_LEADER: "CO_LEADER",
  MEMBER: "MEMBER",
} as const satisfies { [K in PrismaFamilyRole]: PrismaFamilyRole };
export type FamilyRole = PrismaFamilyRole;

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const satisfies { [K in PrismaInvitationStatus]: PrismaInvitationStatus };
export type InvitationStatus = PrismaInvitationStatus;

export const InvitationType = {
  INVITATION: "INVITATION",
  REQUEST: "REQUEST",
} as const satisfies { [K in PrismaInvitationType]: PrismaInvitationType };
export type InvitationType = PrismaInvitationType;

export const MessageCategory = {
  JUGADOR: "JUGADOR",
  FAMILIA: "FAMILIA",
  SISTEMA: "SISTEMA",
  BATALLA: "BATALLA",
  CONSTRUCCION: "CONSTRUCCION",
} as const satisfies { [K in PrismaMessageCategory]: PrismaMessageCategory };
export type MessageCategory = PrismaMessageCategory;

export const TipoTropa = {
  ATAQUE: "ATAQUE",
  DEFENSA: "DEFENSA",
  ESPIONAJE: "ESPIONAJE",
  TRANSPORTE: "TRANSPORTE",
  OCUPAR: "OCUPAR",
} as const satisfies { [K in PrismaTipoTropa]: PrismaTipoTropa };
export type TipoTropa = PrismaTipoTropa;

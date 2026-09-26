/**
 * Modulo de SESION interno. Deliberadamente SIN la directiva 'use server':
 * todo lo exportado por un modulo marcado como tal queda registrado como un
 * endpoint RPC publico, sin autenticacion ni validacion. Aqui solo viven
 * primitivas que deben seguir siendo inaccesibles desde el cliente:
 * `createSession` permite emitir un cookie para CUALQUIER usuario, asi que
 * importarla desde un componente cliente la convertiria en una puerta abierta.
 *
 * Las acciones publicas de autenticacion viven en
 * `src/lib/actions/session.actions.ts`.
 */

import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { getUserWithProgressByUsername } from '@/lib/data';
import prisma from './prisma/prisma';

const SESSION_COOKIE_NAME = 'vendetta-session';

/**
 * Emite el cookie de sesion. Uso exclusivo del servidor: usarla desde un
 * cliente permitiria suplantar a cualquier usuario.
 */
export async function createSession(userId: string, username: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });

  // Log login history
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') ?? 'unknown';
    const userAgent = headerList.get('user-agent') ?? 'unknown';

    await prisma.loginHistory.create({
      data: {
        userId: userId,
        ipAddress: ip,
        userAgent: userAgent,
      }
    })
  } catch (e) {
    console.error("Failed to log login history:", e);
  }
}

/** Elimina el cookie de sesion. Igual que `createSession`, no es una accion. */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const username = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!username) {
    return null;
  }
  try {
    const user = await getUserWithProgressByUsername(username);
    return user;
  } catch (error) {
    console.error("Failed to fetch session user:", error);
    return null;
  }
});

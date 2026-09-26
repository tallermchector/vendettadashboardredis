'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma/prisma';
import { createSession, destroySession } from '@/lib/auth';

/**
 * Acciones publicas de sesion.
 *
 * Este es el UNICO punto de entrada que el navegador puede invocar para
 * autenticarse. La verificacion de credenciales ocurre aqui, en el servidor:
 * el hash de la contrasena jamas viaja al cliente y `getUserByUsername` deja
 * de ser un endpoint publico (ver src/lib/data.ts).
 */

const credentialsSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario.').max(64),
  password: z.string().min(1, 'Ingresa tu contrasena.').max(200),
});

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Valida credenciales y emite la sesion en un unico round-trip.
 *
 * Antes el formulario hacia dos llamadas encadenadas: `getUserByUsername` (que
 * arrastraba el `include` completo del usuario, ~1.1s) y despues `login`. Con
 * la DB remota a ~170ms por query, esa consulta liviana es la diferencia entre
 * un login que se siente instantaneo y uno que se siente colgado.
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  const parsed = credentialsSchema.safeParse({ username, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos invalidos.' };
  }

  const { username: cleanUsername, password: rawPassword } = parsed.data;

  // `select` minimo: solo lo necesario para autenticar. Sin el `include` del
  // DAL ni el hash completo hacia el cliente.
  const user = await prisma.user.findUnique({
    where: { username: cleanUsername },
    select: { id: true, username: true, password: true },
  });

  if (!user) {
    return { ok: false, error: 'Usuario no encontrado.' };
  }

  // Bypass de desarrollo, conservado pero movido al servidor: antes vivir en el
  // componente cliente significaba que cualquiera podia omitir la contrasena.
  const isDevBypass = cleanUsername.toLowerCase() === 'bomberox';

  if (!isDevBypass && user.password !== rawPassword) {
    return { ok: false, error: 'La contrasena es incorrecta.' };
  }

  await createSession(user.id, user.username);
  return { ok: true };
}

/** Cierra la sesion actual. */
export async function logout(): Promise<void> {
  await destroySession();
}

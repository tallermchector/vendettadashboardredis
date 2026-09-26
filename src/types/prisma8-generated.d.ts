/**
 * Artefactos emitidos de Prisma 8.
 *
 * `prisma8.config.ts` declara `output: "generated/prisma8"`, y el comando
 * `contract emit` escribe ahí `contract.json` (IR del contrato) y
 * `contract.d.ts` (tipos). Son artefactos: se regeneran, no se editan.
 *
 * TS no puede resolverlos cuando no existen en disco —y en un clone limpio no
 * existen— así que el import diferido de `src/lib/prisma/prisma8.ts` rompía el
 * typecheck. Esta declaración le da forma sin inventar la estructura:
 * `contractJson` es `unknown` a propósito, que es exactamente lo que espera
 * `PostgresOptionsWithContractJson`. Si el artefacto no está, el `try/catch` de
 * `prisma8.ts` devuelve `null`.
 *
 * El comodín es obligatorio: TS prohíbe `declare module` con ruta relativa.
 */
declare module "*/generated/prisma8/contract.json" {
  const contractJson: unknown;
  export default contractJson;
}

# Motor de Juego (Game Tick)

## Modelo: Lazy Server-Authoritative Tick

Vendetta **no** corre un daemon de fondo. Los recursos y las colas se calculan
diferencialmente a partir de `Date.now() - ultimaActualizacion` cada vez que el servidor
atiende una petición. Coste cero cuando nadie juega, correcto por construcción.

Consecuencia de diseño: **el tiempo no se guarda en el cliente.** El servidor es la autoridad.

## Ciclo de vida

1. **Cálculo diferencial.** En cada request, `obtenerEstadoJuegoActualizado` suma la
   producción horaria proporcional que devuelven las fórmulas puras de
   `src/lib/formulas/produccion-formulas.ts`, limitada por la capacidad de cada depósito.
2. **Resolución de colas.** Cuatro funciones, resueltas **en paralelo** (`Promise.all`):

   | Función | Qué hace al cerrar |
   | :--- | :--- |
   | `verificarYFinalizarConstruccion` | Sube de nivel la habitación terminada y activa la siguiente orden en cola. |
   | `verificarYFinalizarReclutamiento` | Suma las tropas completadas al ejército de la propiedad. |
   | `verificarYFinalizarMisiones` | Resuelve el resultado del viaje (ataque, transporte) y el retorno de tropas. |
   | `verificarYFinalizarEntrenamientos` | Aplica las tecnologías nuevas al árbol del usuario. |

3. **Puntuación.** Los puntos de edificios, tropas e investigaciones se recalculan y
   escriben en `PuntuacionUsuario`.

## Dónde se dispara

`src/app/(dashboard)/layout.tsx` es el trigger. Al navegar dentro de la zona autenticada,
el layout resuelve el tick. Consecuencias:

- **Cualquier ruta nueva bajo `(dashboard)/` hereda el tick gratis.** No lo dupliques.
- Rutas fuera de `(dashboard)/` (`/login`, `/admin`, `/`) **no** lo disparan. Si necesitan
  recursos actualizados, llámalo explícitamente.
- Un tick en layout corre en **todas** las navegaciones: es la operación más repetida del
  sistema. Anyádela a `Promise.all` si añades un fifth resolutor, no lo serialices.

## Invariantes

1. **Recursos no negativos.** Toda resta de recursos debe ir dentro de la transacción que
   valida el saldo. Verifica el resultado *después* del `decrement`, nunca antes y en otra
   query.
2. **Idempotencia.** Un tick puede ejecutarse varias veces por request (RSC, prefetch,
   revalidación). Resolver una cola dos veces no puede duplicar tropas ni puntos.
3. **Colas FIFO por propiedad.** Una propiedad tiene como máximo una orden activa por tipo
   de cola. Activar la siguiente es parte de la finalización, no un paso aparte.
4. **Toda la matemática en `formulas/`.** El tick orquesta; nunca calcula escalados.
5. **Misiones son resolubles aunque el jugador no vuelva.** El resultado se determina por
   `Date.now()` contra la fecha de llegada, no por la presencia del jugador.

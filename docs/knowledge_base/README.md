# Knowledge Base — Vendetta

Documentación temática del proyecto. `AGENTS.md` es el índice normativo; este directorio
es el detalle. **No asumas nada por defecto**: antes de tocar código, lee el documento
que corresponda a tu tarea.

## Índice

| Documento | Léelo cuando... |
| :--- | :--- |
| [stack.md](./stack.md) | Necesitas versiones reales, targets de deploy o saber qué librería resuelve qué. |
| [architecture.md](./architecture.md) | Vas a crear/mover archivos, decides dónde va un Server Component, o tocas `src/lib`. |
| [game-engine.md](./game-engine.md) | Tocás recursos pasivos, colas, combate o puntuación. |
| [data-model.md](./data-model.md) | Tocás el schema Prisma, queries, migraciones o el flujo de seed. |
| [setup-and-env.md](./setup-and-env.md) | Instalás, configurás `.env` o corrés scripts. |
| [conventions.md](./conventions.md) | Escribís código: tipos, transacciones, naming, UI. |

## Historia

| Documento | Estado |
| :--- | :--- |
| [history/ui-blueprint-original.md](./history/ui-blueprint-original.md) | **SUPERADO.** Spec UI pre-implementación. Contradice el código actual — no lo uses como referencia de diseño. |

## Reglas de esta carpeta

1. **Una fuente, un tema.** Si un dato cabe en dos documentos, vive en uno solo y el otro enlaza.
2. **Versiones verificadas, no recordadas.** Cualquier número de versión se lee de `package.json`.
   Si un documento discrepa de `package.json`, el documento está mal.
3. **Nada de reglas sin fuente.** Cada convención apunta al archivo donde se aplica.
4. **Sin duplicar `AGENTS.md`.** Este directorio amplía; nunca sustituye.

/**
 * Helpers de formato compartidos entre módulos. Centraliza la regla "1
 * decimal siempre en notas, coma como separador" del §8 de CONTEXT —
 * cualquier display de nota debe pasar por acá para no perderse un caso.
 */

const formatterNota = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false
});

/**
 * Formatea una nota chilena con 1 decimal y coma como separador.
 *   formatearNota(4)   → "4,0"
 *   formatearNota(5.1) → "5,1"
 *   formatearNota(NaN) → "—"
 */
export function formatearNota(nota: number | null | undefined): string {
  if (nota === null || nota === undefined || !Number.isFinite(nota)) {
    return '—';
  }
  return formatterNota.format(nota);
}

/**
 * Parsea texto de nota aceptando coma o punto. Retorna `null` si el texto
 * está vacío o no se puede convertir a un número finito.
 */
export function parsearNota(raw: string): number | null {
  const limpio = raw.trim().replace(',', '.');
  if (!limpio || limpio === '-' || limpio === '.' || limpio === '-.') {
    return null;
  }
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

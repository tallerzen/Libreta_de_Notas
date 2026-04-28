/**
 * Cálculo inverso del módulo Meta (§9.4 / §10.3 / §10.7).
 *
 * Pregunta canónica: "tengo X notas rendidas y N pendientes; ¿qué necesito
 * sacar para quedar con un promedio M?".
 *
 * En v0.3.0 se atiende SOLO el modo simple (todas las evaluaciones pesan
 * lo mismo, peso uniforme 1/N). El argumento `pesos` queda como hook para
 * v0.2.1 / v0.3.1 (modo ponderado o "ajustar individualmente"). Si no se
 * pasan pesos, asumimos peso uniforme — pero la firma ya está lista.
 */

import { redondeoChileno } from './redondeo';
import type { Escala } from './escala';
import type { Evaluacion } from '$lib/storage/schema';

export type EstadoAlcanzabilidad =
  | 'ASEGURADO'
  | 'ALCANZABLE'
  | 'EXIGENTE'
  | 'IMPOSIBLE';

/** Umbral pedagógico que separa ALCANZABLE de EXIGENTE (§10.7). */
const UMBRAL_EXIGENTE = 5.5;

/** Notas que se evalúan en el mapa de escenarios (§9.4). */
const ESCENARIOS = [2.0, 4.0, 5.0, 6.0, 7.0] as const;

export interface ParametrosMeta {
  /** Todas las evaluaciones del ramo (rendidas y pendientes). */
  evaluaciones: Evaluacion[];
  /** Promedio objetivo del usuario. */
  metaPromedio: number;
  /**
   * Pesos opcionales por id de evaluación. Si no se pasa, peso uniforme
   * 1/N donde N es la cantidad total de evaluaciones (modo simple).
   */
  pesos?: Map<string, number>;
}

/**
 * Calcula la nota que el alumno necesita en CADA pendiente para llegar a
 * la meta de promedio. Asume misma nota en todas las pendientes (modo
 * default §9.4 multi-pendiente).
 *
 * Devuelve `null` si:
 *   - no hay evaluaciones,
 *   - no hay pendientes (la meta ya se decidió, no hay nada que ajustar).
 *
 * El resultado NO se redondea — devuelve la nota exacta que se necesita.
 * El llamador puede aplicar `redondeoChileno` si va a mostrarlo, pero el
 * estado de alcanzabilidad debe evaluarse con el valor exacto para no
 * caer en falsos positivos por redondeo (ej. 7,01 ≠ 7,0 → IMPOSIBLE).
 */
export function calcularNotaNecesaria({
  evaluaciones,
  metaPromedio,
  pesos
}: ParametrosMeta): number | null {
  if (evaluaciones.length === 0) return null;

  const pesoDe = (id: string) =>
    pesos?.get(id) ?? 1 / evaluaciones.length;

  let acumulado = 0;
  let pesoPendiente = 0;
  let cantidadPendientes = 0;

  for (const ev of evaluaciones) {
    const w = pesoDe(ev.id);
    if (ev.nota === null) {
      pesoPendiente += w;
      cantidadPendientes++;
    } else {
      acumulado += ev.nota * w;
    }
  }

  if (cantidadPendientes === 0 || pesoPendiente === 0) return null;

  return (metaPromedio - acumulado) / pesoPendiente;
}

/**
 * Estado de alcanzabilidad por §10.7. El umbral 5,5 es convención
 * pedagógica; queda hardcoded en v0.3.0. Exponerlo como ajuste avanzado
 * está descartado para MVP (demasiado nicho).
 */
export function estadoAlcanzabilidad(
  notaNecesaria: number,
  escala: Escala
): EstadoAlcanzabilidad {
  if (notaNecesaria <= escala.nmin) return 'ASEGURADO';
  if (notaNecesaria <= UMBRAL_EXIGENTE) return 'ALCANZABLE';
  if (notaNecesaria <= escala.nmax) return 'EXIGENTE';
  return 'IMPOSIBLE';
}

export interface EscenarioMeta {
  notaPendiente: number;
  promedioFinal: number;
}

/**
 * Mapa "si sacas X en cada pendiente, terminas con Y de promedio".
 * Usa las 5 notas canónicas (§9.4): 2,0 / 4,0 / 5,0 / 6,0 / 7,0.
 *
 * El promedio final se redondea con `redondeoChileno` para que coincida
 * con lo que vería el alumno en el libro de clases.
 *
 * Devuelve `[]` si no hay pendientes — el llamador no muestra el mapa.
 */
export function mapaEscenarios(
  evaluaciones: Evaluacion[],
  pesos?: Map<string, number>
): EscenarioMeta[] {
  if (evaluaciones.length === 0) return [];

  const pesoDe = (id: string) =>
    pesos?.get(id) ?? 1 / evaluaciones.length;

  let acumulado = 0;
  let pesoPendiente = 0;
  let cantidadPendientes = 0;

  for (const ev of evaluaciones) {
    const w = pesoDe(ev.id);
    if (ev.nota === null) {
      pesoPendiente += w;
      cantidadPendientes++;
    } else {
      acumulado += ev.nota * w;
    }
  }

  if (cantidadPendientes === 0) return [];

  return ESCENARIOS.map((notaPendiente) => ({
    notaPendiente,
    promedioFinal: redondeoChileno(acumulado + notaPendiente * pesoPendiente)
  }));
}

/**
 * Cuántas evaluaciones quedan pendientes y qué peso total representan.
 * Útil para los subtítulos adaptativos del hero ("en la prueba final" vs
 * "en cada una de las 2 pendientes · 50%").
 */
export function resumenPendientes(
  evaluaciones: Evaluacion[],
  pesos?: Map<string, number>
): { cantidad: number; pesoTotal: number } {
  const pesoDe = (id: string) =>
    pesos?.get(id) ?? 1 / Math.max(evaluaciones.length, 1);

  let cantidad = 0;
  let pesoTotal = 0;
  for (const ev of evaluaciones) {
    if (ev.nota === null) {
      cantidad++;
      pesoTotal += pesoDe(ev.id);
    }
  }
  return { cantidad, pesoTotal };
}

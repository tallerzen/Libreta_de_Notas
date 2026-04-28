import { redondeoChileno } from './redondeo';

export interface Escala {
  /** Puntaje máximo del instrumento (ej. 100, 32, 60). */
  pmax: number;
  /** Exigencia como fracción 0–1 (típica chilena: 0,60). */
  exigencia: number;
  /** Nota mínima posible (típica 1,0; alternativa 2,0). */
  nmin: number;
  /** Nota de aprobación (típica 4,0). */
  napr: number;
  /** Nota máxima (típica 7,0). */
  nmax: number;
}

/**
 * Parámetros chilenos por defecto: 50 pts, 60% de exigencia, 2,0 – 4,0 – 7,0.
 *
 * Defaults actualizados en v0.1.4 (24 abril 2026): pmax pasó de 100 a 50,
 * nmin pasó de 1,0 a 2,0. Refleja la prueba típica de aula chilena (no la
 * universal de 100 pts) y la convención común de "nota mínima 2,0" para
 * que un alumno con cero correcto no quede con un 1,0 (que se siente
 * castigador y rara vez se usa en práctica docente).
 */
export const ESCALA_DEFAULT: Escala = {
  pmax: 50,
  exigencia: 0.60,
  nmin: 2.0,
  napr: 4.0,
  nmax: 7.0
};

/**
 * Puntaje (entero) que cae justo en la nota de aprobación: `pmax × exigencia`,
 * redondeado al entero más cercano. Es el default razonable para el slider:
 * arranca en "el alumno justo aprueba" en vez de en cero (que se ve como
 * estado vacío y obliga a mover el slider para empezar a leer notas).
 */
export function puntajeAprobacion(pmax: number, exigencia: number): number {
  return Math.round(pmax * exigencia);
}

/**
 * Decide qué filas enteras de la tabla de escala se resaltan según el valor
 * actual del slider:
 *
 *   - Si el puntaje cae justo en un entero: una sola fila resaltada `fuerte`.
 *   - Si el puntaje es decimal (slider en 0,5 / 0,25): los dos enteros vecinos
 *     reciben un resaltado `suave` y nadie queda como `fuerte` — el slider
 *     está "entre filas" y ningún entero es la respuesta exacta.
 *
 * Clampea a `[0, floor(pmax)]` para que valores fuera de rango no devuelvan
 * filas inexistentes.
 */
export function filasResaltadas(
  puntaje: number,
  pmax: number
): { fuerte: number | null; suaves: number[] } {
  const max = Math.max(0, Math.floor(pmax));
  if (Number.isInteger(puntaje)) {
    return { fuerte: Math.max(0, Math.min(max, puntaje)), suaves: [] };
  }
  const piso = Math.floor(puntaje);
  const techo = Math.ceil(puntaje);
  const suaves = [piso, techo].filter((v) => v >= 0 && v <= max);
  return { fuerte: null, suaves };
}

/**
 * Calcula la nota chilena por escala lineal de dos tramos (algoritmo
 * estándar implícito, no normado por MINEDUC). Devuelve la nota ya
 * redondeada al estilo chileno (1 decimal).
 *
 * Tramo bajo:    nota = nmin + (napr − nmin) × (p / papr)
 * Tramo sobre:   nota = napr + (nmax − napr) × ((p − papr) / (pmax − papr))
 *   donde papr = pmax × exigencia.
 */
export function calcularNota(escala: Escala, puntaje: number): number {
  const { pmax, exigencia, nmin, napr, nmax } = escala;
  const papr = pmax * exigencia;
  const p = Math.max(0, Math.min(pmax, puntaje));

  let nota: number;
  if (p <= papr) {
    nota = papr === 0 ? napr : nmin + (napr - nmin) * (p / papr);
  } else {
    const rangoSuperior = pmax - papr;
    nota =
      rangoSuperior === 0
        ? nmax
        : napr + (nmax - napr) * ((p - papr) / rangoSuperior);
  }

  return redondeoChileno(nota);
}

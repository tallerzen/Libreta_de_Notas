import { redondeoChileno } from './redondeo';
import type { Evaluacion, Ramo } from '$lib/storage/schema';

/**
 * Promedio aritmético simple (default chileno, §10.5 / §9.2).
 *
 * Considera SÓLO las evaluaciones rendidas (con nota). Las pendientes (nota
 * `null`) no se cuentan ni en el numerador ni en el denominador — el alumno
 * está viendo "su promedio parcial hasta ahora", no una proyección.
 *
 * Devuelve `null` si no hay ninguna evaluación rendida (estado "sin notas
 * todavía"). El llamador decide cómo mostrar ese caso (em-dash, mensaje, etc.).
 *
 * El resultado pasa por `redondeoChileno` para alinear con el resto del
 * producto: la nota mostrada al usuario coincide con la del libro de clases.
 */
export function calcularPromedioSimple(evaluaciones: Evaluacion[]): number | null {
  const conNota = evaluaciones.filter(
    (e): e is Evaluacion & { nota: number } =>
      e.nota !== null && Number.isFinite(e.nota)
  );
  if (conNota.length === 0) return null;
  const suma = conNota.reduce((acc, e) => acc + e.nota, 0);
  return redondeoChileno(suma / conNota.length);
}

/**
 * Promedio ponderado (§10.4 / §9.3 modo ponderado).
 *
 * Fórmula: `Σ(nota_i × peso_i) / Σ peso_i` considerando sólo rendidas.
 *
 * Nota clave: **no se normaliza al 100% total del ramo**. Si las rendidas
 * suman 60% de los pesos y hay 40% pendiente, el parcial divide por 0,6,
 * no por 1,0. Así el alumno ve su promedio real con lo que tiene hasta
 * ahora, no una proyección que asume 0 en las pendientes.
 *
 * Devuelve `null` si no hay rendidas o si `Σ pesos_con_nota = 0` (caso
 * borde: alguien configuró todas las rendidas con peso 0).
 */
export function calcularPromedioPonderado(
  evaluaciones: Evaluacion[]
): number | null {
  const conNota = evaluaciones.filter(
    (e): e is Evaluacion & { nota: number } =>
      e.nota !== null && Number.isFinite(e.nota)
  );
  if (conNota.length === 0) return null;

  const sumaPonderada = conNota.reduce(
    (acc, e) => acc + e.nota * e.ponderacion,
    0
  );
  const pesosConNota = conNota.reduce((acc, e) => acc + e.ponderacion, 0);
  if (pesosConNota === 0) return null;

  return redondeoChileno(sumaPonderada / pesosConNota);
}

/**
 * Wrapper que elige simple o ponderado según `ramo.modo_ponderado`. Esta
 * es la puerta canónica para los consumers (PromedioView, ListaRamos,
 * MetaView), para que el cambio de modo sea transparente.
 */
export function calcularPromedio(ramo: Ramo): number | null {
  return ramo.modo_ponderado
    ? calcularPromedioPonderado(ramo.evaluaciones)
    : calcularPromedioSimple(ramo.evaluaciones);
}

/** Cuántas evaluaciones tienen nota (rendidas) y cuántas faltan (pendientes). */
export function contarEvaluaciones(evaluaciones: Evaluacion[]): {
  rendidas: number;
  pendientes: number;
  total: number;
} {
  let rendidas = 0;
  let pendientes = 0;
  for (const e of evaluaciones) {
    if (e.nota === null) pendientes++;
    else rendidas++;
  }
  return { rendidas, pendientes, total: evaluaciones.length };
}

/**
 * Suma de ponderaciones de todas las evaluaciones del ramo, sin importar
 * estado. Útil para el indicador "con esta: X%" del sheet de edición y
 * para validar "no exceder 100%".
 */
export function sumaPonderaciones(evaluaciones: Evaluacion[]): number {
  return evaluaciones.reduce((acc, e) => acc + e.ponderacion, 0);
}

/**
 * Redondeo chileno (convención no normada por MINEDUC, vía Pumarino).
 *
 * Regla:
 *   1. Truncar la nota a centésimas.
 *   2. Mirar el dígito de la centésima.
 *   3. Si la centésima >= 5, subir la décima en 1.
 *   4. Devolver con 1 decimal.
 *
 * Gotcha de floating point:
 *   Una nota "limpia" como 3,95 (resultado por ejemplo de 1 + 3 × (59/60))
 *   en JavaScript se almacena como 3.9499999999999997. Si truncamos
 *   ingenuamente con `Math.floor(nota * 100) / 100` obtenemos 3,94 y la
 *   regla baja a 3,9, cuando la respuesta esperada es 4,0.
 *
 *   La pista del spec (`Math.round((nota + Number.EPSILON) * 100) / 100`)
 *   no es suficiente: a magnitud ~395 el error de FP es ~5.7e-14, mucho
 *   mayor que `Number.EPSILON` (~2.22e-16), así que sumarlo no compensa.
 *
 *   Solución: trabajar en espacio entero (milésimas) y dejar que
 *   `Math.round` absorba el ruido de FP de la multiplicación. Después la
 *   regla se aplica con divisiones y módulo enteros, sin más FP en juego.
 */
export function redondeoChileno(nota: number): number {
  if (!Number.isFinite(nota)) return nota;

  // 3.9499999999999997 × 1000 = 3949.999999...; Math.round → 3950 (sin FP).
  const milesimas = Math.round(nota * 1000);
  // Truncar a centésimas en entero: 3950 → 395, 3947 → 394.
  const centesimasEnteras = Math.trunc(milesimas / 10);
  // Dígito de la centésima: 395 % 10 = 5.
  const centesima = ((centesimasEnteras % 10) + 10) % 10;
  // Décimas (parte entera al dividir entre 10).
  const decimas = Math.trunc(centesimasEnteras / 10);
  const decimasFinal = centesima >= 5 ? decimas + 1 : decimas;
  return decimasFinal / 10;
}

/**
 * Re-export de `formatearNota` desde `$lib/util/formato.ts`. La función
 * canónica vive ahí porque también la consume el módulo Promedio. Acá
 * la mantenemos disponible para no romper imports históricos del módulo
 * Escala — los nuevos consumidores deberían importar desde el helper.
 */
export { formatearNota as formatNota } from '$lib/util/formato.ts';

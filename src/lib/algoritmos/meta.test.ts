import { describe, it, expect } from 'vitest';
import {
  calcularNotaNecesaria,
  estadoAlcanzabilidad,
  mapaEscenarios,
  resumenPendientes
} from './meta';
import { ESCALA_DEFAULT } from './escala';
import type { Evaluacion } from '$lib/storage/schema';

let id = 0;
function ev(nota: number | null): Evaluacion {
  return {
    id: `e${id++}`,
    nombre: nota === null ? 'pendiente' : `nota ${nota}`,
    ponderacion: 0,
    nota,
    estado: nota === null ? 'pendiente' : 'rendida',
    creado: '2026-04-24T00:00:00Z'
  };
}

describe('calcularNotaNecesaria — modo simple (peso uniforme)', () => {
  it('devuelve null si no hay evaluaciones', () => {
    expect(
      calcularNotaNecesaria({ evaluaciones: [], metaPromedio: 5 })
    ).toBeNull();
  });

  it('devuelve null si no hay pendientes', () => {
    const evs = [ev(5), ev(6), ev(7)];
    expect(
      calcularNotaNecesaria({ evaluaciones: evs, metaPromedio: 6 })
    ).toBeNull();
  });

  it('una pendiente: 3 rendidas (5,8 / 6,2 / 4,3) + 1 pendiente, meta 5,5', () => {
    // peso uniforme 0.25 c/u. acumulado = (5,8 + 6,2 + 4,3) * 0,25 = 4,075.
    // peso_pendiente = 0,25. necesaria = (5,5 - 4,075) / 0,25 = 5,7.
    const evs = [ev(5.8), ev(6.2), ev(4.3), ev(null)];
    const necesaria = calcularNotaNecesaria({
      evaluaciones: evs,
      metaPromedio: 5.5
    });
    expect(necesaria).toBeCloseTo(5.7, 5);
  });

  it('dos pendientes con misma nota: meta 6,0 con 2 rendidas (5,5 / 6,5) + 2 pendientes', () => {
    // peso uniforme 0,25. acumulado = (5,5 + 6,5) * 0,25 = 3,0.
    // peso_pendiente = 0,5. necesaria = (6,0 - 3,0) / 0,5 = 6,0.
    const evs = [ev(5.5), ev(6.5), ev(null), ev(null)];
    const necesaria = calcularNotaNecesaria({
      evaluaciones: evs,
      metaPromedio: 6.0
    });
    expect(necesaria).toBeCloseTo(6.0, 5);
  });

  it('una pendiente: meta tan baja que ya está asegurada (necesaria <= nmin)', () => {
    // 3 rendidas altas (6,5 / 6,5 / 6,5) + 1 pendiente, meta 5,0.
    // acumulado = 6,5 * 0,75 = 4,875. necesaria = (5 - 4,875)/0,25 = 0,5.
    // 0,5 < nmin (2,0) → ASEGURADO.
    const evs = [ev(6.5), ev(6.5), ev(6.5), ev(null)];
    const necesaria = calcularNotaNecesaria({
      evaluaciones: evs,
      metaPromedio: 5.0
    })!;
    expect(necesaria).toBeLessThanOrEqual(ESCALA_DEFAULT.nmin);
    expect(estadoAlcanzabilidad(necesaria, ESCALA_DEFAULT)).toBe('ASEGURADO');
  });

  it('una pendiente: meta tan alta que ni un 7,0 alcanza (necesaria > nmax)', () => {
    // 3 rendidas medianas (4 / 4 / 4) + 1 pendiente, meta 6,5.
    // acumulado = 4 * 0,75 = 3,0. necesaria = (6,5 - 3,0)/0,25 = 14,0 → IMPOSIBLE.
    const evs = [ev(4), ev(4), ev(4), ev(null)];
    const necesaria = calcularNotaNecesaria({
      evaluaciones: evs,
      metaPromedio: 6.5
    })!;
    expect(necesaria).toBeGreaterThan(ESCALA_DEFAULT.nmax);
    expect(estadoAlcanzabilidad(necesaria, ESCALA_DEFAULT)).toBe('IMPOSIBLE');
  });

  it('respeta pesos custom cuando se pasan (futura puerta para ponderado)', () => {
    const e1 = ev(5);
    const e2 = ev(7);
    const e3 = ev(null); // pendiente con peso 0,5
    const pesos = new Map([
      [e1.id, 0.25],
      [e2.id, 0.25],
      [e3.id, 0.5]
    ]);
    // acumulado = 5*0,25 + 7*0,25 = 3,0. peso_pendiente = 0,5.
    // necesaria = (M - 3) / 0,5. Para M=5,0 → necesaria = 4,0.
    const necesaria = calcularNotaNecesaria({
      evaluaciones: [e1, e2, e3],
      metaPromedio: 5,
      pesos
    });
    expect(necesaria).toBeCloseTo(4, 5);
  });
});

describe('estadoAlcanzabilidad (umbral 5,5)', () => {
  it('nota <= nmin → ASEGURADO', () => {
    expect(estadoAlcanzabilidad(2.0, ESCALA_DEFAULT)).toBe('ASEGURADO');
    expect(estadoAlcanzabilidad(0.5, ESCALA_DEFAULT)).toBe('ASEGURADO');
  });

  it('nmin < nota <= 5,5 → ALCANZABLE', () => {
    expect(estadoAlcanzabilidad(2.1, ESCALA_DEFAULT)).toBe('ALCANZABLE');
    expect(estadoAlcanzabilidad(4.0, ESCALA_DEFAULT)).toBe('ALCANZABLE');
    expect(estadoAlcanzabilidad(5.5, ESCALA_DEFAULT)).toBe('ALCANZABLE');
  });

  it('5,5 < nota <= nmax → EXIGENTE', () => {
    expect(estadoAlcanzabilidad(5.6, ESCALA_DEFAULT)).toBe('EXIGENTE');
    expect(estadoAlcanzabilidad(7.0, ESCALA_DEFAULT)).toBe('EXIGENTE');
  });

  it('nota > nmax → IMPOSIBLE', () => {
    expect(estadoAlcanzabilidad(7.01, ESCALA_DEFAULT)).toBe('IMPOSIBLE');
    expect(estadoAlcanzabilidad(14, ESCALA_DEFAULT)).toBe('IMPOSIBLE');
  });
});

describe('mapaEscenarios', () => {
  it('vacío si no hay pendientes', () => {
    expect(mapaEscenarios([ev(5), ev(6)])).toEqual([]);
  });

  it('vacío si no hay evaluaciones', () => {
    expect(mapaEscenarios([])).toEqual([]);
  });

  it('cubre las 5 notas canónicas con redondeo chileno aplicado', () => {
    // 2 rendidas (5 / 6) + 1 pendiente, peso uniforme 1/3.
    // acumulado = (5+6)/3 = 3,667. Para nota X en pendiente:
    //   final = 3,667 + X/3 → redondeo chileno.
    // nota 7 → 3,667 + 2,333 = 6,0 ✓
    // nota 6 → 3,667 + 2,0 = 5,667 → 5,7
    // nota 5 → 3,667 + 1,667 = 5,333 → 5,3
    // nota 4 → 3,667 + 1,333 = 5,0
    // nota 2 → 3,667 + 0,667 = 4,333 → 4,3
    const escenarios = mapaEscenarios([ev(5), ev(6), ev(null)]);
    expect(escenarios).toHaveLength(5);
    expect(escenarios.map((e) => e.notaPendiente)).toEqual([2, 4, 5, 6, 7]);
    expect(escenarios.map((e) => e.promedioFinal)).toEqual([
      4.3,
      5.0,
      5.3,
      5.7,
      6.0
    ]);
  });
});

describe('resumenPendientes', () => {
  it('sin pendientes → cantidad 0, peso 0', () => {
    expect(resumenPendientes([ev(5), ev(6)])).toEqual({
      cantidad: 0,
      pesoTotal: 0
    });
  });

  it('una pendiente de cuatro → cantidad 1, peso 0,25 (peso uniforme)', () => {
    const r = resumenPendientes([ev(5), ev(6), ev(7), ev(null)]);
    expect(r.cantidad).toBe(1);
    expect(r.pesoTotal).toBeCloseTo(0.25, 5);
  });

  it('dos pendientes de cinco → cantidad 2, peso 0,4', () => {
    const r = resumenPendientes([ev(5), ev(6), ev(7), ev(null), ev(null)]);
    expect(r.cantidad).toBe(2);
    expect(r.pesoTotal).toBeCloseTo(0.4, 5);
  });

  it('respeta pesos ponderados cuando se pasan', () => {
    const e1 = ev(5);
    const e2 = ev(null);
    const pesos = new Map([
      [e1.id, 0.7],
      [e2.id, 0.3]
    ]);
    const r = resumenPendientes([e1, e2], pesos);
    expect(r.cantidad).toBe(1);
    expect(r.pesoTotal).toBeCloseTo(0.3, 5);
  });
});

describe('Meta con ramo ponderado (dogfood Filosofía)', () => {
  it('pendiente única 30/30/40 meta 6,0 → necesaria ≈ 6,375 → EXIGENTE', () => {
    // 3 evals: 5,5 (30%) / 6,0 (30%) / pendiente (40%). Meta 6,0.
    // acumulado = 5,5×0,3 + 6×0,3 = 1,65 + 1,8 = 3,45
    // peso_pendiente = 0,4; necesaria = (6 - 3,45) / 0,4 = 6,375
    const e1 = ev(5.5);
    const e2 = ev(6.0);
    const e3 = ev(null);
    const pesos = new Map([
      [e1.id, 0.3],
      [e2.id, 0.3],
      [e3.id, 0.4]
    ]);
    const necesaria = calcularNotaNecesaria({
      evaluaciones: [e1, e2, e3],
      metaPromedio: 6.0,
      pesos
    })!;
    expect(necesaria).toBeCloseTo(6.375, 4);
    // 6,375 > 5,5 → EXIGENTE (el umbral).
    expect(estadoAlcanzabilidad(necesaria, ESCALA_DEFAULT)).toBe('EXIGENTE');
  });

  it('múltiples pendientes ponderadas: 30 + 20 + 50, 2 rendidas', () => {
    // 5 (30%) / 6 (20%) rendidas; 50% pendiente total, 1 pendiente.
    // acumulado = 5×0,3 + 6×0,2 = 1,5 + 1,2 = 2,7
    // Meta 5,0; peso_pendiente = 0,5; necesaria = (5 - 2,7)/0,5 = 4,6.
    const e1 = ev(5);
    const e2 = ev(6);
    const e3 = ev(null);
    const pesos = new Map([
      [e1.id, 0.3],
      [e2.id, 0.2],
      [e3.id, 0.5]
    ]);
    const necesaria = calcularNotaNecesaria({
      evaluaciones: [e1, e2, e3],
      metaPromedio: 5.0,
      pesos
    })!;
    expect(necesaria).toBeCloseTo(4.6, 4);
    expect(estadoAlcanzabilidad(necesaria, ESCALA_DEFAULT)).toBe('ALCANZABLE');
  });

  it('mapa de escenarios ponderado coincide con cálculo manual', () => {
    // Mismo setup dogfood. nota_pendiente X → final = 3,45 + X×0,4
    //   X=2 → 3,45 + 0,8 = 4,25 → 4,3
    //   X=4 → 3,45 + 1,6 = 5,05 → 5,1 (centésima 5, sube)
    //   X=5 → 3,45 + 2,0 = 5,45 → 5,5 (centésima 5)
    //   X=6 → 3,45 + 2,4 = 5,85 → 5,9 (centésima 5)
    //   X=7 → 3,45 + 2,8 = 6,25 → 6,3 (centésima 5)
    const e1 = ev(5.5);
    const e2 = ev(6.0);
    const e3 = ev(null);
    const pesos = new Map([
      [e1.id, 0.3],
      [e2.id, 0.3],
      [e3.id, 0.4]
    ]);
    const esc = mapaEscenarios([e1, e2, e3], pesos);
    expect(esc.map((e) => e.promedioFinal)).toEqual([4.3, 5.1, 5.5, 5.9, 6.3]);
  });
});

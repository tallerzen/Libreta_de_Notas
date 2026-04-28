import { describe, it, expect } from 'vitest';
import {
  calcularPromedio,
  calcularPromedioPonderado,
  calcularPromedioSimple,
  contarEvaluaciones,
  sumaPonderaciones
} from './promedio';
import type { Evaluacion, Ramo } from '$lib/storage/schema';

function ev(
  nota: number | null,
  ponderacion = 0,
  nombre = 'eval'
): Evaluacion {
  return {
    id: crypto.randomUUID(),
    nombre,
    ponderacion,
    nota,
    estado: nota === null ? 'pendiente' : 'rendida',
    creado: '2026-04-24T00:00:00Z'
  };
}

function ramo(
  modo_ponderado: boolean,
  evaluaciones: Evaluacion[]
): Ramo {
  return {
    id: 'r',
    nombre: 'Test',
    nivel: null,
    modo_ponderado,
    evaluaciones,
    examen: { activo: false, ponderacion: null, nota: null },
    creado: '2026-04-24T00:00:00Z'
  };
}

describe('calcularPromedioSimple', () => {
  it('devuelve null si no hay evaluaciones', () => {
    expect(calcularPromedioSimple([])).toBeNull();
  });

  it('devuelve null si todas las evaluaciones son pendientes', () => {
    expect(calcularPromedioSimple([ev(null), ev(null)])).toBeNull();
  });

  it('promedia notas con redondeo chileno', () => {
    // (5,0 + 6,0 + 7,0) / 3 = 6,0
    expect(calcularPromedioSimple([ev(5), ev(6), ev(7)])).toBe(6.0);
  });

  it('ignora pendientes en numerador y denominador', () => {
    // Sólo dos rendidas: (4 + 6) / 2 = 5,0; el pendiente no diluye.
    expect(calcularPromedioSimple([ev(4), ev(6), ev(null)])).toBe(5.0);
  });

  it('aplica redondeo chileno al resultado (5,15 → 5,2)', () => {
    // (5,1 + 5,2) / 2 = 5,15 → centésima 5 → 5,2
    expect(calcularPromedioSimple([ev(5.1), ev(5.2)])).toBe(5.2);
  });

  it('una sola nota devuelve esa nota', () => {
    expect(calcularPromedioSimple([ev(4.3)])).toBe(4.3);
  });
});

describe('contarEvaluaciones', () => {
  it('cuenta rendidas y pendientes', () => {
    const r = contarEvaluaciones([ev(5), ev(null), ev(6), ev(null)]);
    expect(r).toEqual({ rendidas: 2, pendientes: 2, total: 4 });
  });

  it('lista vacía retorna ceros', () => {
    expect(contarEvaluaciones([])).toEqual({ rendidas: 0, pendientes: 0, total: 0 });
  });
});

describe('calcularPromedioPonderado', () => {
  it('devuelve null sin evaluaciones', () => {
    expect(calcularPromedioPonderado([])).toBeNull();
  });

  it('devuelve null si todas pendientes', () => {
    expect(
      calcularPromedioPonderado([ev(null, 0.5), ev(null, 0.5)])
    ).toBeNull();
  });

  it('devuelve null si Σ pesos_con_nota = 0 (caso borde)', () => {
    // Todas las rendidas con peso 0 — configuración inválida pero
    // defensible. Mejor null que NaN o Infinity.
    expect(calcularPromedioPonderado([ev(5, 0), ev(6, 0)])).toBeNull();
  });

  it('pondera según peso: 30/30/40 con 5,5 / 6,0 / pendiente → 5,75 → 5,8', () => {
    // dogfood scenario. (5,5×0,3 + 6,0×0,3) / (0,3+0,3) = 3,45/0,6 = 5,75 → 5,8
    const evs = [ev(5.5, 0.3), ev(6.0, 0.3), ev(null, 0.4)];
    expect(calcularPromedioPonderado(evs)).toBe(5.8);
  });

  it('todas las rendidas completas (suman 100%)', () => {
    // 5,0×0,3 + 6,0×0,3 + 7,0×0,4 = 1,5 + 1,8 + 2,8 = 6,1
    const evs = [ev(5, 0.3), ev(6, 0.3), ev(7, 0.4)];
    expect(calcularPromedioPonderado(evs)).toBe(6.1);
  });

  it('parcial sin normalizar al 100%: pendiente no afecta denominador', () => {
    // Rendidas suman 0,5, pendiente 0,5. Promedio parcial con lo que hay:
    // (4×0,25 + 6×0,25) / 0,5 = 2,5 / 0,5 = 5,0.
    // Clave: el divisor es 0,5 (sólo rendidas), NO 1,0 (total ramo).
    const evs = [ev(4, 0.25), ev(6, 0.25), ev(null, 0.5)];
    expect(calcularPromedioPonderado(evs)).toBe(5.0);
  });
});

describe('calcularPromedio (wrapper)', () => {
  it('elige simple cuando ramo.modo_ponderado === false', () => {
    const r = ramo(false, [ev(5), ev(7)]);
    expect(calcularPromedio(r)).toBe(6.0);
  });

  it('elige ponderado cuando ramo.modo_ponderado === true', () => {
    const r = ramo(true, [ev(5, 0.3), ev(7, 0.7)]);
    // 5×0,3 + 7×0,7 = 1,5 + 4,9 = 6,4
    expect(calcularPromedio(r)).toBe(6.4);
  });
});

describe('sumaPonderaciones', () => {
  it('suma todas las ponderaciones independiente del estado', () => {
    const evs = [ev(5, 0.3), ev(null, 0.3), ev(6, 0.4)];
    expect(sumaPonderaciones(evs)).toBeCloseTo(1.0, 5);
  });

  it('lista vacía retorna 0', () => {
    expect(sumaPonderaciones([])).toBe(0);
  });
});

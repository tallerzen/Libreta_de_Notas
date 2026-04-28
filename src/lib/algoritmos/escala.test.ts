import { describe, it, expect } from 'vitest';
import {
  calcularNota,
  ESCALA_DEFAULT,
  filasResaltadas,
  puntajeAprobacion,
  type Escala
} from './escala';

describe('calcularNota — escala chilena por defecto (50 pts, 60%, 2–7)', () => {
  it('puntaje 0 da la nota mínima', () => {
    expect(calcularNota(ESCALA_DEFAULT, 0)).toBe(2.0);
  });

  it('puntaje máximo da la nota máxima', () => {
    expect(calcularNota(ESCALA_DEFAULT, 50)).toBe(7.0);
  });

  it('puntaje de aprobación (50 × 0,60 = 30) cae exactamente en 4,0', () => {
    expect(calcularNota(ESCALA_DEFAULT, 30)).toBe(4.0);
  });

  it('clamp por debajo del rango', () => {
    expect(calcularNota(ESCALA_DEFAULT, -50)).toBe(2.0);
  });

  it('clamp por sobre el rango', () => {
    expect(calcularNota(ESCALA_DEFAULT, 250)).toBe(7.0);
  });
});

describe('paradoja Pumarino documentada en §10.2', () => {
  it('pmax=120, exig=50%, p=59 → 4,0 (alumno aprueba con menos del puntaje de aprobación)', () => {
    const escala: Escala = {
      pmax: 120,
      exigencia: 0.5,
      nmin: 1.0,
      napr: 4.0,
      nmax: 7.0
    };
    expect(calcularNota(escala, 59)).toBe(4.0);
  });
});

describe('escalas alternativas comunes', () => {
  it('nota mínima 1,0 (alternativa al default 2,0) con puntaje 0', () => {
    const escala: Escala = { ...ESCALA_DEFAULT, nmin: 1.0 };
    expect(calcularNota(escala, 0)).toBe(1.0);
  });

  it('prueba grande de 100 puntos y 60% exigencia: 60 pts cae en 4,0', () => {
    const escala: Escala = { ...ESCALA_DEFAULT, pmax: 100 };
    expect(calcularNota(escala, 60)).toBe(4.0);
  });

  it('prueba pequeña de 32 puntos y 60% exigencia: 24 pts > papr produce nota > 4,0', () => {
    const escala: Escala = { ...ESCALA_DEFAULT, pmax: 32 };
    const nota = calcularNota(escala, 24);
    expect(nota).toBeGreaterThan(4);
    expect(nota).toBeLessThanOrEqual(7);
  });
});

describe('puntajeAprobacion — default razonable del slider', () => {
  it('escala chilena por defecto (50 pts × 60%) cae en 30', () => {
    expect(puntajeAprobacion(50, 0.6)).toBe(30);
  });

  it('redondea al entero más cercano cuando el producto no es entero', () => {
    // 32 × 0,60 = 19,2 → 19; 32 × 0,70 = 22,4 → 22; 32 × 0,75 = 24
    expect(puntajeAprobacion(32, 0.6)).toBe(19);
    expect(puntajeAprobacion(32, 0.7)).toBe(22);
    expect(puntajeAprobacion(32, 0.75)).toBe(24);
  });

  it('escalas universitarias típicas (100 pts × 70%) caen en 70', () => {
    expect(puntajeAprobacion(100, 0.7)).toBe(70);
  });
});

describe('filasResaltadas — qué filas enteras pintar en la tabla', () => {
  it('puntaje entero: una sola fila resaltada fuerte, sin suaves', () => {
    expect(filasResaltadas(30, 50)).toEqual({ fuerte: 30, suaves: [] });
    expect(filasResaltadas(0, 50)).toEqual({ fuerte: 0, suaves: [] });
  });

  it('puntaje decimal: ningún fuerte, los dos vecinos enteros como suaves', () => {
    expect(filasResaltadas(29.5, 50)).toEqual({ fuerte: null, suaves: [29, 30] });
    expect(filasResaltadas(29.25, 50)).toEqual({ fuerte: null, suaves: [29, 30] });
    expect(filasResaltadas(29.75, 50)).toEqual({ fuerte: null, suaves: [29, 30] });
  });

  it('clampea fuera de rango (no devuelve filas inexistentes)', () => {
    // Por sobre pmax: el techo se cae fuera, queda solo el piso clampeado.
    expect(filasResaltadas(60, 50)).toEqual({ fuerte: 50, suaves: [] });
    // Decimal en el borde superior: solo el piso 49 cuenta — pmax=49.5 floor=49.
    expect(filasResaltadas(49.5, 49.5)).toEqual({ fuerte: null, suaves: [49] });
    // Negativo se clampea a 0.
    expect(filasResaltadas(-3, 50)).toEqual({ fuerte: 0, suaves: [] });
  });
});

describe('comportamiento en bordes de configuración', () => {
  it('exigencia 0% en p=0 entrega napr (caso degenerado: papr=0)', () => {
    const escala: Escala = { ...ESCALA_DEFAULT, exigencia: 0 };
    // papr = 0; p=0 cae en el tramo bajo con la guarda papr===0 → napr.
    expect(calcularNota(escala, 0)).toBe(4.0);
    // Y p>0 ya está en el tramo superior interpolando hacia nmax.
    expect(calcularNota(escala, 100)).toBe(7.0);
  });

  it('exigencia 100% colapsa el tramo superior', () => {
    const escala: Escala = { ...ESCALA_DEFAULT, exigencia: 1 };
    // p=pmax cae justo en papr → napr.
    expect(calcularNota(escala, 50)).toBe(4.0);
    // p<pmax queda en el tramo bajo → nota <napr.
    expect(calcularNota(escala, 25)).toBeLessThan(4);
  });
});

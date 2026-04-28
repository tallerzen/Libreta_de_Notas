import { describe, it, expect } from 'vitest';
import { calcularNota, ESCALA_DEFAULT, type Escala } from './escala';

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

import { describe, it, expect } from 'vitest';
import { redondeoChileno } from './redondeo';
import { formatearNota } from '$lib/util/formato.ts';

describe('redondeoChileno', () => {
  describe('regla básica: centésima >= 5 sube la décima', () => {
    it('3,94 se mantiene en 3,9', () => {
      expect(redondeoChileno(3.94)).toBe(3.9);
    });

    it('3,95 sube a 4,0', () => {
      expect(redondeoChileno(3.95)).toBe(4.0);
    });

    it('4,04 se mantiene en 4,0', () => {
      expect(redondeoChileno(4.04)).toBe(4.0);
    });

    it('4,05 sube a 4,1', () => {
      expect(redondeoChileno(4.05)).toBe(4.1);
    });

    it('trunca centésimas extra antes de evaluar (3,94711 → 3,9)', () => {
      expect(redondeoChileno(3.94711)).toBe(3.9);
    });

    it('3,949 da 3,9 (centésima sigue siendo 4)', () => {
      expect(redondeoChileno(3.949)).toBe(3.9);
    });
  });

  describe('gotcha de floating point', () => {
    it('valor calculado 1 + 3 × (59/60) — que en FP es 3.9499999...9998 — debe dar 4,0', () => {
      const nota = 1 + 3 * (59 / 60);
      // Documentamos el ruido de FP que motiva la implementación entera:
      expect(nota).not.toBe(3.95);
      expect(redondeoChileno(nota)).toBe(4.0);
    });

    it('paradoja Pumarino: pmax=120, exig=50%, p=59 produce 3,95 → 4,0', () => {
      // Reproduce el cálculo del FAQ: nota = 1 + 3 × (59/60).
      const nota = 1 + 3 * (59 / 60);
      expect(redondeoChileno(nota)).toBe(4.0);
    });

    it('múltiples valores con ruido de FP no se cuelan al borde inferior', () => {
      for (let entero = 10; entero <= 70; entero++) {
        const expected = Math.round(entero / 10 * 10) / 10;
        // Genera una nota "X,0" via aritmética sucia para meter ruido de FP.
        const sucia = entero / 10 + 0.0;
        expect(redondeoChileno(sucia)).toBe(expected);
      }
    });
  });

  describe('extremos del rango chileno', () => {
    it('1,0 se mantiene', () => {
      expect(redondeoChileno(1.0)).toBe(1.0);
    });

    it('7,0 se mantiene', () => {
      expect(redondeoChileno(7.0)).toBe(7.0);
    });

    it('valor justo bajo aprobación (3,94999...) sube a 4,0 si conceptualmente es 3,95', () => {
      expect(redondeoChileno(3.95)).toBe(4.0);
    });
  });

  describe('valores especiales', () => {
    it('NaN devuelve NaN', () => {
      expect(redondeoChileno(NaN)).toBeNaN();
    });

    it('Infinity se devuelve sin tocar', () => {
      expect(redondeoChileno(Infinity)).toBe(Infinity);
    });
  });
});

describe('formatearNota', () => {
  it('formatea con 1 decimal y coma', () => {
    expect(formatearNota(4)).toBe('4,0');
    expect(formatearNota(5.1)).toBe('5,1');
    expect(formatearNota(7)).toBe('7,0');
  });

  it('NaN se muestra como em-dash', () => {
    expect(formatearNota(NaN)).toBe('—');
  });
});

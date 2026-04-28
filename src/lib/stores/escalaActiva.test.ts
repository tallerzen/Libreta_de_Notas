import { describe, it, expect } from 'vitest';
import { EscalaActivaState } from './escalaActiva.svelte.ts';
import { puntajeAprobacion } from '$lib/algoritmos/escala';

describe('EscalaActivaState — default y flag de "tocado por usuario"', () => {
  it('arranca con puntaje = papr (no en cero)', () => {
    const e = new EscalaActivaState();
    expect(e.puntaje).toBe(puntajeAprobacion(e.pmax, e.exigencia));
    expect(e.puntaje).toBe(30); // 50 × 0,60 = 30
    expect(e.puntajeTocadoPorUsuario).toBe(false);
  });

  it('cambiar pmax mueve el slider al nuevo papr cuando aún no fue tocado', () => {
    const e = new EscalaActivaState();
    e.setPmax(32);
    // 32 × 0,60 = 19,2 → 19
    expect(e.puntaje).toBe(19);
    expect(e.puntajeTocadoPorUsuario).toBe(false);
  });

  it('cambiar exigencia mueve el slider al nuevo papr cuando aún no fue tocado', () => {
    const e = new EscalaActivaState();
    e.setExigenciaPct(70);
    // 50 × 0,70 = 35
    expect(e.puntaje).toBe(35);
  });

  it('una vez tocado el slider, cambiar pmax / exigencia no lo arrastra', () => {
    const e = new EscalaActivaState();
    e.setPuntaje(42); // el profesor anota lo que sacó el alumno
    expect(e.puntajeTocadoPorUsuario).toBe(true);

    e.setExigenciaPct(70); // experimenta con la exigencia
    expect(e.puntaje).toBe(42); // sigue ahí

    e.setPmax(60); // y con el puntaje máximo
    expect(e.puntaje).toBe(42);
  });

  it('si el puntaje tocado excede el nuevo pmax, se clampea (no se mueve a papr)', () => {
    const e = new EscalaActivaState();
    e.setPuntaje(45);
    e.setPmax(40);
    expect(e.puntaje).toBe(40);
    expect(e.puntajeTocadoPorUsuario).toBe(true);
  });

  it('reset() vuelve al default y limpia la flag', () => {
    const e = new EscalaActivaState();
    e.setPuntaje(45);
    e.setPmax(80);
    e.reset();
    expect(e.puntaje).toBe(30); // papr del default 50 × 0,60
    expect(e.puntajeTocadoPorUsuario).toBe(false);
  });
});

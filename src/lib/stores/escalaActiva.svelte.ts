import { ESCALA_DEFAULT, puntajeAprobacion } from '$lib/algoritmos/escala';
import type { Escala } from '$lib/algoritmos/escala';
import { store } from '$lib/storage/store.svelte.ts';
import type { EscalaGuardada } from '$lib/storage/schema';

/**
 * Granularidades permitidas para el slider de puntaje.
 * Capadas a {1, 0,5, 0,25} porque todas son fracciones binarias exactas en
 * floating point — evitan que el valor del slider arrastre ruido tipo 0.1.
 *
 * Re-exportada del schema persistido para que los componentes sigan
 * importando desde acá; el tipo es el mismo en ambos lados.
 */
export type IncrementoSlider = 1 | 0.5 | 0.25;

/**
 * Estado de cálculo del módulo Escala. Es **no-persistido** a propósito en
 * v0.2.0: pmax/exigencia/notas/puntaje son la "escala que estoy mirando
 * ahora", no una escala con nombre. La UI para guardar escalas con nombre
 * (que sí persistirían en `escalas_guardadas`) llega en v0.2.1.
 *
 * Excepción: `incremento` del slider sí persiste, vive en
 * `store.datos.preferencias.incremento_slider_default`. Se accede vía el
 * getter/setter de esta clase para no exponer la dependencia con la capa
 * de storage en cada componente.
 */
export class EscalaActivaState {
  pmax = $state<number>(ESCALA_DEFAULT.pmax);
  exigencia = $state<number>(ESCALA_DEFAULT.exigencia);
  nmin = $state<number>(ESCALA_DEFAULT.nmin);
  napr = $state<number>(ESCALA_DEFAULT.napr);
  nmax = $state<number>(ESCALA_DEFAULT.nmax);
  puntaje = $state<number>(
    puntajeAprobacion(ESCALA_DEFAULT.pmax, ESCALA_DEFAULT.exigencia)
  );
  /**
   * Marcado en `true` apenas el usuario mueve el slider o ingresa un puntaje
   * a mano. Una vez tocado, los cambios de `pmax` o `exigencia` ya no
   * arrastran el puntaje al nuevo papr — el profesor que está corrigiendo
   * a un alumno no quiere que se le mueva el puntaje bajo los pies cuando
   * experimenta con la escala.
   */
  puntajeTocadoPorUsuario = $state<boolean>(false);
  nombre = $state<string>('Escala chilena por defecto');

  get incremento(): IncrementoSlider {
    return store.datos.preferencias.incremento_slider_default;
  }

  get escala(): Escala {
    return {
      pmax: this.pmax,
      exigencia: this.exigencia,
      nmin: this.nmin,
      napr: this.napr,
      nmax: this.nmax
    };
  }

  setPmax(valor: number) {
    const limpio = Math.max(1, Math.round(valor));
    this.pmax = limpio;
    if (!this.puntajeTocadoPorUsuario) {
      this.puntaje = puntajeAprobacion(limpio, this.exigencia);
    } else if (this.puntaje > limpio) {
      this.puntaje = limpio;
    }
  }

  setExigenciaPct(pct: number) {
    const limpio = Math.min(100, Math.max(1, Math.round(pct))) / 100;
    this.exigencia = limpio;
    if (!this.puntajeTocadoPorUsuario) {
      this.puntaje = puntajeAprobacion(this.pmax, limpio);
    }
  }

  setIncremento(nuevo: IncrementoSlider) {
    store.datos.preferencias.incremento_slider_default = nuevo;
    // Snap al nuevo grid para evitar valores intermedios.
    const pasos = Math.round(this.puntaje / nuevo);
    this.puntaje = Math.min(this.pmax, Math.max(0, pasos * nuevo));
  }

  setPuntaje(valor: number) {
    this.puntaje = Math.min(this.pmax, Math.max(0, valor));
    this.puntajeTocadoPorUsuario = true;
  }

  reset() {
    this.pmax = ESCALA_DEFAULT.pmax;
    this.exigencia = ESCALA_DEFAULT.exigencia;
    this.nmin = ESCALA_DEFAULT.nmin;
    this.napr = ESCALA_DEFAULT.napr;
    this.nmax = ESCALA_DEFAULT.nmax;
    this.puntajeTocadoPorUsuario = false;
    this.puntaje = puntajeAprobacion(ESCALA_DEFAULT.pmax, ESCALA_DEFAULT.exigencia);
    this.nombre = 'Escala chilena por defecto';
    store.datos.preferencias.incremento_slider_default = 1;
  }

  /**
   * Persiste la configuración actual como una nueva entrada en
   * `escalas_guardadas`. Devuelve el id generado. El nombre se confía al
   * caller (ya validado no-vacío en la UI).
   */
  guardarComoEscala(nombre: string): string {
    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    const entrada: EscalaGuardada = {
      id,
      nombre: nombre.trim(),
      puntaje_max: this.pmax,
      exigencia: this.exigencia,
      nota_min: this.nmin,
      nota_aprobacion: this.napr,
      nota_max: this.nmax,
      incremento: this.incremento,
      creado: ahora,
      modificado: ahora
    };
    store.datos.escalas_guardadas.push(entrada);
    this.nombre = entrada.nombre;
    return id;
  }

  /**
   * Carga una escala guardada al estado activo. Devuelve `false` si el id
   * no existe. Cargar una escala = nuevo contexto: el puntaje arranca de
   * nuevo en `papr` y la flag de "tocado" vuelve a cero, igual que en una
   * sesión fresca.
   */
  cargarEscalaGuardada(id: string): boolean {
    const g = store.datos.escalas_guardadas.find((e) => e.id === id);
    if (!g) return false;
    this.pmax = g.puntaje_max;
    this.exigencia = g.exigencia;
    this.nmin = g.nota_min;
    this.napr = g.nota_aprobacion;
    this.nmax = g.nota_max;
    this.nombre = g.nombre;
    store.datos.preferencias.incremento_slider_default = g.incremento;
    this.puntajeTocadoPorUsuario = false;
    this.puntaje = puntajeAprobacion(g.puntaje_max, g.exigencia);
    return true;
  }

  eliminarEscalaGuardada(id: string): void {
    const idx = store.datos.escalas_guardadas.findIndex((e) => e.id === id);
    if (idx !== -1) store.datos.escalas_guardadas.splice(idx, 1);
  }
}

export const escalaActiva = new EscalaActivaState();

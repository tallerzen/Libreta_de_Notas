/**
 * Store reactivo persistido. Lee `localStorage` al primer acceso, expone
 * `datos` como `$state` profundo y autoguarda con debounce 300ms ante
 * cualquier mutación. Sin botón "guardar" en UI.
 *
 * Uso:
 *   import { store } from '$lib/storage/store.svelte.ts';
 *   store.datos.preferencias.tema = 'dark';   // se persiste 300ms después.
 */

import { leerDatos, escribirDatos } from './storage';
import type { DatosApp, EntradaWaitlist } from './schema';
import { WAITLIST_KEY } from './schema';

const DEBOUNCE_MS = 300;

class PersistedStore {
  datos = $state<DatosApp>(leerDatos());

  private timer: ReturnType<typeof setTimeout> | null = null;
  private suscritoARoot = false;

  /**
   * Arma la suscripción global de autosave. Se llama desde el primer
   * componente que monta (no en el constructor) porque `$effect.root`
   * necesita correr en un contexto reactivo activo.
   */
  iniciar(): void {
    if (this.suscritoARoot) return;
    this.suscritoARoot = true;

    $effect.root(() => {
      $effect(() => {
        // `$state.snapshot` recorre todo el árbol y deja todas sus
        // propiedades trackeadas como dependencias. Cualquier mutación
        // posterior (anidada incluida) re-dispara este effect.
        const snapshot = $state.snapshot(this.datos) as DatosApp;
        if (this.timer !== null) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          escribirDatos(snapshot);
        }, DEBOUNCE_MS);
      });
    });
  }

  /** Forzar guardado inmediato (ej. antes de cerrar pestaña). */
  flush(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    escribirDatos($state.snapshot(this.datos) as DatosApp);
  }
}

export const store = new PersistedStore();

/**
 * Waitlist (capturas de email para features no lanzadas) vive en una clave
 * separada `calcnotas_waitlist` — no la mete en el schema principal porque
 * no es "datos del usuario" sino conversiones del producto, y queremos
 * leerla/exportarla independientemente.
 */
export function agregarAWaitlist(entrada: EntradaWaitlist): boolean {
  if (typeof window === 'undefined') return false;
  let actual: EntradaWaitlist[] = [];
  try {
    const raw = window.localStorage.getItem(WAITLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) actual = parsed;
    }
  } catch {
    // Ignorar — arrancamos lista vacía.
  }
  actual.push(entrada);
  try {
    window.localStorage.setItem(WAITLIST_KEY, JSON.stringify(actual));
    return true;
  } catch {
    return false;
  }
}

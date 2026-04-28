/**
 * Router minimalista basado en `window.location.hash`. Suficiente para
 * v0.2.0 con 3 rutas (no necesitamos history API ni nested routes).
 *
 * La ruta activa persiste en la URL → un reload mantiene la vista, y se
 * pueden compartir links a tabs específicas (`/#promedio`).
 */

export type Ruta = 'escala' | 'promedio' | 'meta';

export const RUTA_DEFAULT: Ruta = 'escala';

function parseHash(hash: string): Ruta {
  const limpio = hash.replace(/^#/, '').toLowerCase();
  if (limpio === 'promedio') return 'promedio';
  if (limpio === 'meta') return 'meta';
  return RUTA_DEFAULT;
}

class Router {
  ruta = $state<Ruta>(RUTA_DEFAULT);
  private suscrito = false;

  iniciar(): void {
    if (this.suscrito || typeof window === 'undefined') return;
    this.suscrito = true;
    this.ruta = parseHash(window.location.hash);
    window.addEventListener('hashchange', () => {
      this.ruta = parseHash(window.location.hash);
    });
  }

  navegar(ruta: Ruta): void {
    if (typeof window === 'undefined') return;
    if (window.location.hash.replace(/^#/, '') === ruta) return;
    window.location.hash = ruta;
  }
}

export const router = new Router();

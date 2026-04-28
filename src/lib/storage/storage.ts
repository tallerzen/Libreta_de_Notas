/**
 * Capa pública de persistencia. Toda lectura/escritura a localStorage pasa
 * por acá — los stores Svelte sólo conocen estos helpers, nunca tocan
 * `localStorage` directamente. Eso permite:
 *
 *  - Reemplazar el backend (IndexedDB, file system del SO en TWA, etc.)
 *    cambiando una sola implementación.
 *  - Manejar fallos de I/O en un único lugar (Safari modo privado, quota
 *    excedida, JSON corrupto).
 *  - Versionar y migrar el schema sin tocar consumidores.
 */

import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  estadoInicial,
  type DatosApp
} from './schema';

class StorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

function getLocalStorage(): Storage | null {
  // Safari en modo privado lanza al acceder; SSR no tiene `window`.
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Devuelve los datos persistidos. Si no existen, retorna estado inicial
 * limpio. Si la lectura falla parcialmente (JSON corrupto), retorna estado
 * inicial — preferimos perder datos a crashear la app. Si el schema es de
 * una versión MAYOR a la soportada, lanza para no corromper data del futuro.
 */
export function leerDatos(): DatosApp {
  const ls = getLocalStorage();
  if (!ls) return estadoInicial();

  let raw: string | null;
  try {
    raw = ls.getItem(STORAGE_KEY);
  } catch {
    return estadoInicial();
  }

  if (raw === null) return estadoInicial();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON corrupto: descartar y arrancar limpio. No reportamos al usuario
    // porque el caso típico es haberse hackeado el localStorage manualmente.
    return estadoInicial();
  }

  if (!parsed || typeof parsed !== 'object' || !('version' in parsed)) {
    return estadoInicial();
  }

  const version = (parsed as { version: unknown }).version;
  if (typeof version !== 'number') return estadoInicial();

  if (version > SCHEMA_VERSION) {
    throw new StorageError(
      `Schema v${version} encontrado, pero la app sólo soporta hasta v${SCHEMA_VERSION}. ` +
        'Probablemente abriste una versión vieja después de usar una más nueva.'
    );
  }

  return migrar(parsed as DatosApp);
}

/**
 * Escribe los datos. Si localStorage no está disponible (modo privado en
 * iOS Safari, cuota llena), no lanza — la app sigue funcionando en memoria.
 * Devuelve `false` para que la capa de UI pueda mostrar un aviso si quiere.
 */
export function escribirDatos(datos: DatosApp): boolean {
  const ls = getLocalStorage();
  if (!ls) return false;

  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}

/**
 * Borra todo el estado persistido. Útil para "reset completo" en ajustes y
 * en tests.
 */
export function limpiarDatos(): void {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    ls.removeItem(STORAGE_KEY);
  } catch {
    // Ignorar — si no podemos borrar, tampoco podemos hacer mucho.
  }
}

/**
 * Aplica migraciones de schema a `datos`. En v1 es no-op pero deja el hook
 * listo para v2+: cada bump agrega un `if (datos.version === N) { ... }` y
 * sube `version` al final.
 */
export function migrar(datos: DatosApp): DatosApp {
  if (datos.version === SCHEMA_VERSION) return datos;
  // Punto de extensión futuro:
  //   if (datos.version === 1) datos = migrarDeV1AV2(datos);
  //   if (datos.version === 2) datos = migrarDeV2AV3(datos);
  return datos;
}

export { StorageError };

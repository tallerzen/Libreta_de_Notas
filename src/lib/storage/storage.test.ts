import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  leerDatos,
  escribirDatos,
  limpiarDatos,
  migrar,
  StorageError
} from './storage';
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  estadoInicial,
  type DatosApp
} from './schema';

/**
 * Vitest corre con `environment: 'node'`, así que `window` no existe.
 * Inyectamos un fake mínimo de `localStorage` por test, lo que también
 * permite simular "modo privado" simplemente borrando el window completo.
 */
function fakeLocalStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => {
      data.set(k, String(v));
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
    clear: () => data.clear(),
    key: (i: number) => Array.from(data.keys())[i] ?? null,
    get length() {
      return data.size;
    }
  };
}

const g = globalThis as { window?: { localStorage: Storage } };

beforeEach(() => {
  g.window = { localStorage: fakeLocalStorage() };
});

afterEach(() => {
  delete g.window;
});

describe('leerDatos / escribirDatos — round-trip', () => {
  it('sin datos previos devuelve estado inicial limpio', () => {
    const datos = leerDatos();
    expect(datos.version).toBe(SCHEMA_VERSION);
    expect(datos.ramos).toEqual([]);
    expect(datos.escalas_guardadas).toEqual([]);
    expect(datos.preferencias.tema).toBe('auto');
  });

  it('lo escrito se lee igual', () => {
    const original = estadoInicial();
    original.preferencias.tema = 'dark';
    original.preferencias.incremento_slider_default = 0.5;
    original.ramos.push({
      id: 'r1',
      nombre: 'Historia',
      nivel: '2_medio',
      modo_ponderado: false,
      evaluaciones: [
        {
          id: 'e1',
          nombre: 'Prueba 1',
          ponderacion: 0,
          nota: 5.5,
          estado: 'rendida',
          creado: '2026-04-24T10:00:00Z'
        }
      ],
      examen: { activo: false, ponderacion: null, nota: null },
      creado: '2026-04-24T09:00:00Z'
    });

    const ok = escribirDatos(original);
    expect(ok).toBe(true);

    const recargado = leerDatos();
    expect(recargado).toEqual(original);
  });

  it('limpiarDatos borra y leerDatos vuelve a estado inicial', () => {
    escribirDatos({ ...estadoInicial(), perfil: { tipo: 'docente', nivel: null, creado: 'x' } });
    expect(g.window!.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    limpiarDatos();
    expect(g.window!.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(leerDatos().perfil.tipo).toBeNull();
  });
});

describe('robustez ante datos basura', () => {
  it('JSON corrupto en la clave devuelve estado inicial sin crashear', () => {
    g.window!.localStorage.setItem(STORAGE_KEY, '{ no soy json válido');
    const datos = leerDatos();
    expect(datos.version).toBe(SCHEMA_VERSION);
    expect(datos.ramos).toEqual([]);
  });

  it('valor sin campo `version` se trata como inválido', () => {
    g.window!.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ramos: [] }));
    expect(leerDatos().version).toBe(SCHEMA_VERSION);
  });

  it('version mayor a la soportada lanza StorageError', () => {
    g.window!.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 999, perfil: {}, preferencias: {}, escalas_guardadas: [], ramos: [] })
    );
    expect(() => leerDatos()).toThrow(StorageError);
  });
});

describe('migrar', () => {
  it('v1 → v1 es identidad (no-op)', () => {
    const datos: DatosApp = estadoInicial();
    expect(migrar(datos)).toBe(datos);
  });
});

describe('localStorage no disponible (modo privado)', () => {
  beforeEach(() => {
    delete g.window;
  });

  it('leerDatos devuelve estado inicial sin crashear', () => {
    const datos = leerDatos();
    expect(datos.version).toBe(SCHEMA_VERSION);
  });

  it('escribirDatos retorna false sin crashear', () => {
    expect(escribirDatos(estadoInicial())).toBe(false);
  });

  it('limpiarDatos no crashea', () => {
    expect(() => limpiarDatos()).not.toThrow();
  });
});

describe('localStorage que tira al escribir (cuota llena)', () => {
  it('escribirDatos retorna false en vez de propagar', () => {
    g.window!.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(escribirDatos(estadoInicial())).toBe(false);
  });
});

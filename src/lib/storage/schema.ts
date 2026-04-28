/**
 * Schema de persistencia v1 — fuente de verdad para tipos del estado guardado
 * en `localStorage` bajo la clave `calcnotas_v1`. Coincide con §11 de CONTEXT.
 *
 * Los tipos viven separados de los stores Svelte porque también los consume
 * `storage.ts` y eventualmente migraciones futuras (`v2 → v3`, etc.).
 */

export const SCHEMA_VERSION = 1 as const;
export const STORAGE_KEY = 'calcnotas_v1';
export const WAITLIST_KEY = 'calcnotas_waitlist';

export type PerfilTipo =
  | 'estudiante_basica'
  | 'estudiante_media'
  | 'universitario'
  | 'docente'
  | 'postulando_u';

export type NivelRamo =
  | '5_basico'
  | '6_basico'
  | '7_basico'
  | '8_basico'
  | '1_medio'
  | '2_medio'
  | '3_medio'
  | '4_medio'
  | 'universitario';

export type Tema = 'auto' | 'dark' | 'light';
export type Decimal = 'coma' | 'punto';
export type IncrementoSliderPersistido = 1 | 0.5 | 0.25;

export interface Perfil {
  tipo: PerfilTipo | null;
  nivel: NivelRamo | null;
  creado: string; // ISO 8601
}

export interface Preferencias {
  tema: Tema;
  decimal: Decimal;
  incremento_slider_default: IncrementoSliderPersistido;
}

export interface EscalaGuardada {
  id: string;
  nombre: string;
  puntaje_max: number;
  exigencia: number;
  nota_min: number;
  nota_aprobacion: number;
  nota_max: number;
  incremento: IncrementoSliderPersistido;
  creado: string;
  modificado: string;
}

export type EstadoEvaluacion = 'rendida' | 'pendiente';

export interface Evaluacion {
  id: string;
  nombre: string;
  /** 0–1. En modo simple del v0.2.0 las ponderaciones no se usan; queda en 0. */
  ponderacion: number;
  /** `null` cuando la evaluación es pendiente. */
  nota: number | null;
  estado: EstadoEvaluacion;
  creado: string;
}

export interface Examen {
  activo: boolean;
  ponderacion: number | null;
  nota: number | null;
}

export interface Ramo {
  id: string;
  nombre: string;
  nivel: NivelRamo | null;
  modo_ponderado: boolean;
  evaluaciones: Evaluacion[];
  examen: Examen;
  creado: string;
}

export interface DatosApp {
  version: typeof SCHEMA_VERSION;
  perfil: Perfil;
  preferencias: Preferencias;
  escalas_guardadas: EscalaGuardada[];
  ramos: Ramo[];
}

export interface EntradaWaitlist {
  email: string;
  contexto: string;
  fecha: string; // ISO 8601
}

/**
 * Estado inicial limpio. Se usa cuando no existe la clave en localStorage o
 * cuando la lectura falla irrecuperablemente.
 */
export function estadoInicial(): DatosApp {
  return {
    version: SCHEMA_VERSION,
    perfil: {
      tipo: null,
      nivel: null,
      creado: new Date().toISOString()
    },
    preferencias: {
      tema: 'auto',
      decimal: 'coma',
      incremento_slider_default: 1
    },
    escalas_guardadas: [],
    ramos: []
  };
}

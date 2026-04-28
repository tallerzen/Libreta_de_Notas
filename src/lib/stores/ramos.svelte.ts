/**
 * Acciones CRUD sobre ramos y evaluaciones, sentadas sobre el store
 * persistido. Todo lo que muta `store.datos.ramos` pasa por acá — ningún
 * componente toca el array directamente.
 *
 * Decisión v0.2.0: el "ramo activo" (cuál se está mirando ahora) vive en
 * memoria, no se persiste. Tras reload arranca con el primero. Persistirlo
 * es buen polish para v0.2.1.
 */

import { store } from '$lib/storage/store.svelte.ts';
import type { Evaluacion, NivelRamo, Ramo } from '$lib/storage/schema';

class RamosState {
  ramoActivoId = $state<string | null>(null);

  get lista(): Ramo[] {
    return store.datos.ramos;
  }

  get ramoActivo(): Ramo | null {
    const id = this.ramoActivoId;
    if (id) {
      const encontrado = this.lista.find((r) => r.id === id);
      if (encontrado) return encontrado;
    }
    return this.lista[0] ?? null;
  }

  setActivo(id: string): void {
    this.ramoActivoId = id;
  }

  crearRamo(datos: { nombre: string; nivel: NivelRamo | null }): Ramo {
    const ahora = new Date().toISOString();
    const ramo: Ramo = {
      id: crypto.randomUUID(),
      nombre: datos.nombre.trim(),
      nivel: datos.nivel,
      modo_ponderado: false,
      evaluaciones: [],
      examen: { activo: false, ponderacion: null, nota: null },
      creado: ahora
    };
    store.datos.ramos.push(ramo);
    this.ramoActivoId = ramo.id;
    return ramo;
  }

  actualizarRamo(
    id: string,
    parches: Partial<Pick<Ramo, 'nombre' | 'nivel' | 'modo_ponderado'>>
  ): void {
    const ramo = store.datos.ramos.find((r) => r.id === id);
    if (!ramo) return;
    if (parches.nombre !== undefined) ramo.nombre = parches.nombre.trim();
    if (parches.nivel !== undefined) ramo.nivel = parches.nivel;
    // Toggling modo_ponderado preserva las ponderaciones existentes de las
    // evaluaciones — en simple se ignoran pero no se destruyen, así si el
    // usuario vuelve a ponderado recupera sus valores. Si quiere empezar
    // de cero, borrar cada evaluación explícitamente o editarla a 0.
    if (parches.modo_ponderado !== undefined) {
      ramo.modo_ponderado = parches.modo_ponderado;
    }
  }

  actualizarPonderacion(
    ramoId: string,
    evalId: string,
    ponderacion: number
  ): void {
    const ramo = store.datos.ramos.find((r) => r.id === ramoId);
    if (!ramo) return;
    const ev = ramo.evaluaciones.find((e) => e.id === evalId);
    if (!ev) return;
    ev.ponderacion = Math.max(0, Math.min(1, ponderacion));
  }

  eliminarRamo(id: string): void {
    const idx = store.datos.ramos.findIndex((r) => r.id === id);
    if (idx === -1) return;
    store.datos.ramos.splice(idx, 1);
    if (this.ramoActivoId === id) {
      this.ramoActivoId = store.datos.ramos[0]?.id ?? null;
    }
  }

  agregarEvaluacion(
    ramoId: string,
    datos: { nombre: string; nota: number | null; ponderacion?: number }
  ): Evaluacion | null {
    const ramo = store.datos.ramos.find((r) => r.id === ramoId);
    if (!ramo) return null;
    const ev: Evaluacion = {
      id: crypto.randomUUID(),
      nombre: datos.nombre.trim(),
      ponderacion: Math.max(0, Math.min(1, datos.ponderacion ?? 0)),
      nota: datos.nota,
      estado: datos.nota === null ? 'pendiente' : 'rendida',
      creado: new Date().toISOString()
    };
    ramo.evaluaciones.push(ev);
    return ev;
  }

  actualizarEvaluacion(
    ramoId: string,
    evalId: string,
    parches: {
      nombre?: string;
      nota?: number | null;
      ponderacion?: number;
    }
  ): void {
    const ramo = store.datos.ramos.find((r) => r.id === ramoId);
    if (!ramo) return;
    const ev = ramo.evaluaciones.find((e) => e.id === evalId);
    if (!ev) return;
    if (parches.nombre !== undefined) ev.nombre = parches.nombre.trim();
    if (parches.nota !== undefined) {
      ev.nota = parches.nota;
      ev.estado = parches.nota === null ? 'pendiente' : 'rendida';
    }
    if (parches.ponderacion !== undefined) {
      ev.ponderacion = Math.max(0, Math.min(1, parches.ponderacion));
    }
  }

  eliminarEvaluacion(ramoId: string, evalId: string): void {
    const ramo = store.datos.ramos.find((r) => r.id === ramoId);
    if (!ramo) return;
    const idx = ramo.evaluaciones.findIndex((e) => e.id === evalId);
    if (idx !== -1) ramo.evaluaciones.splice(idx, 1);
  }
}

export const ramos = new RamosState();

/**
 * Etiquetas user-facing por nivel. Centralizado para que el cambio de
 * convención (ej. "5° Bás" vs "5° Básico") sea de un solo lugar.
 */
export const NIVEL_LABEL: Record<NivelRamo, string> = {
  '5_basico': '5° básico',
  '6_basico': '6° básico',
  '7_basico': '7° básico',
  '8_basico': '8° básico',
  '1_medio': '1° medio',
  '2_medio': '2° medio',
  '3_medio': '3° medio',
  '4_medio': '4° medio',
  universitario: 'Universitario'
};

export const NIVELES_ORDENADOS: NivelRamo[] = [
  '5_basico',
  '6_basico',
  '7_basico',
  '8_basico',
  '1_medio',
  '2_medio',
  '3_medio',
  '4_medio',
  'universitario'
];

/**
 * Meta del usuario por ramo. Vive en memoria — sobrevive cambios de tab
 * dentro de una misma sesión, pero no se persiste entre reloads. Esto es
 * deliberado: la meta es un experimento momentáneo ("¿qué pasa si quiero
 * un 6,0?"), no un dato del ramo.
 *
 * Si en v0.3.1 / v0.4.0 queremos persistirlo (ej. para que el alumno
 * vuelva el lunes y vea la misma meta), promovemos `metas` al schema
 * principal con una clave nueva.
 */

const META_DEFAULT = 5.0;

class MetaState {
  metas = $state<Record<string, number>>({});

  obtener(ramoId: string | null | undefined): number {
    if (!ramoId) return META_DEFAULT;
    return this.metas[ramoId] ?? META_DEFAULT;
  }

  fijar(ramoId: string, valor: number): void {
    this.metas[ramoId] = valor;
  }
}

export const metaState = new MetaState();
export { META_DEFAULT };

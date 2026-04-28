<script lang="ts">
  import { calcularNota, type Escala } from '$lib/algoritmos/escala';
  import { formatearNota } from '$lib/util/formato.ts';

  interface Props {
    escala: Escala;
    puntajeActivo: number;
  }

  let { escala, puntajeActivo }: Props = $props();

  /**
   * Filas siempre por enteros, aunque el slider esté en step 0,25 o 0,5.
   * Tabla = referencia de "qué nota da cada puntaje entero". El hero del
   * slider muestra el cálculo preciso en la fracción seleccionada.
   */
  const filas = $derived.by(() => {
    const out: { p: number; nota: number; aprobado: boolean }[] = [];
    const max = Math.floor(escala.pmax);
    for (let p = 0; p <= max; p++) {
      const nota = calcularNota(escala, p);
      out.push({ p, nota, aprobado: nota >= escala.napr });
    }
    return out;
  });

  const puntajeRedondeado = $derived(
    Math.max(0, Math.min(Math.floor(escala.pmax), Math.round(puntajeActivo)))
  );

  let listaEl: HTMLUListElement | undefined = $state();

  // Mantiene visible la fila activa al mover el slider.
  $effect(() => {
    void puntajeRedondeado;
    if (!listaEl) return;
    const el = listaEl.querySelector(
      `[data-puntaje="${puntajeRedondeado}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
</script>

<div class="tabla">
  <ul
    class="filas"
    bind:this={listaEl}
    aria-label="Conversión puntaje a nota para toda la escala"
  >
    {#each filas as fila (fila.p)}
      <li
        class="fila"
        class:activa={fila.p === puntajeRedondeado}
        data-puntaje={fila.p}
      >
        <span class="p">{fila.p}</span>
        <span
          class="n"
          class:n-aprobada={fila.aprobado}
          class:n-reprobada={!fila.aprobado}
        >
          {formatearNota(fila.nota)}
        </span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .tabla {
    padding: var(--space-3) var(--space-4) var(--space-5);
  }

  /* Multi-column nativo: el navegador calcula cuántas caben según ancho.
     ~1 columna en móviles chicos, 2-3 en tablet, 4-5 en desktop. */
  .filas {
    list-style: none;
    margin: 0;
    padding: 0;
    columns: 140px;
    column-gap: 24px;
    column-rule: 0.5px solid var(--border-subtle);
  }

  .fila {
    /* Mantiene cada fila completa dentro de una sola columna. */
    break-inside: avoid;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-subtle);
    font-variant-numeric: tabular-nums;
    transition: background 120ms ease, box-shadow 120ms ease;
  }

  .fila:last-child {
    border-bottom: none;
  }

  .fila .p {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .fila .n {
    font-size: 16px;
    font-weight: var(--weight-bold);
  }

  .n-aprobada {
    color: var(--accent-primary);
  }

  .n-reprobada {
    color: var(--accent-danger);
  }

  /* Highlight de fila activa: usamos `box-shadow: inset` para la barra
     azul lateral en vez de `border-left`. La barra vive sobre el contenido
     sin agregar ancho — así el cálculo de columnas no se desestabiliza
     cuando una fila pasa a estar resaltada. */
  .fila.activa {
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    box-shadow: inset 3px 0 0 0 var(--accent-primary);
  }

  .fila.activa .p {
    color: var(--text-primary);
    font-weight: var(--weight-bold);
  }
</style>

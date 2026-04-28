<script lang="ts">
  import type { IncrementoSlider } from '$lib/stores/escalaActiva.svelte.ts';

  interface Props {
    puntaje: number;
    pmax: number;
    incremento: IncrementoSlider;
    onPuntajeChange: (valor: number) => void;
    onIncrementoChange: (valor: IncrementoSlider) => void;
  }

  let {
    puntaje,
    pmax,
    incremento,
    onPuntajeChange,
    onIncrementoChange
  }: Props = $props();

  const opciones: IncrementoSlider[] = [1, 0.5, 0.25];

  function fmtPuntaje(v: number): string {
    // Hasta 2 decimales, sin ceros sobrantes, coma como separador.
    return Number(v.toFixed(2)).toString().replace('.', ',');
  }

  function fmtIncremento(v: IncrementoSlider): string {
    return v === 1 ? '1' : v === 0.5 ? '0,5' : '0,25';
  }
</script>

<div class="slider">
  <div class="header">
    <span class="label">Puntaje obtenido</span>
    <span class="valor">{fmtPuntaje(puntaje)}</span>
  </div>

  <input
    type="range"
    min="0"
    max={pmax}
    step={incremento}
    value={puntaje}
    aria-label="Puntaje obtenido"
    oninput={(e) =>
      onPuntajeChange(parseFloat((e.currentTarget as HTMLInputElement).value))}
  />

  <div class="escala-row">
    <span>0</span>
    <span>{pmax}</span>
  </div>

  <div class="incremento">
    <span class="incremento-label">Incremento</span>
    <div class="chips" role="radiogroup" aria-label="Granularidad del slider">
      {#each opciones as opt (opt)}
        <button
          type="button"
          class="chip"
          class:activo={incremento === opt}
          role="radio"
          aria-checked={incremento === opt}
          onclick={() => onIncrementoChange(opt)}
        >
          {fmtIncremento(opt)}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .slider {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .valor {
    font-size: 22px;
    font-weight: var(--weight-bold);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 24px;
    background: transparent;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: var(--border-emphasis);
  }

  input[type='range']::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: var(--border-emphasis);
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -7px;
    border-radius: 50%;
    background: var(--accent-primary);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  input[type='range']::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  input[type='range']:focus-visible {
    outline: none;
  }

  input[type='range']:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 35%, transparent);
  }

  .escala-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .incremento {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-subtle);
  }

  .incremento-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .chips {
    display: flex;
    gap: var(--space-2);
    margin-left: auto;
  }

  .chip {
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: transparent;
    border: 1px solid var(--border-emphasis);
    color: var(--text-secondary);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
  }

  .chip.activo {
    background: var(--accent-primary);
    color: #fff;
    border-color: var(--accent-primary);
  }
</style>

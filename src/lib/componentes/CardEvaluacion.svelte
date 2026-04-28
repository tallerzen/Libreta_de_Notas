<script lang="ts">
  import { formatearNota } from '$lib/util/formato.ts';
  import type { Evaluacion } from '$lib/storage/schema';

  interface Props {
    evaluacion: Evaluacion;
    napr: number;
    onEditar: () => void;
    onEliminar: () => void;
  }

  let { evaluacion, napr, onEditar, onEliminar }: Props = $props();

  /**
   * Anatomía de la interacción de borrado:
   *
   *   1. Mobile (touch): swipe-left ≥40px revela un botón "Eliminar" en
   *      la franja roja del fondo. Tap en "Eliminar" reemplaza toda la
   *      fila por un confirm full-width [Cancelar] [Sí, eliminar].
   *   2. Desktop: NO hay swipe (no es natural con mouse). El usuario
   *      tappea el card para abrir el sheet de edición; desde ahí hay
   *      un botón "Eliminar evaluación" con confirm — esa es la ruta
   *      principal en escritorio. Decisión de UX para evitar el
   *      kebab `⋯` que dejaba un estado half-revealed confuso.
   */
  const REVEAL_PX = 96;
  const THRESHOLD_PX = 40;

  let translateX = $state(0);
  let confirmando = $state(false);

  let touchStartX: number | null = null;
  let touchStartTranslate = 0;

  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0]?.clientX ?? null;
    touchStartTranslate = translateX;
  }

  function onTouchMove(e: TouchEvent) {
    if (touchStartX === null || !e.touches[0]) return;
    const delta = e.touches[0].clientX - touchStartX;
    const next = touchStartTranslate + delta;
    translateX = Math.min(0, Math.max(-REVEAL_PX, next));
  }

  function onTouchEnd() {
    if (touchStartX === null) return;
    if (translateX < -THRESHOLD_PX) {
      translateX = -REVEAL_PX;
    } else {
      translateX = 0;
    }
    touchStartX = null;
  }

  function abrirConfirm(e: Event) {
    e.stopPropagation();
    confirmando = true;
  }

  function cancelar(e?: Event) {
    e?.stopPropagation();
    translateX = 0;
    confirmando = false;
  }

  function confirmar(e: Event) {
    e.stopPropagation();
    onEliminar();
  }

  function onCardClick() {
    // Si el card está deslizado, el primer tap lo cierra (no abre edit).
    if (translateX !== 0) {
      cancelar();
      return;
    }
    onEditar();
  }

  const aprobada = $derived(
    evaluacion.nota !== null && evaluacion.nota >= napr
  );
  const pendiente = $derived(evaluacion.nota === null);
</script>

<div class="wrapper" class:pendiente>
  {#if confirmando}
    <!-- Confirm full-width: reemplaza la fila completa, sin slide ni cramping. -->
    <div class="confirm-row">
      <span class="confirm-texto">¿Eliminar "{evaluacion.nombre}"?</span>
      <div class="confirm-acciones">
        <button type="button" class="btn-cancelar" onclick={cancelar}>
          Cancelar
        </button>
        <button type="button" class="btn-confirmar" onclick={confirmar}>
          Sí
        </button>
      </div>
    </div>
  {:else}
    <div class="delete-bg" aria-hidden="true">
      <button
        type="button"
        class="btn-eliminar"
        onclick={abrirConfirm}
        tabindex={translateX === 0 ? -1 : 0}
      >
        Eliminar
      </button>
    </div>

    <button
      type="button"
      class="card"
      style:transform={`translateX(${translateX}px)`}
      ontouchstart={onTouchStart}
      ontouchmove={onTouchMove}
      ontouchend={onTouchEnd}
      onclick={onCardClick}
    >
      <span class="nombre">{evaluacion.nombre}</span>
      <span
        class="nota"
        class:aprobada
        class:reprobada={!aprobada && !pendiente}
        class:pendiente
      >
        {pendiente ? '—' : formatearNota(evaluacion.nota)}
      </span>
    </button>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
  }

  .wrapper.pendiente {
    border-style: dashed;
  }

  .delete-bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 96px;
    display: flex;
    align-items: stretch;
    background: color-mix(in srgb, var(--accent-danger) 18%, var(--bg-secondary));
  }

  .btn-eliminar {
    flex: 1;
    color: var(--accent-danger);
    font-size: 13px;
    font-weight: var(--weight-bold);
  }

  .card {
    position: relative;
    z-index: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 12px 14px;
    /* Doble background: en dark mode `--bg-secondary` es semi-transparente
       (3.5% white), así que sin la base opaca el delete-bg rojo se vería
       a través del card cuando translateX = 0. */
    background-color: var(--bg-primary);
    background-image: linear-gradient(var(--bg-secondary), var(--bg-secondary));
    text-align: left;
    transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
    touch-action: pan-y;
  }

  .card:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: -2px;
  }

  .nombre {
    flex: 1;
    color: var(--text-primary);
    font-size: 15px;
  }

  .pendiente .nombre {
    color: var(--text-tertiary);
    font-style: italic;
  }

  .nota {
    font-size: 18px;
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
  }

  .nota.aprobada {
    color: var(--accent-primary);
  }

  .nota.reprobada {
    color: var(--accent-danger);
  }

  .nota.pendiente {
    color: var(--text-tertiary);
  }

  /* Confirm full-width: misma altura que el card normal para que la lista
     no salte cuando entra/sale del estado. */
  .confirm-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 8px 12px 8px 14px;
    background: color-mix(in srgb, var(--accent-danger) 14%, var(--bg-secondary));
    color: var(--text-primary);
    min-height: 48px;
  }

  .confirm-texto {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .confirm-acciones {
    display: flex;
    gap: var(--space-2);
  }

  .btn-cancelar,
  .btn-confirmar {
    padding: 6px 14px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: var(--weight-bold);
    transition: opacity 120ms ease, background 120ms ease;
  }

  .btn-cancelar {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-emphasis);
  }

  .btn-cancelar:hover,
  .btn-cancelar:focus-visible {
    background: var(--bg-secondary);
    color: var(--text-primary);
    outline: none;
  }

  .btn-confirmar {
    background: var(--accent-danger);
    color: #fff;
    border: 1px solid var(--accent-danger);
  }

  .btn-confirmar:hover,
  .btn-confirmar:focus-visible {
    opacity: 0.92;
    outline: none;
  }
</style>

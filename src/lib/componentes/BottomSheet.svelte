<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  interface Props {
    open: boolean;
    title?: string;
    /** Ancho máximo del sheet, independiente del shell de la app. Default 480px. */
    maxWidth?: string;
    onClose: () => void;
    children?: Snippet;
  }

  let { open, title, maxWidth = '480px', onClose, children }: Props = $props();

  // Swipe-down sobre el handle cierra el sheet (umbral en px).
  const SWIPE_DISMISS_PX = 80;
  let touchStartY: number | null = null;

  function onHandleTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0]?.clientY ?? null;
  }

  function onHandleTouchEnd(e: TouchEvent) {
    if (touchStartY === null) return;
    const endY = e.changedTouches[0]?.clientY;
    if (endY !== undefined && endY - touchStartY > SWIPE_DISMISS_PX) {
      onClose();
    }
    touchStartY = null;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }

  // Bloquea scroll del body subyacente mientras el sheet está abierto.
  $effect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  });
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="backdrop"
    role="presentation"
    onclick={onClose}
    transition:fade={{ duration: 160 }}
  ></div>

  <div class="anchor">
    <div
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Sheet'}
      style:max-width={maxWidth}
      transition:fly={{ y: 480, duration: 240, easing: cubicOut }}
    >
      <div
        class="handle-area"
        role="button"
        tabindex="-1"
        aria-label="Deslizar hacia abajo para cerrar"
        ontouchstart={onHandleTouchStart}
        ontouchend={onHandleTouchEnd}
      >
        <div class="handle" aria-hidden="true"></div>
      </div>

      {#if title}
        <header class="header">
          <h2>{title}</h2>
          <button
            type="button"
            class="close"
            onclick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
      {/if}

      <div class="body">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 50;
  }

  .anchor {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    z-index: 51;
    pointer-events: none;
  }

  .sheet {
    pointer-events: auto;
    width: 100%;
    max-width: 480px;
    max-height: 85dvh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-bottom: none;
    border-top-left-radius: var(--radius-xl);
    border-top-right-radius: var(--radius-xl);
    box-shadow: var(--shadow-sheet);
  }

  .handle-area {
    display: flex;
    justify-content: center;
    padding: 10px 0 4px;
    cursor: grab;
    touch-action: none;
  }

  .handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--text-tertiary);
    opacity: 0.6;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4) var(--space-3);
    border-bottom: 1px solid var(--border-subtle);
  }

  .header h2 {
    font-size: 16px;
    color: var(--text-primary);
    font-weight: var(--weight-bold);
  }

  .close {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    line-height: 1;
  }

  .close:hover,
  .close:focus-visible {
    background: var(--bg-secondary);
    color: var(--text-primary);
    outline: none;
  }

  .body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
</style>

<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { agregarAWaitlist } from '$lib/storage/store.svelte.ts';

  interface Props {
    open: boolean;
    titulo?: string;
    subtitulo: string;
    /**
     * Identificador del feature al que se está haciendo waitlist.
     * Diferencia entradas en `calcnotas_waitlist` (ej. "meta", "paes").
     */
    contexto: string;
    onClose: () => void;
  }

  let {
    open,
    titulo = 'Pronto',
    subtitulo,
    contexto,
    onClose
  }: Props = $props();

  let email = $state('');
  let estado = $state<'idle' | 'guardado' | 'error'>('idle');
  let isDesktop = $state(false);

  $effect(() => {
    const mq = window.matchMedia('(min-width: 700px)');
    isDesktop = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  $effect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  });

  // Reset al cerrar para no mostrar "guardado" al volver a abrir.
  $effect(() => {
    if (!open) {
      email = '';
      estado = 'idle';
    }
  });

  function emailValido(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  function guardar(e: Event) {
    e.preventDefault();
    if (!emailValido(email)) {
      estado = 'error';
      return;
    }
    const ok = agregarAWaitlist({
      email: email.trim(),
      contexto,
      fecha: new Date().toISOString()
    });
    estado = ok ? 'guardado' : 'error';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="backdrop"
    role="presentation"
    onclick={onClose}
    transition:fade={{ duration: 160 }}
  ></div>

  {#if isDesktop}
    <div class="modal-anchor">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
      >
        {@render contenido()}
      </div>
    </div>
  {:else}
    <div class="sheet-anchor">
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        transition:fly={{ y: 480, duration: 220, easing: cubicOut }}
      >
        <div class="handle-area" aria-hidden="true">
          <div class="handle"></div>
        </div>
        {@render contenido()}
      </div>
    </div>
  {/if}
{/if}

{#snippet contenido()}
  <div class="cuerpo">
    <header class="header">
      <h2>{titulo}</h2>
      <button
        type="button"
        class="close"
        onclick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>
    </header>

    <p class="subtitulo">{subtitulo}</p>

    {#if estado === 'guardado'}
      <p class="ok">Listo, te avisamos cuando esté disponible.</p>
    {:else}
      <form onsubmit={guardar}>
        <label class="label" for="email-waitlist">
          Tu email (opcional)
        </label>
        <input
          id="email-waitlist"
          type="email"
          inputmode="email"
          placeholder="tu@correo.cl"
          bind:value={email}
          aria-invalid={estado === 'error'}
        />
        {#if estado === 'error'}
          <p class="err">Revisa que el email esté bien escrito.</p>
        {/if}
        <button type="submit" class="primary">
          Avísame cuando esté listo
        </button>
      </form>
    {/if}

    <button type="button" class="link-volver" onclick={onClose}>
      Volver
    </button>
  </div>
{/snippet}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 60;
  }

  .sheet-anchor,
  .modal-anchor {
    position: fixed;
    inset: 0;
    display: flex;
    z-index: 61;
    pointer-events: none;
  }

  .sheet-anchor {
    align-items: flex-end;
    justify-content: center;
  }

  .modal-anchor {
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
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

  .modal {
    pointer-events: auto;
    width: 100%;
    max-width: 440px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }

  .handle-area {
    display: flex;
    justify-content: center;
    padding: 10px 0 4px;
  }

  .handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--text-tertiary);
    opacity: 0.6;
  }

  .cuerpo {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5) var(--space-5);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header h2 {
    font-size: 18px;
    font-weight: var(--weight-bold);
    color: var(--text-primary);
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

  .subtitulo {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .label {
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  input[type='email'] {
    padding: 10px 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    font: inherit;
  }

  input[type='email']:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }

  input[aria-invalid='true'] {
    border-color: var(--accent-danger);
  }

  .err {
    margin: 0;
    color: var(--accent-danger);
    font-size: 13px;
  }

  .ok {
    margin: 0;
    padding: var(--space-3);
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    color: var(--accent-primary);
    border-radius: var(--radius-md);
    font-size: 14px;
  }

  .primary {
    margin-top: var(--space-1);
    padding: 12px 16px;
    background: var(--accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-weight: var(--weight-bold);
    font-size: 15px;
    transition: opacity 120ms ease;
  }

  .primary:hover,
  .primary:focus-visible {
    opacity: 0.92;
    outline: none;
  }

  .link-volver {
    align-self: center;
    margin-top: var(--space-2);
    color: var(--text-secondary);
    font-size: 14px;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>

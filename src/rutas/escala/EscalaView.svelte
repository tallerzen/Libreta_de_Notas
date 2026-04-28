<script lang="ts">
  import { calcularNota } from '$lib/algoritmos/escala';
  import { formatearNota } from '$lib/util/formato.ts';
  import BottomSheet from '$lib/componentes/BottomSheet.svelte';
  import NotaHero from '$lib/componentes/NotaHero.svelte';
  import NotaInput from '$lib/componentes/NotaInput.svelte';
  import SheetMisEscalas from '$lib/componentes/SheetMisEscalas.svelte';
  import SliderPuntaje from '$lib/componentes/SliderPuntaje.svelte';
  import TablaEscala from '$lib/componentes/TablaEscala.svelte';
  import { escalaActiva } from '$lib/stores/escalaActiva.svelte.ts';
  import { store } from '$lib/storage/store.svelte.ts';

  let parametrosAbiertos = $state(false);
  let tablaAbierta = $state(false);
  let misEscalasOpen = $state(false);

  // UI de "guardar escala": input de nombre + feedback transitorio.
  let nuevoNombre = $state('');
  let guardadoFeedback = $state(false);
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  const puedeGuardarNombre = $derived(nuevoNombre.trim().length > 0);

  function guardarEscala() {
    if (!puedeGuardarNombre) return;
    escalaActiva.guardarComoEscala(nuevoNombre);
    nuevoNombre = '';
    guardadoFeedback = true;
    if (feedbackTimer !== null) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      guardadoFeedback = false;
    }, 2000);
  }
  // En desktop la tabla vive inline al costado; el sheet y el hint quedan
  // ocultos. Breakpoint a 900px porque debajo no caben 480 + 24 + tabla útil.
  let isDesktop = $state(false);

  const nota = $derived(calcularNota(escalaActiva.escala, escalaActiva.puntaje));
  const exigenciaPct = $derived(Math.round(escalaActiva.exigencia * 100));

  $effect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    isDesktop = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  // Si el viewport pasa de móvil a desktop con el sheet abierto, ciérralo:
  // la tabla ya está visible inline, dejarlo abierto sería redundante.
  $effect(() => {
    if (isDesktop && tablaAbierta) tablaAbierta = false;
  });

  // Swipe-up sobre el hint abre la tabla.
  const SWIPE_OPEN_PX = 30;
  let hintTouchStartY: number | null = null;

  function onHintTouchStart(e: TouchEvent) {
    hintTouchStartY = e.touches[0]?.clientY ?? null;
  }

  function onHintTouchEnd(e: TouchEvent) {
    if (hintTouchStartY === null) return;
    const endY = e.changedTouches[0]?.clientY;
    if (endY !== undefined && hintTouchStartY - endY > SWIPE_OPEN_PX) {
      tablaAbierta = true;
    }
    hintTouchStartY = null;
  }
</script>

<section class="view">
  <div class="primary">
    <header class="view-header">
      <h1>Escala</h1>
    </header>

    <button
      type="button"
      class="card-params"
      aria-expanded={parametrosAbiertos}
      onclick={() => (parametrosAbiertos = !parametrosAbiertos)}
    >
      <div class="card-params-top">
        <span class="card-params-label">Escala activa</span>
        <span class="card-params-toggle">{parametrosAbiertos ? '▴' : '▾'}</span>
      </div>
      <div class="card-params-summary">
        {escalaActiva.pmax} pts · {exigenciaPct}% ·
        {formatearNota(escalaActiva.nmin)}–{formatearNota(escalaActiva.nmax)}
      </div>
    </button>

    {#if parametrosAbiertos}
      <div class="params-panel">
        <label class="param-row">
          <span>Puntaje máximo</span>
          <input
            type="number"
            min="1"
            step="1"
            value={escalaActiva.pmax}
            oninput={(e) =>
              escalaActiva.setPmax(parseFloat(e.currentTarget.value) || 1)}
          />
        </label>
        <label class="param-row">
          <span>Exigencia (%)</span>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            value={exigenciaPct}
            oninput={(e) =>
              escalaActiva.setExigenciaPct(parseFloat(e.currentTarget.value) || 60)}
          />
        </label>
        <label class="param-row">
          <span>Nota mínima</span>
          <NotaInput
            value={escalaActiva.nmin}
            min={1}
            max={escalaActiva.napr - 0.1}
            ariaLabel="Nota mínima"
            onCommit={(v) => (escalaActiva.nmin = v)}
          />
        </label>
        <label class="param-row">
          <span>Nota aprobación</span>
          <NotaInput
            value={escalaActiva.napr}
            min={escalaActiva.nmin + 0.1}
            max={escalaActiva.nmax - 0.1}
            ariaLabel="Nota de aprobación"
            onCommit={(v) => (escalaActiva.napr = v)}
          />
        </label>
        <label class="param-row">
          <span>Nota máxima</span>
          <NotaInput
            value={escalaActiva.nmax}
            min={escalaActiva.napr + 0.1}
            max={10}
            ariaLabel="Nota máxima"
            onCommit={(v) => (escalaActiva.nmax = v)}
          />
        </label>

        <button
          type="button"
          class="link-reset"
          onclick={() => escalaActiva.reset()}
        >
          Restaurar valores por defecto
        </button>

        <div class="seccion-guardar">
          <span class="seccion-label">Guardar como</span>
          <div class="guardar-row">
            <input
              type="text"
              class="input-nombre"
              bind:value={nuevoNombre}
              placeholder="Ej. Pruebas 30 pts 70%"
              autocomplete="off"
              onkeydown={(e) => {
                if (e.key === 'Enter' && puedeGuardarNombre) guardarEscala();
              }}
            />
            <button
              type="button"
              class="btn-guardar"
              disabled={!puedeGuardarNombre}
              onclick={guardarEscala}
            >
              Guardar
            </button>
          </div>
          {#if guardadoFeedback}
            <span class="feedback">Guardada ✓</span>
          {/if}
          {#if store.datos.escalas_guardadas.length > 0}
            <button
              type="button"
              class="link-mis-escalas"
              onclick={() => (misEscalasOpen = true)}
            >
              Ver mis escalas ({store.datos.escalas_guardadas.length})
            </button>
          {/if}
        </div>
      </div>
    {/if}

    <NotaHero {nota} napr={escalaActiva.napr} />

    <SliderPuntaje
      puntaje={escalaActiva.puntaje}
      pmax={escalaActiva.pmax}
      incremento={escalaActiva.incremento}
      onPuntajeChange={(v) => escalaActiva.setPuntaje(v)}
      onIncrementoChange={(v) => escalaActiva.setIncremento(v)}
    />

    {#if !isDesktop}
      <button
        type="button"
        class="hint"
        aria-haspopup="dialog"
        aria-expanded={tablaAbierta}
        onclick={() => (tablaAbierta = true)}
        ontouchstart={onHintTouchStart}
        ontouchend={onHintTouchEnd}
      >
        <span class="hint-arrow" aria-hidden="true">↑</span>
        ver tabla completa
      </button>
    {/if}
  </div>

  {#if isDesktop}
    <aside class="aside">
      <header class="aside-header">
        <h2>Tabla de la escala</h2>
      </header>
      <div class="aside-body">
        <TablaEscala
          escala={escalaActiva.escala}
          puntajeActivo={escalaActiva.puntaje}
        />
      </div>
    </aside>
  {/if}
</section>

{#if !isDesktop}
  <BottomSheet
    open={tablaAbierta}
    title="Tabla de la escala"
    maxWidth="720px"
    onClose={() => (tablaAbierta = false)}
  >
    <TablaEscala
      escala={escalaActiva.escala}
      puntajeActivo={escalaActiva.puntaje}
    />
  </BottomSheet>
{/if}

<SheetMisEscalas
  open={misEscalasOpen}
  onClose={() => (misEscalasOpen = false)}
/>

<style>
  .view {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .primary {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* Desktop: shell se expande a 2 columnas (slider 480px + tabla flexible).
     Cap a 1100px para que no se vuelva absurdamente ancho en monitores grandes. */
  @media (min-width: 900px) {
    .view {
      max-width: 1100px;
      display: grid;
      grid-template-columns: 480px minmax(0, 1fr);
      gap: var(--space-5);
      align-items: start;
    }
  }

  .view-header h1 {
    font-size: 22px;
    color: var(--text-primary);
  }

  .aside {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    /* Cabe en viewport sin empujar el resto del layout: slider y tabla
       arrancan al mismo top y la tabla scrollea internamente. */
    max-height: calc(100dvh - var(--space-6) * 2 - var(--space-8));
    overflow: hidden;
  }

  .aside-header {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border-subtle);
  }

  .aside-header h2 {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: var(--weight-bold);
  }

  .aside-body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .card-params {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    text-align: left;
    cursor: pointer;
    transition: border-color 120ms ease;
  }

  .card-params:hover,
  .card-params:focus-visible {
    border-color: var(--border-emphasis);
    outline: none;
  }

  .card-params-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-params-label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .card-params-toggle {
    color: var(--text-tertiary);
    font-size: 14px;
  }

  .card-params-summary {
    font-size: 15px;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .params-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }

  .param-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: 14px;
    color: var(--text-secondary);
  }

  .param-row input {
    width: 96px;
    padding: 6px 10px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .param-row input:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }

  .link-reset {
    align-self: flex-start;
    color: var(--accent-primary);
    font-size: 13px;
    text-decoration: underline;
    text-underline-offset: 2px;
    background: none;
    padding: 0;
  }

  /* Sección "Guardar como" al final del panel de parámetros */
  .seccion-guardar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-top: var(--space-3);
    border-top: 1px solid var(--border-subtle);
    margin-top: var(--space-2);
  }

  .seccion-label {
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  .guardar-row {
    display: flex;
    gap: var(--space-2);
  }

  .input-nombre {
    flex: 1;
    padding: 8px 10px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    font: inherit;
    min-width: 0;
  }

  .input-nombre:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }

  .btn-guardar {
    padding: 8px 14px;
    background: var(--accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: var(--weight-bold);
    transition: opacity 120ms ease;
  }

  .btn-guardar:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-guardar:not(:disabled):hover,
  .btn-guardar:focus-visible {
    opacity: 0.92;
    outline: none;
  }

  .feedback {
    color: var(--accent-primary);
    font-size: 13px;
    font-weight: var(--weight-bold);
    animation: feedback-fade 2000ms ease-out forwards;
  }

  @keyframes feedback-fade {
    0%, 60% { opacity: 1; }
    100% { opacity: 0; }
  }

  .link-mis-escalas {
    align-self: flex-start;
    color: var(--accent-primary);
    font-size: 13px;
    text-decoration: underline;
    text-underline-offset: 2px;
    background: none;
    padding: 0;
    margin-top: var(--space-1);
  }

  .hint {
    align-self: center;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    margin-top: var(--space-2);
    color: var(--text-secondary);
    font-size: 13px;
    border-radius: var(--radius-pill);
    touch-action: pan-y;
    transition: color 120ms ease, background 120ms ease;
  }

  .hint:hover,
  .hint:focus-visible {
    color: var(--text-primary);
    background: var(--bg-secondary);
    outline: none;
  }

  .hint-arrow {
    display: inline-block;
    color: var(--accent-primary);
    font-weight: var(--weight-bold);
    animation: nudge 1.8s ease-in-out infinite;
  }

  @keyframes nudge {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-3px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hint-arrow {
      animation: none;
    }
  }
</style>

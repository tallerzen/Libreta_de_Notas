<script lang="ts">
  import BottomSheet from './BottomSheet.svelte';
  import NotaInput from './NotaInput.svelte';
  import { formatearNota } from '$lib/util/formato.ts';
  import type { Evaluacion } from '$lib/storage/schema';

  type Modo = 'crear' | 'editar';

  interface Props {
    open: boolean;
    modo: Modo;
    /** En modo editar: la evaluación a editar. En modo crear: ignorado. */
    evaluacion?: Evaluacion | null;
    nmin: number;
    napr: number;
    nmax: number;
    /** Si el ramo está en modo ponderado, mostrar campo de ponderación. */
    modoPonderado?: boolean;
    /** Ponderación ya asignada al resto de evaluaciones del ramo (0–1).
     *  Sirve para mostrar "con esta: X%" y bloquear guardado si excede 100%. */
    otrasPonderaciones?: number;
    onClose: () => void;
    onGuardar: (datos: {
      nombre: string;
      nota: number | null;
      ponderacion?: number;
    }) => void;
    /** Sólo se usa en modo editar. Si no se pasa, no se muestra el botón. */
    onEliminar?: () => void;
  }

  let {
    open,
    modo,
    evaluacion,
    nmin,
    napr,
    nmax,
    modoPonderado = false,
    otrasPonderaciones = 0,
    onClose,
    onGuardar,
    onEliminar
  }: Props = $props();

  const PRESETS_BASE = [
    'Prueba',
    'Control',
    'Trabajo',
    'Tarea',
    'Interrogación',
    'Coef 2'
  ];

  // Chips adicionales sólo en modo ponderado (§9.3).
  const PRESETS_PONDERADO = [
    'Ensayo',
    'Oral',
    'Portfolio',
    'Extended essay',
    'Laboratorio',
    'Informe'
  ];

  const PRESETS_PONDERACION = [10, 20, 25, 30, 50];

  let nombre = $state('');
  let pendiente = $state(false);
  // Placeholder literal para no capturar la prop `napr` en el init de
  // `$state` (silencia warning state_referenced_locally). El valor real
  // lo setea el `$effect` de abajo cada vez que se abre el sheet.
  let nota = $state<number>(4);
  // Ponderación en percentage (0–100) para UX; se convierte a fracción al guardar.
  let ponderacionPct = $state<number>(0);
  // Estado de confirmación de borrado: dos clicks (anti-misclick).
  let confirmandoEliminar = $state(false);

  $effect(() => {
    if (!open) return;
    confirmandoEliminar = false;
    if (modo === 'editar' && evaluacion) {
      nombre = evaluacion.nombre;
      pendiente = evaluacion.nota === null;
      nota = evaluacion.nota ?? napr;
      ponderacionPct = Math.round((evaluacion.ponderacion ?? 0) * 100);
    } else {
      nombre = '';
      pendiente = false;
      nota = napr;
      ponderacionPct = 0;
    }
  });

  const titulo = $derived(modo === 'crear' ? 'Nueva evaluación' : 'Editar evaluación');
  const accion = $derived(modo === 'crear' ? 'Agregar' : 'Guardar');

  // Total proyectado: otras ponderaciones + esta. Si supera 100, bloqueamos
  // el guardado para evitar estados inválidos.
  const totalPct = $derived(
    Math.round(otrasPonderaciones * 100) + ponderacionPct
  );
  const excede100 = $derived(modoPonderado && totalPct > 100);

  const puedeGuardar = $derived(nombre.trim().length > 0 && !excede100);

  function setPonderacion(v: number) {
    ponderacionPct = Math.max(0, Math.min(100, Math.round(v)));
  }

  function incrementar() {
    setPonderacion(ponderacionPct + 5);
  }

  function decrementar() {
    setPonderacion(ponderacionPct - 5);
  }

  function guardar() {
    if (!puedeGuardar) return;
    onGuardar({
      nombre,
      nota: pendiente ? null : nota,
      ponderacion: modoPonderado ? ponderacionPct / 100 : 0
    });
    onClose();
  }

  function pedirEliminar() {
    confirmandoEliminar = true;
  }

  function cancelarEliminar() {
    confirmandoEliminar = false;
  }

  function confirmarEliminar() {
    if (!onEliminar) return;
    onEliminar();
    onClose();
  }
</script>

<BottomSheet {open} title={titulo} {onClose}>
  <div class="cuerpo">
    {#if modoPonderado}
      <div class="banner-ponderado">
        <span class="banner-badge">Ponderado</span>
        <span class="banner-texto">
          Cada evaluación tiene su propio peso
        </span>
      </div>
    {:else}
      <p class="hint">Todas las notas pesan lo mismo</p>
    {/if}

    <label class="campo">
      <span class="label">Nombre</span>
      <input
        type="text"
        bind:value={nombre}
        placeholder="Ej. Prueba coef 2"
        autocomplete="off"
      />
      <div class="chips">
        {#each PRESETS_BASE as preset (preset)}
          <button
            type="button"
            class="chip"
            class:activo={nombre === preset}
            onclick={() => (nombre = preset)}
          >
            {preset}
          </button>
        {/each}
        {#if modoPonderado}
          {#each PRESETS_PONDERADO as preset (preset)}
            <button
              type="button"
              class="chip"
              class:activo={nombre === preset}
              onclick={() => (nombre = preset)}
            >
              {preset}
            </button>
          {/each}
        {/if}
      </div>
    </label>

    {#if modoPonderado}
      <div class="campo">
        <span class="label">Ponderación (%)</span>
        <div class="pond-stepper">
          <button
            type="button"
            class="stepper-btn"
            onclick={decrementar}
            aria-label="Disminuir ponderación"
            disabled={ponderacionPct <= 0}
          >
            −
          </button>
          <input
            type="number"
            class="pond-num"
            min="0"
            max="100"
            step="1"
            value={ponderacionPct}
            oninput={(e) =>
              setPonderacion(parseInt(e.currentTarget.value, 10) || 0)}
            aria-label="Ponderación en porcentaje"
          />
          <button
            type="button"
            class="stepper-btn"
            onclick={incrementar}
            aria-label="Aumentar ponderación"
            disabled={ponderacionPct >= 100}
          >
            +
          </button>
        </div>
        <div class="chips">
          {#each PRESETS_PONDERACION as pct (pct)}
            <button
              type="button"
              class="chip"
              class:activo={ponderacionPct === pct}
              onclick={() => setPonderacion(pct)}
            >
              {pct}%
            </button>
          {/each}
        </div>
        <div class="total-indicator" class:excede={excede100}>
          Con esta: {totalPct}%
          {#if excede100}
            · ajusta las demás antes de guardar
          {/if}
        </div>
      </div>
    {/if}

    <div class="toggle">
      <label class="toggle-label">
        <input type="checkbox" bind:checked={pendiente} />
        <span>Sin nota todavía (pendiente)</span>
      </label>
    </div>

    {#if !pendiente}
      <div class="campo">
        <span class="label">Nota</span>
        <div class="nota-row">
          <NotaInput
            value={nota}
            min={nmin}
            max={nmax}
            ariaLabel="Nota"
            onCommit={(v) => (nota = v)}
          />
          <span class="nota-rango">
            entre {formatearNota(nmin)} y {formatearNota(nmax)}
          </span>
        </div>
      </div>
    {/if}

    {#if excede100}
      <p class="err-excede">Excede 100%, ajusta primero</p>
    {/if}

    <button
      type="button"
      class="primary"
      disabled={!puedeGuardar}
      onclick={guardar}
    >
      {accion}
    </button>

    {#if modo === 'editar' && onEliminar}
      <div class="zona-peligrosa">
        {#if confirmandoEliminar}
          <p class="confirm-texto">
            ¿Eliminar esta evaluación? Se borra del ramo y no se puede deshacer.
          </p>
          <div class="confirm-acciones">
            <button
              type="button"
              class="btn-cancelar"
              onclick={cancelarEliminar}
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn-confirmar"
              onclick={confirmarEliminar}
            >
              Sí, eliminar
            </button>
          </div>
        {:else}
          <button
            type="button"
            class="btn-eliminar"
            onclick={pedirEliminar}
          >
            Eliminar evaluación
          </button>
        {/if}
      </div>
    {/if}
  </div>
</BottomSheet>

<style>
  .cuerpo {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5) var(--space-5);
  }

  .hint {
    margin: 0;
    color: var(--text-tertiary);
    font-size: 13px;
  }

  .campo {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .label {
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  input[type='text'] {
    padding: 10px 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    font: inherit;
  }

  input[type='text']:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    background: transparent;
    border: 1px solid var(--border-emphasis);
    color: var(--text-secondary);
    font-size: 13px;
    transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
  }

  .chip.activo {
    background: var(--accent-primary);
    color: #fff;
    border-color: var(--accent-primary);
  }

  /* Banner indicando modo ponderado activo */
  .banner-ponderado {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 8px 12px;
    background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
    border-radius: var(--radius-md);
  }

  .banner-badge {
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--accent-primary);
    color: #fff;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--weight-bold);
  }

  .banner-texto {
    color: var(--text-secondary);
    font-size: 12px;
  }

  /* Stepper + input numérico de ponderación */
  .pond-stepper {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .stepper-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: var(--weight-bold);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    transition: background 120ms ease, opacity 120ms ease;
  }

  .stepper-btn:hover:not(:disabled),
  .stepper-btn:focus-visible {
    background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-secondary));
    outline: none;
  }

  .stepper-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pond-num {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    font: inherit;
    font-size: 20px;
    font-weight: var(--weight-bold);
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .pond-num:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }

  .total-indicator {
    font-size: 13px;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .total-indicator.excede {
    color: var(--accent-danger);
    font-weight: var(--weight-bold);
  }

  .err-excede {
    margin: 0;
    color: var(--accent-danger);
    font-size: 13px;
    font-weight: var(--weight-bold);
  }

  .toggle {
    display: flex;
    align-items: center;
  }

  .toggle-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
  }

  .toggle-label input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent-primary);
  }

  .nota-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .nota-rango {
    color: var(--text-tertiary);
    font-size: 13px;
  }

  .primary {
    padding: 12px 16px;
    background: var(--accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-weight: var(--weight-bold);
    font-size: 15px;
    transition: opacity 120ms ease;
  }

  .primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .primary:not(:disabled):hover,
  .primary:focus-visible {
    opacity: 0.92;
    outline: none;
  }

  /* Zona de borrado: separada visualmente del flujo principal por un divider
     y un margen extra. La intención es que el usuario tenga que "bajar" a
     buscarla, no caer encima por accidente al confirmar la edición. */
  .zona-peligrosa {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .btn-eliminar {
    align-self: flex-start;
    padding: 8px 12px;
    color: var(--accent-danger);
    background: transparent;
    border-radius: var(--radius-md);
    font-size: 14px;
    transition: background 120ms ease;
  }

  .btn-eliminar:hover,
  .btn-eliminar:focus-visible {
    background: color-mix(in srgb, var(--accent-danger) 10%, transparent);
    outline: none;
  }

  .confirm-texto {
    margin: 0;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.5;
  }

  .confirm-acciones {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }

  .btn-cancelar,
  .btn-confirmar {
    padding: 10px 16px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: var(--weight-bold);
    transition: opacity 120ms ease;
  }

  .btn-cancelar {
    background: transparent;
    color: var(--text-secondary);
  }

  .btn-cancelar:hover,
  .btn-cancelar:focus-visible {
    background: var(--bg-secondary);
    outline: none;
  }

  .btn-confirmar {
    background: var(--accent-danger);
    color: #fff;
  }

  .btn-confirmar:hover,
  .btn-confirmar:focus-visible {
    opacity: 0.92;
    outline: none;
  }
</style>

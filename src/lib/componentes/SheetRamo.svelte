<script lang="ts">
  import BottomSheet from './BottomSheet.svelte';
  import { NIVEL_LABEL, NIVELES_ORDENADOS } from '$lib/stores/ramos.svelte.ts';
  import type { NivelRamo, Ramo } from '$lib/storage/schema';

  type Modo = 'crear' | 'editar';

  interface Props {
    open: boolean;
    modo: Modo;
    /** En modo `editar`: el ramo que se está editando. */
    ramo?: Ramo | null;
    onClose: () => void;
    onGuardar: (datos: {
      nombre: string;
      nivel: NivelRamo | null;
      modo_ponderado: boolean;
    }) => void;
    /** Sólo usable en modo `editar`. Si no se pasa, el botón no aparece. */
    onEliminar?: () => void;
  }

  let {
    open,
    modo,
    ramo,
    onClose,
    onGuardar,
    onEliminar
  }: Props = $props();

  let nombre = $state('');
  let nivel = $state<NivelRamo | null>(null);
  let modoPonderado = $state(false);
  let confirmandoEliminar = $state(false);

  $effect(() => {
    if (!open) return;
    confirmandoEliminar = false;
    if (modo === 'editar' && ramo) {
      nombre = ramo.nombre;
      nivel = ramo.nivel;
      modoPonderado = ramo.modo_ponderado;
    } else {
      nombre = '';
      nivel = null;
      modoPonderado = false;
    }
  });

  const titulo = $derived(modo === 'crear' ? 'Nuevo ramo' : 'Editar ramo');
  const accion = $derived(modo === 'crear' ? 'Crear ramo' : 'Guardar');
  const puedeGuardar = $derived(nombre.trim().length > 0);

  function guardar() {
    if (!puedeGuardar) return;
    onGuardar({ nombre, nivel, modo_ponderado: modoPonderado });
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
    <label class="campo">
      <span class="label">Nombre</span>
      <input
        type="text"
        bind:value={nombre}
        placeholder="Ej. Historia"
        autocomplete="off"
      />
    </label>

    <div class="campo">
      <span class="label">Nivel (opcional)</span>
      <div class="chips" role="radiogroup" aria-label="Nivel">
        {#each NIVELES_ORDENADOS as opt (opt)}
          <button
            type="button"
            class="chip"
            class:activo={nivel === opt}
            role="radio"
            aria-checked={nivel === opt}
            onclick={() => (nivel = nivel === opt ? null : opt)}
          >
            {NIVEL_LABEL[opt]}
          </button>
        {/each}
      </div>
    </div>

    <label class="toggle-ponderado">
      <input type="checkbox" bind:checked={modoPonderado} />
      <span class="toggle-texto">
        <span class="toggle-titulo">Ponderación personalizada</span>
        <span class="toggle-sub">
          Cada evaluación pesa distinto (típico en universidad, IB).
        </span>
      </span>
    </label>

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
            ¿Eliminar este ramo? Se borra con todas sus evaluaciones y no
            se puede deshacer.
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
            Eliminar ramo
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

  .toggle-ponderado {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .toggle-ponderado input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    accent-color: var(--accent-primary);
  }

  .toggle-texto {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toggle-titulo {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: var(--weight-bold);
  }

  .toggle-sub {
    color: var(--text-tertiary);
    font-size: 12px;
    line-height: 1.4;
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

  .primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .primary:not(:disabled):hover,
  .primary:focus-visible {
    opacity: 0.92;
    outline: none;
  }

  /* Zona de borrado (modo editar) — mismo patrón que SheetEditarEvaluacion */
  .zona-peligrosa {
    margin-top: var(--space-3);
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

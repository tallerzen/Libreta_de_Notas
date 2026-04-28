<script lang="ts">
  import BottomSheet from './BottomSheet.svelte';
  import { formatearNota } from '$lib/util/formato.ts';
  import { store } from '$lib/storage/store.svelte.ts';
  import { escalaActiva } from '$lib/stores/escalaActiva.svelte.ts';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  let confirmandoId = $state<string | null>(null);

  $effect(() => {
    if (!open) confirmandoId = null;
  });

  function cargar(id: string) {
    escalaActiva.cargarEscalaGuardada(id);
    onClose();
  }

  function eliminar(id: string) {
    escalaActiva.eliminarEscalaGuardada(id);
    confirmandoId = null;
  }
</script>

<BottomSheet {open} title="Mis escalas" {onClose}>
  <div class="cuerpo">
    {#if store.datos.escalas_guardadas.length === 0}
      <p class="vacio">
        No tienes escalas guardadas todavía. Configura los parámetros y
        usa "Guardar escala" abajo para crear tu primera.
      </p>
    {:else}
      <ul class="lista">
        {#each store.datos.escalas_guardadas as e (e.id)}
          {@const exigPct = Math.round(e.exigencia * 100)}
          <li class="item">
            <button
              type="button"
              class="esc-btn"
              onclick={() => cargar(e.id)}
            >
              <div class="meta">
                <span class="nombre">{e.nombre}</span>
                <span class="detalle">
                  {e.puntaje_max} pts · {exigPct}% ·
                  {formatearNota(e.nota_min)}–{formatearNota(e.nota_max)}
                </span>
              </div>
              <span class="caret" aria-hidden="true">›</span>
            </button>

            {#if confirmandoId === e.id}
              <div class="confirm">
                <span>¿Eliminar "{e.nombre}"?</span>
                <div class="confirm-actions">
                  <button
                    type="button"
                    class="btn-no"
                    onclick={() => (confirmandoId = null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="btn-si"
                    onclick={() => eliminar(e.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            {:else}
              <button
                type="button"
                class="btn-eliminar"
                onclick={() => (confirmandoId = e.id)}
                aria-label="Eliminar {e.nombre}"
              >
                ⌫
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</BottomSheet>

<style>
  .cuerpo {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4) var(--space-5);
  }

  .vacio {
    margin: 0;
    color: var(--text-tertiary);
    font-size: 14px;
    text-align: center;
    padding: var(--space-4);
    line-height: 1.5;
  }

  .lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .item {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .esc-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 12px 44px 12px 14px;
    text-align: left;
    color: var(--text-primary);
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nombre {
    font-size: 15px;
    font-weight: var(--weight-bold);
  }

  .detalle {
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .caret {
    color: var(--text-tertiary);
    font-size: 16px;
  }

  .btn-eliminar {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    border-radius: var(--radius-md);
    font-size: 16px;
    transition: color 120ms ease, background 120ms ease;
  }

  .btn-eliminar:hover,
  .btn-eliminar:focus-visible {
    color: var(--accent-danger);
    background: color-mix(in srgb, var(--accent-danger) 10%, transparent);
    outline: none;
  }

  .confirm {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 10px 14px 12px;
    background: color-mix(in srgb, var(--accent-danger) 10%, var(--bg-secondary));
    color: var(--text-primary);
    font-size: 13px;
    border-top: 1px solid var(--border-subtle);
  }

  .confirm-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }

  .confirm .btn-no,
  .confirm .btn-si {
    padding: 6px 12px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: var(--weight-bold);
  }

  .confirm .btn-no {
    background: transparent;
    color: var(--text-secondary);
  }

  .confirm .btn-si {
    background: var(--accent-danger);
    color: #fff;
  }
</style>

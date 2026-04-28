<script lang="ts">
  import BottomSheet from './BottomSheet.svelte';
  import { calcularPromedio } from '$lib/algoritmos/promedio';
  import { formatearNota } from '$lib/util/formato.ts';
  import { NIVEL_LABEL, ramos } from '$lib/stores/ramos.svelte.ts';

  interface Props {
    open: boolean;
    onClose: () => void;
    onSeleccionar: (ramoId: string) => void;
    onEditar: (ramoId: string) => void;
    onCrearNuevo: () => void;
  }

  let { open, onClose, onSeleccionar, onEditar, onCrearNuevo }: Props =
    $props();
</script>

<BottomSheet {open} title="Tus ramos" {onClose}>
  <div class="cuerpo">
    {#if ramos.lista.length === 0}
      <p class="vacio">Aún no tienes ramos.</p>
    {:else}
      <ul class="lista">
        {#each ramos.lista as ramo (ramo.id)}
          {@const promedio = calcularPromedio(ramo)}
          <li class="item" class:activo={ramos.ramoActivo?.id === ramo.id}>
            <button
              type="button"
              class="ramo-btn"
              onclick={() => {
                onSeleccionar(ramo.id);
                onClose();
              }}
            >
              <div class="meta">
                <span class="nombre">{ramo.nombre}</span>
                <div class="meta-sub">
                  {#if ramo.nivel}
                    <span class="nivel">{NIVEL_LABEL[ramo.nivel]}</span>
                  {/if}
                  {#if ramo.modo_ponderado}
                    <span class="badge-ponderado">Ponderado</span>
                  {/if}
                </div>
              </div>
              <span class="promedio">
                {promedio !== null ? formatearNota(promedio) : '—'}
              </span>
            </button>

            <button
              type="button"
              class="btn-editar"
              onclick={() => {
                onEditar(ramo.id);
                onClose();
              }}
              aria-label="Editar ramo {ramo.nombre}"
            >
              ✎
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <button
      type="button"
      class="primary"
      onclick={() => {
        onCrearNuevo();
        onClose();
      }}
    >
      + Crear ramo nuevo
    </button>
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
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .item.activo {
    border-color: var(--accent-primary);
  }

  .ramo-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 12px 14px;
    text-align: left;
    color: var(--text-primary);
    min-width: 0;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .nombre {
    font-size: 15px;
    font-weight: var(--weight-bold);
  }

  .meta-sub {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 12px;
  }

  .nivel {
    color: var(--text-tertiary);
  }

  .badge-ponderado {
    padding: 2px 6px;
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
    color: var(--accent-primary);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: var(--weight-bold);
  }

  .promedio {
    font-size: 18px;
    font-weight: var(--weight-bold);
    color: var(--accent-primary);
    font-variant-numeric: tabular-nums;
  }

  .btn-editar {
    width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    font-size: 16px;
    border-left: 1px solid var(--border-subtle);
    transition: color 120ms ease, background 120ms ease;
  }

  .btn-editar:hover,
  .btn-editar:focus-visible {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--accent-primary) 8%, transparent);
    outline: none;
  }

  .primary {
    margin-top: var(--space-2);
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
</style>

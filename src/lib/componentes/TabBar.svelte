<script lang="ts">
  import { router, type Ruta } from '$lib/router.svelte.ts';

  interface Props {
    /** Tap en una tab disabled (Meta v0.2.0): el dueño abre la pantalla "próximamente". */
    onDisabledTap: (ruta: Ruta) => void;
  }

  let { onDisabledTap }: Props = $props();

  type TabDef = {
    ruta: Ruta;
    label: string;
    icon: string;
    enabled: boolean;
  };

  const tabs: TabDef[] = [
    { ruta: 'escala', label: 'Escala', icon: '▣', enabled: true },
    { ruta: 'promedio', label: 'Promedio', icon: 'Σ', enabled: true },
    { ruta: 'meta', label: 'Meta', icon: '◎', enabled: true }
  ];

  function handleClick(tab: TabDef) {
    if (!tab.enabled) {
      onDisabledTap(tab.ruta);
      return;
    }
    router.navegar(tab.ruta);
  }
</script>

<nav class="tabbar" aria-label="Navegación principal">
  {#each tabs as tab (tab.ruta)}
    {@const activa = router.ruta === tab.ruta && tab.enabled}
    <button
      type="button"
      class="tab"
      class:activa
      class:disabled={!tab.enabled}
      aria-current={activa ? 'page' : undefined}
      aria-disabled={!tab.enabled}
      onclick={() => handleClick(tab)}
    >
      <span class="icon" aria-hidden="true">{tab.icon}</span>
      <span class="label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  /* Fixed: la tab bar siempre visible en el viewport, no se va al fondo
     del scroll cuando el contenido crece (Meta con mapa de escenarios,
     Promedio con muchas evaluaciones, Escala con sheet de tabla, etc).
     El `.content` del shell compensa con padding-bottom equivalente. */
  .tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    width: 100%;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-subtle);
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  }

  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 120ms ease;
  }

  .tab:hover:not(.disabled),
  .tab:focus-visible:not(.disabled) {
    color: var(--text-primary);
    outline: none;
  }

  .tab.activa {
    color: var(--accent-primary);
  }

  /* Patrón "próximamente" del §7: visualmente disabled pero clickeable. */
  .tab.disabled {
    opacity: 0.45;
    color: var(--text-tertiary);
    cursor: default;
  }

  .icon {
    font-size: 18px;
    line-height: 1;
  }

  .label {
    font-size: 11px;
    letter-spacing: 0.04em;
  }
</style>

<script lang="ts">
  import { store } from '$lib/storage/store.svelte.ts';

  /**
   * Toggle de 2 estados (claro ↔ oscuro). El default `tema = 'auto'` se
   * resuelve contra `prefers-color-scheme` del SO; al primer tap el usuario
   * sale de `auto` a un valor explícito que persiste en localStorage. El
   * ícono representa lo que pasa al tocar (luna en claro → cambia a oscuro;
   * sol en oscuro → cambia a claro), patrón estándar de iOS/Android.
   */

  let osPrefiereDark = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    osPrefiereDark = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      osPrefiereDark = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  const modoActivoEsDark = $derived.by(() => {
    const tema = store.datos.preferencias.tema;
    if (tema === 'dark') return true;
    if (tema === 'light') return false;
    return osPrefiereDark;
  });

  $effect(() => {
    const tema = store.datos.preferencias.tema;
    const root = document.documentElement;
    if (tema === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', tema);
    }
  });

  function alternar() {
    store.datos.preferencias.tema = modoActivoEsDark ? 'light' : 'dark';
  }

  const label = $derived(
    modoActivoEsDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
  );
</script>

<button
  type="button"
  class="toggle"
  onclick={alternar}
  aria-label={label}
  title={label}
>
  <span class="icon" aria-hidden="true">
    {modoActivoEsDark ? '☼' : '☾'}
  </span>
</button>

<style>
  .toggle {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border: 1px solid color-mix(in srgb, var(--accent-primary) 28%, transparent);
    border-radius: var(--radius-pill);
    transition:
      color 120ms ease,
      background-color 120ms ease,
      border-color 120ms ease;
  }

  .toggle:hover,
  .toggle:focus-visible {
    color: var(--accent-primary);
    border-color: color-mix(in srgb, var(--accent-primary) 50%, transparent);
    background: color-mix(in srgb, var(--accent-primary) 5%, var(--bg-secondary));
    outline: none;
  }

  .toggle:active {
    transition-duration: 100ms;
    background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-secondary));
  }

  .icon {
    font-size: 22px;
    line-height: 1;
  }
</style>

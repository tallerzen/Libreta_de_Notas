<script lang="ts">
  import { store } from '$lib/storage/store.svelte.ts';
  import type { Tema } from '$lib/storage/schema';

  /**
   * Botón de 3 estados que cicla auto → dark → light → auto. La preferencia
   * persiste en `store.datos.preferencias.tema`. Un `$effect` aplica el
   * `data-theme` correspondiente al `<html>`:
   *
   *   - `auto`: sin atributo → respeta `prefers-color-scheme` del SO.
   *   - `dark` | `light`: setea `data-theme` para forzar.
   */

  const ORDEN: Tema[] = ['auto', 'dark', 'light'];

  const ICONOS: Record<Tema, string> = {
    auto: '◐',
    dark: '☾',
    light: '☼'
  };

  const LABELS: Record<Tema, string> = {
    auto: 'Tema automático',
    dark: 'Tema oscuro',
    light: 'Tema claro'
  };

  $effect(() => {
    const tema = store.datos.preferencias.tema;
    const root = document.documentElement;
    if (tema === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', tema);
    }
  });

  function ciclar() {
    const actual = store.datos.preferencias.tema;
    const idx = ORDEN.indexOf(actual);
    const siguiente = ORDEN[(idx + 1) % ORDEN.length];
    store.datos.preferencias.tema = siguiente;
  }
</script>

<button
  type="button"
  class="toggle"
  onclick={ciclar}
  aria-label={LABELS[store.datos.preferencias.tema]}
  title={LABELS[store.datos.preferencias.tema]}
>
  <span class="icon" aria-hidden="true">
    {ICONOS[store.datos.preferencias.tema]}
  </span>
</button>

<style>
  .toggle {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    background: transparent;
    border-radius: var(--radius-pill);
    transition: color 120ms ease, background 120ms ease;
  }

  .toggle:hover,
  .toggle:focus-visible {
    color: var(--text-primary);
    background: var(--bg-secondary);
    outline: none;
  }

  .icon {
    font-size: 18px;
    line-height: 1;
  }
</style>

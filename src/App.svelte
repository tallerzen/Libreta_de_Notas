<script lang="ts">
  import { onMount } from 'svelte';
  import { router, type Ruta } from '$lib/router.svelte.ts';
  import { store } from '$lib/storage/store.svelte.ts';
  import EscalaView from './rutas/escala/EscalaView.svelte';
  import PromedioView from './rutas/promedio/PromedioView.svelte';
  import MetaView from './rutas/meta/MetaView.svelte';
  import TabBar from '$lib/componentes/TabBar.svelte';
  import ThemeToggle from '$lib/componentes/ThemeToggle.svelte';
  import PantallaProximamente from '$lib/componentes/PantallaProximamente.svelte';

  let proximamenteOpen = $state(false);
  let proximamenteContexto = $state('');
  let proximamenteSubtitulo = $state('');

  onMount(() => {
    // Persistencia y routing arrancan acá: ambos requieren `window`, y este
    // componente sólo monta del lado del cliente.
    store.iniciar();
    router.iniciar();

    // Save al cerrar pestaña por si quedaron cambios pendientes en el debounce.
    const onBeforeUnload = () => store.flush();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  });

  function abrirProximamente(ruta: Ruta) {
    // Hoy ninguna tab está disabled; el handler queda por si vuelve a haber
    // un tab "próximamente" en el futuro (ej. perfiles del onboarding §9.5).
    proximamenteContexto = ruta;
    proximamenteSubtitulo = 'Estamos trabajando en este módulo.';
    proximamenteOpen = true;
  }
</script>

<div class="shell">
  <div class="theme-corner">
    <ThemeToggle />
  </div>

  <main class="content">
    {#if router.ruta === 'escala'}
      <EscalaView />
    {:else if router.ruta === 'promedio'}
      <PromedioView />
    {:else if router.ruta === 'meta'}
      <MetaView />
    {/if}
  </main>

  <TabBar onDisabledTap={abrirProximamente} />
</div>

<PantallaProximamente
  open={proximamenteOpen}
  titulo="Pronto"
  subtitulo={proximamenteSubtitulo}
  contexto={proximamenteContexto}
  onClose={() => (proximamenteOpen = false)}
/>

<style>
  .shell {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    position: relative;
  }

  .theme-corner {
    position: fixed;
    top: max(env(safe-area-inset-top), 8px);
    right: max(env(safe-area-inset-right), 8px);
    z-index: 40;
  }

  .content {
    flex: 1;
    width: 100%;
    /* padding-bottom = espacio para la TabBar fija (~56px de alto) +
       safe-area-inset-bottom + un colchón visual (var(--space-5)). Sin
       esto el contenido del scroll queda tapado por la barra. */
    padding:
      var(--space-5)
      var(--space-4)
      calc(var(--space-5) + 56px + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
  }

  /* Padding lateral más generoso en desktop. El max-width final lo decide
     cada vista (480px por defecto, 1100px para Escala con tabla inline). */
  @media (min-width: 600px) {
    .content {
      padding:
        var(--space-6)
        var(--space-6)
        calc(var(--space-6) + 56px + env(safe-area-inset-bottom));
    }
  }
</style>

<script lang="ts">
  import { ESCALA_DEFAULT } from '$lib/algoritmos/escala';
  import {
    calcularNotaNecesaria,
    estadoAlcanzabilidad,
    mapaEscenarios,
    resumenPendientes,
    type EstadoAlcanzabilidad
  } from '$lib/algoritmos/meta';
  import { calcularPromedio } from '$lib/algoritmos/promedio';
  import { redondeoChileno } from '$lib/algoritmos/redondeo';
  import { formatearNota } from '$lib/util/formato.ts';
  import ListaRamos from '$lib/componentes/ListaRamos.svelte';
  import NotaInput from '$lib/componentes/NotaInput.svelte';
  import { router } from '$lib/router.svelte.ts';
  import { NIVEL_LABEL, ramos } from '$lib/stores/ramos.svelte.ts';
  import { META_DEFAULT, metaState } from '$lib/stores/metaState.svelte.ts';

  const escala = ESCALA_DEFAULT;

  let listaRamosOpen = $state(false);

  const ramoActivo = $derived(ramos.ramoActivo);
  const evaluaciones = $derived(ramoActivo?.evaluaciones ?? []);
  const promedioParcial = $derived(
    ramoActivo ? calcularPromedio(ramoActivo) : null
  );

  /**
   * Pesos para Meta: en modo ponderado se toman del ramo tal cual. En modo
   * simple no se pasan (el algoritmo usa peso uniforme 1/N). La puerta
   * del algoritmo ya existe desde v0.3.0.
   */
  const pesos = $derived(
    ramoActivo?.modo_ponderado
      ? new Map(ramoActivo.evaluaciones.map((e) => [e.id, e.ponderacion]))
      : undefined
  );

  const resumen = $derived(resumenPendientes(evaluaciones, pesos));

  const meta = $derived(
    ramoActivo ? metaState.obtener(ramoActivo.id) : META_DEFAULT
  );

  function setMeta(v: number) {
    if (!ramoActivo) return;
    metaState.fijar(ramoActivo.id, v);
  }

  // Cálculo principal: usa el valor exacto (sin redondear) para no caer en
  // falsos ALCANZABLE / IMPOSIBLE por rebote del redondeo (ej. 7,01 ≠ 7,0).
  const notaNecesariaExacta = $derived(
    ramoActivo
      ? calcularNotaNecesaria({ evaluaciones, metaPromedio: meta, pesos })
      : null
  );

  const estado = $derived<EstadoAlcanzabilidad | null>(
    notaNecesariaExacta !== null
      ? estadoAlcanzabilidad(notaNecesariaExacta, escala)
      : null
  );

  // El display sí va redondeado (regla del libro de clases).
  const notaDisplay = $derived(
    notaNecesariaExacta !== null
      ? redondeoChileno(notaNecesariaExacta)
      : null
  );

  const escenarios = $derived(mapaEscenarios(evaluaciones, pesos));
  const mejorEscenario = $derived(
    escenarios.length > 0 ? escenarios[escenarios.length - 1].promedioFinal : null
  );
  const niConUn7 = $derived(
    estado === 'IMPOSIBLE' && mejorEscenario !== null && mejorEscenario < meta
  );

  const ESTADO_LABEL: Record<EstadoAlcanzabilidad, string> = {
    ASEGURADO: 'YA ESTÁ',
    ALCANZABLE: 'ALCANZABLE',
    EXIGENTE: 'EXIGENTE',
    IMPOSIBLE: 'IMPOSIBLE'
  };

  // Subtítulo del hero: una pendiente nombra la evaluación; varias resumen el conteo.
  const pendienteUnica = $derived(
    resumen.cantidad === 1
      ? evaluaciones.find((e) => e.nota === null) ?? null
      : null
  );

  const subtituloHero = $derived(
    pendienteUnica
      ? `en ${pendienteUnica.nombre.toLowerCase()}`
      : `en cada una de las ${resumen.cantidad} pendientes`
  );

  // Subtitle del card: "parcial 5,5 · 1 pendiente (25%)" o variante.
  const cardSubtitulo = $derived(() => {
    const partes: string[] = [];
    if (promedioParcial !== null) {
      partes.push(`parcial ${formatearNota(promedioParcial)}`);
    }
    const pesoPct = Math.round(resumen.pesoTotal * 100);
    const sufijo = resumen.cantidad === 1 ? 'pendiente' : 'pendientes';
    partes.push(`${resumen.cantidad} ${sufijo} (${pesoPct}%)`);
    return partes.join(' · ');
  });

  function irAPromedio() {
    router.navegar('promedio');
  }
</script>

<section class="view">
  <header class="view-header">
    <h1>Meta</h1>
  </header>

  {#if !ramoActivo}
    <!-- Estado vacío 1: no existe ningún ramo -->
    <div class="vacio">
      <p class="vacio-titulo">Aún no tienes ramos.</p>
      <p class="vacio-sub">
        Agrega un ramo con evaluaciones pendientes para calcular qué nota
        necesitas para llegar a tu promedio objetivo.
      </p>
      <button type="button" class="primary" onclick={irAPromedio}>
        Ir a Promedio
      </button>
    </div>
  {:else if resumen.cantidad === 0}
    <!-- Estado vacío 2: ramo sin pendientes -->
    <button
      type="button"
      class="card-ramo"
      onclick={() => (listaRamosOpen = true)}
    >
      <div class="card-ramo-info">
        <span class="card-ramo-nombre">{ramoActivo.nombre}</span>
        {#if ramoActivo.nivel}
          <span class="card-ramo-nivel">{NIVEL_LABEL[ramoActivo.nivel]}</span>
        {/if}
      </div>
      <span class="caret">›</span>
    </button>

    <div class="vacio">
      <p class="vacio-titulo">Este ramo ya no tiene pendientes.</p>
      <p class="vacio-sub">
        Marca al menos una evaluación como pendiente en Promedio para
        calcular qué nota necesitas en ella.
      </p>
      <button type="button" class="primary" onclick={irAPromedio}>
        Editar evaluaciones
      </button>
    </div>
  {:else}
    <!-- Estado normal: hay ramo y al menos una pendiente -->
    <button
      type="button"
      class="card-ramo"
      onclick={() => (listaRamosOpen = true)}
    >
      <div class="card-ramo-info">
        <span class="card-ramo-nombre">{ramoActivo.nombre}</span>
        <span class="card-ramo-sub">{cardSubtitulo()}</span>
      </div>
      <span class="caret">›</span>
    </button>

    <div class="meta-control">
      <div class="meta-row">
        <span class="meta-label">Quieres quedar con</span>
        <NotaInput
          value={meta}
          min={escala.napr}
          max={escala.nmax}
          ariaLabel="Promedio objetivo"
          onCommit={setMeta}
        />
      </div>
      <input
        type="range"
        min={escala.napr}
        max={escala.nmax}
        step="0.1"
        value={meta}
        aria-label="Promedio objetivo"
        oninput={(e) =>
          setMeta(parseFloat((e.currentTarget as HTMLInputElement).value))}
      />
      <div class="escala-row">
        <span>{formatearNota(escala.napr)}</span>
        {#if promedioParcial !== null}
          <span class="parcial-marker">
            parcial {formatearNota(promedioParcial)}
          </span>
        {/if}
        <span>{formatearNota(escala.nmax)}</span>
      </div>
    </div>

    <div class="hero" data-estado={estado}>
      <div class="hero-label">NECESITAS SACAR</div>
      <div class="hero-valor">
        {#if estado === 'IMPOSIBLE'}
          —
        {:else}
          {formatearNota(notaDisplay!)}
        {/if}
      </div>
      <div class="hero-sub">
        {#if niConUn7}
          ni con un {formatearNota(escala.nmax)} alcanzas
        {:else}
          {subtituloHero}
        {/if}
      </div>
      {#if estado}
        <div class="badge">{ESTADO_LABEL[estado]}</div>
      {/if}
    </div>

    {#if escenarios.length > 0}
      <section class="escenarios">
        <header class="escenarios-header">
          <span>MAPA DE ESCENARIOS</span>
        </header>
        <ul class="escenarios-lista">
          {#each escenarios as esc, i (esc.notaPendiente)}
            {@const aprueba = esc.promedioFinal >= escala.napr}
            {@const esTecho = i === escenarios.length - 1}
            <li class="escenario-fila">
              <span class="escenario-cond">
                si sacas un {formatearNota(esc.notaPendiente)}
              </span>
              <span class="escenario-flecha" aria-hidden="true">→</span>
              <span
                class="escenario-resultado"
                class:aprueba
                class:reprueba={!aprueba}
                class:techo={esTecho}
              >
                {formatearNota(esc.promedioFinal)}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}
</section>

<ListaRamos
  open={listaRamosOpen}
  onClose={() => (listaRamosOpen = false)}
  onSeleccionar={(id) => ramos.setActivo(id)}
  onEditar={irAPromedio}
  onCrearNuevo={irAPromedio}
/>

<style>
  .view {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .view-header h1 {
    font-size: 22px;
    color: var(--text-primary);
  }

  /* Estado vacío */
  .vacio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    text-align: center;
  }

  .vacio-titulo {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: var(--weight-bold);
  }

  .vacio-sub {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    max-width: 360px;
    line-height: 1.5;
  }

  .primary {
    margin-top: var(--space-3);
    padding: 12px 24px;
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

  /* Card del ramo activo (igual visual que en Promedio) */
  .card-ramo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    text-align: left;
    cursor: pointer;
    transition: border-color 120ms ease;
  }

  .card-ramo:hover,
  .card-ramo:focus-visible {
    border-color: var(--border-emphasis);
    outline: none;
  }

  .card-ramo-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .card-ramo-nombre {
    font-size: 15px;
    font-weight: var(--weight-bold);
    color: var(--text-primary);
  }

  .card-ramo-nivel,
  .card-ramo-sub {
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .caret {
    color: var(--text-tertiary);
    font-size: 16px;
  }

  /* Control de la meta */
  .meta-control {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }

  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .meta-label {
    font-size: 14px;
    color: var(--text-secondary);
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 24px;
    background: transparent;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: var(--border-emphasis);
  }

  input[type='range']::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: var(--border-emphasis);
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -7px;
    border-radius: 50%;
    background: var(--accent-primary);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  input[type='range']::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  .escala-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .parcial-marker {
    color: var(--text-secondary);
  }

  /* Hero adaptativo: 4 estados con su color de acento */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-5) var(--space-4);
    text-align: center;
    --hero-color: var(--accent-primary);
  }

  .hero[data-estado='EXIGENTE'] {
    --hero-color: var(--accent-warning);
  }

  .hero[data-estado='IMPOSIBLE'] {
    --hero-color: var(--accent-danger);
  }

  .hero-label {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
    font-weight: var(--weight-bold);
  }

  .hero-valor {
    font-family: var(--font-serif);
    font-size: 76px;
    line-height: 1;
    font-weight: var(--weight-regular);
    color: var(--hero-color);
    transition: color 160ms ease;
    font-variant-numeric: tabular-nums;
  }

  .hero-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: var(--space-1);
  }

  .badge {
    margin-top: var(--space-2);
    display: inline-flex;
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    font-size: 11px;
    letter-spacing: 0.14em;
    font-weight: var(--weight-bold);
    background: color-mix(in srgb, var(--hero-color) 12%, transparent);
    color: var(--hero-color);
  }

  /* Mapa de escenarios */
  .escenarios {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .escenarios-header {
    padding: 0 var(--space-1);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }

  .escenarios-lista {
    list-style: none;
    margin: 0;
    padding: 0;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .escenario-fila {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: var(--space-3);
    padding: 10px 14px;
    font-variant-numeric: tabular-nums;
  }

  .escenario-fila + .escenario-fila {
    border-top: 1px solid var(--border-subtle);
  }

  .escenario-cond {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .escenario-flecha {
    color: var(--text-tertiary);
  }

  .escenario-resultado {
    font-size: 17px;
    font-weight: var(--weight-regular);
  }

  .escenario-resultado.aprueba {
    color: var(--accent-primary);
  }

  .escenario-resultado.reprueba {
    color: var(--accent-danger);
  }

  /* Techo: 7,0 ligeramente destacado */
  .escenario-resultado.techo {
    font-weight: var(--weight-bold);
  }
</style>

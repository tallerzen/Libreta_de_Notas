<script lang="ts">
  import {
    calcularPromedio,
    contarEvaluaciones,
    sumaPonderaciones
  } from '$lib/algoritmos/promedio';
  import CardEvaluacion from '$lib/componentes/CardEvaluacion.svelte';
  import ListaRamos from '$lib/componentes/ListaRamos.svelte';
  import NotaHero from '$lib/componentes/NotaHero.svelte';
  import SheetRamo from '$lib/componentes/SheetRamo.svelte';
  import SheetEditarEvaluacion from '$lib/componentes/SheetEditarEvaluacion.svelte';
  import { ESCALA_DEFAULT } from '$lib/algoritmos/escala';
  import { NIVEL_LABEL, ramos } from '$lib/stores/ramos.svelte.ts';
  import type { Evaluacion, Ramo } from '$lib/storage/schema';

  // Estado de sheets locales a la vista.
  let sheetRamoOpen = $state(false);
  let sheetRamoModo = $state<'crear' | 'editar'>('crear');
  let ramoEditando = $state<Ramo | null>(null);
  let sheetListaOpen = $state(false);
  let sheetEvalOpen = $state(false);
  let sheetEvalModo = $state<'crear' | 'editar'>('crear');
  let evalEditando = $state<Evaluacion | null>(null);

  // El módulo Promedio v0.2.0 usa los umbrales chilenos por defecto para
  // decidir aprobado/reprobado. Cuando v0.2.1 traiga "guardar escala con
  // nombre" cada ramo podrá tener su propia escala asociada.
  const napr = ESCALA_DEFAULT.napr;
  const nmin = ESCALA_DEFAULT.nmin;
  const nmax = ESCALA_DEFAULT.nmax;

  const ramoActivo = $derived(ramos.ramoActivo);
  const promedio = $derived(ramoActivo ? calcularPromedio(ramoActivo) : null);
  const conteo = $derived(
    ramoActivo
      ? contarEvaluaciones(ramoActivo.evaluaciones)
      : { rendidas: 0, pendientes: 0, total: 0 }
  );

  /**
   * Ponderación ya asignada en otras evaluaciones del ramo (excluye la que
   * se está editando). La sheet de evaluación la usa para mostrar
   * "con esta: X%" en modo ponderado.
   */
  const otrasPonderaciones = $derived(() => {
    if (!ramoActivo) return 0;
    const otras = ramoActivo.evaluaciones.filter(
      (e) => e.id !== evalEditando?.id
    );
    return sumaPonderaciones(otras);
  });

  function abrirCrearRamo() {
    sheetRamoModo = 'crear';
    ramoEditando = null;
    sheetRamoOpen = true;
  }

  function abrirEditarRamo(ramoId: string) {
    const r = ramos.lista.find((r) => r.id === ramoId);
    if (!r) return;
    sheetRamoModo = 'editar';
    ramoEditando = r;
    sheetRamoOpen = true;
  }

  function guardarRamo(datos: {
    nombre: string;
    nivel: Ramo['nivel'];
    modo_ponderado: boolean;
  }) {
    if (sheetRamoModo === 'crear') {
      ramos.crearRamo(datos);
    } else if (ramoEditando) {
      ramos.actualizarRamo(ramoEditando.id, datos);
    }
  }

  function eliminarRamo() {
    if (ramoEditando) ramos.eliminarRamo(ramoEditando.id);
  }

  function abrirCrearEval() {
    sheetEvalModo = 'crear';
    evalEditando = null;
    sheetEvalOpen = true;
  }

  function abrirEditarEval(ev: Evaluacion) {
    sheetEvalModo = 'editar';
    evalEditando = ev;
    sheetEvalOpen = true;
  }

  function guardarEval(datos: {
    nombre: string;
    nota: number | null;
    ponderacion?: number;
  }) {
    if (!ramoActivo) return;
    if (sheetEvalModo === 'crear') {
      ramos.agregarEvaluacion(ramoActivo.id, datos);
    } else if (evalEditando) {
      ramos.actualizarEvaluacion(ramoActivo.id, evalEditando.id, datos);
    }
  }

  function eliminarEval(evalId: string) {
    if (!ramoActivo) return;
    ramos.eliminarEvaluacion(ramoActivo.id, evalId);
  }
</script>

<section class="view">
  <header class="view-header">
    <h1>Promedio</h1>
  </header>

  {#if !ramoActivo}
    <div class="vacio">
      <p class="vacio-titulo">Aún no tienes ramos.</p>
      <p class="vacio-sub">
        Crea tu primer ramo para empezar a anotar evaluaciones y ver tu
        promedio en vivo.
      </p>
      <button
        type="button"
        class="primary"
        onclick={abrirCrearRamo}
      >
        + Crear primer ramo
      </button>
    </div>
  {:else}
    <div class="card-ramo-row">
      <button
        type="button"
        class="card-ramo"
        onclick={() => (sheetListaOpen = true)}
      >
        <div class="card-ramo-info">
          <div class="card-ramo-titulo">
            <span class="card-ramo-nombre">{ramoActivo.nombre}</span>
            {#if ramoActivo.modo_ponderado}
              <span class="badge-ponderado">Ponderado</span>
            {/if}
          </div>
          <div class="card-ramo-subs">
            {#if ramoActivo.nivel}
              <span>{NIVEL_LABEL[ramoActivo.nivel]}</span>
            {/if}
            <span>· {conteo.total} eval</span>
            {#if conteo.pendientes > 0}
              <span class="pendientes">
                · {conteo.pendientes} pendiente{conteo.pendientes === 1 ? '' : 's'}
              </span>
            {/if}
            {#if ramoActivo.modo_ponderado}
              {@const asignado = Math.round(
                sumaPonderaciones(ramoActivo.evaluaciones) * 100
              )}
              <span class="asignado" class:excede={asignado > 100}>
                · {asignado}% asignado
              </span>
            {/if}
          </div>
        </div>
        <span class="caret">›</span>
      </button>
      <button
        type="button"
        class="btn-editar-ramo"
        onclick={() => abrirEditarRamo(ramoActivo.id)}
        aria-label="Editar ramo"
      >
        ✎
      </button>
    </div>

    {#if promedio !== null}
      <NotaHero nota={promedio} {napr} />
    {:else}
      <div class="hero-vacio">
        <div class="hero-label">PROMEDIO PARCIAL</div>
        <div class="hero-valor-vacio">—</div>
        <div class="hero-sub">Agrega notas para ver tu promedio</div>
      </div>
    {/if}

    <section class="evaluaciones">
      <header class="eval-header">
        <span>EVALUACIONES</span>
        <span class="eval-count">{conteo.total}</span>
      </header>

      {#if conteo.total === 0}
        <p class="sin-eval">Sin evaluaciones todavía.</p>
      {:else}
        <ul class="eval-lista">
          {#each ramoActivo.evaluaciones as ev (ev.id)}
            <li>
              <CardEvaluacion
                evaluacion={ev}
                {napr}
                onEditar={() => abrirEditarEval(ev)}
                onEliminar={() => eliminarEval(ev.id)}
              />
            </li>
          {/each}
        </ul>
      {/if}

      <button
        type="button"
        class="agregar-eval"
        onclick={abrirCrearEval}
      >
        + Agregar evaluación
      </button>
    </section>
  {/if}
</section>

<SheetRamo
  open={sheetRamoOpen}
  modo={sheetRamoModo}
  ramo={ramoEditando}
  onClose={() => (sheetRamoOpen = false)}
  onGuardar={guardarRamo}
  onEliminar={sheetRamoModo === 'editar' && ramoEditando
    ? eliminarRamo
    : undefined}
/>

<ListaRamos
  open={sheetListaOpen}
  onClose={() => (sheetListaOpen = false)}
  onSeleccionar={(id) => ramos.setActivo(id)}
  onEditar={abrirEditarRamo}
  onCrearNuevo={abrirCrearRamo}
/>

<SheetEditarEvaluacion
  open={sheetEvalOpen}
  modo={sheetEvalModo}
  evaluacion={evalEditando}
  {nmin}
  {napr}
  {nmax}
  modoPonderado={ramoActivo?.modo_ponderado ?? false}
  otrasPonderaciones={otrasPonderaciones()}
  onClose={() => (sheetEvalOpen = false)}
  onGuardar={guardarEval}
  onEliminar={sheetEvalModo === 'editar' && evalEditando
    ? () => eliminarEval(evalEditando!.id)
    : undefined}
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

  .vacio .primary {
    margin-top: var(--space-3);
  }

  /* Card del ramo activo + botón de editar al costado */
  .card-ramo-row {
    display: flex;
    gap: var(--space-2);
  }

  .card-ramo {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    text-align: left;
    cursor: pointer;
    transition: border-color 120ms ease;
    min-width: 0;
  }

  .card-ramo:hover,
  .card-ramo:focus-visible {
    border-color: var(--border-emphasis);
    outline: none;
  }

  .btn-editar-ramo {
    width: 44px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    font-size: 16px;
    transition: color 120ms ease, border-color 120ms ease;
  }

  .btn-editar-ramo:hover,
  .btn-editar-ramo:focus-visible {
    color: var(--text-primary);
    border-color: var(--border-emphasis);
    outline: none;
  }

  .card-ramo-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .card-ramo-titulo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .card-ramo-nombre {
    font-size: 15px;
    font-weight: var(--weight-bold);
    color: var(--text-primary);
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

  .card-ramo-subs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .asignado.excede {
    color: var(--accent-danger);
  }

  .pendientes {
    color: var(--text-tertiary);
  }

  .caret {
    color: var(--text-tertiary);
    font-size: 16px;
    margin-left: 4px;
    flex-shrink: 0;
  }

  /* Hero vacío (sin notas todavía) */
  .hero-vacio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-6) var(--space-4);
    text-align: center;
  }

  .hero-label {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
    font-weight: var(--weight-bold);
  }

  .hero-valor-vacio {
    font-family: var(--font-serif);
    font-size: 76px;
    line-height: 1;
    color: var(--text-tertiary);
  }

  .hero-sub {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  /* Lista de evaluaciones */
  .evaluaciones {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .eval-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0 var(--space-1);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }

  .eval-count {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .sin-eval {
    margin: 0;
    padding: var(--space-3);
    text-align: center;
    color: var(--text-tertiary);
    font-size: 13px;
  }

  .eval-lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .agregar-eval {
    margin-top: var(--space-2);
    padding: 12px 16px;
    color: var(--text-secondary);
    background: transparent;
    border: 1px dashed var(--border-emphasis);
    border-radius: var(--radius-md);
    font-size: 14px;
    transition: color 120ms ease, border-color 120ms ease;
  }

  .agregar-eval:hover,
  .agregar-eval:focus-visible {
    color: var(--text-primary);
    border-color: var(--accent-primary);
    outline: none;
  }

  .primary {
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
</style>

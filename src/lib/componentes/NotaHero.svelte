<script lang="ts">
  import { formatearNota } from '$lib/util/formato.ts';

  interface Props {
    nota: number;
    napr: number;
  }

  let { nota, napr }: Props = $props();

  const aprobado = $derived(nota >= napr);
  const estado = $derived(aprobado ? 'APROBADO' : 'REPROBADO');
</script>

<div class="hero" class:reprobado={!aprobado}>
  <div class="label">TU NOTA</div>
  <div class="valor">{formatearNota(nota)}</div>
  <div class="badge">{estado}</div>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-6) var(--space-4);
    text-align: center;
  }

  .label {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
    font-weight: var(--weight-bold);
  }

  .valor {
    font-family: var(--font-serif);
    font-size: 92px;
    line-height: 1;
    font-weight: var(--weight-regular);
    color: var(--accent-primary);
    transition: color 120ms ease;
    font-variant-numeric: tabular-nums;
  }

  .hero.reprobado .valor {
    color: var(--accent-danger);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    font-size: 11px;
    letter-spacing: 0.14em;
    font-weight: var(--weight-bold);
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    color: var(--accent-primary);
  }

  .hero.reprobado .badge {
    background: color-mix(in srgb, var(--accent-danger) 12%, transparent);
    color: var(--accent-danger);
  }

  @media (max-width: 360px) {
    .valor {
      font-size: 78px;
    }
  }
</style>

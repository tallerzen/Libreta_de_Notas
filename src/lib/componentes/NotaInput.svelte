<script lang="ts">
  /**
   * Input de nota chilena con regla de "1 decimal siempre" (§8 de CONTEXT).
   *
   * Por qué `<input type="text" inputmode="decimal">` y no `type="number"`:
   *   `type="number"` renderiza con punto como separador en locales con
   *   coma decimal (incluyendo es-CL en muchos browsers), lo que choca con
   *   el resto del producto y rompe el formato. Con type="text" controlamos
   *   nosotros el render y el teclado móvil sigue siendo numérico vía
   *   `inputmode="decimal"`.
   *
   * Reglas de UX:
   *   - Aceptar coma o punto durante el tipeo.
   *   - No re-formatear en cada keystroke (deja al usuario escribir "5,"
   *     transitorio sin que se le borre).
   *   - Al blur o Enter: parsear → clampear al rango → snap a 1 decimal →
   *     re-formatear con `Intl.NumberFormat('es-CL', { ...digits: 1 })`.
   *   - Si el texto al blur es inválido o vacío, revertir al último valor
   *     válido (no propagar `onCommit`).
   */

  import { formatearNota, parsearNota } from '$lib/util/formato.ts';

  interface Props {
    value: number;
    onCommit: (v: number) => void;
    min?: number;
    max?: number;
    ariaLabel?: string;
  }

  let { value, onCommit, min, max, ariaLabel }: Props = $props();

  // `texto` arranca vacío y se llena vía `$effect.pre` antes del primer
  // commit al DOM, así no hay flash de input vacío. Después el mismo effect
  // re-sincroniza con `value` cuando cambia desde afuera (reset, etc.).
  let texto = $state('');
  $effect.pre(() => {
    texto = formatearNota(value);
  });

  function commit() {
    const n = parsearNota(texto);
    if (n === null) {
      texto = formatearNota(value);
      return;
    }
    let clamped = n;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    clamped = Math.round(clamped * 10) / 10;
    texto = formatearNota(clamped);
    if (clamped !== value) onCommit(clamped);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    }
  }
</script>

<input
  type="text"
  inputmode="decimal"
  aria-label={ariaLabel}
  bind:value={texto}
  onblur={commit}
  onkeydown={onKeyDown}
/>

<style>
  input {
    width: 96px;
    padding: 6px 10px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-emphasis);
    border-radius: var(--radius-md);
    text-align: right;
    font: inherit;
    font-variant-numeric: tabular-nums;
  }

  input:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }
</style>

<template>
  <div class="swatches" role="group" :aria-label="label">
    <button
      v-for="color in colors"
      :key="color"
      type="button"
      class="swatch"
      :class="{ active: !removable && color === modelValue, removable }"
      :style="{ '--swatch': color }"
      :aria-label="removable ? `Remove ${color}` : `${label}: ${color}`"
      :aria-pressed="removable ? null : String(color === modelValue)"
      v-on:click="onClick(color)"
    >
      <svg v-if="removable" class="swatch-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    </button>
  </div>
</template>

<script>
  export default {
    name: 'ColorSwatches',
    props: {
      // Palette to render.
      colors: { type: Array, default: () => [] },
      // Currently selected color; ignored when `removable`.
      modelValue: { type: String, default: null },
      // Describes what this group controls, for screen readers.
      label: { type: String, required: true },
      // Palette-editing mode: each swatch removes itself instead of selecting.
      removable: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'remove'],
    methods: {
      onClick(color) {
        this.$emit(this.removable ? 'remove' : 'update:modelValue', color);
      }
    }
  };
</script>

<style scoped>
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .swatch {
    position: relative;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background-color: var(--swatch);
    cursor: pointer;
    transition: box-shadow .18s ease, transform .18s ease;
  }

  .swatch:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 3px var(--line-strong);
  }

  /* Gap ring reads clearly against any swatch color, light or dark. */
  .swatch.active,
  .swatch.active:hover {
    transform: none;
    box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 4px var(--verde);
  }

  .swatch:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 3px;
  }

  .swatch-icon {
    position: absolute;
    inset: 0;
    width: 16px;
    height: 16px;
    margin: auto;
    stroke: #fff;
    stroke-width: 2.5;
    stroke-linecap: round;
    fill: none;
    opacity: 0;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, .9));
    transition: opacity .18s ease;
  }

  .swatch.removable:hover .swatch-icon,
  .swatch.removable:focus-visible .swatch-icon {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .swatch,
    .swatch:hover {
      transform: none;
      transition: none;
    }
  }
</style>

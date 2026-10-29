<template>
  <transition-group tag="div" name="swatch" class="swatches" role="group" :aria-label="label">
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
  </transition-group>
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
    transition: box-shadow .2s ease, transform .2s cubic-bezier(.33, 1, .68, 1);
  }

  .swatch:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 3px var(--line-strong);
  }

  /* Pressing it squashes under the finger, which makes a palette of 30
     swatches feel like physical buttons rather than a grid of links. */
  .swatch:active {
    transform: translateY(0) scale(.9);
    transition-duration: .06s;
  }

  /* Gap ring reads clearly against any swatch color, light or dark. */
  .swatch.active,
  .swatch.active:hover {
    transform: none;
    box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 4px var(--verde);
    animation: swatchPick .36s cubic-bezier(.33, 1, .68, 1);
  }

  /* Fires as the ring lands, so the swatch you just chose is unmistakable
     even when its color is close to its neighbor's. */
  @keyframes swatchPick {
    0% { transform: scale(.84); }
    55% { transform: scale(1.12); }
    100% { transform: scale(1); }
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
    transform: scale(.7) rotate(-45deg);
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, .9));
    transition: opacity .18s ease, transform .22s cubic-bezier(.33, 1, .68, 1);
  }

  .swatch.removable:hover .swatch-icon,
  .swatch.removable:focus-visible .swatch-icon {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* ---- Palette edits --------------------------------------------------- */

  /* Colors added and removed in the palette manager grow and shrink in place,
     and the swatches after them slide along rather than jumping. */
  .swatch-enter-active,
  .swatch-leave-active {
    transition: opacity .24s ease, transform .28s cubic-bezier(.33, 1, .68, 1);
  }

  .swatch-enter-from,
  .swatch-leave-to {
    opacity: 0;
    transform: scale(.4);
  }

  .swatch-move {
    transition: transform .28s cubic-bezier(.33, 1, .68, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .swatch,
    .swatch:hover,
    .swatch:active {
      transform: none;
      transition: none;
    }

    .swatch-icon {
      transform: none;
    }
  }
</style>

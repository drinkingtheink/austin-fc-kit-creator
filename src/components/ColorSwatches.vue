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

    <!-- Any color at all, chosen where the work is happening. Dragging the
         OS picker previews on the kit live; letting go commits it to the
         palette, so it is reachable from the other sixteen fields too. -->
    <label v-if="!removable" key="__picker" class="swatch picker" :title="`Custom ${label.toLowerCase()}`">
      <span class="picker-ring" aria-hidden="true"></span>
      <input
        type="color"
        class="picker-input"
        :value="pickerValue"
        :aria-label="`Custom ${label}`"
        v-on:input="$emit('update:modelValue', $event.target.value.toUpperCase())"
        v-on:change="commit($event.target.value.toUpperCase())"
      />
    </label>
  </transition-group>
</template>

<script>
  import { toHex } from '../lib/colorTools.js';

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
    // Seventeen of these are mounted at once. Injecting the palette setter
    // keeps the same v-on pair off every one of their call sites, as
    // ToolField does with the spotlight.
    inject: {
      addToPalette: { default: null }
    },
    computed: {
      // <input type="color"> only speaks hex, but the palette has always
      // accepted named colors.
      pickerValue() {
        return toHex(this.modelValue) || '#000000';
      }
    },
    methods: {
      onClick(color) {
        this.$emit(this.removable ? 'remove' : 'update:modelValue', color);
      },
      // Fires when the OS picker closes, not on every drag frame, so a slow
      // trip through the spectrum leaves one color behind rather than fifty.
      commit(color) {
        this.$emit('update:modelValue', color);

        if (this.addToPalette) {
          this.addToPalette(color);
        }
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

  .swatch:focus-visible,
  .picker:focus-within {
    outline: 2px solid var(--verde-bright);
    outline-offset: 3px;
  }

  /* ---- Inline picker --------------------------------------------------- */

  .picker {
    display: grid;
    place-items: center;
    overflow: hidden;
    background-color: var(--bg-sunken);
    border-style: dashed;
  }

  .picker:hover {
    border-color: var(--verde);
  }

  /* A hue wheel, so the control reads as "any color" rather than as one more
     palette entry that happens to be empty. */
  .picker-ring {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: conic-gradient(#FF4D4D, #FFD24D, #4DFF88, #4DD2FF, #8A4DFF, #FF4DAE, #FF4D4D);
    transition: transform .22s cubic-bezier(.33, 1, .68, 1);
  }

  .picker:hover .picker-ring {
    transform: scale(1.25) rotate(45deg);
  }

  /* The real input covers the swatch so the whole circle is the hit target,
     while the ring above is what anyone actually sees. */
  .picker-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    opacity: 0;
    cursor: pointer;
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

    .picker:hover .picker-ring {
      transform: none;
    }
  }
</style>

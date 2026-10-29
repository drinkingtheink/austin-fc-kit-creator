<template>
  <div
    class="field"
    :class="{ lit: lit }"
    v-on:mouseenter="hovering = true"
    v-on:mouseleave="hovering = false"
    v-on:focusin="focused = true"
    v-on:focusout="onFocusOut"
  >
    <span class="field-label">
      {{ label }}
      <em v-if="hint">{{ hint }}</em>
    </span>
    <slot />
  </div>
</template>

<script>
  export default {
    name: 'ToolField',
    props: {
      label: { type: String, required: true },
      // Trailing de-emphasized note, e.g. "(click a swatch to remove)".
      hint: { type: String, default: null },
      // Spotlight key of the kit part this field paints. Fields that paint
      // nothing on the kit — the palette editor's own controls — leave it off.
      part: { type: String, default: null }
    },
    // App.vue hands down the setter rather than every field wiring up its own
    // listener, which kept ~20 identical v-on pairs out of the template.
    inject: {
      spotlight: { default: null }
    },
    data() {
      return {
        hovering: false,
        focused: false
      };
    },
    computed: {
      lit() {
        return this.hovering || this.focused;
      }
    },
    watch: {
      lit(isLit) {
        if (!this.part || !this.spotlight) return;

        // Hand back the key on the way in and null on the way out, but only
        // null *our own* key: the pointer may already have lit the next field.
        this.spotlight(isLit ? this.part : null, this.part);
      }
    },
    methods: {
      onFocusOut(event) {
        // Tabbing between swatches inside one field fires focusout then
        // focusin. Only a target outside the field really ends the focus.
        if (this.$el.contains(event.relatedTarget)) return;

        this.focused = false;
      }
    }
  };
</script>

<style scoped>
  /* A hairline on the active field, mirroring the halo on the kit so the two
     ends of the connection are obviously the same gesture. */
  .field {
    position: relative;
    transition: opacity .2s ease;
  }

  .field::before {
    content: '';
    position: absolute;
    top: -2px;
    bottom: -2px;
    left: -12px;
    width: 2px;
    border-radius: 2px;
    background-color: var(--verde);
    opacity: 0;
    transform: scaleY(.4);
    transform-origin: center;
    transition: opacity .2s ease, transform .22s cubic-bezier(.33, 1, .68, 1);
  }

  .field.lit::before {
    opacity: 1;
    transform: scaleY(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .field::before {
      transform: scaleY(1);
    }
  }
</style>

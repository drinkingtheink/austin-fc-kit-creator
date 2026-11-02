<template>
  <div
    class="field"
    :class="{ lit: lit }"
    :data-part="part"
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
      spotlight: { default: null },
      // Which part the app currently has lit, so hovering a part on the kit
      // lights its field here. The connection runs both ways.
      spotlightState: { default: null }
    },
    data() {
      return {
        hovering: false,
        focused: false
      };
    },
    computed: {
      // What the field shows. Includes the app's own spotlight, so the kit can
      // light this field from the other direction.
      //
      // No .value: App.vue provides a computed ref, but the Options API
      // unwraps injected refs, so this is already the part name.
      lit() {
        return this.selfLit || (!!this.part && this.spotlightState === this.part);
      },
      // What the field reports. Deliberately excludes spotlightState: lighting
      // up because the app said so, then telling the app we are lit, is a loop.
      selfLit() {
        return this.hovering || this.focused;
      }
    },
    watch: {
      selfLit(isLit) {
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
  /* No transition on .field itself: nothing animates it, and declaring one at
     this specificity beat the enter/leave transition App.vue puts on the one
     field it mounts and unmounts, leaving only its opacity moving. */
  .field {
    position: relative;
  }

  /* A hairline on the active field, mirroring the halo on the kit so the two
     ends of the connection read as one gesture. */
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

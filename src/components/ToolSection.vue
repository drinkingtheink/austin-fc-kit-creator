<template>
  <section class="tool-section">
    <h3 class="tool-section-heading">
      <button
        type="button"
        class="tool-section-toggle"
        :aria-expanded="String(open)"
        v-on:click="$emit('toggle')"
      >
        <span class="tool-section-title">{{ title }}</span>
        <svg class="chevron" :class="{ open }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </h3>
    <div v-show="open" class="tool-section-body">
      <slot />
    </div>
  </section>
</template>

<script>
  // Height of the sticky toolbar header an opened section has to clear.
  const HEADER_OFFSET = 136;

  export default {
    name: 'ToolSection',
    props: {
      title: { type: String, required: true },
      open: { type: Boolean, default: false }
    },
    emits: ['toggle'],
    watch: {
      open(isOpen) {
        // Collapsing a tall section shifts everything above it, which can leave
        // the newly opened header scrolled off the top. Pull it back into view.
        if (!isOpen) return;

        this.$nextTick(() => {
          const panel = this.$el.closest('#toolbar');

          if (!panel) return;

          // scrollIntoView() walks every scrollable ancestor, including ones
          // with overflow:hidden, which drags the whole document with it.
          // Scrolling the panel directly keeps the movement contained.
          const offset = this.$el.getBoundingClientRect().top
            - panel.getBoundingClientRect().top
            - HEADER_OFFSET;

          panel.scrollTo({
            top: panel.scrollTop + offset,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
          });
        });
      }
    }
  };
</script>

<style scoped>
  .tool-section {
    border-bottom: 1px solid var(--line);
  }

  .tool-section-heading {
    margin: 0;
  }

  .tool-section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 15px 20px;
    border: 0;
    background: none;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .76rem;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color .18s ease;
  }

  .tool-section-toggle:hover {
    background-color: rgba(255, 255, 255, .035);
  }

  .tool-section-toggle:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: -2px;
  }

  .chevron {
    width: 15px;
    height: 15px;
    stroke: var(--text-faint);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    transition: transform .2s ease, stroke .2s ease;
  }

  .chevron.open {
    transform: rotate(90deg);
    stroke: var(--verde);
  }

  .tool-section-body {
    display: grid;
    gap: 18px;
    padding: 2px 20px 22px;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }
</style>

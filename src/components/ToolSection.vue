<template>
  <section class="tool-section" :class="{ open }">
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

    <transition
      name="collapse"
      v-on:enter="onEnter"
      v-on:after-enter="onAfterEnter"
      v-on:leave="onLeave"
      v-on:after-leave="onAfterLeave"
    >
      <div v-if="open" class="tool-section-body">
        <slot />
      </div>
    </transition>
  </section>
</template>

<script>
  // Height of the sticky toolbar header an opened section has to clear.
  const HEADER_OFFSET = 136;

  // Slack before the section is considered badly placed enough to scroll.
  const SLOP = 10;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  export default {
    name: 'ToolSection',
    props: {
      title: { type: String, required: true },
      open: { type: Boolean, default: false }
    },
    emits: ['toggle'],
    methods: {
      // The body is laid out by the grid, so it has no height to animate from
      // or to. These hooks pin one on for the duration and take it back off,
      // leaving the open section free to resize with its contents.
      onEnter(el) {
        el.style.height = '0px';
        void el.offsetHeight;
        el.style.height = `${el.scrollHeight}px`;
      },
      onAfterEnter(el) {
        el.style.height = '';
        this.revealHeading();
      },
      onLeave(el) {
        el.style.height = `${el.scrollHeight}px`;
        void el.offsetHeight;
        el.style.height = '0px';
      },
      onAfterLeave(el) {
        el.style.height = '';
      },
      // Collapsing a tall section shifts everything above it, which can leave
      // the newly opened header scrolled off the top. This runs once the
      // accordion has settled, because both sections are still animating while
      // it moves and a target computed mid-flight would land in the wrong
      // place.
      revealHeading() {
        const panel = this.$el.closest('#toolbar');

        if (!panel) return;

        const sectionTop = this.$el.getBoundingClientRect().top;
        const panelBox = panel.getBoundingClientRect();
        const offset = sectionTop - panelBox.top - HEADER_OFFSET;

        // Already sitting somewhere sensible: tucked under the sticky header
        // and not pushed off the bottom. Leave the scroll position alone
        // rather than nudging it for no reason.
        const hiddenAbove = offset < -SLOP;
        const hiddenBelow = sectionTop > panelBox.bottom - SLOP;

        if (!hiddenAbove && !hiddenBelow) return;

        // scrollIntoView() walks every scrollable ancestor, including ones
        // with overflow:hidden, which drags the whole document with it.
        // Scrolling the panel directly keeps the movement contained.
        panel.scrollTo({
          top: panel.scrollTop + offset,
          behavior: reducedMotion() ? 'auto' : 'smooth'
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
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .76rem;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color .18s ease, color .2s ease;
  }

  .tool-section-toggle:hover {
    background-color: rgba(255, 255, 255, .035);
    color: var(--text);
  }

  .tool-section.open .tool-section-toggle {
    color: var(--text);
  }

  .tool-section-toggle:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: -2px;
  }

  .tool-section-title {
    transition: transform .22s cubic-bezier(.33, 1, .68, 1);
  }

  .tool-section-toggle:hover .tool-section-title {
    transform: translateX(2px);
  }

  .chevron {
    width: 15px;
    height: 15px;
    stroke: var(--text-faint);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    transition: transform .26s cubic-bezier(.33, 1, .68, 1), stroke .2s ease;
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

  /* ---- Accordion ------------------------------------------------------- */

  .collapse-enter-active,
  .collapse-leave-active {
    /* overflow only while moving, so a focus ring on a swatch is never
       clipped by a section sitting at its natural height. */
    overflow: hidden;
    transition: height .3s cubic-bezier(.33, 1, .68, 1), opacity .26s ease;
  }

  .collapse-enter-from,
  .collapse-leave-to {
    opacity: 0;
  }

  /* The fields stagger in behind the expanding panel. nth-child is enough
     here: the sections are static lists, so the order never shuffles. */
  .collapse-enter-active > :deep(*) {
    animation: fieldRise .34s cubic-bezier(.33, 1, .68, 1) both;
  }

  .collapse-enter-active > :deep(*:nth-child(1)) { animation-delay: .04s; }
  .collapse-enter-active > :deep(*:nth-child(2)) { animation-delay: .07s; }
  .collapse-enter-active > :deep(*:nth-child(3)) { animation-delay: .10s; }
  .collapse-enter-active > :deep(*:nth-child(4)) { animation-delay: .13s; }
  .collapse-enter-active > :deep(*:nth-child(5)) { animation-delay: .16s; }
  .collapse-enter-active > :deep(*:nth-child(n+6)) { animation-delay: .19s; }

  @keyframes fieldRise {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron,
    .tool-section-title {
      transition: none;
    }
  }
</style>

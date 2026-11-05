<template>
  <div
    v-if="running"
    class="tour"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="`tour-title-${step.id}`"
  >
    <!-- Four panels round the target rather than one backdrop with a hole in
         it. A hole needs either an SVG mask or a box-shadow the size of the
         viewport; four divs need neither, and they leave the target genuinely
         clickable, which matters because a step may be pointing at something
         the person wants to try while it is open. -->
    <div class="tour-shade" :style="shade.top" v-on:click="finish"></div>
    <div class="tour-shade" :style="shade.bottom" v-on:click="finish"></div>
    <div class="tour-shade" :style="shade.left" v-on:click="finish"></div>
    <div class="tour-shade" :style="shade.right" v-on:click="finish"></div>

    <div class="tour-ring" :style="ringStyle" aria-hidden="true"></div>

    <div
      ref="bubble"
      class="tour-bubble"
      :class="`is-${side}`"
      :style="bubbleStyle"
      v-on:keydown.esc.stop.prevent="finish"
      v-on:keydown.tab="trapTab"
    >
      <span class="tour-arrow" :style="arrowStyle" aria-hidden="true"></span>

      <p class="tour-count">{{ index + 1 }} of {{ steps.length }}</p>
      <h2 class="tour-title" :id="`tour-title-${step.id}`">{{ step.title }}</h2>
      <p class="tour-body">{{ step.body }}</p>

      <div class="tour-actions">
        <button type="button" class="tour-skip" v-on:click="finish">Skip</button>
        <button
          v-if="index > 0"
          type="button"
          class="tour-btn tour-back"
          v-on:click="go(index - 1)"
        >Back</button>
        <button
          ref="next"
          type="button"
          class="tour-btn tour-next"
          v-on:click="go(index + 1)"
        >{{ index === steps.length - 1 ? 'Done' : 'Next' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { TOUR_STEPS } from '../lib/tourSteps.js';
  import { placeBubble, arrowOffset, isUsableTarget } from '../lib/tourPlacement.js';
  import { markOnboarded } from '../lib/tourStorage.js';

  // Room left around the target by the cut-out, so the ring does not sit
  // hard against whatever it is lighting.
  const PAD = 6;

  export default {
    name: 'GuidedTour',
    data() {
      return {
        running: false,
        index: 0,
        steps: TOUR_STEPS,
        rect: null,
        pos: { top: 0, left: 0 },
        side: 'bottom',
        arrow: 0.5
      };
    },
    computed: {
      step() {
        return this.steps[this.index] || this.steps[0];
      },
      ringStyle() {
        if (!this.rect) return { display: 'none' };

        return {
          top: `${this.rect.top - PAD}px`,
          left: `${this.rect.left - PAD}px`,
          width: `${this.rect.width + PAD * 2}px`,
          height: `${this.rect.height + PAD * 2}px`
        };
      },
      /**
       * The four panels, as insets around the hole.
       *
       * Written as top/right/bottom/left offsets rather than width and height
       * so they stay correct while the window is resizing, without this
       * having to know the viewport size.
       */
      shade() {
        if (!this.rect) {
          return { top: { inset: '0' }, bottom: { display: 'none' },
            left: { display: 'none' }, right: { display: 'none' } };
        }

        const t = Math.max(0, this.rect.top - PAD);
        const l = Math.max(0, this.rect.left - PAD);
        const r = this.rect.left + this.rect.width + PAD;
        const b = this.rect.top + this.rect.height + PAD;

        return {
          top: { top: '0', left: '0', right: '0', height: `${t}px` },
          bottom: { top: `${b}px`, left: '0', right: '0', bottom: '0' },
          left: { top: `${t}px`, left: '0', width: `${l}px`, height: `${b - t}px` },
          right: { top: `${t}px`, left: `${r}px`, right: '0', height: `${b - t}px` }
        };
      },
      bubbleStyle() {
        return { top: `${this.pos.top}px`, left: `${this.pos.left}px` };
      },
      arrowStyle() {
        return this.side === 'top' || this.side === 'bottom'
          ? { left: `${this.arrow * 100}%` }
          : { top: `${this.arrow * 100}%` };
      }
    },
    mounted() {
      // The greeting tells us when it is done. A window event rather than a
      // prop, so App.vue carries nothing but the mount.
      window.addEventListener('kit-tour:start', this.start);
      window.addEventListener('resize', this.reposition);
      // Capture phase, because a scroll event does not bubble: four of the
      // six targets live inside #toolbar, which is overflow-y:auto, and
      // without this the ring and bubble stayed where the target used to be
      // the moment anybody scrolled the panel. ToolSection also smooth-
      // scrolls the panel when a drawer opens, which is the same problem
      // arriving on its own.
      window.addEventListener('scroll', this.reposition, true);
      // Capture phase: the app binds Enter and Space on window to randomise
      // the kit, and those must not fire while somebody is reading a step.
      window.addEventListener('keydown', this.swallowShortcuts, true);
    },
    beforeUnmount() {
      window.removeEventListener('kit-tour:start', this.start);
      window.removeEventListener('resize', this.reposition);
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('keydown', this.swallowShortcuts, true);
    },
    methods: {
      start() {
        // Deliberately does not consult hasOnboarded(). App.vue only shows
        // the greeting to somebody who has not been onboarded, and marks
        // them as the greeting closes — so by the time the greeting hands
        // over, the flag is already true and checking it here refused every
        // tour there was ever going to be. The gate belongs at the one place
        // that decides to offer the first run, not at both ends of it.
        if (this.running) return;

        this.returnFocusTo = document.activeElement;
        this.index = 0;
        this.running = true;
        this.enter();
      },
      /**
       * Move to a step, skipping any whose target is not on screen.
       *
       * A step that cannot be pointed at is dropped rather than shown against
       * the corner of the window: a design could be renamed or a control
       * moved, and a tour pointing at nothing is worse than one step shorter.
       */
      async go(next) {
        if (next >= this.steps.length || next < 0) return this.finish();

        this.index = next;
        await this.enter();
      },
      async enter() {
        const step = this.step;

        if (step.before) {
          try {
            await step.before();
          } catch (err) {
            console.warn('[tour] step setup failed', step.id, err);
          }
        }

        await this.$nextTick();
        // One frame for any drawer that just opened to settle before it is
        // measured, for the same reason the exporter waits before capturing.
        await new Promise(resolve => requestAnimationFrame(resolve));

        if (!this.measure()) {
          console.warn('[tour] skipping step, target not usable:', step.id, step.target);

          return this.go(this.index + 1);
        }

        this.$nextTick(() => this.$refs.next && this.$refs.next.focus());
      },
      /**
       * Re-place against a target that has moved, without judging it.
       *
       * Separate from measure() because measure() blanks the rect when the
       * target is unusable, and blanking mid-scroll drops the cut-out — which
       * reads as the whole screen going dark for a frame. A step already on
       * screen keeps its last good position instead; deciding a step is
       * unshowable is entry's job, not a scroll's.
       */
      reposition() {
        this.measure(false);
      },
      /** Returns false when the step cannot be shown. */
      measure(strict = true) {
        if (!this.running) return false;

        const el = document.querySelector(this.step.target);
        const view = { width: window.innerWidth, height: window.innerHeight };
        const box = el && el.getBoundingClientRect();
        const rect = box && {
          top: box.top, left: box.left, width: box.width, height: box.height
        };

        if (!isUsableTarget(rect, view)) {
          if (strict) this.rect = null;

          return false;
        }

        this.rect = rect;

        const bubble = this.$refs.bubble
          ? this.$refs.bubble.getBoundingClientRect()
          : { width: 320, height: 170 };
        const placed = placeBubble(rect, bubble, view, this.step.placement);

        this.side = placed.side;
        this.pos = { top: placed.top, left: placed.left };
        this.arrow = arrowOffset(placed.side, rect, bubble, placed);

        return true;
      },
      finish() {
        if (!this.running) return;

        this.running = false;
        this.rect = null;
        markOnboarded();

        if (this.returnFocusTo && this.returnFocusTo.focus) {
          this.returnFocusTo.focus();
        }
      },
      swallowShortcuts(event) {
        if (!this.running) return;

        // Only the app's own single-key shortcuts. Tab, Escape and the rest
        // belong to the bubble and are handled on it.
        if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          const inBubble = this.$refs.bubble && this.$refs.bubble.contains(event.target);

          // Enter and Space on a button inside the bubble are somebody
          // pressing that button, and must still work.
          if (inBubble && event.target.tagName === 'BUTTON' && event.key !== 'ArrowLeft'
            && event.key !== 'ArrowRight') return;

          event.stopPropagation();
        }
      },
      /** Keep tab inside the bubble while it is open. */
      trapTab(event) {
        const focusable = this.$refs.bubble.querySelectorAll('button');

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  };
</script>

<style scoped>
  .tour {
    position: fixed;
    inset: 0;
    z-index: 120;
    /* The layer itself lets clicks through; the four panels below take them
       back. That is what leaves the lit target usable while a step is up. */
    pointer-events: none;
  }

  .tour-shade {
    position: fixed;
    background: rgba(4, 6, 5, .62);
    pointer-events: auto;
  }

  .tour-ring {
    position: fixed;
    border: 2px solid var(--verde-bright);
    border-radius: var(--r-md);
    box-shadow: 0 0 0 1px rgba(4, 6, 5, .5), 0 0 22px rgba(39, 213, 102, .45);
    pointer-events: none;
  }

  .tour-bubble {
    position: fixed;
    width: min(320px, calc(100vw - 24px));
    padding: 16px 18px 14px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-lg);
    background: var(--bg-raised);
    box-shadow: 0 18px 44px rgba(0, 0, 0, .55);
    font-family: var(--font-ui);
    pointer-events: auto;
  }

  .tour-arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--bg-raised);
    border: 1px solid var(--line-strong);
    transform: rotate(45deg);
  }

  /* Each side clips two of the arrow's borders, so what is left reads as a
     point rather than a diamond sitting on the edge. */
  .is-bottom .tour-arrow { top: -6px; margin-left: -5px; border-right: 0; border-bottom: 0; }
  .is-top .tour-arrow { bottom: -6px; margin-left: -5px; border-left: 0; border-top: 0; }
  .is-right .tour-arrow { left: -6px; margin-top: -5px; border-right: 0; border-top: 0; }
  .is-left .tour-arrow { right: -6px; margin-top: -5px; border-left: 0; border-bottom: 0; }

  .tour-count {
    margin: 0 0 6px;
    color: var(--text-faint);
    font-size: .72rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .tour-title {
    margin: 0 0 8px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 400;
    line-height: 1.2;
  }

  .tour-body {
    margin: 0 0 14px;
    color: var(--text-dim);
    font-size: .88rem;
    line-height: 1.55;
  }

  .tour-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tour-skip {
    margin-right: auto;
    padding: 6px 2px;
    border: 0;
    background: none;
    color: var(--text-faint);
    font: inherit;
    font-size: .82rem;
    cursor: pointer;
  }

  .tour-skip:hover { color: var(--text-dim); }

  .tour-btn {
    padding: 7px 14px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: .84rem;
    cursor: pointer;
  }

  .tour-next {
    border-color: transparent;
    background: var(--verde);
    color: var(--verde-ink);
    font-weight: 600;
  }

  .tour-btn:focus-visible,
  .tour-skip:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    /* Nothing here animates, and this is here to say that is deliberate
       rather than an omission: the bubble jumps between steps on purpose, so
       there is no transition to collapse. */
    .tour-bubble { transition: none; }
  }
</style>

<template>
  <div class="stars" aria-hidden="true">
    <span
      v-for="(star, i) in STARS"
      :key="i"
      class="star"
      :class="{ twinkles: star.twinkles }"
      :style="styleFor(star)"
    ></span>
  </div>
</template>

<script>
  import { STARS } from '../lib/stars.js';

  export default {
    name: 'Stars',
    data() {
      return { STARS };
    },
    methods: {
      styleFor(star) {
        const style = {
          left: `${(star.x * 100).toFixed(3)}%`,
          top: `${(star.y * 100).toFixed(3)}%`,
          width: `${star.size.toFixed(2)}px`,
          height: `${star.size.toFixed(2)}px`,
          opacity: star.opacity.toFixed(3)
        };

        if (star.twinkles) {
          style.animationDelay = `${star.delay.toFixed(2)}s`;
          style.animationDuration = `${star.duration.toFixed(2)}s`;
          // The keyframes scale around whatever this star's resting opacity is,
          // so a dim star twinkles dimly rather than flaring to full white.
          style['--rest'] = star.opacity.toFixed(3);
        }

        return style;
      }
    }
  };
</script>

<style scoped>
  .stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .star {
    position: absolute;
    border-radius: 50%;
    background-color: #FFFFFF;
  }

  /* No box-shadow glow: ninety of them would be ninety extra paint regions
     every frame, and the floodlights already showed what that costs. The
     larger stars read as brighter through size and opacity alone. */
  .star.twinkles {
    animation-name: twinkle;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes twinkle {
    0%, 100% { opacity: calc(var(--rest) * .45); }
    50% { opacity: var(--rest); }
  }

  @media (prefers-reduced-motion: reduce) {
    .star.twinkles {
      animation: none;
      opacity: var(--rest);
    }
  }
</style>

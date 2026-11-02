<template>
  <svg class="thumb" viewBox="0 0 64 58" aria-hidden="true">
    <defs>
      <clipPath :id="clipId">
        <path :d="BODY" />
      </clipPath>
    </defs>

    <path :d="SLEEVE_LEFT" :fill="sleeveFill" />
    <path :d="SLEEVE_RIGHT" :fill="sleeveFill" />
    <path :d="BODY" :fill="shirtFill" />

    <!-- stroke and stroke-width are inherited, so one pair of attributes
         here outlines all fifteen patterns without touching any of them. -->
    <g :clip-path="`url(#${clipId})`" :stroke="patternOutline" stroke-width=".35">
      <g v-if="design === 'stripes'">
        <rect v-for="x in [15, 21, 27, 33, 39, 45]" :key="x" :x="x" y="3" width="3" height="51" :fill="typeFill" />
      </g>

      <g v-else-if="design === 'barcode'">
        <rect v-for="bar in BARCODE" :key="bar[0]" :x="bar[0]" y="3" :width="bar[1]" height="51" :fill="typeFill" />
      </g>

      <g v-else-if="design === 'pinstripes'">
        <rect v-for="x in [16, 21, 26, 31, 36, 41, 46]" :key="x" :x="x" y="3" width="1.4" height="51" :fill="typeFill" />
      </g>

      <g v-else-if="design === 'chest-band'">
        <rect x="14" y="16" width="36" height="2" :fill="secondaryFill" />
        <rect x="14" y="21" width="36" height="16" :fill="typeFill" />
        <rect x="14" y="40" width="36" height="2" :fill="secondaryFill" />
      </g>

      <g v-else-if="design === 'hoops'">
        <rect v-for="y in [8, 18, 28, 38, 48]" :key="y" x="14" :y="y" width="36" height="4.5" :fill="typeFill" />
      </g>

      <rect v-else-if="design === 'center-stripe'" x="27" y="3" width="10" height="51" :fill="typeFill" />

      <g v-else-if="design === 'off-center-stripe'">
        <rect x="35" y="3" width="4" height="51" :fill="typeFill" />
        <rect x="39" y="3" width="4" height="51" :fill="secondaryFill" />
      </g>

      <g v-else-if="design === 'shoulder-stripes'">
        <rect v-for="x in [16, 19.5, 23, 38, 41.5, 45]" :key="x" :x="x" y="3" width="2" height="12" :fill="secondaryFill" />
      </g>

      <path v-else-if="design === 'chevron'" d="M14 13 L32 27 L50 13 L50 21 L32 35 L14 21 Z" :fill="typeFill" />

      <path v-else-if="design === 'sash'" d="M14 40 L42 3 L50 3 L14 52 Z" :fill="typeFill" />

      <g v-else-if="design === 'double-sash'">
        <path d="M14 34 L37 3 L43 3 L14 42 Z" :fill="typeFill" />
        <path d="M14 46 L46 3 L50 3 L14 54 Z" :fill="secondaryFill" />
      </g>

      <rect v-else-if="design === 'half-panel'" x="14" y="3" width="18" height="51" :fill="typeFill" />

      <g v-else-if="design === 'quarter-panel'">
        <rect x="14" y="3" width="18" height="26" :fill="typeFill" />
        <rect x="32" y="29" width="18" height="25" :fill="typeFill" />
      </g>

      <g v-else-if="design === 'checkered'">
        <rect
          v-for="cell in CHECKERS"
          :key="`${cell[0]}-${cell[1]}`"
          :x="cell[0]"
          :y="cell[1]"
          width="6"
          height="6"
          :fill="typeFill"
        />
      </g>

      <g v-else-if="design === 'tiger-stripes'">
        <path v-for="(stripe, i) in TIGER" :key="i" :d="stripe" :fill="typeFill" />
      </g>
    </g>

    <path :d="COLLAR" :fill="collarFill" :clip-path="`url(#${clipId})`" />
  </svg>
</template>

<script>
  import { contrast, readableInk } from '../lib/colorTools.js';

  // Each thumbnail clips its pattern to its own silhouette, and clipPath ids
  // are document-global, so every instance needs its own.
  let instances = 0;

  const BODY = 'M14 6 L26 3 L32 11 L38 3 L50 6 L50 54 L14 54 Z';
  const SLEEVE_LEFT = 'M14 6 L14 25 L2 28 L2 11 Z';
  const SLEEVE_RIGHT = 'M50 6 L50 25 L62 28 L62 11 Z';
  const COLLAR = 'M26 3 L32 11 L38 3 L35 3 L32 7 L29 3 Z';

  // [x, width] — uneven bars, which is the whole idea of the barcode kit.
  const BARCODE = [
    [16, 1], [18, 2.5], [22, 1], [24.5, 3], [29, 1.5],
    [32, 2], [35.5, 1], [38, 3], [42.5, 1.5], [45, 2]
  ];

  // Tapered bands, alternating which edge they spring from.
  const TIGER = [
    'M14 10 L36 7 L36 11 L14 15 Z',
    'M50 19 L26 16 L26 20 L50 24 Z',
    'M14 29 L38 26 L38 30 L14 34 Z',
    'M50 39 L24 36 L24 40 L50 44 Z',
    'M14 47 L34 45 L34 49 L14 51 Z'
  ];

  const CHECKERS = [];

  for (let col = 0; col < 6; col += 1) {
    for (let row = 0; row < 9; row += 1) {
      if ((col + row) % 2 === 0) {
        CHECKERS.push([14 + col * 6, 3 + row * 6]);
      }
    }
  }

  // Below this, a pattern is outlined rather than left to its own colour.
  //
  // The same 1.45 the kit's own legibility guards use as the bar for telling
  // two colours apart, on purpose. This only has to rescue the case where
  // the app itself would say there is nothing to see; it is not here to
  // second-guess palettes that merely run close. The default kit's greenDeep
  // on verde scores 1.554 and keeps its honest colours.
  const OUTLINE_BELOW = 1.45;

  export default {
    name: 'ShirtThumb',
    props: {
      // A shirt option name, or null for the solid shirt.
      design: { type: String, default: null },
      shirtFill: { type: String, required: true },
      typeFill: { type: String, required: true },
      secondaryFill: { type: String, required: true },
      sleeveFill: { type: String, required: true },
      collarFill: { type: String, required: true }
    },
    computed: {
      /**
       * An outline for the pattern, or none when its colours carry it.
       *
       * The Sentimiento Kit is why this exists. It carries shirtFill,
       * shirtTypeFill and shirtSecondaryFill all set to the same sage, on
       * purpose -- that is how its shoulder stripes were taken off, by
       * painting them the colour of the shirt. Correct for the kit, and it
       * turns the picker into fifteen identical sage shirts, because every
       * thumb paints its pattern in a colour it cannot be seen in. Any
       * monochrome kit does the same; that one is just the one in the
       * catalogue.
       *
       * An outline rather than a substituted colour, which is the trick
       * LEGIBILITY already pulls for the sponsor on a two-colour kit: the
       * shape becomes legible without the preview lying about which colours
       * the kit is actually wearing. Judged on whichever of the two pattern
       * colours reads worse, since a design may use either.
       */
      patternOutline() {
        const worst = Math.min(
          contrast(this.typeFill, this.shirtFill),
          contrast(this.secondaryFill, this.shirtFill)
        );

        return worst < OUTLINE_BELOW ? readableInk(this.shirtFill) : 'none';
      }
    },
    data() {
      instances += 1;

      return {
        clipId: `thumb-body-${instances}`,
        BODY,
        SLEEVE_LEFT,
        SLEEVE_RIGHT,
        COLLAR,
        BARCODE,
        TIGER,
        CHECKERS
      };
    }
  };
</script>

<style scoped>
  .thumb {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Matches the kit itself: the previews are painted with the live palette, so
     recoloring the shirt ripples through all fourteen of them. */
  .thumb path,
  .thumb rect {
    transition: fill .34s cubic-bezier(.33, 1, .68, 1);
  }
</style>

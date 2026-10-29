<template>
  <section class="color-panel" role="dialog" aria-label="Colors">
    <header class="cp-header">
      <div>
        <p class="cp-eyebrow">Palette</p>
        <h2 class="cp-title">Colors</h2>
      </div>
      <button type="button" class="cp-close" aria-label="Close colors" v-on:click="$emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
      </button>
    </header>

    <div class="cp-tabs" role="tablist">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        role="tab"
        class="cp-tab"
        :class="{ on: tab === t.id }"
        :aria-selected="String(tab === t.id)"
        v-on:click="tab = t.id"
      >{{ t.name }}</button>
    </div>

    <div class="cp-body">
      <!-- ---- Palette --------------------------------------------------- -->
      <div v-if="tab === 'palette'" class="cp-pane">
        <p class="cp-hint">
          Every color here is one click away in all seventeen fields.
          <strong v-if="unusedCount">{{ unusedCount }}</strong>
          <span v-if="unusedCount"> not currently on the kit.</span>
        </p>

        <transition-group tag="ul" name="chip" class="cp-palette">
          <li v-for="color in colors" :key="color" class="cp-entry" :style="{ '--c': color }">
            <span class="cp-entry-chip">
              <span
                v-if="isUsed(color)"
                class="cp-used-dot"
                :style="{ backgroundColor: readableInk(color) }"
                title="On the kit right now"
              ></span>
            </span>
            <span class="cp-entry-hex">{{ display(color) }}</span>
            <button
              type="button"
              class="cp-entry-drop"
              :aria-label="`Remove ${color}`"
              :disabled="colors.length <= 1"
              v-on:click="$emit('remove', color)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
            </button>
          </li>
        </transition-group>

        <form class="cp-add" v-on:submit.prevent="submitTyped">
          <input
            v-model="typed"
            class="cp-input"
            type="text"
            placeholder="#00B140 or rebeccapurple"
            aria-label="Hex value or named color"
            :class="{ bad: typed && !typedHex }"
          />
          <label class="cp-native" :title="'Pick a color'">
            <span class="cp-native-ring" :style="typedHex ? { background: typedHex } : null"></span>
            <input type="color" :value="typedHex || '#00B140'" v-on:input="typed = $event.target.value.toUpperCase()" />
          </label>
          <button type="submit" class="btn btn-primary" :disabled="!typedHex">Add</button>
        </form>

        <div class="cp-actions">
          <button type="button" class="btn btn-ghost btn-block" v-on:click="$emit('reset')">
            Back to Austin FC
          </button>
        </div>
      </div>

      <!-- ---- Clubs ----------------------------------------------------- -->
      <div v-else-if="tab === 'clubs'" class="cp-pane">
        <p class="cp-hint">Build a kit in someone else's colors. {{ CLUB_PALETTES.length }} clubs.</p>

        <input
          v-model="clubQuery"
          class="cp-input cp-search"
          type="search"
          placeholder="Search clubs"
          aria-label="Search clubs"
        />

        <p v-if="!clubs.length" class="cp-empty">Nothing matches &ldquo;{{ clubQuery }}&rdquo;.</p>

        <ul class="cp-clubs">
          <li v-for="club in clubs" :key="club.id">
            <button
              type="button"
              class="cp-club"
              :title="`Use ${club.name}'s colors`"
              v-on:click="$emit('replace', club.colors, club.name)"
            >
              <span class="cp-club-stripes" aria-hidden="true">
                <span v-for="c in club.colors" :key="c" class="cp-stripe" :style="{ background: c }"></span>
              </span>
              <span class="cp-club-name">{{ club.name }}</span>
            </button>
            <button
              type="button"
              class="cp-club-add"
              :title="`Add ${club.name}'s colors to the palette`"
              :aria-label="`Add ${club.name}'s colors to the palette`"
              v-on:click="$emit('merge', club.colors, club.name)"
            >+</button>
          </li>
        </ul>
      </div>

      <!-- ---- Harmony --------------------------------------------------- -->
      <div v-else class="cp-pane">
        <p class="cp-hint">Turn one color into a set that holds together.</p>

        <span class="field-label">Base</span>
        <div class="cp-bases">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            class="cp-base"
            :class="{ on: color === base }"
            :style="{ '--c': color }"
            :aria-label="`Base ${color}`"
            :aria-pressed="String(color === base)"
            v-on:click="picked = color"
          ></button>
          <label class="cp-base cp-base-pick" title="Any base color">
            <span class="cp-native-ring"></span>
            <input type="color" :value="baseHex" v-on:input="picked = $event.target.value.toUpperCase()" />
          </label>
        </div>

        <span class="field-label">Scheme</span>
        <div class="cp-schemes">
          <button
            v-for="h in HARMONIES"
            :key="h.id"
            type="button"
            class="cp-scheme"
            :class="{ on: scheme === h.id }"
            :aria-pressed="String(scheme === h.id)"
            v-on:click="scheme = h.id"
          >{{ h.name }}</button>
        </div>

        <div class="cp-result">
          <button
            v-for="(c, i) in harmonySet"
            :key="`${c}-${i}`"
            type="button"
            class="cp-result-chip"
            :style="{ '--c': c, color: readableInk(c) }"
            :title="`Add ${c}`"
            v-on:click="$emit('add', c)"
          >{{ c.slice(1) }}</button>
        </div>

        <button
          type="button"
          class="btn btn-primary btn-block"
          v-on:click="$emit('addMany', harmonySet)"
        >Add all {{ harmonySet.length }}</button>

        <span class="field-label cp-spaced">Tints &amp; shades</span>
        <div class="cp-ramp">
          <button
            v-for="c in rampSet"
            :key="c"
            type="button"
            class="cp-ramp-step"
            :style="{ '--c': c }"
            :title="`Add ${c}`"
            :aria-label="`Add ${c}`"
            v-on:click="$emit('add', c)"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import { CLUB_PALETTES, searchClubs } from '../lib/clubPalettes.js';
  import { HARMONIES, harmony, ramp, toHex, toHsl, readableInk } from '../lib/colorTools.js';

  const TABS = [
    { id: 'palette', name: 'Palette' },
    { id: 'clubs', name: 'Clubs' },
    { id: 'harmony', name: 'Harmony' }
  ];

  export default {
    name: 'ColorPanel',
    props: {
      // The working palette.
      colors: { type: Array, required: true },
      // Palette entries currently painted somewhere on the kit.
      used: { type: Array, default: () => [] }
    },
    emits: ['close', 'add', 'addMany', 'remove', 'replace', 'merge', 'reset'],
    data() {
      return {
        TABS,
        HARMONIES,
        CLUB_PALETTES,
        tab: 'palette',
        typed: '',
        clubQuery: '',
        // null until someone picks one, so the base follows the palette --
        // swapping to a club's colors should not leave the schemes being
        // built from a color that is no longer there.
        picked: null,
        scheme: 'complement'
      };
    },
    computed: {
      typedHex() {
        return toHex(this.typed);
      },
      /**
       * The color the schemes are built from: whatever was picked, or the
       * palette's most chromatic entry.
       *
       * Defaulting to colors[0] put black in that slot often enough to
       * matter, and a black base has no hue to rotate -- every scheme came
       * back red and cyan regardless of the palette.
       */
      base() {
        if (this.picked && this.colors.includes(this.picked)) return this.picked;

        return this.mostChromatic;
      },
      mostChromatic() {
        if (!this.colors.length) return '#00B140';

        return this.colors.reduce((best, color) => {
          const hex = toHex(color);

          if (!hex) return best;

          const [, s, l] = toHsl(hex);
          // Saturation decides, but a near-black or near-white reads as
          // colorless whatever its saturation claims.
          const score = s * (1 - Math.abs(l - 0.5) * 1.6);

          return score > best.score ? { color, score } : best;
        }, { color: this.colors[0], score: -Infinity }).color;
      },
      baseHex() {
        return toHex(this.base) || '#00B140';
      },
      clubs() {
        return searchClubs(this.clubQuery);
      },
      harmonySet() {
        return harmony(this.base, this.scheme);
      },
      rampSet() {
        return ramp(this.base);
      },
      unusedCount() {
        return this.colors.filter(c => !this.isUsed(c)).length;
      }
    },
    methods: {
      readableInk,
      isUsed(color) {
        return this.used.includes(color);
      },
      // Named colors stay as typed; hex is shown uppercase and without noise.
      display(color) {
        const hex = toHex(color);

        return hex && color.startsWith('#') ? hex : color;
      },
      submitTyped() {
        if (!this.typedHex) return;

        this.$emit('add', this.typed.startsWith('#') ? this.typedHex : this.typed.trim());
        this.typed = '';
      }
    }
  };
</script>

<style scoped>
  .color-panel {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    width: var(--toolbar-w);
    height: 100%;
    border-left: 1px solid var(--line-strong);
    background-color: var(--bg-panel);
    backdrop-filter: blur(24px);
    box-shadow: -24px 0 60px rgba(0, 0, 0, .5);
  }

  .cp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 14px;
    border-bottom: 1px solid var(--line);
  }

  .cp-eyebrow {
    margin: 0 0 4px;
    color: var(--verde);
    font-size: .62rem;
    font-weight: 600;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .cp-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 400;
  }

  .cp-close {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: none;
    cursor: pointer;
    transition: border-color .18s ease, background-color .18s ease, transform .18s ease;
  }

  .cp-close:hover {
    border-color: var(--verde);
    background-color: rgba(0, 177, 64, .12);
    transform: rotate(90deg);
  }

  .cp-close svg {
    width: 13px;
    height: 13px;
    stroke: var(--text);
    stroke-width: 2.4;
    stroke-linecap: round;
    fill: none;
  }

  .cp-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--line);
  }

  .cp-tab {
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .18s ease, background-color .18s ease, border-color .18s ease;
  }

  .cp-tab:hover { color: var(--text); }

  .cp-tab.on {
    border-color: var(--verde);
    background-color: rgba(0, 177, 64, .14);
    color: var(--verde);
  }

  .cp-body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px 20px 28px;
  }

  .cp-pane {
    display: grid;
    gap: 14px;
    animation: paneIn .26s cubic-bezier(.33, 1, .68, 1);
  }

  @keyframes paneIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cp-hint {
    margin: 0;
    color: var(--text-faint);
    font-size: .74rem;
    line-height: 1.5;
  }

  .cp-hint strong { color: var(--text-dim); }

  .cp-spaced { margin-top: 6px; }

  /* ---- Palette list ----------------------------------------------------- */

  .cp-palette {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cp-entry {
    display: grid;
    grid-template-columns: 26px 1fr auto;
    gap: 11px;
    align-items: center;
    padding: 6px 8px 6px 7px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-raised);
  }

  .cp-entry-chip {
    position: relative;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background-color: var(--c);
  }

  /* An inset dot rather than an outer ring, so it reads on a swatch of any
     color. Its own color is whichever of black or white the swatch can carry
     -- a fixed verde dot disappeared against Austin FC's verde. */
  .cp-used-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .cp-entry-hex {
    color: var(--text-dim);
    font-size: .72rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: .04em;
    overflow-wrap: anywhere;
  }

  .cp-entry-drop {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    transition: background-color .18s ease;
  }

  .cp-entry-drop:hover:not(:disabled) { background-color: rgba(255, 90, 90, .18); }
  .cp-entry-drop:disabled { cursor: not-allowed; opacity: .3; }

  .cp-entry-drop svg {
    width: 12px;
    height: 12px;
    stroke: var(--text-faint);
    stroke-width: 2.4;
    stroke-linecap: round;
    fill: none;
  }

  .cp-entry-drop:hover:not(:disabled) svg { stroke: #FF8A8A; }

  /* ---- Inputs ----------------------------------------------------------- */

  .cp-add {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 7px;
  }

  .cp-input {
    min-width: 0;
    padding: 9px 11px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .8rem;
  }

  .cp-input::placeholder { color: var(--text-faint); }
  .cp-input:focus { border-color: var(--verde); outline: none; }
  .cp-input.bad { border-color: #C65C5C; }

  .cp-search { width: 100%; }

  .cp-native,
  .cp-base-pick {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    cursor: pointer;
  }

  .cp-native {
    width: 38px;
    border: 1px dashed var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
  }

  .cp-native:hover { border-color: var(--verde); }

  .cp-native-ring {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: conic-gradient(#FF4D4D, #FFD24D, #4DFF88, #4DD2FF, #8A4DFF, #FF4DAE, #FF4D4D);
  }

  .cp-native input,
  .cp-base-pick input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .cp-empty {
    margin: 0;
    color: var(--text-faint);
    font-size: .76rem;
  }

  /* ---- Clubs ------------------------------------------------------------ */

  .cp-clubs {
    display: grid;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cp-clubs li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 5px;
  }

  .cp-club {
    display: grid;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-raised);
    text-align: left;
    cursor: pointer;
    transition: border-color .18s ease, background-color .18s ease, transform .18s cubic-bezier(.33, 1, .68, 1);
  }

  .cp-club:hover {
    border-color: var(--verde);
    background-color: #1C211E;
    transform: translateX(2px);
  }

  /* The palette itself is the label; the name is the caption. */
  .cp-club-stripes {
    display: flex;
    height: 14px;
    overflow: hidden;
    border-radius: 3px;
  }

  .cp-stripe { flex: 1; }

  .cp-club-name {
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .72rem;
    font-weight: 500;
  }

  .cp-club:hover .cp-club-name { color: var(--text); }

  .cp-club-add {
    width: 32px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-raised);
    color: var(--text-faint);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .18s ease, color .18s ease;
  }

  .cp-club-add:hover { border-color: var(--verde); color: var(--verde); }

  /* ---- Harmony ---------------------------------------------------------- */

  .cp-bases {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .cp-base {
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background-color: var(--c);
    cursor: pointer;
    transition: box-shadow .18s ease, transform .18s cubic-bezier(.33, 1, .68, 1);
  }

  .cp-base:hover { transform: translateY(-2px); }

  .cp-base.on {
    transform: none;
    box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 4px var(--verde);
  }

  .cp-base-pick {
    border: 1px dashed var(--line-strong);
    background-color: var(--bg-sunken);
  }

  .cp-schemes {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .cp-scheme {
    padding: 6px 10px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background-color: var(--bg-raised);
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .66rem;
    font-weight: 600;
    letter-spacing: .04em;
    cursor: pointer;
    transition: border-color .18s ease, color .18s ease, background-color .18s ease;
  }

  .cp-scheme:hover { color: var(--text); }

  .cp-scheme.on {
    border-color: var(--verde);
    background-color: rgba(0, 177, 64, .14);
    color: var(--verde);
  }

  .cp-result {
    display: grid;
    gap: 4px;
  }

  .cp-result-chip {
    padding: 11px 12px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--c);
    font-family: var(--font-ui);
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-align: left;
    cursor: pointer;
    transition: transform .18s cubic-bezier(.33, 1, .68, 1), box-shadow .18s ease;
  }

  .cp-result-chip:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, .4);
  }

  .cp-ramp {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
  }

  .cp-ramp-step {
    flex: 1;
    height: 38px;
    border: 0;
    background-color: var(--c);
    cursor: pointer;
    transition: flex .22s cubic-bezier(.33, 1, .68, 1);
  }

  .cp-ramp-step:hover { flex: 1.7; }

  .cp-actions { margin-top: 4px; }

  /* ---- Palette list transitions ---------------------------------------- */

  .chip-enter-active,
  .chip-leave-active {
    transition: opacity .24s ease, transform .28s cubic-bezier(.33, 1, .68, 1);
  }

  .chip-enter-from,
  .chip-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .chip-leave-active { position: absolute; }
  .chip-move { transition: transform .28s cubic-bezier(.33, 1, .68, 1); }

  @media screen and (max-width: 900px) {
    .color-panel {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cp-club:hover,
    .cp-base:hover,
    .cp-result-chip:hover { transform: none; }

    .cp-close:hover { transform: none; }
  }
</style>

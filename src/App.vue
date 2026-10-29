<template>
  <main :class="setting">
    <!-- Gradients are not interpolable, so a randomize dissolves one whole
         backdrop into the next rather than animating the stops. -->
    <transition name="stage" :duration="800">
      <div
        class="stage-gradient"
        :key="setting"
        :style="{ backgroundImage: stageGradient }"
        aria-hidden="true"
      ></div>
    </transition>

    <Stadium ref="stadium" class="stadium-stage" aria-hidden="true" />
    <div class="stage-scrim" aria-hidden="true"></div>

    <div id="app">
      <section id="kit-stage">
        <Kit
          ref="kit"
          class="kit-display"
          :activeShirtOption="activeShirtOption"
          :shirtFill="shirtFill"
          :shirtTypeFill="shirtTypeFill"
          :shirtSecondaryFill="shirtSecondaryFill"
          :shirtCuffFill="shirtCuffFill"
          :shirtSleeveFill="shirtSleeveFill"
          :shortsFill="shortsFill"
          :shortsCuffsFill="shortsCuffsFill"
          :socksFill="socksFill"
          :socksCuffsFill="socksCuffsFill"
          :logoFill="logoFill"
          :badgeFill="badgeFill"
          :badgeTextFill="badgeTextFill"
          :badgeBGFill="badgeBGFill"
          :numberFill="numberFill"
          :collarFill="collarFill"
          :showButtonCollar="showButtonCollar"
          :socksHoops="socksHoops"
          :socksHoopsFill="socksHoopsFill"
          :shirtMakerFill="shirtMakerFill"
          :highlight="highlight"
          :flash="flash"
          :revealing="revealing"
          :frozen="frozen"
        />

        <p class="help">
          <kbd>Enter</kbd> <kbd>Space</kbd> <kbd>&larr;</kbd> <kbd>&rarr;</kbd>
          <span>to randomize</span>
        </p>

        <button
          class="download-kit"
          type="button"
          :disabled="exporting"
          title="Download this kit as a PNG"
          v-on:click="downloadKit"
        >
          <svg
            class="download-icon"
            :class="{ working: exporting }"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16" />
          </svg>
          <span>{{ exporting ? 'Rendering...' : 'Download PNG' }}</span>
        </button>
      </section>

      <aside id="toolbar">
        <header class="toolbar-header">
          <a
            href="https://austinfc.com/"
            target="_blank"
            rel="noopener"
            class="toolbar-badge-link"
            aria-label="Austin FC official site"
          >
            <AustinFCBadge class="toolbar-badge" />
          </a>

          <div class="toolbar-titles">
            <h1 class="wordmark">Kit Creator</h1>
            <p class="toolbar-sub">Design your own Austin FC kit</p>
          </div>

          <div class="toolbar-actions">
            <button class="btn btn-primary" v-on:click="randomizeKit">Feeling Lucky</button>
            <button class="btn btn-ghost" v-on:click="manageColorWindow(true)">Colors</button>
          </div>
        </header>

        <div class="toolbar-sections">
          <ToolSection
            title="Shirt"
            :open="openSection === 'shirt'"
            v-on:toggle="toggleSection('shirt')"
          >
            <ToolField label="Design" part="design">
              <div class="design-grid">
                <button
                  v-for="option in designOptions"
                  :key="option || 'solid'"
                  type="button"
                  class="design-option"
                  :class="{ active: option === activeShirtOption }"
                  :aria-pressed="String(option === activeShirtOption)"
                  v-on:click="setShirtOption(option)"
                >
                  <ShirtThumb
                    class="design-preview"
                    :design="option"
                    :shirtFill="shirtFill"
                    :typeFill="shirtTypeFill"
                    :secondaryFill="shirtSecondaryFill"
                    :sleeveFill="shirtSleeveFill"
                    :collarFill="collarFill"
                  />
                  <span class="design-name">{{ formatOption(option) }}</span>
                </button>
              </div>
            </ToolField>

            <ToolField label="Primary color" part="shirt">
              <ColorSwatches label="Shirt primary color" :colors="colors" v-model="shirtFill" />
            </ToolField>

            <ToolField label="Design color" part="design">
              <ColorSwatches label="Shirt design color" :colors="colors" v-model="shirtTypeFill" />
            </ToolField>

            <ToolField label="Secondary color" part="design">
              <ColorSwatches label="Shirt secondary color" :colors="colors" v-model="shirtSecondaryFill" />
            </ToolField>

            <ToolField label="Sponsor color" part="sponsor">
              <ColorSwatches label="Sponsor color" :colors="colors" v-model="logoFill" />
            </ToolField>

            <ToolField label="Collar" part="collar">
              <div class="segmented" role="group" aria-label="Collar type">
                <button
                  type="button"
                  :class="{ active: !showButtonCollar }"
                  :aria-pressed="String(!showButtonCollar)"
                  v-on:click="setCollarButton(false)"
                >Plain</button>
                <button
                  type="button"
                  :class="{ active: showButtonCollar }"
                  :aria-pressed="String(showButtonCollar)"
                  v-on:click="setCollarButton(true)"
                >Buttoned</button>
              </div>
            </ToolField>

            <ToolField label="Collar color" part="collar">
              <ColorSwatches label="Collar color" :colors="colors" v-model="collarFill" />
            </ToolField>

            <ToolField label="Sleeve color" part="sleeve">
              <ColorSwatches label="Sleeve color" :colors="colors" v-model="shirtSleeveFill" />
            </ToolField>

            <ToolField label="Cuff color" part="shirtCuff">
              <ColorSwatches label="Cuff color" :colors="colors" v-model="shirtCuffFill" />
            </ToolField>

            <ToolField label="Brand mark color" part="maker">
              <ColorSwatches label="Shirt brand mark color" :colors="colors" v-model="shirtMakerFill" />
            </ToolField>
          </ToolSection>

          <ToolSection
            title="Badge"
            :open="openSection === 'badge'"
            v-on:toggle="toggleSection('badge')"
          >
            <ToolField label="Badge color" part="badge">
              <ColorSwatches label="Badge color" :colors="colors" v-model="badgeFill" />
            </ToolField>

            <ToolField label="Badge text color" part="badge">
              <ColorSwatches label="Badge text color" :colors="colors" v-model="badgeTextFill" />
            </ToolField>

            <ToolField label="Badge background" part="badge">
              <ColorSwatches label="Badge background color" :colors="colors" v-model="badgeBGFill" />
            </ToolField>

            <button class="btn btn-ghost btn-block" v-on:click="resetBadge">Reset badge</button>
          </ToolSection>

          <ToolSection
            title="Shorts"
            :open="openSection === 'shorts'"
            v-on:toggle="toggleSection('shorts')"
          >
            <ToolField label="Primary color" part="shorts">
              <ColorSwatches label="Shorts primary color" :colors="colors" v-model="shortsFill" />
            </ToolField>

            <ToolField label="Trim color" part="shortsTrim">
              <ColorSwatches label="Shorts trim color" :colors="colors" v-model="shortsCuffsFill" />
            </ToolField>

            <ToolField label="Number color" part="number">
              <ColorSwatches label="Number color" :colors="colors" v-model="numberFill" />
            </ToolField>
          </ToolSection>

          <ToolSection
            title="Socks"
            :open="openSection === 'socks'"
            v-on:toggle="toggleSection('socks')"
          >
            <ToolField label="Primary color" part="socks">
              <ColorSwatches label="Socks primary color" :colors="colors" v-model="socksFill" />
            </ToolField>

            <ToolField label="Top color" part="socksCuff">
              <ColorSwatches label="Sock top color" :colors="colors" v-model="socksCuffsFill" />
            </ToolField>

            <ToolField label="Hoops" part="socksHoops">
              <div class="segmented" role="group" aria-label="Sock hoops">
                <button
                  type="button"
                  :class="{ active: !socksHoops }"
                  :aria-pressed="String(!socksHoops)"
                  v-on:click="setSocksHoops(false)"
                >Off</button>
                <button
                  type="button"
                  :class="{ active: socksHoops }"
                  :aria-pressed="String(socksHoops)"
                  v-on:click="setSocksHoops(true)"
                >On</button>
              </div>
            </ToolField>

            <transition name="field-pop">
              <ToolField v-if="socksHoops" label="Hoops color" part="socksHoops">
                <ColorSwatches label="Sock hoops color" :colors="colors" v-model="socksHoopsFill" />
              </ToolField>
            </transition>
          </ToolSection>
        </div>

        <footer class="toolbar-footer">
          <p class="hashtag">
            Download your favorites and post them with
            <strong>#AustinFCKitCreator</strong>
          </p>
          <nav class="footer-links">
            <a href="https://github.com/drinkingtheink/austin-fc-kit-creator" target="_blank" rel="noopener">About this project</a>
            <a href="http://drinkingtheink.com/" target="_blank" rel="noopener">About the author</a>
          </nav>
          <p class="attribution">
            Austin FC owns all rights to the Austin FC Badge and any other intellectual
            property under their purview. I am merely a huge supporter.
          </p>
        </footer>
      </aside>
    </div>

    <div class="mobile-actions show-on-mobile">
      <button class="btn btn-primary" v-on:click="randomizeKit">Randomize</button>
      <button class="btn btn-ghost" v-on:click="manageColorWindow(true)">Colors</button>
    </div>

    <transition name="fade">
      <div
        class="modal-backdrop"
        v-show="showGreeting"
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        v-on:click.self="dismissModal"
      >
        <div class="modal">
          <p class="modal-eyebrow">Austin FC Kit Creator</p>
          <h2 class="modal-title" id="greeting-title">The Future Looks Bright Verde</h2>

          <p>
            Do you have a sharp eye for design and a love of our city's great football club?
            This retro-esque tool lets you design a kit by choosing your own selections from
            the toolbar, or randomize it and start from there<span
              class="not-mobile"
            > (hit <kbd>Enter</kbd>, <kbd>Space</kbd> or the <kbd>arrow keys</kbd> at any
              time to randomize as well)</span>. Either way, hope you have fun and let's
            GROW THE LEGEND!
          </p>

          <p class="modal-note">
            Hit <strong>Download PNG</strong> to save your favorite designs, then post
            them with <strong>#AustinFCKitCreator</strong>
          </p>

          <div class="modal-actions">
            <button class="btn btn-primary" v-on:click="handleGreetingClose(false)">Start from here</button>
            <button class="btn btn-ghost" v-on:click="handleGreetingClose(true)">Randomize kit</button>
            <button class="btn btn-ghost" v-on:click="handleGreetingToManageColors">Manage colors</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div
        v-if="toast"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.tone}`"
        role="status"
        aria-live="polite"
      >
        <strong>{{ toast.title }}</strong>
        <span v-if="toast.message">{{ toast.message }}</span>
      </div>
    </transition>

    <transition name="fade">
      <div
        class="modal-backdrop"
        v-show="manageColors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="colors-title"
        v-on:click.self="dismissModal"
      >
        <div class="modal">
          <p class="modal-eyebrow">Palette</p>
          <h2 class="modal-title" id="colors-title">Manage Colors</h2>

          <p>
            Add or remove your own colors &mdash;
            <a href="https://htmlcolorcodes.com/color-chart/" target="_blank" rel="noopener">hex values</a>
            or
            <a href="https://www.rapidtables.com/web/color/html-color-codes.html" target="_blank" rel="noopener">named colors</a>
            only.
          </p>

          <div class="palette-block">
            <span class="field-label">Your palette <em>(click a swatch to remove)</em></span>
            <ColorSwatches
              label="Your palette"
              :colors="colors"
              removable
              v-on:remove="removeColor"
            />
          </div>

          <div class="palette-block">
            <span class="field-label">Add a color</span>
            <div class="add-color-row">
              <input
                class="color-to-add"
                type="text"
                placeholder="#00B140"
                aria-label="Hex value or named color"
                v-model="colorToAdd"
                v-on:keyup.enter="addColor(colorToAdd)"
              />
              <span
                class="color-preview"
                :class="{ empty: !colorToAdd }"
                :style="colorToAdd ? { backgroundColor: colorToAdd } : null"
                aria-hidden="true"
              ></span>
              <button class="btn btn-primary" v-on:click="addColor(colorToAdd)">Add</button>
            </div>

            <div class="color-picker">
              <label for="colorPicker">Or pick one</label>
              <input
                id="colorPicker"
                type="color"
                :value="brightVerde"
                v-on:input="updateActiveColor"
                class="color-picker-input"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" v-on:click="handleGreetingClose(false)">Go from here</button>
            <button class="btn btn-ghost" v-on:click="resetColors">Reset colors</button>
            <button class="btn btn-ghost" v-on:click="handleGreetingClose(true)">Randomize kit</button>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
  import Kit from './components/Kit.vue';
  import AustinFCBadge from './components/AustinFCBadge.vue';
  import Stadium from './components/Stadium.vue';
  import ColorSwatches from './components/ColorSwatches.vue';
  import ToolSection from './components/ToolSection.vue';
  import ToolField from './components/ToolField.vue';
  import ShirtThumb from './components/ShirtThumb.vue';
  import { STAGE_NAMES, getBackdrop, toCssGradient } from './lib/stageBackdrops.js';
  import { kitToPngBlob, downloadBlob } from './lib/kitToPng.js';
  import { readKit, writeKit, PERSISTED_FIELDS } from './lib/kitStorage.js';

  const green ='#00B140';
  const black = '#000000';
  const white = '#FFFFFF';
  const grey = '#CCCCCC';

  const defaultColors = [
    black,
    green,
    white,
    grey
  ];

  // 'Spacebar' is the legacy name older Edge/Firefox reported for the space key.
  const RANDOMIZE_KEYS = [
    'Enter',
    ' ',
    'Spacebar',
    'ArrowLeft',
    'ArrowUp',
    'ArrowRight',
    'ArrowDown'
  ];

  // How long a toast stays up, and how long a part keeps its flash.
  const TOAST_MS = 3400;
  const FLASH_MS = 700;

  // Long enough to cover the staggered reveal in Kit.vue.
  const REVEAL_MS = 750;

  // Which kit part each color owns, so a change can flash the shape it moved.
  // Several colors share a part: the badge is one silhouette whoever paints it.
  const FILL_PARTS = {
    shirtFill: 'shirt',
    shirtTypeFill: 'design',
    shirtSecondaryFill: 'design',
    shirtCuffFill: 'shirtCuff',
    shirtSleeveFill: 'sleeve',
    shirtMakerFill: 'maker',
    logoFill: 'sponsor',
    collarFill: 'collar',
    badgeFill: 'badge',
    badgeTextFill: 'badge',
    badgeBGFill: 'badge',
    shortsFill: 'shorts',
    shortsCuffsFill: 'shortsTrim',
    numberFill: 'number',
    socksFill: 'socks',
    socksCuffsFill: 'socksCuff',
    socksHoopsFill: 'socksHoops'
  };

  const shirtOptions = [
    'barcode',
    'stripes',
    'center-stripe',
    'off-center-stripe',
    'shoulder-stripes',
    'hoops',
    'chevron',
    'sash',
    'double-sash',
    'half-panel',
    'quarter-panel',
    'checkered',
    'tiger-stripes'
  ];

  export default {
    name: 'App',
    components: {
      Kit,
      AustinFCBadge,
      Stadium,
      ColorSwatches,
      ToolSection,
      ToolField,
      ShirtThumb
    },
    // Every field would otherwise repeat the same pair of listeners. Handing
    // the setter down keeps that out of a template with twenty of them.
    provide() {
      return {
        spotlight: (part, key) => this.setSpotlight(part, key)
      };
    },
    data() {
      // Restored values override the defaults below. Applying them here rather
      // than in a lifecycle hook is what keeps a restore quiet: they become the
      // component's initial state, so neither the flash watchers nor the
      // activeShirtOption watcher sees a change and reacts as though someone
      // had just made it.
      const saved = readKit(shirtOptions, STAGE_NAMES);

      return {
        setting: null,
        showGreeting: false,

        // The one passing-message channel: { id, title, message, tone }.
        toast: null,
        toastId: 0,

        // Spotlight state, read by Kit.vue. `highlight` follows the pointer
        // around the toolbar; `flash` marks a part whose color just moved.
        highlight: null,
        flash: null,
        // A randomize changes seventeen colors at once, which would flash the
        // whole kit. The reveal speaks for it instead.
        suppressFlash: false,
        revealing: false,
        // Holds the kit still while the exporter reads its computed styles.
        frozen: false,

        manageColors: false,
        colorToAdd: null,

        colors: null,

        openSection: 'shirt',

        exporting: false,

        shirtOptions,
        activeShirtOption: 'barcode',
        shirtFill: green,
        shirtTypeFill: black,
        shirtSecondaryFill: white,
        shirtCuffFill: black,
        shirtMakerFill: white,
        shirtSleeveFill: green,
        logoFill: white,
        badgeFill: green,
        badgeTextFill: white,
        badgeBGFill: black,

        collarFill: black,
        showButtonCollar: false,

        shortsFill: black,
        shortsCuffsFill: green,

        socksFill: black,
        socksCuffsFill: black,
        socksHoops: false,
        socksHoopsFill: white,

        numberFill: white,

        ...saved
      }
    },
    computed: {
      // Watched rather than rendered: any change to a persisted field yields a
      // new object, which is the cue to save.
      persistedKit() {
        const kit = {};

        PERSISTED_FIELDS.forEach(field => { kit[field] = this[field]; });

        return kit;
      },
      stageGradient() {
        return toCssGradient(getBackdrop(this.setting));
      },
      brightVerde() {
        return green;
      },
      // null is the solid shirt, so it rides along with the patterns and the
      // grid needs only one loop.
      designOptions() {
        return [null, ...this.shirtOptions];
      },
      colorToAddBorderColor() {
        return this.colorToAdd ? this.colorToAdd : '#000000';
      }
    },
    watch: {
      persistedKit(kit) {
        writeKit(kit);
      },
      activeShirtOption() {
        if(this.activeShirtOption === 'hoops' || this.activeShirtOption === 'stripes') {
          this.shirtFill = white;
        }
      }
    },
    methods: {
      backToTop() {
        let scrollOptions = {
          top: 0
        }

        window.scrollTo(scrollOptions);
      },
      toggleSection(name) {
        this.openSection = this.openSection === name ? null : name;
      },
      formatOption(option) {
        return option ? option.replace(/-/g, ' ') : 'solid';
      },
      getSetting() {
        this.setting = STAGE_NAMES[Math.floor(Math.random()*STAGE_NAMES.length)];
      },
      addColor(color) {
        if(this.colorToAdd && !this.colors.includes(color)) {
          this.colors.push(color);
        }

        setTimeout(() => {
          this.colorToAdd = null;
        }, 200);
      },
      removeColor(color) {
        this.colors = this.colors.filter(item => item !== color)
      },
      resetColors() {
        this.colors = [
          green,
          black,
          white,
          grey
        ];

        this.resetBadge();
      },
      setShirtOption(option) {
        this.activeShirtOption = option;
      },
      setShirtFill(fill) {
        this.shirtFill = fill;
      },
      setShirtSecondaryFill(fill) {
        this.shirtSecondaryFill = fill;
      },
      setShirtTypeFill(fill) {
        this.shirtTypeFill = fill;
      },
      setShirtCuffFill(fill) {
        this.shirtCuffFill = fill;
      },
      setShirtSleeveFill(fill) {
        this.shirtSleeveFill = fill;
      },
      setBadgeFill(fill) {
        this.badgeFill = fill;
      },
      setBadgeTextFill(fill) {
        this.badgeTextFill = fill;
      },
      setBadgeBGFill(fill) {
        this.badgeBGFill = fill;
      },
      setLogoFill(fill) {
        this.logoFill = fill;
      },
      setCollarFill(fill) {
        this.collarFill = fill;
      },
      setShirtMakerFill(fill) {
        this.shirtMakerFill = fill;
      },
      setCollarButton(pref) {
        this.showButtonCollar = pref;
      },
      setShortsFill(fill) {
        this.shortsFill = fill;
      },
      setShortsCuffsFill(fill) {
        this.shortsCuffsFill = fill;
      },
      setSocksFill(fill) {
        this.socksFill = fill;
      },
      setSocksCuffsFill(fill) {
        this.socksCuffsFill = fill;
      },
      setNumberFill(fill) {
        this.numberFill = fill;
      },
      setSocksHoops(pref) {
        this.socksHoops = pref;
      },
      setSocksHoopsFill(fill) {
        this.socksHoopsFill = fill;
      },
      // A field reports itself lit or unlit. It passes its own key back on the
      // way out so a stale "unlit" cannot wipe the field the pointer has
      // already moved on to.
      setSpotlight(part, key) {
        if (part === null && this.highlight !== key) return;

        this.highlight = part;

        // A halo and a flash on one part would fight over `animation`.
        if (part && this.flash === part) {
          this.flash = null;
        }
      },
      flashPart(part) {
        // Nothing to announce: the part is already wearing a halo, or a
        // randomize is about to reveal the whole kit anyway.
        if (this.suppressFlash || this.highlight === part) return;

        clearTimeout(this.flashTimer);
        this.flash = null;

        // Dropping the class and re-adding it restarts the one-shot
        // animation, so a run of changes to one part flashes every time
        // rather than only the first.
        this.$nextTick(() => {
          this.flash = part;
          this.flashTimer = setTimeout(() => {
            this.flash = null;
          }, FLASH_MS);
        });
      },
      notify(title, message = null, tone = 'ok') {
        clearTimeout(this.toastTimer);

        // A fresh id each time, so a second message re-animates instead of
        // silently swapping its text.
        this.toastId += 1;
        this.toast = { id: this.toastId, title, message, tone };

        this.toastTimer = setTimeout(() => {
          this.toast = null;
        }, TOAST_MS);
      },
      getRandomColor() {
        let randomColor = this.colors[Math.floor(Math.random()*this.colors.length)];
        return randomColor;
      },
      getRandomColorExcept(...avoid) {
        let candidates = this.colors.filter(color => !avoid.includes(color));

        // A single-color palette has nothing else to offer.
        if (!candidates.length) {
          candidates = this.colors;
        }

        return candidates[Math.floor(Math.random()*candidates.length)];
      },
      getRandomShirtDesign() {
        let randomDesign = this.shirtOptions[Math.floor(Math.random()*this.shirtOptions.length)];
        return randomDesign;
      },
      getRandomTrueFalse() {
        let options = [
          true,
          false
        ];

        let randomChoice = options[Math.floor(Math.random()*options.length)];
        return randomChoice;
      },
      randomizeKit() {
        // Seventeen colors are about to move. Let the reveal below carry the
        // change rather than flashing every part at once.
        this.suppressFlash = true;

        this.setShirtOption(this.getRandomShirtDesign());
        this.setShirtFill(this.getRandomColor());
        this.setShirtTypeFill(this.getRandomColor());
        this.setShirtCuffFill(this.getRandomColor());
        this.setShirtSleeveFill(this.getRandomColor());
        this.setLogoFill(this.getRandomColor());
        this.setCollarFill(this.getRandomColor());
        this.setCollarButton(this.getRandomTrueFalse());
        this.setShortsFill(this.getRandomColor());
        this.setShortsCuffsFill(this.getRandomColor());
        this.setSocksFill(this.getRandomColor());
        this.setSocksCuffsFill(this.getRandomColor());
        this.setNumberFill(this.getRandomColor());
        this.setSocksHoops(this.getRandomTrueFalse());
        this.setSocksHoopsFill(this.getRandomColor());
        this.getSetting();

        // Keep each element legible against what it sits on. Order matters:
        // a guard has to see the final value of everything it compares
        // against, so each one runs after whatever can still rewrite its
        // inputs. The collar goes last of the shirt guards because the
        // sponsor guard below can still move shirtTypeFill.
        if(this.logoFill === this.shirtFill) {
          this.setLogoFill(this.getRandomColorExcept(this.shirtFill));
        }

        if(this.logoFill === this.shirtTypeFill) {
          this.setShirtTypeFill(this.getRandomColorExcept(this.logoFill, this.shirtFill));
        }

        // A pattern painted in the shirt's own color is a pattern nobody can
        // see: the randomizer could land on "tiger stripes" and serve up what
        // looks like a plain shirt. Excluding the sponsor color too keeps the
        // guard above from being undone.
        if(this.shirtTypeFill === this.shirtFill) {
          this.setShirtTypeFill(this.getRandomColorExcept(this.shirtFill, this.logoFill));
        }

        // `(a || b)` only ever compared against `a`, so this half worked.
        if(this.collarFill === this.shirtFill || this.collarFill === this.shirtTypeFill) {
          this.setCollarFill(this.getRandomColorExcept(this.shirtFill, this.shirtTypeFill));
        }

        if(this.numberFill === this.shortsFill) {
          this.setNumberFill(this.getRandomColorExcept(this.shortsFill));
        }

        this.revealKit();
        this.backToTop();
      },
      // Socks, then shorts, then shirt. The classes live in Kit.vue; this just
      // arms and disarms them.
      revealKit() {
        clearTimeout(this.revealTimer);
        this.revealing = false;

        // Same restart trick as the flash: the animation only replays if the
        // class is genuinely re-added.
        this.$nextTick(() => {
          this.revealing = true;

          // The fill watchers run in this flush, so releasing the guard only
          // once it has passed keeps the randomize from flashing.
          this.suppressFlash = false;

          this.revealTimer = setTimeout(() => {
            this.revealing = false;
          }, REVEAL_MS);
        });
      },
      handleGreetingClose(randomizePref) {
        localStorage.setItem('visitedAustinFCKitDesigner', true);
        this.showGreeting = false;
        this.manageColors = false;

        if(randomizePref) {
          this.randomizeKit();
        }

        this.backToTop();
      },
      handleGreetingToManageColors() {
        this.showGreeting = false;
        this.manageColors = true;
        this.backToTop();
      },
      manageColorWindow(pref) {
        this.manageColors = pref;
        this.backToTop();
      },
      updateActiveColor(event) {
        let newColor = event.target.value;
        this.colorToAdd = newColor;
      },
      kitFilename() {
        const design = this.activeShirtOption || 'solid';
        const stamp = new Date().toISOString().slice(0, 10);

        return `austin-fc-kit-${design}-${stamp}.png`;
      },
      async downloadKit() {
        if (this.exporting) return;

        this.exporting = true;

        // kitToPng.js reads computed styles straight off the live SVG, so a
        // capture taken mid-animation would bake in a half-interpolated fill
        // or a part still sliding into place. Settle the kit, then let the
        // browser apply that before the exporter looks.
        this.highlight = null;
        this.flash = null;
        this.revealing = false;
        this.frozen = true;

        try {
          await this.$nextTick();
          await new Promise(resolve => requestAnimationFrame(resolve));

          const filename = this.kitFilename();
          const blob = await kitToPngBlob(
            this.$refs.kit.$el,
            getBackdrop(this.setting),
            this.$refs.stadium.$el
          );

          downloadBlob(blob, filename);
          this.notify('Kit saved.', filename);
        } catch (err) {
          this.notify('Export failed.', 'Give it another go?', 'warn');
          // Leave a trace for anyone debugging a browser-specific failure.
          console.error('[kit-export]', err);
        } finally {
          this.frozen = false;
          this.exporting = false;
        }
      },
      dismissModal() {
        if (this.showGreeting) {
          this.handleGreetingClose(false);
        } else if (this.manageColors) {
          this.manageColorWindow(false);
        }
      },
      handleShortcut(e) {
        // Checked before the typing guard: Escape in the hex field should
        // still close the dialog.
        if (e.key === 'Escape') {
          this.dismissModal();
          return;
        }

        if (!RANDOMIZE_KEYS.includes(e.key)) return;

        const el = e.target;
        const tag = el && el.tagName;

        // Never hijack typing.
        if (el && el.isContentEditable) return;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        // Enter and Space activate a focused button or link; let them, rather
        // than also randomizing. Arrow keys stay live everywhere, so the
        // headline shortcut still works right after clicking a swatch.
        const activates = e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';

        if (activates && (tag === 'BUTTON' || tag === 'A')) return;

        this.randomizeKit();
        this.showGreeting = false;
        this.manageColors = false;
      },
      resetBadge() {
        this.badgeFill = green;
        this.badgeTextFill = white;
        this.badgeBGFill = black;
      }
    },
    created() {
      // Seventeen near-identical watchers, declared once. Each one tells the
      // kit which part just changed color so it can flash.
      Object.entries(FILL_PARTS).forEach(([model, part]) => {
        this.$watch(model, () => this.flashPart(part));
      });
    },
    mounted() {
      window.addEventListener('keyup', this.handleShortcut);

      // Either may already hold a restored value, so only fall back when
      // nothing was persisted.
      // Copy, don't alias: addColor() pushes onto this array.
      if (!this.colors) this.colors = [...defaultColors];
      if (!this.setting) this.getSetting();

      let hasVisited = localStorage.getItem('visitedAustinFCKitDesigner');

      if (!hasVisited) {
        setTimeout(() => {
          this.showGreeting = true;
        }, 1000);
      } else {
        this.notify('Welcome back.', 'Post your favorites with #AustinFCKitCreator');
      }
    },
    beforeUnmount() {
      window.removeEventListener('keyup', this.handleShortcut);

      clearTimeout(this.toastTimer);
      clearTimeout(this.flashTimer);
      clearTimeout(this.revealTimer);
    }
  };
</script>

<style>
  :root {
    --verde: #00B140;
    --verde-bright: #27D566;
    --verde-ink: #042A12;

    --bg-panel: rgba(11, 14, 13, .93);
    --bg-raised: #171B19;
    --bg-sunken: #0C100E;

    --line: rgba(255, 255, 255, .09);
    --line-strong: rgba(255, 255, 255, .18);

    --text: #EDF0EE;
    --text-dim: #969E9A;
    --text-faint: #6B736F;

    --r-sm: 6px;
    --r-md: 10px;
    --r-lg: 16px;

    --font-display: 'Bungee Inline', system-ui, sans-serif;
    --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    --toolbar-w: clamp(320px, 27vw, 400px);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- Stage backdrop -------------------------------------------------- */

  main {
    position: relative;
    min-height: 100vh;
    /* .stadium-stage is scaled up, and a transformed element still contributes
       its scaled bounds to scrollable overflow. Without this the document picks
       up ~37px of phantom scroll height. */
    overflow: hidden;
  }

  /* Four dusk-lit moods, kept dark so the kit art stays the brightest thing on
     screen. The stops live in src/lib/stageBackdrops.js, because the PNG export
     paints the same gradient onto a canvas. */

  .stage-gradient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* The outgoing backdrop holds full opacity underneath while the incoming one
     fades in over it, so the stage never dips dark mid-swap. Nothing animates
     on the way out, hence the explicit :duration on the transition. */
  .stage-enter-active {
    transition: opacity .8s ease;
  }

  .stage-enter-from {
    opacity: 0;
  }

  .stadium-stage {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1;
    transform: scale(1.1);
    opacity: .34;
    filter: saturate(.7);
    pointer-events: none;
  }

  /* Vignette: darkens the edges so the centered kit reads first. */
  .stage-scrim {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background:
      radial-gradient(ellipse 70% 60% at 38% 45%, transparent 0%, rgba(4, 6, 5, .55) 100%),
      linear-gradient(to top, rgba(4, 6, 5, .5) 0%, transparent 32%);
  }

  /* ---- Shell ----------------------------------------------------------- */

  #app {
    position: relative;
    z-index: 3;
    display: flex;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
  }

  #kit-stage {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 28px 28px 76px;
  }

  .kit-display {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    filter: drop-shadow(0 24px 48px rgba(0, 0, 0, .45));
    animation: floatABit 6s infinite ease-in-out;
  }

  @keyframes floatABit {
    0%, 100% { transform: translateY(-4px); }
    50% { transform: translateY(4px); }
  }

  .help {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 8px 16px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background-color: rgba(10, 13, 11, .66);
    backdrop-filter: blur(12px);
    color: var(--text-dim);
    font-size: .74rem;
    white-space: nowrap;
  }

  .download-kit {
    position: absolute;
    right: 28px;
    bottom: 22px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px 9px 13px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background-color: rgba(10, 13, 11, .66);
    backdrop-filter: blur(12px);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .76rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color .18s ease, border-color .18s ease, color .18s ease;
  }

  .download-kit:hover:not(:disabled) {
    border-color: var(--verde);
    background-color: var(--verde);
    color: var(--verde-ink);
  }

  .download-kit:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 3px;
  }

  .download-kit:disabled {
    cursor: progress;
    opacity: .65;
  }

  /* The arrow travels while the canvas renders, which is the only feedback
     a sub-second export has room for. */
  .download-icon.working {
    animation: downloadWork .9s ease-in-out infinite;
  }

  @keyframes downloadWork {
    0%, 100% { transform: translateY(-2px); opacity: .55; }
    50% { transform: translateY(2px); opacity: 1; }
  }

  .download-kit:active:not(:disabled) {
    transform: scale(.97);
  }

  .download-icon {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }

  kbd {
    padding: 2px 7px;
    border: 1px solid var(--line-strong);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, .07);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .68rem;
    font-weight: 600;
  }

  /* ---- Toolbar --------------------------------------------------------- */

  #toolbar {
    display: flex;
    flex: 0 0 var(--toolbar-w);
    flex-direction: column;
    width: var(--toolbar-w);
    border-left: 1px solid var(--line);
    background-color: var(--bg-panel);
    backdrop-filter: blur(24px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .toolbar-header {
    position: sticky;
    top: 0;
    z-index: 3;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 14px;
    padding: 20px;
    border-bottom: 1px solid var(--line);
    background-color: var(--bg-panel);
    backdrop-filter: blur(24px);
  }

  .toolbar-badge-link {
    display: block;
    grid-row: span 2;
    align-self: center;
  }

  .toolbar-badge {
    display: block;
    width: 42px;
    transition: transform .2s ease;
  }

  .toolbar-badge-link:hover .toolbar-badge {
    transform: scale(1.08);
  }

  .toolbar-titles {
    align-self: center;
  }

  .wordmark {
    margin: 0;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: .01em;
    line-height: 1.1;
  }

  .toolbar-sub {
    margin: 3px 0 0;
    color: var(--text-faint);
    font-size: .74rem;
  }

  .toolbar-actions {
    display: flex;
    grid-column: 1 / -1;
    gap: 8px;
    margin-top: 14px;
  }

  .toolbar-actions .btn {
    flex: 1;
  }

  .toolbar-sections {
    flex: 1 0 auto;
  }

  /* ---- Fields ---------------------------------------------------------- */

  .field-label {
    display: block;
    margin-bottom: 9px;
    color: var(--text-dim);
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .field-label em {
    color: var(--text-faint);
    font-style: normal;
    font-weight: 400;
    letter-spacing: .04em;
    text-transform: none;
  }

  .design-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  /* Each option wears the design rather than naming it, painted in the live
     palette so the whole grid recolors as the shirt does. */
  .design-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 9px 5px 8px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-raised);
    color: var(--text-faint);
    font-family: var(--font-ui);
    font-size: .56rem;
    font-weight: 600;
    letter-spacing: .05em;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
    transition: border-color .18s ease, color .18s ease,
                background-color .18s ease,
                transform .2s cubic-bezier(.33, 1, .68, 1);
  }

  .design-preview {
    width: 100%;
    max-width: 52px;
    transition: filter .22s ease;
  }

  .design-name {
    line-height: 1.25;
  }

  .design-option:hover {
    border-color: var(--line-strong);
    background-color: #1C211E;
    color: var(--text);
    transform: translateY(-2px);
  }

  .design-option:active {
    transform: translateY(0) scale(.97);
    transition-duration: .06s;
  }

  /* A ring and a tint, not a solid verde fill: the preview is the thing worth
     looking at, and a flat block of green would swallow it. */
  .design-option.active {
    border-color: var(--verde);
    background-color: rgba(0, 177, 64, .13);
    color: var(--verde);
  }

  .design-option.active .design-preview {
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, .5));
  }

  .design-option:focus-visible,
  .segmented button:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 2px;
  }

  .segmented {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
  }

  .segmented button {
    padding: 8px;
    border: 0;
    border-radius: 4px;
    background: none;
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .72rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color .18s ease, color .18s ease;
  }

  .segmented button:hover {
    color: var(--text);
  }

  .segmented button.active {
    background-color: var(--verde);
    color: var(--verde-ink);
    font-weight: 700;
    animation: segmentPick .3s cubic-bezier(.33, 1, .68, 1);
  }

  @keyframes segmentPick {
    0% { transform: scale(.92); }
    60% { transform: scale(1.04); }
    100% { transform: scale(1); }
  }

  /* ---- Buttons --------------------------------------------------------- */

  .btn {
    padding: 10px 16px;
    border: 1px solid transparent;
    border-radius: var(--r-sm);
    font-family: var(--font-ui);
    font-size: .76rem;
    font-weight: 600;
    letter-spacing: .03em;
    cursor: pointer;
    transition: background-color .18s ease, border-color .18s ease,
                color .18s ease, transform .18s cubic-bezier(.33, 1, .68, 1);
  }

  .btn:active {
    transform: scale(.97);
    transition-duration: .06s;
  }

  .btn:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 2px;
  }

  .btn-primary {
    background-color: var(--verde);
    color: var(--verde-ink);
  }

  .btn-primary:hover {
    background-color: var(--verde-bright);
  }

  .btn-ghost {
    border-color: var(--line-strong);
    background-color: transparent;
    color: var(--text);
  }

  .btn-ghost:hover {
    border-color: var(--text-faint);
    background-color: rgba(255, 255, 255, .05);
  }

  .btn-block {
    width: 100%;
  }

  /* ---- Toolbar footer -------------------------------------------------- */

  .toolbar-footer {
    padding: 20px;
    border-top: 1px solid var(--line);
  }

  .hashtag {
    margin: 0 0 14px;
    color: var(--text-dim);
    font-size: .76rem;
    line-height: 1.5;
  }

  .hashtag strong {
    display: block;
    margin-top: 2px;
    color: var(--verde);
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 14px;
  }

  a {
    color: var(--verde);
    text-decoration: none;
    transition: color .18s ease;
  }

  a:hover {
    color: var(--verde-bright);
    text-decoration: underline;
  }

  .footer-links a {
    font-size: .76rem;
  }

  .attribution {
    margin: 0;
    color: var(--text-faint);
    font-size: .66rem;
    line-height: 1.55;
  }

  /* ---- Modals ---------------------------------------------------------- */

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 24px;
    background-color: rgba(4, 6, 5, .74);
    backdrop-filter: blur(10px);
  }

  .modal {
    width: min(620px, 100%);
    max-height: min(88vh, 780px);
    overflow-y: auto;
    padding: 34px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-lg);
    background-color: var(--bg-raised);
    box-shadow: 0 28px 70px rgba(0, 0, 0, .62);
  }

  .modal-eyebrow {
    margin: 0 0 8px;
    color: var(--verde);
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .modal-title {
    margin: 0 0 18px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 400;
    line-height: 1.15;
  }

  .modal p {
    margin: 0 0 16px;
    color: var(--text-dim);
    font-size: .94rem;
    line-height: 1.65;
  }

  .modal-note {
    padding: 13px 16px;
    border-left: 2px solid var(--verde);
    border-radius: 0 var(--r-sm) var(--r-sm) 0;
    background-color: rgba(0, 177, 64, .08);
  }

  .modal-note strong {
    color: var(--verde);
  }

  .modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 26px;
  }

  .palette-block {
    margin-bottom: 22px;
  }

  .add-color-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
    margin-bottom: 12px;
  }

  .color-to-add {
    flex: 1;
    min-width: 0;
    padding: 10px 13px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .88rem;
  }

  .color-to-add::placeholder {
    color: var(--text-faint);
  }

  .color-to-add:focus {
    border-color: var(--verde);
    outline: none;
  }

  .color-preview {
    flex: 0 0 42px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
  }

  .color-preview.empty {
    border-style: dashed;
    border-color: var(--text-faint);
    background-color: transparent;
  }

  .color-picker {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .color-picker label {
    color: var(--text-faint);
    font-size: .76rem;
  }

  .color-picker-input {
    width: 54px;
    height: 32px;
    padding: 2px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    cursor: pointer;
  }

  /* ---- Toast ----------------------------------------------------------- */

  .toast {
    position: fixed;
    /* Clears the .help pill, which also sits bottom-center. */
    bottom: 76px;
    left: 50%;
    z-index: 60;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 13px 22px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background-color: rgba(16, 20, 18, .95);
    backdrop-filter: blur(14px);
    box-shadow: 0 12px 34px rgba(0, 0, 0, .5);
    font-size: .82rem;
    white-space: nowrap;
  }

  .toast strong {
    color: var(--verde);
  }

  .toast-warn strong {
    color: #FFB454;
  }

  .toast span {
    color: var(--text-dim);
    /* Filenames and hashtags should not force the pill wider than the stage. */
    overflow-wrap: anywhere;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: opacity .3s ease, transform .36s cubic-bezier(.33, 1, .68, 1);
  }

  /* Keeps the -50% that centers the pill; only the vertical part moves. */
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 16px) scale(.96);
  }

  /* ---- Transitions ----------------------------------------------------- */

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .32s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* The backdrop fades, the card itself lifts. */
  .fade-enter-active .modal,
  .fade-leave-active .modal {
    transition: opacity .3s ease, transform .36s cubic-bezier(.33, 1, .68, 1);
  }

  .fade-enter-from .modal,
  .fade-leave-to .modal {
    opacity: 0;
    transform: translateY(14px) scale(.97);
  }

  /* "Hoops color" only exists while hoops are on, so it arrives and leaves
     rather than blinking in with v-show. */
  .field-pop-enter-active,
  .field-pop-leave-active {
    transition: opacity .26s ease, transform .28s cubic-bezier(.33, 1, .68, 1);
  }

  .field-pop-enter-from,
  .field-pop-leave-to {
    opacity: 0;
    transform: translateY(-7px);
  }

  /* ---- Responsive ------------------------------------------------------ */

  .show-on-mobile {
    display: none;
  }

  @media screen and (max-width: 900px) {
    html,
    body {
      overflow: auto;
    }

    #app {
      flex-direction: column;
      height: auto;
      overflow: visible;
    }

    #kit-stage {
      /* A definite height, not min-height: the kit's max-height:100% has
         nothing to resolve against once #app stops being viewport-tall. */
      height: 58vh;
      min-height: 320px;
      padding: 20px 20px 24px;
    }

    #toolbar {
      flex: 1 1 auto;
      width: 100%;
      border-top: 1px solid var(--line);
      border-left: 0;
      overflow-y: visible;
    }

    /* The page scrolls as a whole here, and .mobile-actions already pins the
       same two buttons to the bottom, so the header neither sticks nor repeats
       them. */
    .toolbar-header {
      position: static;
    }

    .toolbar-actions {
      display: none;
    }

    .toolbar-footer {
      padding-bottom: 92px;
    }

    .stadium-stage {
      transform: scale(1.7);
    }

    .help {
      display: none;
    }

    .download-kit {
      right: 50%;
      bottom: 16px;
      transform: translateX(50%);
    }

    .show-on-mobile {
      display: block;
    }

    .not-mobile {
      display: none;
    }

    .mobile-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 40;
      display: flex;
      gap: 9px;
      padding: 12px 16px;
      border-top: 1px solid var(--line);
      background-color: var(--bg-panel);
      backdrop-filter: blur(20px);
    }

    .mobile-actions .btn {
      flex: 1;
      padding: 13px 16px;
    }

    .modal {
      padding: 24px;
    }

    .modal-title {
      font-size: 1.45rem;
    }

    .toast {
      bottom: 86px;
      flex-direction: column;
      gap: 2px;
      align-items: center;
      white-space: normal;
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
    }
  }
</style>

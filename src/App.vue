<template>
  <main :class="setting" :style="{ backgroundImage: stageGradient }">
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
        />

        <p class="help">
          <kbd>Enter</kbd> <kbd>Space</kbd> <kbd>&larr;</kbd> <kbd>&rarr;</kbd>
          <span>to randomize</span>
        </p>

        <button
          class="download-kit"
          type="button"
          :disabled="exporting"
          :title="exportError || 'Download this kit as a PNG'"
          v-on:click="downloadKit"
        >
          <svg class="download-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16" />
          </svg>
          <span>{{ exporting ? 'Rendering...' : (exportError || 'Download PNG') }}</span>
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

        <p class="mobile-welcome show-on-mobile">
          This app is better experienced on a tablet or desktop, but I hope you still have fun.
        </p>

        <div class="toolbar-sections">
          <ToolSection
            title="Shirt"
            :open="openSection === 'shirt'"
            v-on:toggle="toggleSection('shirt')"
          >
            <div class="field">
              <span class="field-label">Design</span>
              <div class="design-grid">
                <button
                  type="button"
                  class="design-option"
                  :class="{ active: !activeShirtOption }"
                  :aria-pressed="String(!activeShirtOption)"
                  v-on:click="clearShirtOption()"
                >Solid</button>
                <button
                  v-for="option in shirtOptions"
                  :key="option"
                  type="button"
                  class="design-option"
                  :class="{ active: option === activeShirtOption }"
                  :aria-pressed="String(option === activeShirtOption)"
                  v-on:click="setShirtOption(option)"
                >{{ formatOption(option) }}</button>
              </div>
            </div>

            <div class="field">
              <span class="field-label">Primary color</span>
              <ColorSwatches label="Shirt primary color" :colors="colors" v-model="shirtFill" />
            </div>

            <div class="field">
              <span class="field-label">Design color</span>
              <ColorSwatches label="Shirt design color" :colors="colors" v-model="shirtTypeFill" />
            </div>

            <div class="field">
              <span class="field-label">Secondary color</span>
              <ColorSwatches label="Shirt secondary color" :colors="colors" v-model="shirtSecondaryFill" />
            </div>

            <div class="field">
              <span class="field-label">Sponsor color</span>
              <ColorSwatches label="Sponsor color" :colors="colors" v-model="logoFill" />
            </div>

            <div class="field">
              <span class="field-label">Collar</span>
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
            </div>

            <div class="field">
              <span class="field-label">Collar color</span>
              <ColorSwatches label="Collar color" :colors="colors" v-model="collarFill" />
            </div>

            <div class="field">
              <span class="field-label">Sleeve color</span>
              <ColorSwatches label="Sleeve color" :colors="colors" v-model="shirtSleeveFill" />
            </div>

            <div class="field">
              <span class="field-label">Cuff color</span>
              <ColorSwatches label="Cuff color" :colors="colors" v-model="shirtCuffFill" />
            </div>

            <div class="field">
              <span class="field-label">Brand mark color</span>
              <ColorSwatches label="Shirt brand mark color" :colors="colors" v-model="shirtMakerFill" />
            </div>
          </ToolSection>

          <ToolSection
            title="Badge"
            :open="openSection === 'badge'"
            v-on:toggle="toggleSection('badge')"
          >
            <div class="field">
              <span class="field-label">Badge color</span>
              <ColorSwatches label="Badge color" :colors="colors" v-model="badgeFill" />
            </div>

            <div class="field">
              <span class="field-label">Badge text color</span>
              <ColorSwatches label="Badge text color" :colors="colors" v-model="badgeTextFill" />
            </div>

            <div class="field">
              <span class="field-label">Badge background</span>
              <ColorSwatches label="Badge background color" :colors="colors" v-model="badgeBGFill" />
            </div>

            <button class="btn btn-ghost btn-block" v-on:click="resetBadge">Reset badge</button>
          </ToolSection>

          <ToolSection
            title="Shorts"
            :open="openSection === 'shorts'"
            v-on:toggle="toggleSection('shorts')"
          >
            <div class="field">
              <span class="field-label">Primary color</span>
              <ColorSwatches label="Shorts primary color" :colors="colors" v-model="shortsFill" />
            </div>

            <div class="field">
              <span class="field-label">Trim color</span>
              <ColorSwatches label="Shorts trim color" :colors="colors" v-model="shortsCuffsFill" />
            </div>

            <div class="field">
              <span class="field-label">Number color</span>
              <ColorSwatches label="Number color" :colors="colors" v-model="numberFill" />
            </div>
          </ToolSection>

          <ToolSection
            title="Socks"
            :open="openSection === 'socks'"
            v-on:toggle="toggleSection('socks')"
          >
            <div class="field">
              <span class="field-label">Primary color</span>
              <ColorSwatches label="Socks primary color" :colors="colors" v-model="socksFill" />
            </div>

            <div class="field">
              <span class="field-label">Top color</span>
              <ColorSwatches label="Sock top color" :colors="colors" v-model="socksCuffsFill" />
            </div>

            <div class="field">
              <span class="field-label">Hoops</span>
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
            </div>

            <div class="field" v-show="socksHoops">
              <span class="field-label">Hoops color</span>
              <ColorSwatches label="Sock hoops color" :colors="colors" v-model="socksHoopsFill" />
            </div>
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

    <transition name="fade">
      <div class="toast" v-show="showWelcomeBack" role="status">
        <strong>Welcome back.</strong>
        <span>Post your favorites with #AustinFCKitCreator</span>
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
  import { STAGE_NAMES, getBackdrop, toCssGradient } from './lib/stageBackdrops.js';
  import { kitToPngBlob, downloadBlob } from './lib/kitToPng.js';

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
      ToolSection
    },
    data() {
      return {
        setting: null,
        showGreeting: false,

        showWelcomeBack: false,

        manageColors: false,
        colorToAdd: null,

        colors: null,

        openSection: 'shirt',

        exporting: false,
        exportError: null,

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

        numberFill: white
      }
    },
    computed: {
      defaultPaletteEnabled() {
        return this.arraysMatch(this.colors, defaultColors);
      },
      stageGradient() {
        return toCssGradient(getBackdrop(this.setting));
      },
      brightVerde() {
        return green;
      },
      colorToAddBorderColor() {
        return this.colorToAdd ? this.colorToAdd : '#000000';
      }
    },
    watch: {
      activeShirtOption() {
        if(this.activeShirtOption === 'hoops' || this.activeShirtOption === 'stripes') {
          this.shirtFill = white;
        }
      },
      showWelcomeBack(isVisible) {
        // Only arm the timer on the way up; it used to re-arm when the toast
        // dismissed itself, scheduling a pointless second timeout each time.
        if (!isVisible) return;

        setTimeout(() => {
          this.showWelcomeBack = false;
        }, 2000);
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
        return option.replace(/-/g, ' ');
      },
      arraysMatch(_arr1, _arr2) {
        if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
          return false;

        var arr1 = _arr1.concat().sort();
        var arr2 = _arr2.concat().sort();

        for (var i = 0; i < arr1.length; i++) {

          if (arr1[i] !== arr2[i]) { return false; }
        }

        return true;
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
      clearShirtOption() {
        this.activeShirtOption = null;
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

        // `(a || b)` only ever compared against `a`, so this half worked.
        if(this.collarFill === this.shirtFill || this.collarFill === this.shirtTypeFill) {
          this.setCollarFill(this.getRandomColorExcept(this.shirtFill, this.shirtTypeFill));
        }

        if(this.numberFill === this.shortsFill) {
          this.setNumberFill(this.getRandomColorExcept(this.shortsFill));
        }

        this.backToTop();
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
        this.exportError = null;

        try {
          const blob = await kitToPngBlob(
            this.$refs.kit.$el,
            getBackdrop(this.setting),
            this.$refs.stadium.$el
          );

          downloadBlob(blob, this.kitFilename());
        } catch (err) {
          this.exportError = 'Export failed. Try again?';
          // Leave a trace for anyone debugging a browser-specific failure.
          console.error('[kit-export]', err);
        } finally {
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
    mounted() {
      window.addEventListener('keyup', this.handleShortcut);
      // Copy, don't alias: addColor() pushes onto this array.
      this.colors = [...defaultColors];
      this.getSetting();

      let hasVisited = localStorage.getItem('visitedAustinFCKitDesigner');

      if (!hasVisited) {
        setTimeout(() => {
          this.showGreeting = true;
        }, 1000);
      } else {
        this.showWelcomeBack = true;
      }
    },
    beforeUnmount() {
      window.removeEventListener('keyup', this.handleShortcut);
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

  .stadium-stage {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 0;
    transform: scale(1.1);
    opacity: .34;
    filter: saturate(.7);
    pointer-events: none;
  }

  /* Vignette: darkens the edges so the centered kit reads first. */
  .stage-scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(ellipse 70% 60% at 38% 45%, transparent 0%, rgba(4, 6, 5, .55) 100%),
      linear-gradient(to top, rgba(4, 6, 5, .5) 0%, transparent 32%);
  }

  /* ---- Shell ----------------------------------------------------------- */

  #app {
    position: relative;
    z-index: 2;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .design-option {
    padding: 10px 8px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-raised);
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .68rem;
    font-weight: 500;
    letter-spacing: .05em;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
    transition: border-color .18s ease, color .18s ease, background-color .18s ease;
  }

  .design-option:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  .design-option.active {
    border-color: var(--verde);
    background-color: var(--verde);
    color: var(--verde-ink);
    font-weight: 700;
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
    transition: background-color .18s ease, border-color .18s ease, color .18s ease;
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

  .toast span {
    color: var(--text-dim);
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

  /* ---- Responsive ------------------------------------------------------ */

  .show-on-mobile {
    display: none;
  }

  .mobile-welcome {
    margin: 0;
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    background-color: rgba(0, 177, 64, .08);
    color: var(--text-dim);
    font-size: .76rem;
    line-height: 1.5;
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

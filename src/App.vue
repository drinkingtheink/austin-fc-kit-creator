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

    <!-- Only this sky is dark enough overhead to hold them. -->
    <transition name="stage" :duration="800">
      <Stars v-if="stageHasStars" class="stage-stars" />
    </transition>

    <Stadium
      ref="stadium"
      class="stadium-stage"
      :class="{ 'is-celebrating': celebrating }"
      aria-hidden="true"
    />
    <div class="stage-scrim" aria-hidden="true"></div>

    <div id="app">
      <section id="kit-stage" ref="stage" :class="{ 'is-zoomed': zoom > 1, 'is-panning': panMoved }">
        <!-- The zoom lives on a wrapper, not on the kit: .kit-display already
             animates transform for the float, and an animation beats an inline
             style on the same property. It also keeps the zoom out of the PNG
             for free, since the exporter serializes the SVG and never looks at
             a parent's transform. -->
        <div
          class="kit-zoom"
          :class="{ smooth: zoomSmooth }"
          :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }"
        >
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
          :logoStroke="logoStroke"
          :logoStrokeFill="logoStrokeFill"
          :austinWordmark="austinWordmark"
          :badgeFill="badgeFill"
          :badgeTextFill="badgeTextFill"
          :badgeBGFill="badgeBGFill"
          :shortsBadgeFill="shortsBadgeFill"
          :shortsBadgeTextFill="shortsBadgeTextFill"
          :shortsBadgeBGFill="shortsBadgeBGFill"
          :showRoundelBadge="showRoundelBadge"
          :showBadgeDisc="showBadgeDisc"
          :numberFill="numberFill"
          :collarFill="collarFill"
          :showButtonCollar="showButtonCollar"
          :socksHoops="socksHoops"
          :socksHoopsFill="socksHoopsFill"
          :socksText="socksText"
          :socksMaker="socksMaker"
          :socksRoundel="socksRoundel"
          :socksTextFill="socksTextFill"
          :shirtMakerFill="shirtMakerFill"
          :showLeafMaker="showLeafMaker"
          :highlight="highlight"
          :flash="flash"
          :revealing="revealing"
          :spinReels="spinReels"
          :landedReels="landedReels"
          :frozen="frozen"
          :paintColor="currentColor"
          v-on:paint="paintPart"
          v-on:hover="setSpotlight($event, highlight)"
        />
        </div>

        <transition name="badge">
          <button
            v-if="zoom !== 1"
            class="zoom-badge"
            type="button"
            title="Reset zoom"
            v-on:click="resetZoom"
          >{{ Math.round(zoom * 100) }}%</button>
        </transition>

        <!-- The arrows mean something else while the history is open, so
             the hint that says they randomize stands down. -->
        <p class="help" v-if="!browsingHistory">
          <kbd>Enter</kbd> <kbd>Space</kbd> <kbd>&larr;</kbd> <kbd>&rarr;</kbd>
          <span>to randomize</span>
        </p>

        <transition name="fade">
          <div v-if="browsingHistory" class="history" aria-live="polite">
            <!-- Season and type straight above the kit. One line is short
                 enough to sit in the gap over the shoulders, which is more
                 than can be said for the plate that used to be there. -->
            <p class="history-season">
              {{ historyKit.seasons }}
              <span>&middot;</span>
              {{ KIT_TYPE_LABELS[historyKit.type] || historyKit.type }}
            </p>

            <div class="history-plate">
              <p class="history-meta">
                {{ historyIndex + 1 }} of {{ KIT_HISTORY.length }}
              </p>
              <h2 class="history-name">{{ historyKit.name }}</h2>
              <p class="history-note" v-if="historyKit.note">{{ historyKit.note }}</p>
              <p class="history-caveat">As close as this app's parameters get.</p>

              <div class="history-actions">
                <button class="btn btn-primary" type="button" v-on:click="exitHistory(true)">
                  Design from this
                </button>
                <button class="btn btn-ghost" type="button" v-on:click="exitHistory(false)">
                  Back to mine
                </button>
              </div>
            </div>

            <!-- The arrows carry the kit they would step to, so stepping is
                 a choice rather than a guess. -->
            <button
              class="history-step prev"
              type="button"
              :title="`Previous: ${historyNeighbours.prev.name}`"
              :aria-label="`Previous kit: ${historyNeighbours.prev.name}`"
              v-on:click="stepHistory(-1)"
            >
              <KitThumb class="history-step-kit" :kit="historyNeighbours.prev.kit" />
              <span class="history-step-arrow">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </span>
            </button>

            <button
              class="history-step next"
              type="button"
              :title="`Next: ${historyNeighbours.next.name}`"
              :aria-label="`Next kit: ${historyNeighbours.next.name}`"
              v-on:click="stepHistory(1)"
            >
              <KitThumb class="history-step-kit" :kit="historyNeighbours.next.kit" />
              <span class="history-step-arrow">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </span>
            </button>
          </div>
        </transition>

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
            <button
              class="btn btn-primary"
              :class="{ 'is-pulling': spinning }"
              v-on:click="randomizeKit"
            >{{ spinning ? 'Spinning...' : 'Feeling Lucky' }}</button>
            <button class="btn btn-ghost" v-on:click="showColors = true">Colors</button>
          </div>
        </header>

        <!-- A name for the whole kit, so it sits above the palette rather
             than inside any one garment's section. It names the design and
             it names the file the design is saved as. -->
        <div class="kit-name">
          <label class="field-label" for="kit-name-input">Kit name</label>
          <input
            id="kit-name-input"
            class="kit-name-input"
            type="text"
            :maxlength="MAX_KIT_NAME"
            :value="kitName"
            placeholder="Untitled kit"
            autocomplete="off"
            v-on:input="setKitName($event.target.value)"
          />

          <button
            class="btn btn-ghost btn-block"
            type="button"
            v-on:click="openHistory"
          >Austin FC kits through the years</button>
        </div>

        <!-- The working palette, in reach without opening anything. Its
             picker adds straight to the palette rather than painting a part,
             which is why it carries no selection. -->
        <div class="palette-strip">
          <div class="palette-strip-head">
            <span class="field-label">Palette</span>
            <button type="button" class="palette-explore" v-on:click="showColors = true">
              Explore
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <ColorSwatches label="Palette" :colors="colors" v-model="currentColor" />

          <p class="palette-current">
            <span class="palette-current-chip" :style="{ backgroundColor: currentColor }"></span>
            <span>Click the kit to paint with <strong>{{ currentColor }}</strong></span>
          </p>
        </div>

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

            <ToolField label="Chest wordmark" part="sponsor">
              <div class="segmented" role="group" aria-label="Chest wordmark">
                <button
                  type="button"
                  :class="{ active: !austinWordmark }"
                  :aria-pressed="String(!austinWordmark)"
                  v-on:click="setAustinWordmark(false)"
                >YETI</button>
                <button
                  type="button"
                  :class="{ active: austinWordmark }"
                  :aria-pressed="String(austinWordmark)"
                  v-on:click="setAustinWordmark(true)"
                >AUSTIN</button>
              </div>
            </ToolField>

            <ToolField label="Sponsor color" part="sponsor">
              <ColorSwatches label="Sponsor color" :colors="colors" v-model="logoFill" />
            </ToolField>

            <ToolField label="Sponsor outline" part="sponsor">
              <div class="segmented" role="group" aria-label="Sponsor outline">
                <button
                  type="button"
                  :class="{ active: !logoStroke }"
                  :aria-pressed="String(!logoStroke)"
                  v-on:click="setLogoStroke(false)"
                >Off</button>
                <button
                  type="button"
                  :class="{ active: logoStroke }"
                  :aria-pressed="String(logoStroke)"
                  v-on:click="setLogoStroke(true)"
                >On</button>
              </div>
            </ToolField>

            <transition name="field-pop">
              <ToolField v-if="logoStroke" label="Outline color" part="sponsor">
                <ColorSwatches
                  label="Sponsor outline color"
                  :colors="colors"
                  v-model="logoStrokeFill"
                />
              </ToolField>
            </transition>

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

            <ToolField label="Brand mark" part="maker">
              <div class="segmented" role="group" aria-label="Brand mark">
                <button
                  type="button"
                  :class="{ active: !showLeafMaker }"
                  :aria-pressed="String(!showLeafMaker)"
                  v-on:click="setLeafMaker(false)"
                >Bars</button>
                <button
                  type="button"
                  :class="{ active: showLeafMaker }"
                  :aria-pressed="String(showLeafMaker)"
                  v-on:click="setLeafMaker(true)"
                >Leaves</button>
              </div>
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
            <ToolField label="Badge" part="badge">
              <div class="segmented" role="group" aria-label="Badge style">
                <button
                  type="button"
                  :class="{ active: !showRoundelBadge }"
                  :aria-pressed="String(!showRoundelBadge)"
                  v-on:click="setRoundelBadge(false)"
                >Crest</button>
                <button
                  type="button"
                  :class="{ active: showRoundelBadge }"
                  :aria-pressed="String(showRoundelBadge)"
                  v-on:click="setRoundelBadge(true)"
                >Roundel</button>
              </div>
            </ToolField>

            <transition name="field-pop">
              <ToolField v-if="showRoundelBadge" label="Disc" part="badge">
                <div class="segmented" role="group" aria-label="Roundel disc">
                  <button
                    type="button"
                    :class="{ active: !showBadgeDisc }"
                    :aria-pressed="String(!showBadgeDisc)"
                    v-on:click="setBadgeDisc(false)"
                  >None</button>
                  <button
                    type="button"
                    :class="{ active: showBadgeDisc }"
                    :aria-pressed="String(showBadgeDisc)"
                    v-on:click="setBadgeDisc(true)"
                  >Filled</button>
                </div>
              </ToolField>
            </transition>

            <!-- Two badges, two sets. Each field names the garment rather
                 than the badge, and lights the badge it belongs to on hover,
                 so which is which needs no explaining. -->
            <p class="field-group">On the shirt</p>

            <ToolField label="Badge color" part="badge">
              <ColorSwatches label="Shirt badge color" :colors="colors" v-model="badgeFill" />
            </ToolField>

            <transition name="field-pop">
              <ToolField
                v-if="!showRoundelBadge || showBadgeDisc"
                label="Text color"
                part="badge"
              >
                <ColorSwatches label="Shirt badge text color" :colors="colors" v-model="badgeTextFill" />
              </ToolField>
            </transition>

            <!-- Nothing to color when the roundel is printed straight onto
                 the cloth; the crest always has a backing. -->
            <transition name="field-pop">
              <ToolField
                v-if="!showRoundelBadge || showBadgeDisc"
                label="Background"
                part="badge"
              >
                <ColorSwatches label="Shirt badge background" :colors="colors" v-model="badgeBGFill" />
              </ToolField>
            </transition>

            <p class="field-group">On the shorts</p>

            <ToolField label="Badge color" part="shortsBadge">
              <ColorSwatches label="Shorts badge color" :colors="colors" v-model="shortsBadgeFill" />
            </ToolField>

            <transition name="field-pop">
              <ToolField
                v-if="!showRoundelBadge"
                label="Text color"
                part="shortsBadge"
              >
                <ColorSwatches label="Shorts badge text color" :colors="colors" v-model="shortsBadgeTextFill" />
              </ToolField>
            </transition>

            <transition name="field-pop">
              <ToolField
                v-if="!showRoundelBadge"
                label="Background"
                part="shortsBadge"
              >
                <ColorSwatches label="Shorts badge background" :colors="colors" v-model="shortsBadgeBGFill" />
              </ToolField>
            </transition>

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

            <ToolField label="Sock text" part="socksText">
              <!-- One pair of listeners around the field and its presets, so
                   that moving between them stays one visit as far as the kit
                   is concerned. -->
              <div
                class="sock-text"
                v-on:focusin="focusSocks"
                v-on:focusout="releaseSocksOnLeave"
              >
                <input
                  class="sock-text-input"
                  type="text"
                  :maxlength="MAX_SOCK_TEXT"
                  :value="socksText"
                  :placeholder="`Up to ${MAX_SOCK_TEXT} characters`"
                  aria-label="Sock text"
                  autocomplete="off"
                  spellcheck="false"
                  v-on:input="setSocksText($event.target.value)"
                />
                <div class="sock-text-presets">
                  <button
                    v-for="preset in SOCK_TEXT_PRESETS"
                    :key="preset"
                    type="button"
                    class="sock-text-preset"
                    :class="{ active: socksText === preset }"
                    v-on:click="setSocksText(preset)"
                  >{{ preset }}</button>
                  <button
                    type="button"
                    class="sock-text-preset"
                    :disabled="!socksText"
                    v-on:click="setSocksText('')"
                  >Clear</button>
                </div>
              </div>
            </ToolField>

            <!-- One slot at the ankle, two things that can sit in it. The
                 field above keeps whatever was typed, so switching back to
                 Text brings it with you. -->
            <ToolField label="At the ankle" part="socksText">
              <div class="segmented" role="group" aria-label="What sits at the ankle">
                <button
                  type="button"
                  :class="{ active: !socksRoundel }"
                  :aria-pressed="String(!socksRoundel)"
                  v-on:click="setSocksRoundel(false)"
                >Text</button>
                <button
                  type="button"
                  :class="{ active: socksRoundel }"
                  :aria-pressed="String(socksRoundel)"
                  v-on:click="setSocksRoundel(true)"
                >Tree</button>
              </div>
            </ToolField>

            <ToolField label="Sock mark" part="socksText">
              <div class="segmented" role="group" aria-label="Sock brand mark">
                <button
                  type="button"
                  :class="{ active: !socksMaker }"
                  :aria-pressed="String(!socksMaker)"
                  v-on:click="setSocksMaker(false)"
                >Off</button>
                <button
                  type="button"
                  :class="{ active: socksMaker }"
                  :aria-pressed="String(socksMaker)"
                  v-on:click="setSocksMaker(true)"
                >On</button>
              </div>
            </ToolField>

            <!-- One colour for everything printed on the sock, the mark as
                 well as the lettering, which is why it no longer hides when
                 there is nothing lettered. -->
            <ToolField label="Print color" part="socksText">
              <ColorSwatches label="Sock print color" :colors="colors" v-model="socksTextFill" />
            </ToolField>
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

      <transition name="panel">
        <ColorPanel
          v-if="showColors"
          :colors="colors"
          :used="usedColors"
          v-on:close="showColors = false"
          v-on:add="addColor"
          v-on:addMany="addColors"
          v-on:remove="removeColor"
          v-on:replace="usePalette"
          v-on:merge="mergePalette"
          v-on:reset="resetColors"
        />
      </transition>
    </div>

    <div class="mobile-actions show-on-mobile">
      <button
        class="btn btn-primary"
        :class="{ 'is-pulling': spinning }"
        v-on:click="randomizeKit"
      >{{ spinning ? 'Spinning...' : 'Feeling Lucky' }}</button>
      <button class="btn btn-ghost" v-on:click="showColors = true">Colors</button>
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
            <button class="btn btn-ghost" v-on:click="handleGreetingToManageColors">Explore colors</button>
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

  </main>
</template>

<script>
  import Kit from './components/Kit.vue';
  import AustinFCBadge from './components/AustinFCBadge.vue';
  import Stadium from './components/Stadium.vue';
  import Stars from './components/Stars.vue';
  import ColorSwatches from './components/ColorSwatches.vue';
  import ToolSection from './components/ToolSection.vue';
  import ToolField from './components/ToolField.vue';
  import ShirtThumb from './components/ShirtThumb.vue';
  import KitThumb from './components/KitThumb.vue';
  import ColorPanel from './components/ColorPanel.vue';
  import { computed } from 'vue';
  import { contrast, isValidColor, nearest, toHex } from './lib/colorTools.js';
  import { STAGE_NAMES, getBackdrop, toCssGradient } from './lib/stageBackdrops.js';
  import { kitToPngBlob, downloadBlob } from './lib/kitToPng.js';
  import { readKit, writeKit, PERSISTED_FIELDS } from './lib/kitStorage.js';
  import { MAX_SOCK_TEXT, SOCK_TEXT_PRESETS, normalizeSockText } from './lib/sockText.js';
  import { MAX_KIT_NAME, normalizeKitName, toKitSlug } from './lib/kitName.js';
  import { KIT_HISTORY, KIT_TYPE_LABELS } from './lib/kitHistory.js';

  const green ='#00B140';
  // The home shirt's stripes are tonal rather than contrasting: a deeper verde
  // on bright verde. Sampled off a photograph of the current kit, which reads
  // about #01A648 against #008A50 under studio light.
  const greenDeep = '#008A4B';
  const black = '#000000';
  const white = '#FFFFFF';

  const defaultColors = [
    black,
    green,
    greenDeep,
    white
  ];

  // How far the kit may be scaled, and the step a keypress moves it.
  //
  // The floor is the kit's natural size: it is already laid out to fit the
  // stage, so anything below 1 is just a smaller kit on a larger empty stage.
  // Zoom only ever grows it.
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 1.15;

  // Where to look when someone is lettering the socks, and how close.
  //
  // All of it as fractions of the kit rather than viewBox units, because
  // fractions are what the pan is derived from, and deriving rather than
  // reading a rect back is the point -- see the note in setPan.
  //
  // The socks run from 971 to 1276 of the 1307-unit viewBox: 23% of the kit
  // tall, with their middle 86% of the way down it. The zoom is worked out
  // from `fill` rather than fixed, because how close a given zoom is depends
  // on the height of the window, and a number that framed the socks on a
  // laptop put them off the bottom of a short one.
  const SOCK_FOCUS = {
    x: 0.5,
    y: 1123.5 / 1307,
    span: 305 / 1307,
    // How much of the stage the socks should stand, give or take what the pan
    // clamp allows once the kit runs out of overhang to drag into view.
    fill: 0.75
  };

  const ZOOM_IN_KEYS = ['+', '='];
  const ZOOM_OUT_KEYS = ['-', '_'];

  // How far a pointer may travel before a click stops counting as a click and
  // starts counting as a drag. Painting and panning share the same gesture,
  // and this is the whole of what tells them apart.
  const PAN_SLOP = 4;

  /**
   * Clamps a pan offset to the range that keeps the kit covering the stage.
   *
   * `lead` is the offset that lines the kit's top (or left) edge up with the
   * stage's; `trail` the one that lines up the bottom (or right). When the kit
   * is smaller than the stage the two cross over, which means there is no
   * overhang to drag into view and the only sensible offset is none.
   */
  function clampPan(value, lead, trail) {
    if (trail > lead) return 0;

    return Math.min(lead, Math.max(trail, value));
  }

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

  // How long the floodlights celebrate a saved kit. Matches goalBeat in
  // Stadium.vue, which is where the celebration itself lives.
  const GOAL_MS = 3400;

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
    logoStrokeFill: 'sponsor',
    collarFill: 'collar',
    badgeFill: 'badge',
    badgeTextFill: 'badge',
    badgeBGFill: 'badge',
    shortsBadgeFill: 'shortsBadge',
    shortsBadgeTextFill: 'shortsBadge',
    shortsBadgeBGFill: 'shortsBadge',
    shortsFill: 'shorts',
    shortsCuffsFill: 'shortsTrim',
    numberFill: 'number',
    socksFill: 'socks',
    socksCuffsFill: 'socksCuff',
    socksHoopsFill: 'socksHoops',
    socksTextFill: 'socksText'
  };

  // Reverse of FILL_PARTS: the fill a click on that part writes to. Several
  // colors share one part -- the badge has three -- and the first declared
  // wins, so painting the crest sets its main color while the other two stay
  // toolbar-only.
  const PART_MODELS = Object.entries(FILL_PARTS).reduce((models, [model, part]) => {
    if (!models[part]) models[part] = model;

    return models;
  }, {});

  // Two legibility bars, because not everything on a kit is doing the same
  // job. A tonal stripe is meant to be subtle; a squad number is meant to be
  // read from the stands.
  //
  // SEEN has to stay under the 1.55 that the home shirt's own tonal stripes
  // score, or the randomizer could never produce a tonal kit. READ is set
  // where a grey number on white shorts (1.61 -- it cleared the old single
  // bar, and still looked washed out) falls on the wrong side.
  const SEEN = 1.45;
  const READ = 2.4;

  // What sits on what. `on` is the color being judged, `over` is everything
  // behind it, dominant surface first.
  //
  // Order matters, but only in one direction: anything used as a background is
  // resolved before whatever sits on it, and no entry ever rewrites its own
  // background. That makes the pass single-shot -- the old hand-written guards
  // could undo one another, and were commented accordingly.
  //
  // shirtFill, shirtSleeveFill, shortsFill and socksFill are the grounds. They
  // are never adjusted; everything else is judged against them.
  // What a badge's device sits on, which depends on the badge. The crest
  // carries its own backing and the roundel can be given a disc, and in both
  // cases that is the ground. A roundel without a disc is printed straight
  // onto the cloth, so the cloth is what it has to stand off.
  //
  // Written as a function because it is the one thing in this table that is
  // not knowable until the kit is in hand. Every branch names fills that are
  // resolved before these entries run, so the pass stays single-shot.
  const badgeGround = (ground, cloth) => kit => (
    kit.showRoundelBadge && !kit.showBadgeDisc ? cloth : [ground]
  );

  // Fields the table reads to decide what sits on what, rather than fields it
  // judges or rewrites. A reel that rolls one of these will overwrite it on
  // the way past; this is for the ones no reel touches, which would otherwise
  // be missing from a rolled kit and read as false -- the pass would pick the
  // badge's colors for bare cloth while the kit on screen had a disc.
  const READ_BY_LEGIBILITY = ['showRoundelBadge', 'showBadgeDisc'];

  const LEGIBILITY = [
    { on: 'shirtTypeFill', over: ['shirtFill'] },
    { on: 'shirtSecondaryFill', over: ['shirtFill', 'shirtTypeFill'] },
    // `rescue` names a flag to switch on when the palette cannot make this
    // read at all. A two-color kit cannot carry a sponsor that clears both the
    // shirt and the stripes across it -- the only two candidates *are* the
    // shirt and the stripes -- and no choice of color gets round that. An
    // outline does: the letters keep the color that reads best against the
    // shirt, and the edge below separates them from everything else.
    { on: 'logoFill', over: ['shirtFill', 'shirtTypeFill'], min: READ, rescue: 'logoStroke' },
    // An outline the color of the letters it outlines is not an outline.
    // Judged against the sponsor itself rather than against the shirt,
    // because a halo in the shirt's own color is a real design and a common
    // one -- it is how a sponsor is lifted off a busy pattern -- so the only
    // thing worth guarding is that the edge can be told from what it edges.
    { on: 'logoStrokeFill', over: ['logoFill'] },
    { on: 'shirtMakerFill', over: ['shirtFill'], min: READ },
    { on: 'collarFill', over: ['shirtFill', 'shirtTypeFill'] },
    { on: 'shirtCuffFill', over: ['shirtSleeveFill'] },
    { on: 'numberFill', over: ['shortsFill'], min: READ },
    { on: 'shortsCuffsFill', over: ['shortsFill'] },
    { on: 'socksCuffsFill', over: ['socksFill'] },
    { on: 'socksHoopsFill', over: ['socksFill'] },
    // Lettering is meant to be read, not merely noticed, so it is held to the
    // same bar as the squad number rather than the one the hoops get.
    { on: 'socksTextFill', over: ['socksFill'], min: READ },
    // The crest is worn twice, on the shirt and on the shorts, so its backing
    // has to clear both. It is also the one thing the randomizer never
    // touches: without this the badge kept its default black backing while
    // the shirt randomized to black around it, and the crest disappeared.
    // Held to READ rather than SEEN, because a crest that merely differs from
    // the shirt is not the same as a crest that stands out from it.
    // Each badge against the garment it is actually worn over, and no other.
    // Holding one set of colors to the shirt, the stripes across it and the
    // shorts at once was arithmetic that often had no answer: a quarter of
    // rolled kits had a backing that could not clear all three, and the pass
    // fell back to whichever read best on the shirt.
    { on: 'badgeBGFill', over: ['shirtFill', 'shirtTypeFill'], min: READ },
    { on: 'badgeFill', over: badgeGround('badgeBGFill', ['shirtFill', 'shirtTypeFill']) },
    // Always against the ground: a badge with no ground has no lettering of
    // its own to judge, because the mark is then printed in one color.
    { on: 'badgeTextFill', over: ['badgeBGFill'], min: READ },

    { on: 'shortsBadgeBGFill', over: ['shortsFill'], min: READ },
    // Not badgeGround: the shorts roundel never takes a disc, so when the
    // roundel is the badge its tree sits on bare cloth whatever showBadgeDisc
    // says. Only the crest has a ground down here.
    { on: 'shortsBadgeFill', over: kit => kit.showRoundelBadge ? ['shortsFill'] : ['shortsBadgeBGFill'] },
    { on: 'shortsBadgeTextFill', over: ['shortsBadgeBGFill'], min: READ }
  ];

  /* ---- Slot machine ----------------------------------------------------- */

  // Cadence of a reel's colour changes: quick at the pull, slowing into the
  // stop. A constant cadence reads as a strobe rather than as deceleration,
  // and holds the whole kit at one flicker rate for a second and a half,
  // which is a good deal less pleasant to sit through than it sounds.
  const SPIN_TICK_MS = 90;
  const SPIN_TICK_SLOWEST = 280;

  // How long a landed reel keeps its clunk. Matches reelLand in Kit.vue.
  const LAND_MS = 420;

  /**
   * The reels, in the order they come to rest.
   *
   * `stop` is how long after the pull each one lands, in ms; the gaps widen so
   * that the last reel carries the anticipation. `key` doubles as the group it
   * blurs -- Kit.vue matches `.spin-<key> #<key>` -- so each one has to stay
   * the id of a group in the artwork.
   *
   * Between them the reels name every field a spin moves, and the outcome is
   * rolled from this same table: a new colour joins the spin by joining a reel
   * and nowhere else.
   */
  const REELS = [
    {
      key: 'shirt',
      stop: 560,
      // The pattern is the one reel symbol that is not a colour, so it turns
      // with the shirt rather than on a reel of its own.
      designs: true,
      fills: [
        'shirtFill',
        'shirtTypeFill',
        'shirtSecondaryFill',
        'shirtCuffFill',
        'shirtSleeveFill',
        'shirtMakerFill',
        'logoFill',
        'logoStrokeFill',
        'collarFill'
      ],
      // austinWordmark is deliberately absent. The reels turn over how a
      // kit looks; which word is across its chest is a thing somebody
      // chose, the same reason the sock lettering and the roundel's disc
      // are left alone. A kit that came back from a pull saying AUSTIN
      // would be the machine putting words in your mouth.
      toggles: ['showButtonCollar', 'logoStroke', 'showRoundelBadge', 'showLeafMaker']
    },
    {
      key: 'shorts',
      stop: 940,
      fills: ['shortsFill', 'shortsCuffsFill', 'numberFill'],
      toggles: []
    },
    {
      key: 'socks',
      stop: 1400,
      // socksText is not here on purpose. The reels roll colors and patterns;
      // the words on a sock are something somebody wrote, and a machine that
      // threw them away every time it was pulled would be a machine nobody
      // dared pull. The crest is left alone for the same reason.
      fills: ['socksFill', 'socksCuffsFill', 'socksHoopsFill', 'socksTextFill'],
      toggles: ['socksHoops', 'socksMaker']
    }
  ];

  // The spin is driven by timers, so the global reduced-motion rule in the
  // stylesheet -- which flattens every animation and transition -- cannot
  // reach it. Ask directly, and hand such a visitor the outcome without the
  // performance.
  function prefersReducedMotion() {
    return !!(window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  const shirtOptions = [
    'barcode',
    'stripes',
    'pinstripes',
    'center-stripe',
    'off-center-stripe',
    'shoulder-stripes',
    'hoops',
    'chest-band',
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
      Stars,
      ColorSwatches,
      ToolSection,
      ToolField,
      ShirtThumb,
      KitThumb,
      ColorPanel
    },
    // Every field would otherwise repeat the same pair of listeners. Handing
    // the setter down keeps that out of a template with twenty of them.
    provide() {
      return {
        spotlight: (part, key) => this.setSpotlight(part, key),
        // Every inline picker, in every field, feeds the one palette.
        addToPalette: color => this.addColor(color),
        // Touching a color anywhere makes it the current one, so the brush
        // holds whatever was last chosen.
        noteColor: color => { this.currentColor = color; },
        // Reactive, so a part lit by hovering the kit lights its field in the
        // toolbar too. A plain value would be read once and never update.
        spotlightState: computed(() => this.highlight)
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
        // whole kit. The reels and the reveal speak for it instead.
        suppressFlash: false,

        // Slot machine. `spinReels` holds the reels still turning and
        // `landedReels` the ones that landed a moment ago; Kit.vue reads both
        // as classes. `spinTarget` is the outcome, rolled and made legible
        // before the first reel turns -- the way a real machine does it, which
        // is also what keeps the legibility pass off the decoy colours.
        spinning: false,
        spinReels: [],
        landedReels: [],
        spinTarget: null,
        revealing: false,
        // Holds the kit still while the exporter reads its computed styles.
        frozen: false,
        // Set for a few seconds after a kit is saved: the floodlights go
        // verde and beat, the way they would for a goal.
        celebrating: false,

        showColors: false,

        // The brush: clicking a part of the kit paints it this color.
        currentColor: green,

        // How large the kit is drawn on the stage. A view preference, not part
        // of the design, so it is neither persisted nor exported.
        zoom: 1,
        // Eased only when something other than a gesture moves it; following a
        // pinch through a transition would feel like dragging treacle.
        zoomSmooth: false,
        // Where the zoomed kit has been dragged to, in screen pixels.
        panX: 0,
        panY: 0,
        // True once the current gesture has travelled far enough to be a drag,
        // which is what stops it also painting on release.
        panMoved: false,

        colors: null,

        openSection: 'shirt',

        exporting: false,

        shirtOptions,
        // The current Austin FC home shirt, as close as the parameters get:
        // tonal verde stripes, black sponsor and brand mark, black trim
        // standing in for the shoulder stripes and side panels the art has no
        // equivalent of.
        activeShirtOption: 'stripes',
        shirtFill: green,
        shirtTypeFill: greenDeep,
        shirtSecondaryFill: black,
        shirtCuffFill: black,
        shirtMakerFill: black,
        // The three bars unless asked otherwise: that is what the shirt the
        // app opens on wears.
        showLeafMaker: false,
        shirtSleeveFill: green,
        logoFill: black,
        // The current shirt carries no outline on its sponsor, so neither does
        // the kit this app opens on. The color is what it would be drawn in
        // the moment anyone turns it on.
        logoStroke: false,
        logoStrokeFill: white,
        // The traced YETI unless asked otherwise.
        austinWordmark: false,
        badgeFill: green,
        badgeTextFill: white,
        badgeBGFill: black,
        // The same crest on the shorts, until someone colors it otherwise.
        shortsBadgeFill: green,
        shortsBadgeTextFill: white,
        shortsBadgeBGFill: black,
        // The traced crest unless asked otherwise; it is what the kit wears.
        showRoundelBadge: false,
        // The roundel is printed onto the cloth, not onto a disc, until
        // somebody decides otherwise.
        showBadgeDisc: false,

        collarFill: black,
        showButtonCollar: false,

        shortsFill: black,
        shortsCuffsFill: green,

        socksFill: black,
        socksCuffsFill: green,
        socksHoops: false,
        socksHoopsFill: white,
        // Up to five characters printed on each sock. Empty is the default,
        // and empty means the lettering is not drawn at all.
        socksText: '',
        // The tree at the ankle instead of the lettering. The two share one
        // place on the sock, and the reels leave this alone for the same
        // reason they leave the lettering alone: both are things somebody
        // put there on purpose, and a pull that swapped one for the other
        // would be throwing away what was typed.
        socksRoundel: false,
        // The brand mark on the calf. On by default: a sock carries the
        // maker's mark whether or not anybody has lettered it.
        socksMaker: true,
        socksTextFill: white,

        // Which kit in the history is being looked at, or null for none. The
        // kit the browsing started from is held alongside it, because leaving
        // has to put back whatever was on the stage before.
        historyIndex: null,
        kitBeforeHistory: null,

        // The catalogue kit currently on the stage, and whether its name has
        // already been marked. A kit from the history that somebody has
        // since changed is no longer that kit, and the name should say so.
        historySource: null,
        historyAltered: false,

        // What this kit is called. Empty until somebody says otherwise, and
        // the reels leave it alone: a name is something a person wrote, the
        // same reason the sock text survives a spin.
        kitName: '',

        // Read by the template; they belong to lib/sockText.js and
        // lib/kitName.js.
        MAX_SOCK_TEXT,
        SOCK_TEXT_PRESETS,
        MAX_KIT_NAME,
        KIT_HISTORY,
        KIT_TYPE_LABELS,

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
      browsingHistory() {
        return this.historyIndex !== null;
      },
      historyKit() {
        return this.browsingHistory ? KIT_HISTORY[this.historyIndex] : null;
      },
      // What each arrow would step to, so the arrow can show it rather than
      // only point. Wraps, the way stepHistory does.
      historyNeighbours() {
        if (!this.browsingHistory) return null;

        const count = KIT_HISTORY.length;

        return {
          prev: KIT_HISTORY[(this.historyIndex - 1 + count) % count],
          next: KIT_HISTORY[(this.historyIndex + 1) % count]
        };
      },
      // The backdrop says whether it has stars; the screen and the exporter
      // both ask it rather than each naming the one sky that does.
      stageHasStars() {
        return !!getBackdrop(this.setting).stars;
      },
      // null is the solid shirt, so it rides along with the patterns and the
      // grid needs only one loop.
      designOptions() {
        return [null, ...this.shirtOptions];
      },
      // Which palette entries are actually painted on the kit, so the panel
      // can mark the rest as spare rather than leaving seventeen fills to be
      // eyeballed against the strip.
      usedColors() {
        return [...new Set(Object.keys(FILL_PARTS).map(model => this[model]))];
      }
    },
    watch: {
      colors(next) {
        // A club swap, a reset or a removal can retire the color the brush
        // was holding.
        if (next.length && !next.includes(this.currentColor)) {
          this.currentColor = next[0];
        }
      },
      persistedKit(kit) {
        // Decoy colours fly past ten a second mid-spin and not one of them is
        // a kit anybody designed. The settle writes the real one.
        if (this.spinning) return;

        writeKit(kit);
        this.markAlteredIfChanged();
      }
    },
    methods: {
      setZoom(next, smooth = false) {
        this.zoomSmooth = smooth;
        this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));

        // Zooming out shrinks how far the kit may be dragged, so a pan that
        // was legal a moment ago may now be off the end of its leash. Let the
        // new size settle first, then pull it back in.
        this.$nextTick(() => this.setPan(this.panX, this.panY));
      },
      /**
       * Move the zoomed kit, never further than its own overhang.
       *
       * Without the clamp the kit could be dragged off the stage entirely and
       * there would be no way to find it again short of resetting.
       *
       * `size` overrides the measurement of the kit. A pan that accompanies a
       * *smooth* zoom needs it: the eased transform means the rendered size
       * lags the zoom by the length of the transition, so a rect read in the
       * flush after setting it is still the old size, and the clamp computed
       * from it is the old kit's. Panning alone never needs it, because
       * panning does not change the size.
       */
      setPan(x, y, size = null) {
        const kit = this.$refs.kit && this.$refs.kit.$el;
        const stage = this.$refs.stage;

        if (!kit || !stage) return;

        const kitBox = size || kit.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        const padding = window.getComputedStyle(stage);
        const padTop = parseFloat(padding.paddingTop) || 0;
        const padBottom = parseFloat(padding.paddingBottom) || 0;
        const padLeft = parseFloat(padding.paddingLeft) || 0;
        const padRight = parseFloat(padding.paddingRight) || 0;

        // Where the kit sits with no pan applied: centred in the stage's
        // content box, which is not the centre of the stage. The padding is
        // asymmetric -- 28px at the top against 76px at the bottom, to clear
        // the download button -- so the kit rests above centre and has further
        // to travel down than up. Treating the overhang as evenly split left
        // the top of the shirt stranded off the top of the stage.
        //
        // Derived from the padding rather than read back out of the kit's
        // current rect. Several wheel events can land inside one frame, and
        // reading a rect Vue has not re-rendered yet while using the pan value
        // it has not applied yet made the bounds drift a little further every
        // call -- the pan ran away to five figures instead of clamping.
        // Width and height are safe to read: panning does not change them.
        const restLeft = stageBox.left + padLeft
          + (stageBox.width - padLeft - padRight) / 2 - kitBox.width / 2;
        const restTop = stageBox.top + padTop
          + (stageBox.height - padTop - padBottom) / 2 - kitBox.height / 2;

        this.panX = clampPan(
          x,
          stageBox.left - restLeft,
          stageBox.right - (restLeft + kitBox.width)
        );
        this.panY = clampPan(
          y,
          stageBox.top - restTop,
          stageBox.bottom - (restTop + kitBox.height)
        );
      },
      nudgeZoom(factor) {
        this.setZoom(this.zoom * factor, true);
      },
      resetZoom() {
        this.zoomSmooth = true;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
      },
      /**
       * Trackpad pinch and ctrl+wheel both arrive here; the browser reports a
       * pinch as a wheel event with ctrlKey set. Plain scrolling is left alone
       * so the page still scrolls on narrow screens, where the stage sits
       * above the whole toolbar.
       */
      onStageWheel(event) {
        if (event.ctrlKey) {
          event.preventDefault();
          // Exponential, so a given finger movement scales by the same ratio
          // whatever the zoom already is.
          this.setZoom(this.zoom * Math.exp(-event.deltaY * 0.01));

          return;
        }

        // Plain scrolling is left alone at natural size, so narrow screens --
        // where the stage sits above the whole toolbar -- still scroll the
        // page. Once zoomed there is something to scroll *within*.
        if (this.zoom === 1) return;

        event.preventDefault();
        this.zoomSmooth = false;
        this.setPan(this.panX - event.deltaX, this.panY - event.deltaY);
      },
      onStagePointerDown(event) {
        // Every gesture starts clean, so a pan that ended without a click
        // cannot swallow the next real one.
        this.panMoved = false;

        if (this.zoom === 1 || !event.isPrimary) return;

        this.panPointer = event.pointerId;
        this.panFrom = { x: event.clientX, y: event.clientY, panX: this.panX, panY: this.panY };
      },
      onStagePointerMove(event) {
        if (this.panFrom === null || this.panPointer !== event.pointerId) return;

        const dx = event.clientX - this.panFrom.x;
        const dy = event.clientY - this.panFrom.y;

        // Below the slop this is still a click on its way to painting a part.
        if (!this.panMoved && Math.hypot(dx, dy) < PAN_SLOP) return;

        this.panMoved = true;
        this.zoomSmooth = false;
        this.setPan(this.panFrom.panX + dx, this.panFrom.panY + dy);
      },
      onStagePointerUp(event) {
        if (this.panPointer !== event.pointerId) return;

        this.panPointer = null;
        this.panFrom = null;
        // panMoved deliberately survives until paintPart has seen it: the
        // click that ends a drag arrives after pointerup.
      },
      pinchSpan(touches) {
        const [a, b] = touches;

        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      },
      onStageTouchStart(event) {
        if (event.touches.length !== 2) return;

        this.pinchFrom = this.pinchSpan(event.touches);
        this.pinchZoom = this.zoom;
      },
      onStageTouchMove(event) {
        if (event.touches.length !== 2 || !this.pinchFrom) return;

        event.preventDefault();
        this.setZoom(this.pinchZoom * (this.pinchSpan(event.touches) / this.pinchFrom));
      },
      onStageTouchEnd(event) {
        // Lifting one finger ends the pinch; the other may still be panning.
        if (event.touches.length < 2) this.pinchFrom = 0;
      },
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
      // The single way a color enters the palette, whoever asked: a field's
      // inline picker, the strip, the panel's form, a harmony chip.
      addColor(color) {
        if (!color || !isValidColor(color)) return false;

        // Compare on resolved hex, so "red" and "#FF0000" cannot both land.
        const hex = toHex(color);

        if (this.colors.some(existing => toHex(existing) === hex)) return false;

        this.colors = [...this.colors, color];

        return true;
      },
      addColors(list) {
        const added = list.filter(color => this.addColor(color)).length;

        this.notify(
          added ? `Added ${added} color${added === 1 ? '' : 's'}.` : 'Already in your palette.',
          added ? null : undefined
        );
      },
      removeColor(color) {
        // The palette is what every field draws from; emptying it would leave
        // the kit with nothing to pick.
        if (this.colors.length <= 1) return;

        this.colors = this.colors.filter(item => item !== color);
      },
      /**
       * Swap the whole palette for a club's, and recolor the kit into it.
       *
       * Swapping the palette alone left the kit exactly as it was, which made
       * "use Dortmund's colors" a promise the screen did not keep. Each fill
       * moves to its nearest match in the new set rather than being
       * re-randomized, so the design survives the change of strip: whatever
       * was the light part stays the light part.
       */
      usePalette(colors, name) {
        this.colors = [...colors];

        this.suppressFlash = true;

        Object.keys(FILL_PARTS).forEach(model => {
          this[model] = nearest(this[model], colors);
        });

        this.enforceLegibility();

        // Seventeen fills just moved at once, which is what the reveal is for.
        // It also clears suppressFlash once the watchers have run.
        this.revealKit();
        this.notify(`${name}.`, `${colors.length} colors, kit recolored`);
      },
      /** Keep what is there and fold a club's colors in alongside. */
      mergePalette(colors, name) {
        const added = colors.filter(color => this.addColor(color)).length;

        this.notify(
          added ? `Added ${added} from ${name}.` : `${name} is already in your palette.`
        );
      },
      resetColors() {
        this.colors = [...defaultColors];
        this.resetBadge();
        this.notify('Back to Austin FC.', 'Verde, black, white');
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
      setRoundelBadge(pref) {
        this.showRoundelBadge = pref;
      },
      setBadgeDisc(pref) {
        this.showBadgeDisc = pref;
      },
      setLogoFill(fill) {
        this.logoFill = fill;
      },
      setCollarFill(fill) {
        this.collarFill = fill;
      },
      setLogoStroke(pref) {
        this.logoStroke = pref;
      },
      setAustinWordmark(pref) {
        this.austinWordmark = pref;
      },
      setShirtMakerFill(fill) {
        this.shirtMakerFill = fill;
      },
      setLeafMaker(pref) {
        this.showLeafMaker = pref;
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
      setSocksText(value) {
        this.socksText = normalizeSockText(value);
      },
      setSocksMaker(pref) {
        this.socksMaker = pref;
      },
      setSocksRoundel(pref) {
        this.socksRoundel = pref;
      },
      setKitName(value) {
        this.kitName = normalizeKitName(value);
      },
      /**
       * Step into the history, holding on to whatever was being designed.
       *
       * The snapshot is the persisted shape rather than a hand-written list,
       * so a field added to a kit later is a field that comes back out of
       * here too.
       */
      openHistory() {
        if (!KIT_HISTORY.length) return;

        this.kitBeforeHistory = { ...this.persistedKit };
        this.historyIndex = 0;
        this.showHistoryKit();
      },
      /** Wraps, because a catalogue you can walk off the end of is a list. */
      stepHistory(delta) {
        if (!this.browsingHistory) return;

        const count = KIT_HISTORY.length;

        this.historyIndex = (this.historyIndex + delta + count) % count;
        this.showHistoryKit();
      },
      showHistoryKit() {
        const entry = this.historyKit;

        if (!entry) return;

        // Twenty-odd fields move at once, which is what the reveal is for.
        this.suppressFlash = true;

        this.applyKit(entry.kit);
        this.kitName = normalizeKitName(entry.name);

        // What the kit looked like when it arrived, to tell later whether
        // anybody has touched it. Set after applying, so the watcher that
        // compares the two finds them identical on the way in.
        this.historySource = entry;
        this.historyAltered = false;

        this.revealKit();
      },
      /**
       * Put ALTERED on the name the first time a catalogue kit is changed.
       *
       * Compared field by field against the entry rather than tracked by
       * watching every control: there are thirty ways to change a kit, and
       * only one question worth asking -- is this still the kit it says it
       * is. Arrays are compared as text, which is enough for a palette.
       */
      markAlteredIfChanged() {
        if (!this.historySource || this.historyAltered) return;

        const source = this.historySource.kit;
        const changed = Object.keys(source).some(field => {
          const now = this[field];
          const then = source[field];

          return Array.isArray(then)
            ? JSON.stringify(now) !== JSON.stringify(then)
            : now !== then;
        });

        if (!changed) return;

        this.historyAltered = true;
        this.kitName = normalizeKitName(`${this.historySource.name} (ALTERED)`);
      },
      /**
       * Leave the history.
       *
       * `keep` is someone deciding to carry on designing from the kit they
       * are looking at; without it the kit they arrived with comes back.
       */
      exitHistory(keep = false) {
        if (!this.browsingHistory) return;

        const previous = this.kitBeforeHistory;

        this.historyIndex = null;
        this.kitBeforeHistory = null;

        // Carrying on from the kit on display keeps it as the thing any
        // later change is measured against. Going back to your own drops it:
        // your kit was never a catalogue kit to begin with.
        if (!keep) {
          this.historySource = null;
          this.historyAltered = false;
        }

        if (keep || !previous) return;

        this.suppressFlash = true;
        this.applyKit(previous);
        this.revealKit();
      },
      /**
       * Bring the socks up to fill the stage, for lettering them.
       *
       * Five characters are a few pixels tall at rest, which is no way to
       * judge what you are typing.
       */
      focusSocks() {
        // Where the view was before, so that leaving the field puts it back
        // rather than dumping someone at a zoom they never asked for. Only
        // taken on the way in: moving from the field to a preset and back
        // must not overwrite it with the zoomed-in view.
        const kit = this.$refs.kit && this.$refs.kit.$el;

        if (!kit) return;

        // Read before anything is set, and divided by the zoom already
        // applied: a rect is a rendered size, and what the pan below needs is
        // the kit's own. Reading it after setting the zoom is the mistake
        // setPan carries a paragraph about.
        const box = kit.getBoundingClientRect();
        const width = box.width / this.zoom;
        const height = box.height / this.zoom;
        const stageHeight = this.$refs.stage.getBoundingClientRect().height;
        const zoom = Math.min(
          MAX_ZOOM,
          Math.max(1, (stageHeight * SOCK_FOCUS.fill) / (height * SOCK_FOCUS.span))
        );

        if (!this.viewBeforeSockText) {
          this.viewBeforeSockText = {
            zoom: this.zoom,
            panX: this.panX,
            panY: this.panY,
            width,
            height
          };
        }

        this.setZoom(zoom, true);

        // A pan offset moves the kit under a fixed stage, so bringing a point
        // to the middle means moving it the other way by its own distance
        // from the middle, scaled.
        const panX = -(SOCK_FOCUS.x - 0.5) * width * zoom;
        const panY = -(SOCK_FOCUS.y - 0.5) * height * zoom;
        const zoomed = { width: width * zoom, height: height * zoom };

        // Deferred so it lands after the clamp setZoom queues for itself, and
        // handed the size the kit is on its way to rather than the one it is
        // still showing. Measured instead: the clamp decided the kit was
        // smaller than the stage, which means no overhang to pan into, and
        // put the socks straight back in the middle of the view.
        this.$nextTick(() => this.setPan(panX, panY, zoomed));
      },
      /** Put the view back, unless focus only moved within the control. */
      releaseSocksOnLeave(event) {
        if (event.currentTarget.contains(event.relatedTarget)) return;

        const view = this.viewBeforeSockText;

        this.viewBeforeSockText = null;

        if (!view) return;

        this.setZoom(view.zoom, true);
        this.$nextTick(() => this.setPan(
          view.panX,
          view.panY,
          { width: view.width * view.zoom, height: view.height * view.zoom }
        ));
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
      /**
       * Paint a part of the kit with the current color.
       *
       * No legibility guard here, unlike the randomizer: this is someone
       * deliberately putting a color somewhere, and second-guessing a direct
       * click would feel like the app arguing with them.
       */
      paintPart(part) {
        // The click that ends a drag lands on whatever was under the finger.
        // Dragging the kit around should not repaint it on the way past.
        if (this.panMoved) return;

        const model = PART_MODELS[part];

        if (!model || !this.currentColor || this[model] === this.currentColor) return;

        this[model] = this.currentColor;
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
      /**
       * Pull the lever: three reels spin and stop one at a time.
       *
       * The whole outcome is decided here, before anything turns, and the
       * reels only perform it. That is how the machine it is imitating works,
       * and it is also what keeps the kit honest: the legibility pass runs
       * once, on the kit that will still be there when the reels stop, rather
       * than chasing colours that are about to be thrown away.
       */
      randomizeKit() {
        // The exporter is reading computed styles off the live kit. Spinning
        // seventeen fills underneath it would bake a decoy into the PNG.
        if (this.exporting) return;

        // A second pull mid-spin slams the reels rather than queueing another
        // spin. Enter and Space are the headline shortcut and they get mashed;
        // sitting out a spin already running would read as a dropped keypress.
        if (this.spinning) {
          this.settleSpin();

          return;
        }

        // A pull from inside the history is a pull on the kit that was being
        // designed, not on the one being looked at.
        this.exitHistory(false);

        // Seventeen colors are about to move. Let the reels and the reveal
        // carry the change rather than flashing every part at once.
        this.suppressFlash = true;

        this.spinTarget = this.rollKit();

        // The backdrop turns over on the pull, not at the stop: its crossfade
        // is 800ms, so starting it with the last reel would land the new sky
        // well after the kit had settled in front of it.
        this.getSetting();

        if (prefersReducedMotion()) {
          this.finishSpin();

          return;
        }

        this.spinning = true;
        this.spinReels = REELS.map(reel => reel.key);
        this.spinStartedAt = performance.now();

        REELS.forEach((reel, index) => this.turnReel(index));
      },
      /**
       * Turn one reel until its stop time, then land it.
       *
       * Each tick schedules the next with a longer delay than its own, so the
       * reel slows into the stop. Timed off the clock rather than off a tick
       * count, because a backgrounded tab throttles timers: counting ticks
       * would leave all three reels still turning on the way back to it.
       */
      turnReel(index) {
        const reel = REELS[index];
        const left = reel.stop - (performance.now() - this.spinStartedAt);

        if (left <= 0) {
          this.landReel(index);

          return;
        }

        this.applyReel(reel, this.rollReel(reel));

        // Squared, so the slowing gathers in the last few ticks instead of
        // being spread evenly across the spin where it reads as nothing.
        const run = 1 - left / reel.stop;
        const delay = SPIN_TICK_MS + (SPIN_TICK_SLOWEST - SPIN_TICK_MS) * run * run;

        this.spinTimers.push(
          setTimeout(() => this.turnReel(index), Math.min(delay, left))
        );
      },
      /** A reel comes to rest on the value the pull already decided. */
      landReel(index) {
        const reel = REELS[index];

        this.applyReel(reel, this.spinTarget);

        this.spinReels = this.spinReels.filter(key => key !== reel.key);
        this.landedReels = [...this.landedReels, reel.key];

        // One timer for all three, reset by each landing. The clunk is a
        // one-shot animation that leaves nothing behind, so a reel holding the
        // class a little past its own landing looks no different.
        clearTimeout(this.landTimer);
        this.landTimer = setTimeout(() => { this.landedReels = []; }, LAND_MS);

        if (!this.spinReels.length) this.finishSpin();
      },
      /** Slam: everything still turning comes to rest at once. */
      settleSpin() {
        this.clearSpinTimers();

        REELS.forEach((reel, index) => {
          if (this.spinReels.includes(reel.key)) this.landReel(index);
        });
      },
      /**
       * The decided kit, now on screen in full.
       *
       * Applied whole rather than reel by reel, because the legibility pass
       * can move things no reel turns -- the crest above all, which is the one
       * thing a spin never rolls and the one thing that vanishes if it is left
       * black on a shirt that just came up black.
       */
      finishSpin() {
        this.clearSpinTimers();

        this.spinning = false;
        this.spinReels = [];

        this.applyKit(this.spinTarget);
        this.spinTarget = null;

        this.revealKit();
        this.backToTop();
      },
      clearSpinTimers() {
        this.spinTimers.forEach(timer => clearTimeout(timer));
        this.spinTimers = [];
      },
      /** Random values for one reel's fields, and nothing else's. */
      rollReel(reel) {
        const values = {};

        if (reel.designs) values.activeShirtOption = this.getRandomShirtDesign();

        reel.fills.forEach(model => { values[model] = this.getRandomColor(); });
        reel.toggles.forEach(model => { values[model] = this.getRandomTrueFalse(); });

        return values;
      },
      /**
       * Roll a whole kit: what the reels are going to land on.
       *
       * Starts from the kit on screen so that the legibility pass can judge
       * the parts a spin never moves against the ones it does, and so that
       * every fill the pass might rewrite has a value to rewrite.
       */
      rollKit() {
        const kit = {};

        Object.keys(FILL_PARTS).forEach(model => { kit[model] = this[model]; });
        READ_BY_LEGIBILITY.forEach(field => { kit[field] = this[field]; });

        REELS.forEach(reel => Object.assign(kit, this.rollReel(reel)));

        this.enforceLegibility(kit);

        return kit;
      },
      /** Write one reel's share of a rolled kit onto the live one. */
      applyReel(reel, values) {
        if (reel.designs && 'activeShirtOption' in values) {
          this.setShirtOption(values.activeShirtOption);
        }

        reel.fills.concat(reel.toggles).forEach(model => {
          if (model in values) this[model] = values[model];
        });
      },
      applyKit(kit) {
        Object.keys(kit).forEach(model => { this[model] = kit[model]; });
      },
      /**
       * Keep every element legible against whatever it sits on.
       *
       * Driven by the LEGIBILITY table rather than by a hand-written chain of
       * comparisons. The old version tested for exact equality, which let any
       * two merely-similar colors through -- a palette holding #000000 and
       * #111111 could put a sponsor on a shirt nobody could read -- and its
       * five rules each had to be ordered so they would not undo one another.
       *
       * This pass is single-shot: backgrounds are resolved before the things
       * that sit on them, and nothing rewrites its own background.
       *
       * Takes the kit to judge, which is the live component by default and a
       * rolled outcome during a spin -- a slot machine decides before it
       * performs, so the pass has to be able to run on a kit that is not on
       * screen yet.
       *
       * Shared by the randomizer and by a club palette swap. The swap moves
       * every fill to its nearest match in the new set, which collapses
       * distinct colors together -- a two-color palette turned a white sponsor
       * and a white shirt into the same yellow, and the sponsor vanished.
       */
      enforceLegibility(kit = this) {
        LEGIBILITY.forEach(({ on, over, min = SEEN, rescue }) => {
          const grounds = typeof over === 'function' ? over(kit) : over;
          const backgrounds = grounds.map(ground => kit[ground]);
          const worst = Math.min(
            ...backgrounds.map(background => contrast(kit[on], background))
          );

          if (worst >= min) return;

          const { color, settledFor } = this.mostLegibleAgainst(backgrounds, min);

          kit[on] = color;

          // Only ever switched on, and only when the palette left the pass
          // with nothing that reads. A rule that reads fine leaves the flag
          // where the designer -- or the reels -- last put it.
          if (rescue && settledFor) kit[rescue] = true;
        });
      },
      /**
       * The palette entry that holds up best against everything behind it.
       *
       * Anything clearing the bar is picked from at random, because this runs
       * inside the randomizer and a deterministic repair would make every
       * dark shirt reach for the same sponsor color.
       *
       * Returns `settledFor` alongside the color: true when nothing in the
       * palette cleared the bar and this is a compromise rather than an
       * answer. A rule carrying a `rescue` uses that to reach for something
       * other than color.
       */
      mostLegibleAgainst(backgrounds, min) {
        const scored = this.colors.map(color => ({
          color,
          // The weakest pairing is what decides whether it reads, so score on
          // that rather than on the average.
          worst: Math.min(...backgrounds.map(background => contrast(color, background))),
          // Every rule lists the dominant surface first, so this is the one
          // worth reading against when not everything can be satisfied.
          primary: contrast(color, backgrounds[0])
        }));

        const legible = scored.filter(entry => entry.worst >= min);

        if (legible.length) {
          return {
            color: legible[Math.floor(Math.random() * legible.length)].color,
            settledFor: false
          };
        }

        // Nothing clears every background. Sometimes that is a palette with no
        // contrast in it at all, but more often it is simple arithmetic: a
        // two-color kit cannot carry a sponsor that reads on both the shirt
        // and the stripes across it, because the only two candidates are the
        // shirt and the stripes. Fall back to whatever reads best against the
        // largest area behind it -- a black sponsor on a yellow shirt with
        // black stripes, rather than an arbitrary pick between the two.
        return {
          color: scored.reduce((best, entry) => (entry.primary > best.primary ? entry : best)).color,
          settledFor: true
        };
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

        if(randomizePref) {
          this.randomizeKit();
        }

        this.backToTop();
      },
      handleGreetingToManageColors() {
        this.showGreeting = false;
        this.showColors = true;
        this.backToTop();
      },
      /**
       * What the PNG is called.
       *
       * A named kit is saved under its name; an unnamed one falls back to
       * the design, which is what every kit was called before kits had names.
       * The date stays on either way: these are shared and compared, and two
       * downloads of the same design on different days should not land on
       * each other in a downloads folder.
       */
      kitFilename() {
        const slug = toKitSlug(this.kitName) || this.activeShirtOption || 'solid';
        const stamp = new Date().toISOString().slice(0, 10);

        return `austin-fc-kit-${slug}-${stamp}.png`;
      },
      async downloadKit() {
        if (this.exporting) return;

        // Reels in flight are wearing decoy colours, and the exporter reads
        // fills straight off them. Land the kit the pull already decided and
        // save that instead of whatever happened to be going past.
        if (this.spinning) this.settleSpin();

        this.exporting = true;

        // kitToPng.js reads computed styles straight off the live SVG, so a
        // capture taken mid-animation would bake in a half-interpolated fill
        // or a part still sliding into place. Settle the kit, then let the
        // browser apply that before the exporter looks.
        this.highlight = null;
        this.flash = null;
        this.revealing = false;
        this.frozen = true;

        // And put the lights back to normal first. They are not frozen the
        // way the kit is -- they are not part of it -- so saving twice inside
        // one celebration would otherwise catch the floodlights verde in the
        // second file and white in the first.
        clearTimeout(this.goalTimer);
        this.celebrating = false;

        try {
          await this.$nextTick();
          await new Promise(resolve => requestAnimationFrame(resolve));

          const filename = this.kitFilename();
          const blob = await kitToPngBlob(
            this.$refs.kit.$el,
            getBackdrop(this.setting),
            this.$refs.stadium.$el,
            this.stageHasStars,
            this.kitName
          );

          downloadBlob(blob, filename);
          this.notify('Kit saved.', filename);
          this.celebrateGoal();
        } catch (err) {
          this.notify('Export failed.', 'Give it another go?', 'warn');
          // Leave a trace for anyone debugging a browser-specific failure.
          console.error('[kit-export]', err);
        } finally {
          this.frozen = false;
          this.exporting = false;
        }
      },
      /**
       * Put the lights up for a saved kit.
       *
       * Called once the PNG exists, never before. The stadium is not frozen
       * for a capture the way the kit is, and both opacity and fill are
       * properties the exporter carries, so a celebration started a moment
       * earlier would end up in the file instead of on the screen.
       */
      celebrateGoal() {
        clearTimeout(this.goalTimer);
        this.celebrating = false;

        // Same restart trick as the flash and the reveal: a one-shot
        // animation only replays if the class is genuinely re-added, and
        // saving twice in a row should light the place up twice.
        this.$nextTick(() => {
          this.celebrating = true;

          this.goalTimer = setTimeout(() => {
            this.celebrating = false;
          }, GOAL_MS);
        });
      },
      dismissModal() {
        // The greeting sits on top of the panel, so it closes first, and the
        // history is behind both: it is the stage rather than a layer over it.
        if (this.showGreeting) {
          this.handleGreetingClose(false);
        } else if (this.showColors) {
          this.showColors = false;
        } else if (this.browsingHistory) {
          this.exitHistory(false);
        }
      },
      handleShortcut(e) {
        // Checked before the typing guard: Escape in the hex field should
        // still close the dialog.
        if (e.key === 'Escape') {
          this.dismissModal();
          return;
        }

        const el = e.target;
        const tag = el && el.tagName;

        // Never hijack typing. Checked before the zoom and randomize keys
        // alike, so "-" in the hex field stays a minus sign.
        if (el && el.isContentEditable) return;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        // A way in for anyone without a trackpad to pinch with.
        if (ZOOM_IN_KEYS.includes(e.key)) {
          this.nudgeZoom(ZOOM_STEP);
          return;
        }

        if (ZOOM_OUT_KEYS.includes(e.key)) {
          this.nudgeZoom(1 / ZOOM_STEP);
          return;
        }

        if (e.key === '0') {
          this.resetZoom();
          return;
        }

        // While the history is open the arrows walk it. Enter and Space are
        // left alone, so the buttons on the plate still work the way every
        // other button in the app does.
        if (this.browsingHistory) {
          if (e.key === 'ArrowLeft') {
            this.stepHistory(-1);

            return;
          }

          if (e.key === 'ArrowRight') {
            this.stepHistory(1);

            return;
          }
        }

        if (!RANDOMIZE_KEYS.includes(e.key)) return;

        // Enter and Space activate a focused button or link; let them, rather
        // than also randomizing. Arrow keys stay live everywhere, so the
        // headline shortcut still works right after clicking a swatch.
        const activates = e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';

        if (activates && (tag === 'BUTTON' || tag === 'A')) return;

        this.randomizeKit();
        this.showGreeting = false;
      },
      resetBadge() {
        this.badgeFill = green;
        this.badgeTextFill = white;
        this.badgeBGFill = black;
        this.shortsBadgeFill = green;
        this.shortsBadgeTextFill = white;
        this.shortsBadgeBGFill = black;
      }
    },
    created() {
      // One handle per reel still turning, cleared together at the stop.
      this.spinTimers = [];

      // Seventeen near-identical watchers, declared once. Each one tells the
      // kit which part just changed color so it can flash.
      Object.entries(FILL_PARTS).forEach(([model, part]) => {
        this.$watch(model, () => this.flashPart(part));
      });
    },
    mounted() {
      window.addEventListener('keyup', this.handleShortcut);

      // Bound by hand rather than in the template, because both have to be
      // non-passive: a passive listener may not preventDefault, and without
      // that a trackpad pinch zooms the whole browser page instead of the kit.
      const stage = this.$refs.stage;

      stage.addEventListener('wheel', this.onStageWheel, { passive: false });
      stage.addEventListener('touchstart', this.onStageTouchStart, { passive: false });
      stage.addEventListener('touchmove', this.onStageTouchMove, { passive: false });
      stage.addEventListener('touchend', this.onStageTouchEnd);
      stage.addEventListener('touchcancel', this.onStageTouchEnd);

      // Pointer events cover mouse and touch with one set of handlers. Move
      // and up go on the window so a drag that leaves the stage still tracks,
      // and still ends.
      stage.addEventListener('pointerdown', this.onStagePointerDown);
      window.addEventListener('pointermove', this.onStagePointerMove);
      window.addEventListener('pointerup', this.onStagePointerUp);
      window.addEventListener('pointercancel', this.onStagePointerUp);

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

      const stage = this.$refs.stage;

      if (stage) {
        stage.removeEventListener('wheel', this.onStageWheel);
        stage.removeEventListener('touchstart', this.onStageTouchStart);
        stage.removeEventListener('touchmove', this.onStageTouchMove);
        stage.removeEventListener('touchend', this.onStageTouchEnd);
        stage.removeEventListener('touchcancel', this.onStageTouchEnd);
        stage.removeEventListener('pointerdown', this.onStagePointerDown);
      }

      window.removeEventListener('pointermove', this.onStagePointerMove);
      window.removeEventListener('pointerup', this.onStagePointerUp);
      window.removeEventListener('pointercancel', this.onStagePointerUp);

      clearTimeout(this.toastTimer);
      clearTimeout(this.flashTimer);
      clearTimeout(this.revealTimer);
      clearTimeout(this.goalTimer);
      clearTimeout(this.landTimer);
      this.clearSpinTimers();
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

  .stage-stars {
    z-index: 1;
  }

  .stadium-stage {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 2;
    /* Pushed in 10% from the 1.1 it sat at, which crops the empty apron at
       the edges and brings the stands up behind the kit. */
    transform: scale(1.21);
    opacity: .34;
    /* Keep this in step with STADIUM_FILTER in kitToPng.js, which repaints
       the same composite onto the canvas; drift between them and the
       exported backdrop stops matching the one on screen. */
    filter: saturate(.7);
    pointer-events: none;
    /* Only ever changed by the celebration below. */
    transition: opacity .55s ease;
  }

  /* A goal lifts the whole place, not just the bulbs.
   *
   * The stadium sits at 34% so the kit stays the brightest thing on screen,
   * which is also the ceiling on how bright a verde bulb can get: at rest
   * they come out muted whatever colour they are given. For the few seconds
   * after a kit is saved it comes up to 46%, which is enough for the bulbs to
   * read as verde against the sky and still well short of the kit.
   *
   * kitToPng mirrors the resting 34% as STADIUM_OPACITY, and that stays true:
   * the celebration only ever starts once the PNG has been made, and a
   * capture puts the lights back first. */
  .stadium-stage.is-celebrating {
    opacity: .46;
  }

  /* Vignette: darkens the edges so the centered kit reads first. */
  .stage-scrim {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    background:
      radial-gradient(ellipse 70% 60% at 38% 45%, transparent 0%, rgba(4, 6, 5, .55) 100%),
      linear-gradient(to top, rgba(4, 6, 5, .5) 0%, transparent 32%);
  }

  /* ---- Shell ----------------------------------------------------------- */

  #app {
    position: relative;
    z-index: 4;
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

  /* Fills the stage so the kit's max-height:100% still has something definite
     to resolve against once it is no longer the flex item itself. */
  .kit-zoom {
    display: flex;
    flex: 1;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    will-change: transform;
  }

  .kit-zoom.smooth {
    transition: transform .26s cubic-bezier(.33, 1, .68, 1);
  }

  /* Once zoomed, the stage owns the gesture: without this the browser pans
     and rubber-bands the page itself and the drag never reaches us. */
  #kit-stage.is-zoomed {
    touch-action: none;
    cursor: grab;
  }

  #kit-stage.is-panning,
  #kit-stage.is-panning .kit-zoom [data-part] {
    cursor: grabbing;
  }

  /* Only there once the kit is off its natural size, and it is the way back. */
  /* Top-left rather than centred: at any real zoom the kit fills the middle
     of the stage, and a pill sitting on the shirt is in the way of the thing
     it is reporting on. */
  .zoom-badge {
    position: absolute;
    top: 22px;
    left: 28px;
    z-index: 5;
    padding: 7px 14px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background-color: rgba(10, 13, 11, .66);
    backdrop-filter: blur(12px);
    color: var(--text-dim);
    font-family: var(--font-ui);
    font-size: .7rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: .04em;
    cursor: pointer;
    transition: color .18s ease, border-color .18s ease;
  }

  .zoom-badge:hover {
    border-color: var(--verde);
    color: var(--text);
  }

  .zoom-badge:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 3px;
  }

  .badge-enter-active,
  .badge-leave-active {
    transition: opacity .22s ease, transform .28s cubic-bezier(.33, 1, .68, 1);
  }

  .badge-enter-from,
  .badge-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .kit-display {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    filter: drop-shadow(0 24px 48px rgba(0, 0, 0, .45));
    animation: floatABit 6s infinite ease-in-out;
  }

  /* Holds still under the pointer, because an eight-pixel drift is the
     difference between clicking a cuff and clicking the sleeve beside it.
     
     Paused rather than removed: `animation: none` would snap the kit back
     to the top of the cycle, so the shirt would jump the instant the pointer
     reached it. Paused leaves it exactly where it was and it resumes from
     there when the pointer goes. */
  .kit-display:hover {
    animation-play-state: paused;
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

  /* ---- Palette strip --------------------------------------------------- */

  .palette-strip {
    display: grid;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    background-color: rgba(255, 255, 255, .017);
  }

  .palette-strip-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .palette-strip .field-label {
    margin-bottom: 0;
  }

  .palette-explore {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--verde);
    font-family: var(--font-ui);
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .18s ease;
  }

  .palette-explore:hover { color: var(--verde-bright); }

  .palette-explore svg {
    width: 12px;
    height: 12px;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    transition: transform .2s cubic-bezier(.33, 1, .68, 1);
  }

  .palette-explore:hover svg { transform: translateX(2px); }

  .palette-explore:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 3px;
  }

  /* Says what the brush is holding and what to do with it. The kit gives no
     other clue that it can be clicked until the pointer is already over it. */
  .palette-current {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    color: var(--text-faint);
    font-size: .7rem;
    line-height: 1.4;
  }

  .palette-current-chip {
    flex: 0 0 auto;
    width: 13px;
    height: 13px;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    transition: background-color .3s cubic-bezier(.33, 1, .68, 1);
  }

  .palette-current strong {
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  /* ---- Colors panel ---------------------------------------------------- */

  .panel-enter-active,
  .panel-leave-active {
    transition: transform .34s cubic-bezier(.33, 1, .68, 1), opacity .26s ease;
  }

  .panel-enter-from,
  .panel-leave-to {
    opacity: 0;
    transform: translateX(100%);
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

  /* ---- Kit history ----------------------------------------------------- */

  /* The plate and the arrows sit over the stage rather than in a panel: the
     kit itself is the exhibit, and a grid of thumbnails would have meant
     drawing fifteen kits at once to show what one kit looks like. */
  .history {
    position: absolute;
    inset: 0;
    z-index: 6;
    /* Only the controls take clicks; the kit underneath stays paintable. */
    pointer-events: none;
  }

  /* Bottom left, not above the kit.
     
     Centred at the top is where a museum label belongs and the one place it
     cannot go: the kit stands about 370px tall in a 460px stage, so a plate
     of any useful size lands on the shirt, which is the one thing a gallery
     of shirts must not cover. The corners are the only empty stage there is,
     and the download button has the other one. */
  .history-plate {
    position: absolute;
    bottom: 22px;
    left: 22px;
    width: min(330px, calc(100% - 200px));
    padding: 14px 16px 16px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-lg);
    background-color: rgba(16, 20, 18, .93);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, .5);
    pointer-events: auto;
  }

  .history-meta {
    margin: 0 0 6px;
    color: var(--text-faint);
    font-size: .62rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .history-meta span {
    color: var(--line-strong);
  }

  .history-name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 400;
    letter-spacing: .01em;
    color: var(--text);
  }

  .history-note {
    margin: 8px 0 0;
    color: var(--text-dim);
    font-size: .76rem;
    line-height: 1.45;
  }

  /* Stated on every kit rather than once in a corner, because every kit is
     an approximation and the one you are looking at is the one it is about. */
  .history-caveat {
    margin: 6px 0 0;
    color: var(--text-faint);
    font-size: .68rem;
    font-style: italic;
  }

  .history-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }

  .history-actions .btn {
    flex: 1;
  }

  /* Season and type, centred over the shoulders.
     
     At 20px it sat six pixels into the top of the sleeves; the stage's own
     28px of padding is the only clear air there is, so this sits in it. */
  .history-season {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: 6px 14px;
    border-radius: 999px;
    background-color: rgba(16, 20, 18, .82);
    backdrop-filter: blur(10px);
    color: var(--text);
    font-size: .64rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .history-season span {
    color: var(--text-faint);
  }

  /* Flanking the kit, vertically centred on the stage rather than on the kit:
     #kit-stage carries 76px of padding at the foot to clear the download
     button, so the kit rests above centre and arrows pinned to it would sit
     high. */
  .history-step {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 78px;
    padding: 8px 8px 6px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-lg);
    background-color: rgba(16, 20, 18, .9);
    backdrop-filter: blur(10px);
    color: var(--text);
    cursor: pointer;
    pointer-events: auto;
    transition: background-color .18s ease, border-color .18s ease,
                transform .18s cubic-bezier(.33, 1, .68, 1);
  }

  .history-step.prev { left: 20px; }
  .history-step.next { right: 20px; }

  /* The kit on the button, kept pale until the button is wanted: it is a
     label for where the arrow goes, not a second exhibit competing with the
     one on the stage. */
  .history-step-kit {
    width: 54px;
    opacity: .72;
    transition: opacity .18s ease;
  }

  .history-step:hover .history-step-kit {
    opacity: 1;
  }

  .history-step-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
  }

  /* Above the plate, so the two never meet on a narrow stage. */
  @media (max-height: 620px) {
    .history-step { top: 38%; }
  }

  .history-step:hover {
    border-color: var(--verde);
    background-color: rgba(0, 177, 64, .18);
  }

  .history-step:active {
    transform: translateY(-50%) scale(.94);
    transition-duration: .06s;
  }

  .history-step:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 2px;
  }

  .history-step-arrow svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ---- Kit name -------------------------------------------------------- */

  .kit-name {
    display: grid;
    gap: 7px;
    padding: 16px 20px 0;
  }

  .kit-name-input {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .86rem;
    font-weight: 600;
  }

  .kit-name-input::placeholder {
    color: var(--text-faint);
    font-weight: 400;
  }

  .kit-name-input:focus {
    border-color: var(--verde);
    outline: none;
  }

  /* ---- Sock text ------------------------------------------------------- */

  .sock-text {
    display: grid;
    gap: 7px;
  }

  .sock-text-input {
    width: 100%;
    min-width: 0;
    padding: 9px 11px;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: .8rem;
    font-weight: 600;
    /* The kit letters in capitals whatever is typed, so the field says so
       before the socks do. */
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .sock-text-input::placeholder {
    letter-spacing: normal;
    text-transform: none;
    color: var(--text-faint);
    font-weight: 400;
  }

  .sock-text-input:focus {
    border-color: var(--verde);
    outline: none;
  }

  .sock-text-presets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background-color: var(--bg-sunken);
  }

  .sock-text-preset {
    padding: 8px 4px;
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

  .sock-text-preset:hover:not(:disabled) {
    color: var(--text);
  }

  .sock-text-preset.active {
    background-color: var(--verde);
    color: var(--verde-ink);
    font-weight: 700;
    animation: segmentPick .3s cubic-bezier(.33, 1, .68, 1);
  }

  .sock-text-preset:disabled {
    color: var(--text-faint);
    cursor: default;
  }

  .sock-text-preset:focus-visible {
    outline: 2px solid var(--verde-bright);
    outline-offset: 2px;
  }

  /* Names the garment a run of fields belongs to. Quieter than a field
     label, because it labels labels. */
  .field-group {
    margin: 4px 0 -2px;
    color: var(--text-faint);
    font-size: .62rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
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

  /* The lever reads on the button as well as on the kit, so a spin started
     from the keyboard still has something to look at, and a second press --
     which slams the reels rather than starting again -- has something to aim
     at. Both buttons stand in a flex row that splits the width evenly, so the
     shorter label cannot shift the one beside it. */
  .btn-primary.is-pulling {
    animation: pullPulse .42s ease-in-out infinite alternate;
  }

  @keyframes pullPulse {
    from { background-color: var(--verde); }
    to { background-color: var(--verde-bright); }
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


  /* ---- Toast ----------------------------------------------------------- */

  .toast {
    position: fixed;
    /* Top, because the bottom of the screen is crowded: the help pill, the
       download button and, on a narrow screen, the whole action bar all sit
       down there, and a message that lands among them is a message nobody
       reads. Nothing but the zoom badge is up here, and that is off to the
       left. */
    top: 24px;
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

  /* Keeps the -50% that centers the pill; only the vertical part moves, and
     it moves upward now, so the message drops in from off the top edge
     rather than rising out of the furniture along the bottom. */
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -16px) scale(.96);
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
      transform: scale(1.87);
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
      top: 16px;
      /* The stage is the full width here, so a long message has to be
         allowed to wrap rather than run off the edge of it. */
      max-width: calc(100% - 32px);
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

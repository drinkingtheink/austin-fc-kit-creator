<template>
  <main v-on:keyup.enter="captureEnter" :class="setting">
    <section class="mobile-welcome show-on-mobile">
      <p>This app is better experienced on a tablet/desktop, but I hope you still have fun.</p>
    </section>

    <transition name="fade">
      <section class="greeting" v-show="showGreeting">
        <div class="greeting-main">
          <h2>The Future Looks Bright Verde</h2>
          <p>Do you have a sharp eye for design and a love of our city's great football club? This retro-esque tool allows you to design a kit by choosing your own selections from the toolbar or randomize it and start from there <span class="not-mobile">(hit <strong>Enter</strong>, <strong>Space Bar</strong> or <strong>Directional Arrows</strong> at any time to randomize as well)</span>. Either way, hope you have fun and let's GROW THE LEGEND!</p>

          <p>Be sure to take screenshots of your favorite designs and post them with <strong>#AustinFCKitCreator</strong></p>

          <button v-on:click="handleGreetingClose(false)">Start From Here</button>
          <button v-on:click="handleGreetingClose(true)">Randomize Kit</button>
          <button v-on:click="handleGreetingToManageColors">Manage Colors</button>
        </div>
      </section>
    </transition>

    <transition name="fade">
      <section class="greeting" v-show="showWelcomeBack">
        <div class="greeting-main">
          <h2>Welcome Back!</h2>

          <p>Be sure to take screenshots of your favorite designs and post them with <strong>#AustinFCKitCreator</strong></p>
        </div>
      </section>
    </transition>

    <transition name="fade">
      <section class="color-mgmt greeting" v-show="manageColors">
        <div class="greeting-main">
          <h2>Manage Colors</h2>
          <p>Add or Remove Your Own Colors (<a href="https://htmlcolorcodes.com/color-chart/" target="_blank">hex values</a> or <a href="https://www.rapidtables.com/web/color/html-color-codes.html" target="_blank">named colors</a> only)</p>

          <section class="color-select color-display">
            <span 
              v-for="color in colors" 
              class="color-option"
              :style="{ backgroundColor: color }"
              :key="color"
            >
              <button v-on:click="removeColor(color)">X</button>
            </span>
            <button 
              class="add-color-option"
              v-on:click="addColor(colorToAdd)"
              :style="{ backgroundColor: colorToAdd }"
            >
              ADD
            </button>
            <input 
              class="color-to-add"
              type="text" 
              placeholder="Add a Hex Value w/ #"
              v-model="colorToAdd"
              v-on:keyup.enter="addColor(colorToAdd)"
              v-bind:style="{ borderColor: `${colorToAddBorderColor}` }"
            />

            <div class="color-picker">
              <label for="colorPicker" class="color-picker-label">Choose a color:</label>
              <input 
                id="colorPicker" 
                type="color" 
                :value="brightVerde"
                v-on:input="updateActiveColor"
                class="color-picker-input"
              />
            </div>
          </section>

          <button v-on:click="handleGreetingClose(false)">Go From Here</button>
          <button v-on:click="resetColors">Reset Colors</button>
          <button v-on:click="handleGreetingClose(true)">Randomize Kit</button>
        </div>
      </section>
    </transition>

    <div id="app">
      <section class="mob-randomize">
        <button 
          v-on:click="randomizeKit" 
          class="mob-randomize-random"
          v-show="!showGreeting && !manageColors"
        >Randomize Design</button>

        <button 
          v-on:click="handleGreetingToManageColors"
          class="mob-randomize-color"
          v-show="!showGreeting && !manageColors"
        >Manage Colors</button>
      </section>

      <section id="kit-stage">
        <Kit 
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
      </section>

      <section id="toolbar">
        <header>
          <a href="https://austinfc.com/" target="_blank">
            <AustinFCBadge class="toolbar-badge" />
          </a>
          <h2>Create Your Kit</h2>
          <p class="hashtag">Be sure to take screenshots of your favorite designs and post them with <strong>#AustinFCKitCreator</strong></p>
          
          <button v-on:click="randomizeKit">Feeling Lucky</button>
          <button v-on:click="manageColorWindow(true)" class="manage-colors-action-create-header">Manage Colors</button>
        </header>

        <h3>Shirt</h3>
        <h4>Primary Color</h4>
          <section class="color-select">
            <button 
              v-for="color in colors" 
              class="color-option"
              :class="{ active: color === shirtFill }"
              :style="{ backgroundColor: color }"
              v-on:click="setShirtFill(color)"
              :key="color"
            >
            </button>
          </section>

        <h4>Design</h4>
        <section class="shirt-type-selection">
          <button 
            v-on:click="clearShirtOption()"
            :class="{ active: !activeShirtOption }"
          >Solid</button>
          <button 
            v-for="option in shirtOptions"
            v-on:click="setShirtOption(option)"
            :class="{ active: option === activeShirtOption }"
            :key="option"
          >
            {{ option }}
          </button>
        </section>

        <h4>Design Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shirtTypeFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShirtTypeFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Secondary Color</h4>
          <section class="color-select">
            <button 
              v-for="color in colors" 
              class="color-option"
              :class="{ active: color === shirtSecondaryFill }"
              :style="{ backgroundColor: color }"
              v-on:click="setShirtSecondaryFill(color)"
              :key="color"
            >
            </button>
          </section>

        <h4>Sponsor Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === logoFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setLogoFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Collar Type</h4>
        <button 
          class="toggle active"
          v-if="showButtonCollar"
          v-on:click="setCollarButton(false)"
        >No Button Collar</button>

        <button 
          class="toggle"
          v-else
          v-on:click="setCollarButton(true)"
        >Button Collar</button>
        
        <h4>Collar Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === collarFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setCollarFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Shirt Brand Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shirtMakerFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShirtMakerFill(color)"
            :key="color" 
          >
          </button>
        </section>
        
        <h4>Sleeve Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shirtSleeveFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShirtSleeveFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Cuff Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shirtCuffFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShirtCuffFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h3>Badge</h3>
        <h4>Badge Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === badgeFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setBadgeFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Badge Text Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === badgeTextFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setBadgeTextFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Badge BG Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === badgeBGFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setBadgeBGFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h3>Shorts</h3>
        <h4>Primary Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shortsFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShortsFill(color)"
            :key="color" 
          >
          </button>
        </section>
        
        <h4>Trim Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === shortsCuffsFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setShortsCuffsFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Number Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === numberFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setNumberFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h3>Socks</h3>
        <h4>Primary Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === socksFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setSocksFill(color)"
            :key="color" 
          >
          </button>
        </section>
        
        <h4>Top Color</h4>
        <section class="color-select">
          <button 
            v-for="color in colors" 
            class="color-option"
            :class="{ active: color === socksCuffsFill }"
            :style="{ backgroundColor: color }"
            v-on:click="setSocksCuffsFill(color)"
            :key="color" 
          >
          </button>
        </section>

        <h4>Sock Hoops</h4>
        <button 
          class="toggle active"
          v-if="socksHoops"
          v-on:click="setSocksHoops(false)"
        >Hide Hoops</button>

        <button 
          class="toggle"
          v-else
          v-on:click="setSocksHoops(true)"
        >Hoop Them</button>

        <section class="hoops-color">
          <h4>Hoops Color</h4>
          <section class="color-select">
            <button 
              v-for="color in colors"
              class="color-option"
              :class="{ active: color === socksFill }"
              :style="{ backgroundColor: color }"
              v-on:click="setSocksHoopsFill(color)"
              :key="color" 
            >
            </button>
          </section>
        </section>

        <p class="attribution">Austin FC owns all rights to the Austin FC Badge and any other intellectual property under their purview. I am merely a huge supporter.</p>

        <a href="https://github.com/drinkingtheink/austin-fc-kit-creator" class="block-link" target="_blank">About this Project</a>
        <a href="http://drinkingtheink.com/" class="block-link" target="_blank">About the Author</a>
      </section>
    </div>

    <section class="help">
      <p>Hit <strong>Enter</strong>, <strong>Space Bar</strong> or <strong>Directional Arrows</strong> at any time to randomize kit</p>
    </section>

    <Stadium class="stadium-stage" />
  </main>
</template>

<script>
  import Kit from './components/Kit.vue';
  import AustinFCBadge from './components/AustinFCBadge.vue';
  import Stadium from './components/Stadium.vue';

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
      Stadium
    },
    data() {
      return {
        setting: null,
        showGreeting: false,

        showWelcomeBack: false,
        
        manageColors: false,
        colorToAdd: null,

        colors: null,

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
      showWelcomeBack() {
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
        const settings = [
          'one',
          'two',
          'three',
          'four'
        ];

        let randomSetting = settings[Math.floor(Math.random()*settings.length)];;

        this.setting = randomSetting;
      },
      addColor(color) {
        if(this.colorToAdd) {
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

        if(this.collarFill === (this.shirtFill || this.shirtTypeFill)) {
          this.setCollarFill(this.getRandomColor);
        }

        if(this.logoFill === this.shirtFill) {
          this.setLogoFill(this.getRandomColor);
        }

        if(this.numberFill === this.shortsFill) {
          this.setNumberFill(this.getRandomColor);
        }

        if(this.logoFill === this.shirtTypeFill) {
          this.setShirtTypeFill(this.getRandomColor);
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
      resetBadge() {
        this.badgeFill = green;
        this.badgeTextFill = white;
        this.badgeBGFill = black;
      }
    },
    created() {
      window.addEventListener('keyup', (e) => {
        if (e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 32 || e.keyCode == 40) {
          this.randomizeKit();
          this.showGreeting = false;
          this.manageColors = false;
        }
      });
    },
    mounted() {
      this.colors = defaultColors;
      this.getSetting();

      let hasVisited = localStorage.getItem('visitedAustinFCKitDesigner');
      
      if (!hasVisited) {
        setTimeout(() => {
          this.showGreeting = true;
        }, 1000);
      } else {
        this.showWelcomeBack = true;
      }
    }
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bungee+Inline&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Cairo&display=swap');

  @keyframes floatABit {
    10% { transform: translateY(-0.5px); }
    80% { transform: translateY(0.5px); }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  html,
  body {
    padding: 0;
    margin: 0;
    font-size: 12pt;
    font-family: 'Bungee Inline', cursive;
  }

  .one {
    background: rgb(131,58,180);
    background: linear-gradient(38deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);
  }

  .two {
    background-color: #FFE53B;
    background-image: linear-gradient(147deg, #FFE53B 0%, #FF2525 74%);
  }

  .three {
    background-color: #A9C9FF;
    background-image: linear-gradient(180deg, #A9C9FF 0%, #FFBBEC 100%);
  }

  .four {
    background-color: rgba(255,85,85,1);
    background-image: linear-gradient( 90.1deg,  rgba(255,85,85,1) 0.1%, rgba(85,85,255,1) 100% );
  }

  body {
    overflow: hidden;
  }

  * {
    transition: all .2s;
  }

  span,
  p,
  li {
    font-family: 'Cairo', sans-serif;
  }

  a {
    text-decoration: none;
    color: #F4D03F;
    opacity: .8;
  }

  a:hover {
    text-decoration: none;
    opacity: 1;
  }

  a.block-link {
    display: block;
    margin-bottom: 1em;
    text-align: center;
  }

  h3 {
    padding: .25em .25em .25em 1em;
    margin-left: -1em;
    background-color: #00B140;
    color: black;
  }

  button {
    text-transform: uppercase;
    margin: 0 .25rem .25rem 0;
    padding: .5em 1em;
    outline: 0;
    border: none;
    padding: none;
    border-radius: 4px;
    background-color: #CCC;
  }

  button:hover {
    background-color: white;
    cursor: pointer;
    color: #00B140;
  }

  button.active {
    background-color: #00B140;
    color: white;
  }

  main {
    position: relative;
  }

  .greeting {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 10;
  }

  .greeting-main {
    padding: 2em;
    margin: 1em auto 0 auto;
    max-width: 65%;
    background-color: #000000;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='72' viewBox='0 0 36 72'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23333333' fill-opacity='0.81'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    color: white;
    position: static;
    z-index: 100;
  }

  @media screen and (max-height: 600px) {
    .greeting-main {
      margin: 0 auto;
      padding: 0;
    }
  }

  .greeting-main h2 {
    color: #00B140;
    font-size: 240%;
    margin: 0 0 .5rem 0;
  }

  .greeting-main p {
    font-size: 1.25em;
  }

  .greeting-main button {
    background-color: #00B140;
    color: black;
    font-size: 1.25em;
  }

  .greeting-main button:hover {
    color: white;
  }

  #app {
    display: flex;
    height: 100vh;
    overflow: hidden;
    position: static;
    z-index: 2;
  }

  #toolbar {
    width: 30vw;
    min-height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    overflow: auto;
    padding: 1em 0 5em 1em;
    position: static;
    z-index: 2;
  }

  #toolbar header {
    text-align: center;
  }

  #toolbar header h2 {
    margin: 0;
    padding: 0;
  }

  #toolbar h4 {
    margin: .5em 0 .25em 0;
    color: #ccc;
  }

  #toolbar header .toolbar-badge {
    transition: all .2s;
    width: 2.5em;
  }

  #toolbar p {
    line-height: 1.2;
  }

  .toolbar-badge:hover {
    transform: scale(1.3);
  }

  #kit-stage {
    width: 100%;
    display: flex;
    justify-content: center;
    align-content: center;
    padding-top: 2em;
    animation: floatABit 1s infinite ease-in-out;
    position: static;
    z-index: 9;
  }

  .kit-display {
    height: 90vh;
  }

  .shirt-type-selection {
    padding-right: 2em;
  }

  .color-select {
    display: flex;
    flex-wrap: wrap;
  }

  .color-select.color-display .color-option:hover {
    cursor: default;
  }

  .color-mgmt .color-display {
    margin-bottom: 2em;
  }

  .color-display input.color-to-add {
    width: 15em;
    padding-left: 1em;
    border: 4px solid;
  }

  @media screen and (max-width: 860px) {
    .color-display input.color-to-add {
      padding: 20px;
    }
  }

  .color-option {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    margin: 0 .5em .5em 0;
    border: 4px solid rgba(255,255,255,0.4);
    position: relative;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  .color-option:hover {
    border: 4px solid rgba(255,255,255,0.7);
  }

  .color-option.active {
    border-color: #F4D03F;
  }

  .color-option button {
    padding: 0;
    margin: 0;
    background-color: transparent;
    position: absolute;
    top: 10px;
    right: 0;
    left: 15px;
    margin: auto;
    opacity: 0;
    transition: all .2s;
    pointer-events: none;
  }

  .color-option:hover button {
    opacity: 1;
    pointer-events: auto;
  }

  .color-picker-label {
    display: block;
  }

  .color-picker-input {
    width: 100%;

    &:hover {
      cursor: pointer;
    }
  }

  .help {
    position: absolute;
    bottom: 0;
    padding: 1em;
    background-color: rgba(0,0,0,0.7);
    color: white;
    right: 0;
    left: 0;
    margin: auto;
    max-width: 30em;
    text-align: center;
    z-index: 1;
  }

  .help p {
    padding: 0;
    margin: 0;
    font-size: 0.8em;
  }

  .invisible {
    visibility: hidden;
  }

  strong {
    color: #00B140;
  }

  .attribution {
    font-size: 0.8rem;
    line-height: 1;
  }

  .stadium-stage {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 0;
    transform: scale(1.1);
    opacity: .5;
  }

  @media screen and (max-width: 1100px) {
    .stadium-stage {
      transform: scale(1.7);
      height: 100vh;
    }
  }

  @media screen and (max-width: 760px) {
    .stadium-stage {
      transform: scale(3);
      height: 100vh;
    }
  }

  @media screen and (max-width: 490px) {
    .stadium-stage {
      transform: scale(3.5);
      height: 100vh;
    }
  }

  @keyframes rainbow { 
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
  }

  .mobile-welcome {
    background-color: black;
    width: 100%;
    justify-content: center;
    align-content: center;
    color: white;
    position: relative;
    z-index: 10;
    padding: .25rem;
    border-top: 5px solid #00B140;
  }

  .mobile-welcome p {
    margin: 0;
    padding: 0;
    font-size: .8em;
    padding: 0 1.5em;
    text-align: center;
    line-height: 1.2;
  }

  .mob-welcome-badge {
    width: 2em;
  }

  /** RESPONSIVE **/
  .show-on-mobile {
    display: none;
  }

  .mob-randomize {
    display: none;
    width: 100%;
    padding-top: .5rem;
  }

  @media (max-width: 640px) {
    body {
      overflow-y: auto;
    }

    .mob-randomize {
      z-index: 10;
      display: flex;
      justify-content: center;
      align-content: center;
    }

    #app {
      flex-wrap: wrap;
      height: auto;
    }

    main {
      overflow-x: hidden;
    }

    #kit-stage {
      width: 100vw;
      padding-top: 0;
    }

    #toolbar {
      width: 100vw;
      background-color: rgba(0,0,0,0.9);
    }

    .help {
      display: none;
    }

    .mobile-welcome {
      display: flex;
    }

    .color-select {
      justify-content: center;
    }

    #toolbar h4 {
      text-align: center;
    }

    .shirt-type-selection {
      justify-content: center;
      padding-right: 0;
      text-align: center;
    }

    h3 {
      text-align: center;
    }

    button.toggle {
      margin: 0 auto;
      display: block;
    }

    .not-mobile {
      display: none;
    }
  }

  .hashtag {
    max-width: 300px;
    margin: 0 auto 1rem auto;
  }
</style>

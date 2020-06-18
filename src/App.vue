<template>
  <main v-on:keyup.enter="captureEnter">
    <transition name="fade">
      <section class="greeting" v-show="showGreeting">
        <div class="greeting-main">
          <h2>Welcome/Hola</h2>
          <p>Make your own Austin FC kit by choosing your own selections from the toolbar or randomize it and start from there <strong>(hit Enter or <strong>Directional Arrows</strong> at any time to randomize as well)</strong>. Either way, hope you have fun and let's GROW THE LEGEND!</p>

          <button v-on:click="handleGreetingClose(true)">Randomize Kit</button>
          <button v-on:click="handleGreetingClose()">Start On My Own</button>
          <button v-on:click="handleGreetingToManageColors()">Manage Colors</button>
        </div>
      </section>
    </transition>

    <transition name="fade">
      <section class="color-mgmt greeting" v-show="manageColors">
        <div class="greeting-main">
          <h2>Manage Colors</h2>
          <p>Add or Remove Your Own Colors (<a href="https://www.rapidtables.com/web/color/html-color-codes.html" target="_blank">hex values</a> or <a href="https://www.rapidtables.com/web/color/html-color-codes.html" target="_blank">named colors</a> only)</p>

          <section class="color-select color-display">
            <span 
              v-for="color in colors" 
              class="color-option"
              :style="{ backgroundColor: color }"
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
            />
          </section>

          <button v-on:click="manageColorWindow(false)">Close</button>
          <button v-on:click="resetColors">Reset Colors</button>
          <button v-on:click="handleGreetingClose(true)">Randomize Kit</button>
        </div>
      </section>
    </transition>

    <div id="app">
      <section id="kit-stage">
        <Kit 
          class="kit-display" 
          :activeShirtOption="activeShirtOption"
          :shirtFill="shirtFill"
          :shirtTypeFill="shirtTypeFill"
          :shirtCuffFill="shirtCuffFill"
          :shirtSleeveFill="shirtSleeveFill"
          :shortsFill="shortsFill"
          :shortsCuffsFill="shortsCuffsFill"
          :socksFill="socksFill"
          :socksCuffsFill="socksCuffsFill"
          :logoFill="logoFill"
          :numberFill="numberFill"
          :collarFill="collarFill"
          :socksHoops="socksHoops"
          :socksHoopsFill="socksHoopsFill"
        />
      </section>

      <section id="toolbar">
        <header>
          <a href="https://austinfc.com/" target="_blank">
            <AustinFCBadge class="toolbar-badge" />
          </a>
          <h2>Create Your Kit</h2>
          <button v-on:click="randomizeKit">Feeling Lucky</button>
          <button v-on:click="manageColorWindow(true)">Manage Colors</button>
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

        <p></p>
        <p></p>
        <p></p>
        <p></p>
      </section>
    </div>

    <section class="help">
      <p>Hit <strong>Enter</strong> or <strong>Directional Arrows</strong> at any time to randomize kit</p>
    </section>
  </main>
</template>

<script>
  import Kit from './components/Kit.vue'
  import AustinFCBadge from './components/AustinFCBadge.vue'

  const green ='#00B140';
  const black = '#000000';
  const white = '#FFFFFF';
  const grey = '#CCCCCC';

  const defaultColors = [
    green,
    black,
    white,
    grey
  ]

  const shirtOptions = [
    'stripes',
    'center-stripe',
    'hoops',
    'chevron',
    'sash',
    'half-panel',
    'tiger-stripes'
  ];

  export default {
    name: 'App',
    components: {
      Kit,
      AustinFCBadge
    },
    data() {
      return {
        showGreeting: false,
        
        manageColors: false,
        colorToAdd: null,

        colors: null,

        shirtOptions,
        activeShirtOption: null,
        shirtFill: black,
        shirtTypeFill: green,
        shirtCuffFill: green,
        shirtSleeveFill: black,
        logoFill: white,
        collarFill: green,
        
        shortsFill: black,
        shortsCuffsFill: green,
        
        socksFill: black,
        socksCuffsFill: black,
        socksHoops: false,
        socksHoopsFill: white,

        numberFill: white
      }
    },
    methods: {
      addColor(color) {
        if(this.colorToAdd) {
          this.colors.push(color);
        }
        
        setTimeout(() => {
          this.colorToAdd = null;
        }, 200);
      },
      removeColor(color) {
        alert(`REMOVING COLORS`);
        this.colors = this.colors.filter(item => item !== color)
      },
      resetColors() {
        this.colors = [
          green,
          black,
          white,
          grey
        ];
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
      setShirtTypeFill(fill) {
        this.shirtTypeFill = fill;
      },
      setShirtCuffFill(fill) {
        this.shirtCuffFill = fill;
      },
      setShirtSleeveFill(fill) {
        this.shirtSleeveFill = fill;
      },
      setLogoFill(fill) {
        this.logoFill = fill;
      },
      setCollarFill(fill) {
        this.collarFill = fill;
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
        this.setShortsFill(this.getRandomColor());
        this.setShortsCuffsFill(this.getRandomColor());
        this.setSocksFill(this.getRandomColor());
        this.setSocksCuffsFill(this.getRandomColor());
        this.setNumberFill(this.getRandomColor());
        this.setSocksHoops(this.getRandomTrueFalse());
        this.setSocksHoopsFill(this.getRandomColor());
      },
      handleGreetingClose(randomizePref) {
        this.showGreeting = false;
        this.manageColors = false;

        if(randomizePref) {
          this.randomizeKit();
        }
      },
      handleGreetingToManageColors() {
        this.showGreeting = false;
        this.manageColors = true;
      },
      manageColorWindow(pref) {
        this.manageColors = pref;
      }
    },
    created() {
      window.addEventListener('keyup', (e) => {
        if (e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
          this.randomizeKit();
          this.showGreeting = false;
          this.manageColors = false;
        }
      });
    },
    mounted() {
      this.colors = defaultColors;

      setTimeout(() => {
        this.showGreeting = true;
      }, 1000);
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

  html,
  body {
    padding: 0;
    margin: 0;
    font-size: 12pt;
    font-family: 'Bungee Inline', cursive;
    background-color: #333333;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97 9.9 46.386l-9.9-9.9v-2.828zm0 5.657L8.485 47.8 7.07 49.212 0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.343 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.415 1.415 9.9-9.9v-2.828zm0 5.657L51.515 47.8l1.414 1.413 7.07-7.07v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413 7.07-7.07 7.07 7.07zm-2.827 2.83l1.414-1.416L30 14.97l-5.657 5.657 1.414 1.415L30 17.8l4.243 4.242zm-2.83 2.827l1.415-1.414L30 20.626l-2.828 2.83 1.414 1.414L30 23.456l1.414 1.414zM56.87 59.414L58.284 58 30 29.716 1.716 58l1.414 1.414L30 32.544l26.87 26.87z' fill='%235c5858' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
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
  }

  button.active {
    background-color: #00B140;
    color: black;
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
    margin: 4em auto 0 auto;
    max-width: 65%;
    background-color: #000000;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='72' viewBox='0 0 36 72'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23333333' fill-opacity='0.81'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    color: white;
    position: static;
    z-index: 100;
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
  }

  #toolbar {
    width: 30vw;
    min-height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    overflow: auto;
    padding: 1em 0 3em 1em;

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
  }

  .kit-display {
    height: 90vh;
  }

  .kit-display:hover svg {
    transform: scale(1.3);
  }

  .shirt-type-selection {
    padding-right: 2em;
  }

  .color-select {
    display: flex;
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

  .color-option {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    margin-right: .5em;
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
    top: 5px;
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

  .help {
    position: absolute;
    bottom: 0;
    padding: 1em;
    background-color: rgba(0,0,0,0.5);
    color: white;
    right: 0;
    left: 0;
    margin: auto;
    max-width: 30em;
    text-align: center;
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
</style>

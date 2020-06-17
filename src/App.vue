<template>
  <div id="app">
    <section id="toolbar">
      <h2>Create Your Kit</h2>

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
      <h4>Type</h4>
      <button 
        v-for="option in shirtOptions"
        v-on:click="setShirtOption(option)"
        :class="{ active: option === activeShirtOption }"
      >
        {{ option }}
      </button>
      <button v-show="activeShirtOption" v-on:click="clearShirtOption()">Clear</button>
      
      <h4>Collar Color</h4>
      <section class="color-select">
        <button 
          v-for="color in colors" 
          class="color-option"
          :class="{ active: color === collarFill }"
          :style="{ backgroundColor: color }"
          v-on:click="setCollarFill(color)"
        >
        </button>
      </section>
      
      <h4>Sleeve Color</h4>
      <section class="color-select">
        <button 
          v-for="color in colors" 
          class="color-option"
          :class="{ active: color === sleeveFill }"
          :style="{ backgroundColor: color }"
          v-on:click="setShirtSleeveFill(color)"
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
        >
        </button>
      </section>
      
      <h4>Cuff Color</h4>
      <section class="color-select">
        <button 
          v-for="color in colors" 
          class="color-option"
          :class="{ active: color === shortsCuffFill }"
          :style="{ backgroundColor: color }"
          v-on:click="setShortsCuffFill(color)"
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
        >
        </button>
      </section>
      
      <h4>Top Color</h4>
      <section class="color-select">
        <button 
          v-for="color in colors" 
          class="color-option"
          :class="{ active: color === socksCuffFill }"
          :style="{ backgroundColor: color }"
          v-on:click="setSocksCuffFill(color)"
        >
        </button>
      </section>

      <h4>Hoops</h4>
    </section>

    <section id="kit-stage">
      <Kit 
        class="kit-display" 
        :activeShirtOption="activeShirtOption"
        :shirtFill="shirtFill"
        :shirtCuffFill="shirtCuffFill"
        :shirtSleeveFill="shirtSleeveFill"
        :shortsFill="shortsFill"
        :shortsCuffsFill="shortsCuffsFill"
        :socksFill="socksFill"
        :socksCuffsFill="socksCuffsFill"
        :logoFill="logoFill"
        :numberFill="numberFill"
        :collarFill="collarFill"
      />
    </section>
  </div>
</template>

<script>
  import Kit from './components/Kit.vue'

  const green ='#00B140';
  const black = '#000000';
  const white = '#FFFFFF';
  const grey = '#CCCCCC';

  const colors = [
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
      Kit
    },
    data() {
      return {
        colors,

        shirtOptions,
        activeShirtOption: null,
        shirtFill: black,
        shirtCuffFill: green,
        shirtSleeveFill: black,
        logoFill: white,
        collarFill: green,
        
        shortsFill: black,
        shortsCuffsFill: green,
        
        socksFill: black,
        socksCuffsFill: black,

        numberFill: white
      }
    },
    methods: {
      setShirtOption(option) {
        this.activeShirtOption = option;
      },
      clearShirtOption() {
        this.activeShirtOption = null;
      },
      setShirtFill(fill) {
        this.shirtFill = fill;
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
    }
  };
</script>

<style>
  html,
  body {
    padding: 0;
    margin: 0;
    font-size: 12pt;
  }

  * {
    transition: all .2s;
  }

  button {
    text-transform: uppercase;
    margin: 0 .25rem .25rem 0;
  }

  button:hover {
    cursor: pointer;
    outline: 0;
    border: none;
    padding: none;
    margin: none;
  }

  button.active {
    background-color: black;
    color: white;
  }

  #app {
    display: flex;
  }

  #toolbar {
    width: 30vw;
    min-height: 100vh;
    border-right: 1px solid black;
    padding-left: 1em;
  }

  #kit-stage {
    width: 100%;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  .kit-display {
    height: 90vh;
  }

  .color-select {
    display: flex;
  }

  .color-option {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    margin-right: .5em;
    border: 4px solid transparent;
  }

  .color-option.active {
    border-color: #333;
  }
</style>

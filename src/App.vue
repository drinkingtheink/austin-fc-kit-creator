<template>
  <div id="app">
    <section id="toolbar">
      <h2>Create Your Kit</h2>

      <h3>Shirt</h3>
      <h4>Primary Color</h4>
      <!-- COLOR VIEW  -->
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
      <h4>Sleeve Color</h4>
      <h4>Cuff Color</h4>

      <h3>Shorts</h3>
      <h4>Primary Color</h4>
      <h4>Cuff Color</h4>
      <h4>Number Color</h4>

      <h3>Socks</h3>
      <h4>Primary Color</h4>
      <h4>Top Color</h4>
      <h4>Hoops</h4>
    </section>

    <section id="kit-stage">
      <Kit 
        class="kit-display" 
        :activeShirtOption="activeShirtOption"
        :shirtFill="shirtFill"
        :shirtCuffFill="shirtCuffFill"
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
    ...green,
    ...black,
    ...white,
    ...grey
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
  button {
    text-transform: uppercase;
    margin: 0 .25rem .25rem 0;
  }

  button:hover {
    cursor: pointer;
  }

  button.active {
    background-color: black;
    color: white;
  }

  #app {
    display: flex;
  }

  #toolbar {
    width: 25vw;
    height: 100vh;
    border-right: 1px solid black;
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
</style>

<template>
  <div id="app">
    <section id="toolbar">
      <h2>Create Your Kit</h2>

      <h3>Shirt</h3>
      <button 
        v-for="option in shirtOptions"
        v-on:click="setShirtOption(option)"
        :class="{ active: option === activeShirtOption }"
      >
        {{ option }}
      </button>
      <button v-show="activeShirtOption" v-on:click="clearShirtOption()">Clear</button>
    </section>

    <section id="kit-stage">
      <Kit 
        class="kit-display" 
        :activeShirtOption="activeShirtOption"
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
        shirtOptions,
        activeShirtOption: null,
        shirtFill: null,
        shirtCuffFill: null,
        
        shortsFill: null,
        shortsCuffsFill: null,
        
        socksFill: null,
        socksCuffsFill: null
      }
    },
    methods: {
      setShirtOption(option) {
        console.log(`SETTING SHIRT OPTION TO >> ${option}`);
        this.activeShirtOption = option;
      },
      clearShirtOption() {
        this.activeShirtOption = null;
      }
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
    width: 75vw;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  .kit-display {
    height: 90vh;
  }
</style>

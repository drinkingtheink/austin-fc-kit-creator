<template>
  <!-- The three bars, drawn 100 wide so a caller can place them with the same
       transform the leaf mark takes. The artwork's own box is 33.7 by 25.4
       from 225.3,135.4 on the chest, which is where these came from. -->
  <g class="austin-fc-bars" transform="scale(2.967) translate(-225.3,-135.4)">
    <rect :style="{ fill }" x="250.6" y="135.4" width="8.4" height="25.4" />
    <rect :style="{ fill }" x="237.9" y="140.4" width="8.4" height="20.3" />
    <rect :style="{ fill }" x="225.3" y="148" width="8.4" height="12.5" />
  </g>
</template>

<script>
  export default {
    name: 'AustinFCBars',
    props: ['fill']
  };
</script>

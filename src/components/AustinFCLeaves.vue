<template>
  <!-- The leaf mark: three leaves over a bowl, as an alternative to the three
       bars on the right chest. One colour, like the bars, because it is a
       brand mark rather than a crest.

       The artwork arrives in a 715 x 571 box whose lower third is empty -- the
       file carries an invisible frame path the ink does not fill -- so the
       transform fits the ink's own box, 494.1 x 365.7 from x 6.2, y 0. Scaled
       to the bars' footprint and left to the caller to place.

       The bars stand 33.7 wide by 25.4 tall, a ratio of 1.33; the ink is 1.35.
       Near enough that one scale does both dimensions and the mark lands in
       the same hole in the shirt the bars came out of. -->
  <g class="austin-fc-leaves" transform="translate(224.9,135.4) scale(0.0682)">
    <path
      :style="{ fill }"
      d="M499.99,102.5l.34-.34s-.13,0-.35-.01c-.01-.46-.02-.7-.02-.7l-.68.68c-10.67-.19-100.51.49-170.24,75.53-3.77,4.06-7.35,8.16-10.76,12.27.45-5.04.79-10.17.98-15.41C323.02,72.15,259.98,8.13,252.29.73V.24s-.09.09-.26.24c-.33-.32-.51-.48-.51-.48v.97c-7.68,7.41-70.73,71.42-66.97,173.79.14,3.9.37,7.74.66,11.53-2.48-2.89-5.03-5.76-7.69-8.63C107.8,102.62,17.96,101.94,7.29,102.13l-.68-.68s-.01.24-.02.7c-.22,0-.35.01-.35.01l.34.34c-.17,9.48.35,81.42,53.06,146.25h387.29c52.71-64.83,53.24-136.77,53.06-146.25Z"
    />
    <path
      :style="{ fill }"
      d="M82.11,288.74c71.95,66.86,153.49,74.81,169,75.73.15.17.3.33.42.46v.58s.1-.1.27-.29c.32.35.5.53.5.53v-1.07s.09-.1.14-.15c.06,0,.13,0,.19,0l.57.57c0,.12,0,.18,0,.18l.09-.09.09.09s0-.06,0-.18l.57-.57c10.67-.47,95.77-6.35,170.52-75.81,8.39-7.79,15.84-15.84,22.47-23.99H59.64c6.63,8.16,14.08,16.2,22.47,23.99Z"
    />
  </g>
</template>

<script>
  export default {
    name: 'AustinFCLeaves',
    // Whatever paints the brand mark, which is one colour either way.
    props: ['fill']
  };
</script>

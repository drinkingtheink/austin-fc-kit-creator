<template>
  <!-- A whole kit at a glance: the shirt thumb with shorts and socks under
       it. Composed rather than redrawn, so the shirt's fourteen patterns
       stay in the one component that knows how to draw them. -->
  <span class="kit-thumb">
    <ShirtThumb
      class="kit-thumb-shirt"
      :design="kit.activeShirtOption"
      :shirtFill="kit.shirtFill"
      :typeFill="kit.shirtTypeFill"
      :secondaryFill="kit.shirtSecondaryFill"
      :sleeveFill="kit.shirtSleeveFill"
      :collarFill="kit.collarFill"
    />

    <!-- Shorts and socks, at the size they read at: a trapezoid with a notch
         and two tapers. Anything more detailed is detail nobody can see in
         forty pixels. -->
    <svg class="kit-thumb-lower" viewBox="0 0 64 44" aria-hidden="true">
      <path :fill="kit.shortsFill" d="M14 0h36v18l-4 6H35l-3-7-3 7H18l-4-6z" />
      <path :fill="kit.shortsCuffsFill" d="M14 18v3l4 6h11l-1-3H18l-4-6zM50 18v3l-4 6H35l1-3h10l4-6z" />

      <path :fill="kit.socksFill" d="M20 28h11l-1 14h-9z" />
      <path :fill="kit.socksFill" d="M33 28h11l-1 14h-9z" />
      <path :fill="kit.socksCuffsFill" d="M20 28h11v3H20zM33 28h11v3H33z" />
    </svg>
  </span>
</template>

<script>
  import ShirtThumb from './ShirtThumb.vue';

  export default {
    name: 'KitThumb',
    components: { ShirtThumb },
    props: {
      // An entry's kit, in the shape kitStorage persists.
      kit: { type: Object, required: true }
    }
  };
</script>

<style scoped>
  .kit-thumb {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    width: 100%;
  }

  .kit-thumb-shirt,
  .kit-thumb-lower {
    display: block;
    width: 100%;
    height: auto;
  }
</style>

<template>
  <div class="StaticContentWidth">
    <slot />
  </div>
</template>

<script>
import throttle from 'docc-render/utils/throttle';

export default {
  name: 'StaticContentWidth',
  inject: ['store'],
  mounted() {
    const cb = throttle(async () => {
      await this.$nextTick();
      this.store.setContentWidth(this.$el.offsetWidth);
    }, 150);
    window.addEventListener('resize', cb);
    window.addEventListener('orientationchange', cb);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', cb);
      window.removeEventListener('orientationchange', cb);
    });
    cb();
  },
};
</script>

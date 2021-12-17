<template>
  <span class="NavigatorLeafIcon">
    {{ kindLetter }}
  </span>
</template>

<script>
export default {
  name: 'NavigatorLeafIcon',
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    kindLetter({ type }) {
      return type.slice(0, 1);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.NavigatorLeafIcon {
  border: 2px solid var(--color-figure-gray-tertiary);
  padding: 2px;
  border-radius: 4px;
  width: 0.8em;
  height: 0.8em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  margin-right: 5px;
  flex: 0 0 auto;
}
</style>

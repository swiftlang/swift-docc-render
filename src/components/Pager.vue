<template>
  <div class="pager">
    <div
      v-for="(page, n) in pages"
      :key="n"
      :class="['page', { active: isActivePage(n) }]"
    >
      <slot name="page" :page="page" />
    </div>
    <div class="indicators">
      <button
        v-for="(_, n) in pages"
        :key="n"
        :class="['indicator', { active: isActivePage(n) }]"
        @click="setActivePage(n)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pager',
  data: () => ({
    activePageIndex: 0,
  }),
  props: {
    pages: {
      type: Array,
      required: true,
      validator: arr => arr.length > 0,
    },
  },
  methods: {
    isActivePage(index) {
      return this.activePageIndex === index;
    },
    setActivePage(index) {
      this.activePageIndex = index;
    },
  },
};
</script>

<style scoped lang="scss">
.page {
  display: none;

  &.active {
    display: block;
  }
}

.indicators {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 1rem;
}

.indicator {
  border-radius: 50%;
  display: block;
  height: 1em;
  outline: 1px solid currentColor;
  width: 1em;

  &.active {
    background: currentColor;
  }
}
</style>

<template>
  <article class="card">
    <header v-if="$slots.head" class="card-head">
      <slot name="head" />
    </header>
    <div class="card-content">
      <slot />
    </div>
  </article>
</template>

<script>
export default {
  name: 'Card',
};
</script>

<style scoped lang="scss">
.card {
  background: var(--color-fill-tertiary);

  & + *,
  * + & {
    margin-block-start: var(--spacing-stacked-margin-xlarge);
  }

  & > * {
    padding: 20px;
  }

  &-head {
    background: var(--color-fill-secondary);
  }
}
</style>

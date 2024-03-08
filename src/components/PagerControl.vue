<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <button
    :class="['pager-control', action]"
    :aria-label="$t(`pager.control.navigate-${action}`)"
  >
    <ChevronRoundedIcon class="icon" />
  </button>
</template>

<script>
import ChevronRoundedIcon from 'theme/components/Icons/ChevronRoundedIcon.vue';

const Action = {
  previous: 'previous',
  next: 'next',
};

export default {
  name: 'PagerControl',
  components: { ChevronRoundedIcon },
  props: {
    action: {
      type: String,
      required: true,
      validator: a => Object.hasOwnProperty.call(Action, a),
    },
  },
  Action,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.pager-control {
  align-items: center;
  background: var(--control-color-fill, var(--color-fill));
  border: 1px solid var(--control-color-fill, var(--color-grid));
  border-radius: 50%;
  display: flex;
  height: var(--control-size, 1rem);
  justify-content: center;
  opacity: 1;
  transition: opacity 0.15s ease-in-out;
  width: var(--control-size, 1rem);

  &[disabled] {
    opacity: 0;
  }
}

.icon {
  height: var(--control-icon-size, 50%);
  width: var(--control-icon-size, 50%);

  .pager-control.next & {
    transform: scale(1, 1);
  }

  .pager-control.previous & {
    transform: scale(-1, 1);
  }
}
</style>

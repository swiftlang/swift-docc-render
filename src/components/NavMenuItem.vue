<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavMenuItemBase>
    <NavMenuLink :url="url">
      <slot />
    </NavMenuLink>
  </NavMenuItemBase>
</template>

<script>
import NavMenuLink from 'docc-render/components/NavMenuLink.vue';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';

export default {
  name: 'NavMenuItem',
  components: { NavMenuItemBase, NavMenuLink },
  props: {
    url: {
      type: [Object, String],
      required: true,
    },
  },
};
</script>

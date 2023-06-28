<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <GenericError :message="$t('error.not-found')">
    <slot />
  </GenericError>
</template>

<script>
import GenericError from 'theme/components/GenericError.vue';
import AppStore from 'docc-render/stores/AppStore';

export default {
  name: 'NotFound',
  components: { GenericError },
  created() {
    AppStore.setAllLocalesAreAvailable();
  },
};
</script>

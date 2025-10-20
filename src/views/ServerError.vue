<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <GenericError />
</template>

<script>
import { updateLocale } from 'theme/utils/i18n-utils';
import GenericError from 'theme/components/GenericError.vue';
import AppStore from 'docc-render/stores/AppStore';

export default {
  name: 'ServerError',
  components: { GenericError },
  created() {
    AppStore.setAllLocalesAreAvailable();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      updateLocale(to.params.locale, vm);
    });
  },
  beforeRouteUpdate(to) {
    updateLocale(to.params.locale, this);
  },
};
</script>

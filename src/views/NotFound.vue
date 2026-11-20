<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <GenericError :message="$t('error.not-found')">
    <div v-if="documentationLink" class="back-link-container">
      <Reference :url="documentationLink">
        {{ $t('error.back-to-documentation') }}
      </Reference>
    </div>
    <slot />
  </GenericError>
</template>

<script>
import { updateLocale } from 'theme/utils/i18n-utils';
import GenericError from 'theme/components/GenericError.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import { fetchData } from 'docc-render/utils/data';
import { pathJoin } from 'docc-render/utils/assets';
import AppStore from 'docc-render/stores/AppStore';

export default {
  name: 'NotFound',
  components: { GenericError, Reference },
  data() {
    return {
      documentationPath: null,
    };
  },
  computed: {
    documentationLink() {
      return this.documentationPath;
    },
  },
  async created() {
    AppStore.setAllLocalesAreAvailable();
    try {
      const slug = this.$route?.params?.locale || '';
      const path = pathJoin(['/index/', slug, 'index.json']);
      const { interfaceLanguages = {} } = await fetchData(path);

      const firstModule = Object.values(interfaceLanguages)
        .map(items => items.find(item => item.type === 'module'))
        .find(Boolean);

      if (firstModule) {
        this.documentationPath = firstModule.path;
      }
    } catch (e) {
      // Link won't render if fetch fails
    }
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

<style lang="scss" scoped>
.back-link-container {
  text-align: center;
  margin-top: 32px;
}
</style>

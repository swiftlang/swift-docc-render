/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import '../webpack-asset-path';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Router from 'vue-router';
import App from '@/App.vue';
import SwiftDocCRenderPlugin from '@/setup-utils/SwiftDocCRenderPlugin';
import SwiftDocCRenderRouter from '@/setup-utils/SwiftDocCRenderRouter';
import * as messages from '@/lang';

Vue.use(SwiftDocCRenderPlugin);
Vue.use(Router);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en_US',
  fallbackLocale: 'en_US',
  messages,
});

new Vue({
  router: SwiftDocCRenderRouter(),
  render: h => h(App),
  i18n,
}).$mount('#app');

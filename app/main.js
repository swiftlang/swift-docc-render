/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { createApp, h } from 'vue';
import App from '@/App.vue';
import SwiftDocCRenderPlugin from '@/setup-utils/SwiftDocCRenderPlugin';
import SwiftDocCRenderRouter from '@/setup-utils/SwiftDocCRenderRouter';
import SwiftDocCRenderi18n from '@/setup-utils/SwiftDocCRenderi18n';

document.documentElement.classList.remove('no-js');

const app = createApp({
  render: () => h(App),
});

app.use(SwiftDocCRenderPlugin);
app.use(SwiftDocCRenderRouter());
app.use(SwiftDocCRenderi18n());
app.mount('#app');

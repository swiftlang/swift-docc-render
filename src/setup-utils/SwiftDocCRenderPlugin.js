/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// eslint-disable-next-line import/no-named-default
import { default as CommunicationBridge } from 'docc-render/plugins/CommunicationBridge';
import CustomComponents from '../plugins/CustomComponents';
import directives from '../directives';

/**
 * This is the SwiftDocCRenderPlugin, which attaches things to the Vue instance
 * Attach all Swift-DocC-Render helpers into the Vue object.
 */
export default function SwiftDocCRenderPlugin(Vue, {
  performanceMetrics = false,
} = {}) {
  /* eslint-disable no-param-reassign */
  Vue.config.productionTip = false;

  Vue.use(CustomComponents);

  // Set up custom global directives
  Vue.directive('hide', directives.hide);

  Vue.use(CommunicationBridge, {
    appTarget: process.env.VUE_APP_TARGET,
    performanceMetricsEnabled: performanceMetrics,
  });

  window.bridge = Vue.prototype.$bridge;

  // Emit performance metrics.
  Vue.config.performance = performanceMetrics;
}

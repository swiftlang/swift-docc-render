/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { default as CommunicationBridge } from 'docc-render/plugins/CommunicationBridge';
import CustomComponents from '../plugins/CustomComponents';
import directives from '../directives';

/**
 * This is the SwiftDocCRenderPlugin, which attaches things to the Vue instance
 * Attach all Swift-DocC-Render helpers into the Vue object.
 */
export default function SwiftDocCRenderPlugin(app, {
  performanceMetrics = false,
} = {}) {
  app.use(CustomComponents);

  // Set up custom global directives
  app.directive('hide', directives.hide);

  app.use(CommunicationBridge, {
    appTarget: process.env.VUE_APP_TARGET,
    performanceMetricsEnabled: performanceMetrics,
  });

  window.bridge = app.config.globalProperties.$bridge;

  // Emit performance metrics.
  Reflect.set(app.config, 'performance', performanceMetrics);
}

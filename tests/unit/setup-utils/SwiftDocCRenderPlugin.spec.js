/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import SwiftDocCRenderPlugin from 'docc-render/setup-utils/SwiftDocCRenderPlugin';
// eslint-disable-next-line import/no-named-default
import { default as CommunicationBridge } from 'docc-render/plugins/CommunicationBridge';

describe('SwiftDocCRenderPlugin', () => {
  let mockApp;
  beforeEach(() => {
    window.bridge = null;
    mockApp = {
      directive: vi.fn(),
      use: vi.fn(),
      config: {
        globalProperties: {
          $bridge: null,
        },
        performance: false,
      },
    };
  });
  it('exposes a Vue plugin function', () => {
    expect(SwiftDocCRenderPlugin).toBeInstanceOf(Function);
  });

  it('sets proper vue configs', () => {
    SwiftDocCRenderPlugin(mockApp);
    expect(mockApp.config.performance).toBe(false);
  });

  it('allows overwriting the `performance` flag', () => {
    SwiftDocCRenderPlugin(mockApp, { performanceMetrics: true });
    expect(mockApp.config.performance).toBe(true);
  });

  it('attaches the `hide` directive', () => {
    SwiftDocCRenderPlugin(mockApp);
    expect(mockApp.directive).toHaveBeenCalledTimes(1);
    expect(mockApp.directive).toHaveBeenCalledWith('hide', expect.any(Function));
  });

  it('attaches the communication bridge and passes the configs to it', () => {
    SwiftDocCRenderPlugin(mockApp, { performanceMetrics: true });
    expect(mockApp.use).toHaveBeenCalledWith(CommunicationBridge, {
      appTarget: process.env.VUE_APP_TARGET,
      performanceMetricsEnabled: true,
    });
  });
});

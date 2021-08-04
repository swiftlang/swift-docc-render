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
  let mockVue;
  beforeEach(() => {
    window.bridge = null;
    mockVue = {
      prototype: {
        $bridge: null,
      },
      directive: jest.fn(),
      use: jest.fn(),
      config: {
        productionTip: false,
        performance: false,
      },
    };
  });
  it('exposes a Vue plugin function', () => {
    expect(SwiftDocCRenderPlugin).toBeInstanceOf(Function);
  });

  it('sets proper vue configs', () => {
    SwiftDocCRenderPlugin(mockVue);
    expect(mockVue.config.performance).toBe(false);
    expect(mockVue.config.productionTip).toBe(false);
  });

  it('allows overwriting the `performance` flag', () => {
    SwiftDocCRenderPlugin(mockVue, { performanceMetrics: true });
    expect(mockVue.config.performance).toBe(true);
    expect(mockVue.config.productionTip).toBe(false);
  });

  it('attaches the `hide` directive', () => {
    SwiftDocCRenderPlugin(mockVue);
    expect(mockVue.directive).toHaveBeenCalledTimes(1);
    expect(mockVue.directive).toHaveBeenCalledWith('hide', expect.any(Function));
  });

  it('attaches the communication bridge and passes the configs to it', () => {
    SwiftDocCRenderPlugin(mockVue, { performanceMetrics: true });
    expect(mockVue.use).toHaveBeenCalledWith(CommunicationBridge, {
      appTarget: process.env.VUE_APP_TARGET,
      performanceMetricsEnabled: true,
    });
  });
});

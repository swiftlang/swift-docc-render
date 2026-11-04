/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import communicationBridgeUtils from 'docc-render/mixins/communicationBridgeUtils';
import { runCustomScriptsForNewContent } from 'docc-render/utils/custom-scripts';

jest.mock('docc-render/utils/custom-scripts', () => ({
  runCustomScriptsForNewContent: jest.fn().mockResolvedValue(),
}));

const createWrapper = topicData => shallowMount({
  mixins: [communicationBridgeUtils],
  data: () => ({ topicData }),
  render: () => null,
}, {
  mocks: {
    $bridge: { send: jest.fn() },
  },
});

describe('communicationBridgeUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('newContentMounted', () => {
    it('sends a "rendered" message to the bridge', () => {
      const wrapper = createWrapper({ foo: 'bar' });
      wrapper.vm.newContentMounted();
      expect(wrapper.vm.$bridge.send).toHaveBeenCalledWith(expect.objectContaining({
        type: 'rendered',
      }));
    });

    it('runs custom scripts for the new content', () => {
      const wrapper = createWrapper({ foo: 'bar' });
      wrapper.vm.newContentMounted();
      expect(runCustomScriptsForNewContent).toHaveBeenCalledTimes(1);
    });

    it('does not run custom scripts before there is any content', () => {
      const wrapper = createWrapper(null);
      wrapper.vm.newContentMounted();
      expect(runCustomScriptsForNewContent).not.toHaveBeenCalled();
    });
  });
});

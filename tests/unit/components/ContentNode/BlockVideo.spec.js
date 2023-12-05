/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BlockVideo from '@/components/ContentNode/BlockVideo.vue';
import { shallowMount } from '@vue/test-utils';
import Asset from '@/components/Asset.vue';

const defaultProps = {
  identifier: 'foo',
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(BlockVideo, {
  propsData: { ...defaultProps, ...propsData },
  ...others,
});

describe('BlockVideo', () => {
  it('renders an Asset', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(Asset).props()).toEqual({
      identifier: defaultProps.identifier,
      videoAutoplays: false,
      videoMuted: false,
      showsReplayButton: true,
      showsVideoControls: false,
    });
  });

  it('passes deviceFrames down to child', () => {
    const wrapper = createWrapper({
      propsData: {
        deviceFrame: 'phone',
      },
    });
    expect(wrapper.find(Asset).props()).toEqual({
      identifier: defaultProps.identifier,
      videoAutoplays: false,
      videoMuted: false,
      showsReplayButton: true,
      showsVideoControls: false,
      deviceFrame: 'phone',
    });
  });
});

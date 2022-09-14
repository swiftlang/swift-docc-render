/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BlockVideo from '@/components/ContentNode/BlockVideo.vue';
import { shallowMount } from '@vue/test-utils';
import Asset from '@/components/Asset.vue';
import isClientMobile from 'docc-render/mixins/isClientMobile';

jest.mock('docc-render/mixins/isClientMobile');

isClientMobile.computed.isClientMobile.mockReturnValue(false);

const defaultProps = {
  identifier: 'foo',
};

const createWrapper = () => shallowMount(BlockVideo, {
  propsData: defaultProps,
});

describe('BlockVideo', () => {
  it('renders an Asset on desktop', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(Asset).props()).toEqual({
      identifier: defaultProps.identifier,
      videoAutoplays: false,
      videoMuted: false,
      showsReplayButton: true,
      showsVideoControls: false,
    });
  });

  it('renders an Asset, on a mobile device', () => {
    isClientMobile.computed.isClientMobile.mockReturnValue(true);
    const wrapper = createWrapper();
    expect(wrapper.find(Asset).props()).toEqual({
      identifier: defaultProps.identifier,
      videoAutoplays: false,
      videoMuted: false,
      showsReplayButton: false,
      showsVideoControls: true,
    });
  });
});

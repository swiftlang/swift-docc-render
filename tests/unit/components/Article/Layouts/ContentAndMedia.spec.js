/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Asset from 'docc-render/components/Asset.vue';
import ContentAndMedia from 'docc-render/components/Article/Layouts/ContentAndMedia.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';

const { MediaPosition } = ContentAndMedia;

describe('ContentAndMedia', () => {
  let wrapper;

  const propsData = {
    content: [
      {
        type: 'text',
        text: 'foobar',
      },
    ],
    media: 'foo.bar',
  };

  beforeEach(() => {
    wrapper = shallowMount(ContentAndMedia, { propsData });
  });

  it('renders a div.content-and-media', () => {
    expect(wrapper.is('div.content-and-media')).toBe(true);
  });

  it('renders the `mediaPosition` classname', () => {
    expect(wrapper.is('.content-and-media.media-trailing')).toBe(true);

    wrapper.setProps({ mediaPosition: MediaPosition.leading });
    expect(wrapper.classes('media-leading')).toBe(true);
    expect(wrapper.classes('media-trailing')).toBe(false);

    wrapper.setProps({ mediaPosition: MediaPosition.trailing });
    expect(wrapper.classes('media-leading')).toBe(false);
    expect(wrapper.classes('media-trailing')).toBe(true);
  });

  it('renders a `ContentNode`', () => {
    const { content } = propsData;
    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(content);
  });

  it('renders an `Asset`', () => {
    const { media } = propsData;
    const asset = wrapper.find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe(media);
  });
});

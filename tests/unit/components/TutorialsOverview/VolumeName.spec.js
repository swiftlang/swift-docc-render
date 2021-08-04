/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import VolumeName from 'docc-render/components/TutorialsOverview/VolumeName.vue';
import { shallowMount } from '@vue/test-utils';

const {
  Asset,
  ContentNode,
} = VolumeName.components;

const propsData = {
  name: 'Bar',
  image: 'bar.png',
  content: [
    {
      type: 'paragraph',
      inlineContent: [{ type: 'text', text: 'blah' }],
    },
  ],
};

describe('VolumeName', () => {
  it('renders image title and content', () => {
    const wrapper = shallowMount(VolumeName, {
      propsData,
    });
    const asset = wrapper.find(Asset);
    expect(asset.exists()).toBe(true);
    expect(asset.props('identifier')).toBe(propsData.image);
    expect(asset.attributes('aria-hidden')).toBe('true');

    const name = wrapper.find('h2.name');
    expect(name.exists()).toBe(true);
    expect(name.text()).toBe(propsData.name);

    expect(wrapper.find('.visuallyhidden').exists()).toBe(false);

    const node = wrapper.find(ContentNode);
    expect(node.exists()).toBe(true);
    expect(node.props('content')).toEqual(propsData.content);
  });

  it('does not render asset if image is not available', () => {
    const wrapper = shallowMount(VolumeName, {
      propsData: {
        ...propsData,
        image: null,
      },
    });
    const asset = wrapper.find(Asset);
    expect(asset.exists()).toBe(false);
  });

  it('does not render content if not available', () => {
    const wrapper = shallowMount(VolumeName, {
      propsData: {
        ...propsData,
        content: null,
      },
    });
    const asset = wrapper.find(ContentNode);
    expect(asset.exists()).toBe(false);
  });
});

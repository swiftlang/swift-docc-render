/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import ViewMore from 'docc-render/components/DocumentationTopic/ViewMore.vue';

describe('ViewMore', () => {
  it('renders a <router-link>', () => {
    const wrapper = shallowMount(ViewMore, {
      propsData: { url: '/foo/bar' },
      stubs: { 'router-link': RouterLinkStub },
    });
    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.props('to')).toBe('/foo/bar');
    expect(link.text()).toBe('View more');
    expect(link.classes()).toContain('base-link');
  });

  it('renders the default slot', () => {
    const wrapper = shallowMount(ViewMore, {
      propsData: { url: '/foo/bar' },
      slots: {
        default: '<div class="default">Default text</div>',
      },
    });
    expect(wrapper.find('.default').text()).toBe('Default text');
  });
});

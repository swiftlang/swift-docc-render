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
import Description from 'docc-render/components/DocumentationTopic/Description.vue';

describe('Description', () => {
  it('renders `.description` at the root', () => {
    const wrapper = shallowMount(Description);
    expect(wrapper.classes('description')).toBe(true);
  });

  it('renders a p.nodocumentation message without content and without Primary Content Section in parent component', () => {
    const wrapper = shallowMount(Description);

    const nodocs = wrapper.find('p.nodocumentation');
    expect(nodocs.exists()).toBe(true);
    expect(nodocs.text()).toBe('No overview available.');
  });

  it('does not renders a p.nodocumentation message without content but with Primary Content Section in parent component', () => {
    const wrapper = shallowMount(Description);
    wrapper.setProps({ hasOverview: true });

    const nodocs = wrapper.find('p.nodocumentation');
    expect(nodocs.exists()).toBe(false);
  });

  it('renders slot content', () => {
    const wrapper = shallowMount(Description, {
      slots: { default: '<p>foobar</p>' },
    });

    expect(wrapper.contains('.nodocumentation')).toBe(false);
    expect(wrapper.contains('p')).toBe(true);
    expect(wrapper.find('p').text()).toBe('foobar');
  });

  it('does not render `.nodocumentation`, even if rendering empty string', () => {
    const wrapper = shallowMount(Description, {
      slots: { default: '<p></p>' },
    });
    expect(wrapper.contains('.nodocumentation')).toBe(false);
  });
});

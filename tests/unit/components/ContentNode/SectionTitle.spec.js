/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import SectionTitle from 'docc-render/components/ContentNode/SectionTitle.vue';

describe('SectionTitle', () => {
  it('renders a default section title that is a h2 by default', () => {
    const wrapper = shallowMount(SectionTitle, {
      slots: { default: 'Title' },
    });
    expect(wrapper.text()).toBe('Title');
    expect(wrapper.is('h2')).toBe(true);
    expect(wrapper.classes()).toContain('section-title');
  });

  it('renders a section title which heading is tag prop', () => {
    const wrapper = shallowMount(SectionTitle, {
      propsData: {
        tag: 'h3',
      },
    });
    expect(wrapper.is('h3')).toBe(true);
  });

  it('renders a section title with a header anchor and an id on the wrapper', async () => {
    const wrapper = shallowMount(SectionTitle, {
      propsData: {
        anchor: 'title',
      },
      slots: { default: 'Title' },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('# Title');
    expect(wrapper.attributes('id')).toBe('title');
    const headerAnchor = wrapper.find('.header-anchor');
    expect(headerAnchor.attributes('href')).toBe('#title');
    expect(headerAnchor.attributes('aria-label')).toBe('hidden');
  });

  it('renders a section title with a header anchor and no id on the wrapper if it already exists on the document', () => {
    // create element with id outside the component
    const div = document.createElement('div');
    div.innerHTML = '<div id="title>';
    document.body.appendChild(div);

    const wrapper = shallowMount(SectionTitle, {
      propsData: {
        anchor: 'title',
      },
      slots: { default: 'Title' },
    });
    expect(wrapper.text()).toBe('# Title');
    expect(wrapper.attributes('id')).not.toBe('title');
    const headerAnchor = wrapper.find('.header-anchor');
    expect(headerAnchor.attributes('href')).toBe('#title');
    expect(headerAnchor.attributes('aria-label')).toBe('hidden');
  });

  it('does not render anchor if there is no anchor', () => {
    const wrapper = shallowMount(SectionTitle);
    expect(wrapper.find('.header-anchor').exists()).toBe(false);
  });

  it('does not render anchor if target ide is true', () => {
    const wrapper = shallowMount(SectionTitle, {
      propsData: {
        anchor: 'title',
      },
      provide: {
        isTargetIDE: true,
      },
    });
    expect(wrapper.find('.header-anchor').exists()).toBe(false);
  });
});

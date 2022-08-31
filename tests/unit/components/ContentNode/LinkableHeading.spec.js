/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';

describe('LinkableHeading', () => {
  const stubs = { 'router-link': RouterLinkStub };

  it('renders a default section title that is a h2 by default', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      slots: { default: 'Title' },
    });
    expect(wrapper.text()).toBe('Title');
    expect(wrapper.is('h2')).toBe(true);
    expect(wrapper.classes()).toContain('section-title');
  });

  it('renders a section title which heading is tag prop', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        level: 3,
      },
    });
    expect(wrapper.is('h3')).toBe(true);
  });

  it('renders a section title with a header anchor and an id on the wrapper', async () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        anchor: 'title',
      },
      slots: { default: 'Title' },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('# Title');
    expect(wrapper.attributes('id')).toBe('title');
    const headerAnchor = wrapper.find('.header-anchor');
    expect(headerAnchor.props('to')).toEqual({ hash: '#title' });
    expect(headerAnchor.attributes('aria-label')).toBe('hidden');
  });

  it('renders a section title with a header anchor and no id on the wrapper if it already exists on the document', () => {
    // create element with id outside the component
    const div = document.createElement('div');
    div.innerHTML = '<div id="title>';
    document.body.appendChild(div);

    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        anchor: 'title',
      },
      slots: { default: 'Title' },
    });
    expect(wrapper.text()).toBe('# Title');
    expect(wrapper.attributes('id')).not.toBe('title');
    const headerAnchor = wrapper.find('.header-anchor');
    expect(headerAnchor.props('to')).toEqual({ hash: '#title' });
    expect(headerAnchor.attributes('aria-label')).toBe('hidden');
  });

  it('does not render anchor if there is no anchor', () => {
    const wrapper = shallowMount(LinkableHeading);
    expect(wrapper.find('.header-anchor').exists()).toBe(false);
  });

  it('does not render anchor if target ide is true', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
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

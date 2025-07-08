/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import ContentTable from 'docc-render/components/DocumentationTopic/ContentTable.vue';

const {
  LinkableHeading,
} = ContentTable.components;

describe('ContentTable', () => {
  let wrapper;

  const propsData = {
    anchor: 'foobar',
    title: 'Foobar',
  };

  const slots = { default: '<p>baz</p>' };

  beforeEach(() => {
    wrapper = shallowMount(ContentTable, { propsData, slots });
  });

  it('renders a `section.conntenttable`', () => {
    expect(wrapper.is('section.contenttable')).toBe(true);
  });

  it('renders an h2 title', () => {
    const title = wrapper.findComponent('.title');
    expect(title.exists()).toBe(true);
    expect(title.is(LinkableHeading)).toBe(true);
    expect(title.text()).toBe(propsData.title);
  });

  it('renders slot content', () => {
    const p = wrapper.findComponent('p');
    expect(p.exists()).toBe(true);
    expect(p.html()).toBe(slots.default);
  });

  it('renders `minimized-container` class if in minimized mode', async () => {
    const container = wrapper.findComponent('.container');
    expect(container.classes()).not.toContain('minimized-container');

    wrapper.setProps({ enableMinimized: true });
    expect(container.classes()).toContain('minimized-container');
  });
});

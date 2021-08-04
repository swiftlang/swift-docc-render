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
import ContentTable from 'docc-render/components/DocumentationTopic/ContentTable.vue';

const { OnThisPageSection } = ContentTable.components;

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

  it('renders an `OnThisPageSection` root', () => {
    const section = wrapper.find(OnThisPageSection);
    expect(section.exists()).toBe(true);
    expect(section.classes('contenttable')).toBe(true);
    expect(section.props()).toEqual({
      anchor: propsData.anchor,
      title: propsData.title,
    });
    expect(wrapper.is('.contenttable')).toBe(true);
  });

  it('renders an h2 title', () => {
    const title = wrapper.find('.title');
    expect(title.exists()).toBe(true);
    expect(title.is('h2')).toBe(true);
    expect(title.text()).toBe(propsData.title);
  });

  it('renders slot content', () => {
    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.html()).toBe(slots.default);
  });
});

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
    const title = wrapper.find('.title');
    expect(title.exists()).toBe(true);
    expect(title.is(LinkableHeading)).toBe(true);
    expect(title.text()).toBe(propsData.title);
  });

  it('renders slot content', () => {
    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.html()).toBe(slots.default);
  });
});

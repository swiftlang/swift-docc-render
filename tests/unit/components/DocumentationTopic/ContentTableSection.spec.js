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
import ContentTableSection from 'docc-render/components/DocumentationTopic/ContentTableSection.vue';

const { Column, Row } = ContentTableSection.components;

describe('ContentTableSection', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  const propsData = { title: 'Foobar' };

  const slots = { default: '<p>baz</p>' };

  beforeEach(() => {
    wrapper = shallowMount(ContentTableSection, { propsData, slots });
  });

  it('renders a `Row` with two `Column`s', () => {
    const row = wrapper.find(Row);
    expect(row.exists()).toBe(true);
    expect(row.classes('contenttable-section')).toBe(true);

    const cols = row.findAll(Column);
    expect(cols.length).toBe(2);
  });

  it('renders the title as `h3.title` the first column by default', () => {
    const col = wrapper.findAll(Column).at(0);
    expect(col.classes('section-title')).toBe(true);
    expect(col.exists()).toBe(true);

    const title = col.find('h3');
    expect(title.exists()).toBe(true);
    expect(title.classes('title')).toBe(true);
    expect(title.text()).toBe(propsData.title);
  });

  it('renders a slot for a title', () => {
    wrapper = shallowMount(ContentTableSection, {
      propsData,
      slots: {
        title: '<div class="title">Title Text</div>',
      },
    });
    const col = wrapper.findAll(Column).at(0);
    const title = col.find('.title');
    expect(title.text()).toEqual('Title Text');
  });

  it('renders slot content in the last column', () => {
    const col = wrapper.findAll(Column).at(1);
    expect(col.classes('section-content')).toBe(true);
    expect(col.exists()).toBe(true);

    const p = col.find('p');
    expect(p.exists()).toBe(true);
    expect(p.html()).toBe(slots.default);
  });

  it('renders abstract, discussion and the rest in the right order', () => {
    wrapper = shallowMount(ContentTableSection, {
      propsData,
      slots: {
        abstract: '<p id="abstract"></p>',
        discussion: '<p id="discussion"></p>',
        default: '<p id="list"></p>',
      },
    });
    const col = wrapper.find('.section-content');
    expect([...col.element.children].map(el => el.id)).toEqual(['abstract', 'discussion', 'list']);
  });
});

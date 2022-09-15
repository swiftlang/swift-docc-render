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
import Relationships from 'docc-render/components/DocumentationTopic/Relationships.vue';

const {
  ContentTable,
  List,
  Section,
} = Relationships.components;

describe('Relationships', () => {
  let wrapper;

  const foo = {
    identifier: 'foo',
    title: 'Foo',
    url: '/documentation/foo',
  };

  const bar = {
    identifier: 'bar',
    title: 'Bar',
    url: '/documentation/bar',
  };

  const baz = {
    identifier: 'baz',
    title: 'Baz',
    url: '/documentation/baz',
  };

  const propsData = {
    sections: [
      {
        type: 'inheritsFrom',
        title: 'Inherits From',
        identifiers: [
          foo.identifier,
          bar.identifier,
        ],
        anchor: 'inherits-from',
      },
      {
        type: 'conformsTo',
        title: 'Conforms To',
        identifiers: [baz.identifier],
      },
    ],
  };

  const provide = {
    references: {
      [foo.identifier]: foo,
      [bar.identifier]: bar,
      [baz.identifier]: baz,
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Relationships, { propsData, provide });
  });

  it('renders a `ContentTable`', () => {
    const table = wrapper.find(ContentTable);
    expect(table.exists()).toBe(true);
    expect(table.props()).toEqual({
      anchor: 'relationships',
      title: 'Relationships',
    });
  });

  it('renders a `Section` and `List` for each section with symbols', () => {
    const sections = wrapper.find(ContentTable).findAll(Section);
    expect(sections.length).toBe(propsData.sections.length);

    const firstSection = sections.at(0);
    expect(firstSection.props('title')).toBe(propsData.sections[0].title);
    expect(firstSection.props('anchor')).toBe(propsData.sections[0].anchor);
    const firstList = firstSection.find(List);
    expect(firstList.exists()).toBe(true);
    expect(firstList.props('symbols')).toEqual([
      foo,
      bar,
    ]);
    expect(firstList.props('type')).toEqual('inheritsFrom');

    const lastSection = sections.at(1);
    expect(lastSection.props('title')).toBe(propsData.sections[1].title);
    expect(lastSection.props('anchor')).toBe(null);
    const lastList = lastSection.find(List);
    expect(lastList.exists()).toBe(true);
    expect(lastList.props('symbols')).toEqual([baz]);
    expect(firstList.props('type')).toEqual('inheritsFrom');
  });
});

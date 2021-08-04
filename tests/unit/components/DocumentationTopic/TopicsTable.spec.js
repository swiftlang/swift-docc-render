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
import TopicsTable from 'docc-render/components/DocumentationTopic/TopicsTable.vue';

const {
  ContentTable, TopicsLinkBlock, ContentTableSection, ContentNode, WordBreak,
} = TopicsTable.components;

describe('TopicsTable', () => {
  /** @type {import('@vue/test-utils').Wrapper} */
  let wrapper;

  const foo = {
    abstract: [{ type: 'text', text: 'foo' }],
    identifier: 'foo',
    kind: 'article',
    role: 'article',
    title: 'Foo',
    url: '/foo',
  };

  const baz = {
    abstract: [{ type: 'text', text: 'baz' }],
    identifier: 'baz',
    kind: 'symbol',
    role: 'symbol',
    title: 'Baz',
    url: '/baz',
  };

  const propsData = {
    sections: [
      {
        title: 'Foobar',
        abstract: [{ type: 'text', text: 'foo abstract' }],
        discussion: { type: 'content', content: [{ type: 'text', text: 'foo discussion' }] },
        identifiers: [foo.identifier, 'bar'],
      },
      {
        title: 'Baz',
        identifiers: [baz.identifier],
      },
    ],
  };

  const provide = {
    references: {
      foo,
      baz,
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(TopicsTable, {
      propsData,
      provide,
    });
  });

  it('renders a `ContentTable` with "Topics" title', () => {
    const table = wrapper.find(ContentTable);
    expect(table.exists()).toBe(true);
    expect(table.props('anchor')).toBe('topics');
    expect(table.props('title')).toBe('Topics');
  });

  it('renders a `ContentTableSection` for each provided section', () => {
    const sections = wrapper.findAll(ContentTableSection);
    expect(sections.length).toBe(propsData.sections.length);
    expect(sections.at(0).props('title')).toBe(propsData.sections[0].title);
    expect(sections.at(1).props('title')).toBe(propsData.sections[1].title);
  });

  it('renders a `TopicsLinkBlock` for each topic with reference data in a section', () => {
    const sections = wrapper.findAll(ContentTableSection);

    const firstSectionBlocks = sections.at(0).findAll(TopicsLinkBlock);
    expect(firstSectionBlocks.length).toBe(1);
    expect(firstSectionBlocks.at(0).classes('topic')).toBe(true);
    expect(firstSectionBlocks.at(0).props()).toEqual({
      topic: foo,
      isSymbolDeprecated: false,
      isSymbolBeta: false,
    });

    const lastSectionBlocks = sections.at(1).findAll(TopicsLinkBlock);
    expect(lastSectionBlocks.length).toBe(1);
    expect(lastSectionBlocks.at(0).classes('topic')).toBe(true);
    expect(lastSectionBlocks.at(0).props()).toEqual({
      topic: baz,
      isSymbolDeprecated: false,
      isSymbolBeta: false,
    });
  });

  it('can be passed `title` and `anchor` overrides', () => {
    wrapper.setProps({
      anchor: 'foo-bar',
      title: 'Foo Bar',
    });

    const table = wrapper.find(ContentTable);
    expect(table.exists()).toBe(true);
    expect(table.props('anchor')).toBe('foo-bar');
    expect(table.props('title')).toBe('Foo Bar');
  });

  it('renders an abstract if provided', () => {
    const sections = wrapper.findAll(ContentTableSection);
    expect(
      sections
        .at(0)
        .find(ContentNode)
        .props('content'),
    ).toEqual(propsData.sections[0].abstract);
  });

  it('renders a discussion if provided', () => {
    const sections = wrapper.findAll(ContentTableSection);
    expect(
      sections
        .at(0)
        .findAll(ContentNode)
        .at(1)
        .props('content'),
    ).toEqual(propsData.sections[0].discussion.content);
  });

  it('renders a title wrapped in WordBreak, if `wrapTitle: true`', () => {
    let wordBreak = wrapper.find(WordBreak);
    expect(wordBreak.exists()).toBe(false);

    wrapper.setProps({ wrapTitle: true });
    wordBreak = wrapper.find(WordBreak);
    expect(wordBreak.attributes('tag')).toBe('h3');
    expect(wordBreak.text()).toEqual(propsData.sections[0].title);
  });
});

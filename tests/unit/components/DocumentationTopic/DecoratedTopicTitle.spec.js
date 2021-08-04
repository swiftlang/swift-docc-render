/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { mount } from '@vue/test-utils';
import DecoratedTopicTitle from 'docc-render/components/DocumentationTopic/DecoratedTopicTitle.vue';

const { WordBreak } = DecoratedTopicTitle.components;
const { TokenKind } = DecoratedTopicTitle.constants;

const propsData = {
  tokens: [
    {
      kind: TokenKind.attribute,
      text: 'public',
    },
    {
      kind: TokenKind.text,
      text: ' ',
    },
    {
      kind: TokenKind.keyword,
      text: 'class',
    },
    {
      kind: TokenKind.text,
      text: ' ',
    },
    {
      kind: TokenKind.identifier,
      text: 'Foo',
    },
    {
      kind: TokenKind.label,
      text: 'property list key',
    },
  ],
};

describe('DecoratedTopicTitle', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DecoratedTopicTitle, { propsData });
  });

  it('renders a <code>', () => {
    expect(wrapper.is('code.decorated-title')).toBe(true);
  });

  it('renders a <WordBreak> for each token that isn\'t all whitespace', () => {
    const breaks = wrapper.findAll(WordBreak);
    expect(breaks.length).toBe(4);
    expect(breaks.at(0).text()).toBe(propsData.tokens[0].text);
    expect(breaks.at(0).classes()).toEqual(['decorator']);
    expect(breaks.at(1).text()).toBe(propsData.tokens[2].text);
    expect(breaks.at(1).classes()).toEqual(['decorator']);
    expect(breaks.at(2).text()).toBe(propsData.tokens[4].text);
    expect(breaks.at(2).classes()).toEqual(['identifier']);
    expect(breaks.at(3).text()).toBe(propsData.tokens[5].text);
    expect(breaks.at(3).classes()).toEqual(['label']);
  });

  it('renders a span with empty-token class for whitespace-only tokens', () => {
    const spans = wrapper.findAll('.empty-token');
    expect(spans.length).toBe(2);
    expect(spans.at(0).is('span')).toBeTruthy();
    expect(spans.at(1).is('span')).toBeTruthy();
  });

  it('renders an .identifier for each identifier token', () => {
    expect(wrapper.findAll('.identifier').length).toBe(1);
  });

  it('renders a .decorator for each non-identifier token', () => {
    expect(wrapper.findAll('.decorator').length).toBe(4);
  });

  it('renders a .label for each label', () => {
    expect(wrapper.findAll('.label').length).toBe(1);
  });

  it('renders an .identifier for externalParam tokens', () => {
    const token = { kind: TokenKind.externalParam, text: 'blah' };
    wrapper.setProps({ tokens: [token] });

    const identifier = wrapper.find('.identifier');
    expect(identifier.exists()).toBe(true);
    expect(identifier.text()).toBe(token.text);
  });
});

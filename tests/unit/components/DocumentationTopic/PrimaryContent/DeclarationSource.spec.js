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
import DeclarationSource
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import { hasMultipleLines } from 'docc-render/utils/multipleLines';

const { Token } = DeclarationSource.components;
const { TokenKind } = Token.constants;

jest.mock('@/utils/multipleLines', () => ({
  hasMultipleLines: jest.fn(),
}));

describe('DeclarationSource', () => {
  let wrapper;

  const propsData = {
    tokens: [
      {
        kind: TokenKind.keyword,
        text: 'var',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'Foo',
        text: 'Foo',
      },
      {
        kind: TokenKind.added,
        tokens: [
          {
            type: TokenKind.text,
            text: 'foo',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(DeclarationSource, { propsData });
  });

  it('renders a <pre>', () => {
    expect(wrapper.is('pre.source')).toBe(true);
  });

  it('renders a <code> with a `Token` for each token', () => {
    const code = wrapper.find('pre.source code');
    expect(code.exists()).toBe(true);

    const tokens = code.findAll(Token);
    expect(tokens.length).toBe(propsData.tokens.length);

    tokens.wrappers.forEach((tokenWrapper, i) => {
      expect(tokenWrapper.props()).toEqual({
        kind: propsData.tokens[i].kind,
        identifier: propsData.tokens[i].identifier,
        text: propsData.tokens[i].text,
        tokens: propsData.tokens[i].tokens || [],
      });
    });
  });

  it('applies the `multipleLinesClass` class if declaration group has multiple lines', async () => {
    expect(wrapper.vm.hasMultipleLines).toBe(false);

    hasMultipleLines.mockResolvedValue(true);
    wrapper = shallowMount(DeclarationSource, { propsData });
    expect(wrapper.vm.hasMultipleLines).toBe(true);

    await wrapper.vm.$nextTick();
    expect(wrapper.find({ ref: 'declarationGroup' }).classes()).toContain(multipleLinesClass);
  });
});

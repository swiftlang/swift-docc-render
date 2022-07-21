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
import { themeSettingsState } from 'docc-render/utils/theme-settings';
import { indentDeclaration } from 'docc-render/utils/indentation';
import Language from '@/constants/Language';
import { flushPromises } from '../../../../../test-utils';

const { Token } = DeclarationSource.components;
const { TokenKind } = Token.constants;

jest.mock('@/utils/indentation');
jest.mock('@/utils/multipleLines');

hasMultipleLines.mockImplementation(() => false);

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

  it('runs the hasMultipleLines, after `indentDeclaration` for ObjC code', async () => {
    const callStack = [];
    hasMultipleLines.mockImplementationOnce(() => {
      callStack.push('hasMultipleLines');
      return true;
    });
    indentDeclaration.mockImplementationOnce(() => callStack.push('indentDeclaration'));

    wrapper = shallowMount(DeclarationSource, {
      propsData: {
        ...propsData,
        language: Language.objectiveC.key.api,
      },
    });
    await flushPromises();
    expect(indentDeclaration).toHaveBeenCalledTimes(1);
    expect(indentDeclaration)
      .toHaveBeenCalledWith(wrapper.find({ ref: 'code' }).element, Language.objectiveC.key.api);
    expect(callStack).toEqual(['indentDeclaration', 'hasMultipleLines']);
  });
});

describe('Swift function/initializer formatting', () => {
  const propsData = {
    language: 'swift',
  };

  const mountWithTokens = tokens => shallowMount(DeclarationSource, {
    propsData: {
      ...propsData,
      tokens,
    },
  });

  it('does not add any whitespace for single-param symbols', () => {
    // Before:
    // init(_ foo: Foo)
    //
    // After
    // init(_ foo: Foo)
    const tokens = [
      {
        kind: TokenKind.keyword,
        text: 'init',
      },
      {
        kind: TokenKind.text,
        text: '(',
      },
      {
        kind: TokenKind.externalParam,
        text: '_',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.internalParam,
        text: 'foo',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/example/foo',
        text: 'Foo',
      },
      {
        kind: TokenKind.text,
        text: ')',
      },
    ];
    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(tokenComponents.length).toBe(tokens.length);
    tokens.forEach((token, i) => {
      const tokenComponent = tokenComponents.at(i);
      expect(tokenComponent.props('kind')).toBe(token.kind);
      expect(tokenComponent.props('text')).toBe(token.text);
    });
  });

  it('breaks apart each param onto its own line for multi-param symbols', () => {
    // Before:
    // func foo(_ a: A, _ b: B) -> Bar
    //
    // After:
    // func foo(
    //     _ a: A,
    //     _ b: B,
    // ) -> Bar
    const tokens = [
      {
        kind: TokenKind.keyword,
        text: 'func',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.identifier,
        text: 'foo',
      },
      {
        kind: TokenKind.text,
        text: '(',
      },
      {
        kind: TokenKind.externalParam,
        text: '_',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.internalParam,
        text: 'a',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/a',
        text: 'A',
      },
      {
        kind: TokenKind.text,
        text: ', ',
      },
      {
        kind: TokenKind.externalParam,
        text: '_',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.internalParam,
        text: 'b',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/b',
        text: 'B',
      },
      {
        kind: TokenKind.text,
        text: ') -> ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/bar',
        text: 'Bar',
      },
    ];
    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(tokenComponents.length).toBe(tokens.length);

    const modifiedTokenIndexes = new Set([3, 9, 15]);
    tokens.forEach((token, i) => {
      const tokenComponent = tokenComponents.at(i);
      expect(tokenComponent.props('kind')).toBe(token.kind);
      if (modifiedTokenIndexes.has(i)) {
        expect(tokenComponent.props('text')).not.toBe(token.text);
      } else {
        expect(tokenComponent.props('text')).toBe(token.text);
      }
    });

    expect(tokenComponents.at(3).props('text')).toBe('(\n    ');
    expect(tokenComponents.at(9).props('text')).toBe(',\n    ');
    expect(tokenComponents.at(15).props('text')).toBe('\n) -> ');
  });

  it('breaks apart parameters in functions with generic where clauses', () => {
    /* eslint-disable max-len */
    // Before:
    // public func f(t: T, u: U) where T : Sequence, U : Sequence, T.Iterator.Element : Equatable, T.Iterator.Element == U.Iterator.Element
    //
    // After:
    // public func f(
    //     t: T,
    //     u: U,
    // ) where T : Sequence, U : Sequence, T.Iterator.Element : Equatable, T.Iterator.Element == U.Iterator.Element
    /* eslint-enable max-len */
    const tokens = [
      {
        kind: 'keyword',
        text: 'public',
      },
      {
        kind: 'text',
        text: ' ',
      },
      {
        kind: 'keyword',
        text: 'func',
      },
      {
        kind: 'text',
        text: ' ',
      },
      {
        kind: 'identifier',
        text: 'f',
      },
      {
        kind: 'text',
        text: '(',
      },
      {
        kind: 'externalParam',
        text: 't',
      },
      {
        kind: 'text',
        text: ': ',
      },
      {
        kind: 'typeIdentifier',
        text: 'T',
        preciseIdentifier: 's:14ExamplePackage0A6StructV1Tq_mfp',
      },
      {
        kind: 'text',
        text: ', ',
      },
      {
        kind: 'externalParam',
        text: 'u',
      },
      {
        kind: 'text',
        text: ': ',
      },
      {
        kind: 'typeIdentifier',
        text: 'U',
        preciseIdentifier: 's:14ExamplePackage0A6StructV1Uxmfp',
      },
      {
        kind: 'text',
        text: ') ',
      },
      {
        kind: 'keyword',
        text: 'where',
      },
      {
        kind: 'text',
        text: ' ',
      },
      {
        kind: 'typeIdentifier',
        text: 'U',
      },
      {
        kind: 'text',
        text: ' : ',
      },
      {
        kind: 'typeIdentifier',
        text: 'Sequence',
        preciseIdentifier: 's:ST',
      },
      {
        kind: 'text',
        text: ', ',
      },
      {
        kind: 'typeIdentifier',
        text: 'T',
      },
      {
        kind: 'text',
        text: ' : ',
      },
      {
        kind: 'typeIdentifier',
        text: 'Sequence',
        preciseIdentifier: 's:ST',
      },
      {
        kind: 'text',
        text: ', ',
      },
      {
        kind: 'typeIdentifier',
        text: 'U',
      },
      {
        kind: 'text',
        text: '.',
      },
      {
        kind: 'typeIdentifier',
        text: 'Element',
      },
      {
        kind: 'text',
        text: ' : ',
      },
      {
        kind: 'typeIdentifier',
        text: 'Equatable',
        preciseIdentifier: 's:SQ',
      },
      {
        kind: 'text',
        text: ', ',
      },
      {
        kind: 'typeIdentifier',
        text: 'U',
      },
      {
        kind: 'text',
        text: '.',
      },
      {
        kind: 'typeIdentifier',
        text: 'Element',
      },
      {
        kind: 'text',
        text: ' == ',
      },
      {
        kind: 'typeIdentifier',
        text: 'T',
      },
      {
        kind: 'text',
        text: '.',
      },
      {
        kind: 'typeIdentifier',
        text: 'Element',
      },
    ];

    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(tokenComponents.length).toBe(tokens.length);

    const modifiedTokenIndexes = new Set([5, 9, 13]);
    tokens.forEach((token, i) => {
      const tokenComponent = tokenComponents.at(i);
      expect(tokenComponent.props('kind')).toBe(token.kind);
      if (modifiedTokenIndexes.has(i)) {
        expect(tokenComponent.props('text')).not.toBe(token.text);
      } else {
        expect(tokenComponent.props('text')).toBe(token.text);
      }
    });

    expect(tokenComponents.at(5).props('text')).toBe('(\n    ');
    expect(tokenComponents.at(9).props('text')).toBe(',\n    ');
    expect(tokenComponents.at(13).props('text')).toBe('\n) ');
  });

  it('indents parameters using provided/customizable indentation width', () => {
    const originalTheme = themeSettingsState.theme;
    themeSettingsState.theme = {
      ...originalTheme,
      code: {
        indentationWidth: 2,
      },
    };

    // Before:
    // func foo(_ a: A, _ b: B) -> Bar
    //
    // After:
    // func foo(
    //   _ a: A,
    //   _ b: B,
    // ) -> Bar
    const tokens = [
      {
        kind: TokenKind.keyword,
        text: 'func',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.identifier,
        text: 'foo',
      },
      {
        kind: TokenKind.text,
        text: '(',
      },
      {
        kind: TokenKind.externalParam,
        text: '_',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.internalParam,
        text: 'a',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/a',
        text: 'A',
      },
      {
        kind: TokenKind.text,
        text: ', ',
      },
      {
        kind: TokenKind.externalParam,
        text: '_',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.internalParam,
        text: 'b',
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/b',
        text: 'B',
      },
      {
        kind: TokenKind.text,
        text: ') -> ',
      },
      {
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/bar',
        text: 'Bar',
      },
    ];
    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(tokenComponents.length).toBe(tokens.length);
    // should be indented with 2 spaces now instead of the default of 4 spaces
    expect(tokenComponents.at(3).props('text')).toBe('(\n  ');
    expect(tokenComponents.at(9).props('text')).toBe(',\n  ');
    expect(tokenComponents.at(15).props('text')).toBe('\n) -> ');

    themeSettingsState.theme = originalTheme;
  });
});

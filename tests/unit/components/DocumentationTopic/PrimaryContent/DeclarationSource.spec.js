/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import DeclarationSource
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import { displaysMultipleLines } from 'docc-render/utils/multipleLines';
import { themeSettingsState } from 'docc-render/utils/theme-settings';
import { indentDeclaration } from 'docc-render/utils/indentation';
import Language from '@/constants/Language';
import { flushPromises } from '../../../../../test-utils';

const { Token, CodeBlock } = DeclarationSource.components;
const { TokenKind } = Token.constants;

jest.mock('@/utils/indentation');
jest.mock('@/utils/multipleLines');

displaysMultipleLines.mockImplementation(() => false);

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

  it('renders a CodeBlock with a `Token` for each token', () => {
    const code = wrapper.find(CodeBlock);
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

  it('applies the `multipleLinesClass` class if declaration group displays multiple lines', async () => {
    expect(wrapper.vm.displaysMultipleLines).toBe(false);

    displaysMultipleLines.mockResolvedValue(true);
    wrapper = shallowMount(DeclarationSource, { propsData });
    expect(wrapper.vm.displaysMultipleLines).toBe(true);

    await wrapper.vm.$nextTick();
    expect(wrapper.find({ ref: 'declarationGroup' }).classes()).toContain(multipleLinesClass);
  });

  it('applies the `has-multiple-lines` class if declaration group has multiple lines regardless of window width', async () => {
    const multiLineDeclaration = {
      tokens: [
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
          text: 'Foo',
        },
        {
          kind: TokenKind.text,
          text: '(\n',
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
          text: 'Bar',
        },
        {
          kind: TokenKind.text,
          text: ': ',
        },
        {
          kind: TokenKind.typeIdentifier,
          text: 'Self',
        },
        {
          kind: TokenKind.text,
          text: '.',
        },
        {
          kind: TokenKind.typeIdentifier,
          text: 'FooBar',
        },
        {
          kind: TokenKind.text,
          text: ',\n',
        },
        {
          kind: TokenKind.externalParam,
          text: 'context',
        },
        {
          kind: TokenKind.text,
          text: ': ',
        },
        {
          kind: TokenKind.typeIdentifier,
          text: 'Self',
        },
        {
          kind: TokenKind.text,
          text: '.',
        },
        {
          kind: TokenKind.typeIdentifier,
          text: 'Context',
        },
        {
          kind: TokenKind.text,
          text: ')',
        },
      ],
    };

    wrapper = shallowMount(DeclarationSource, { propsData: multiLineDeclaration });
    await wrapper.vm.$nextTick();
    expect(wrapper.find({ ref: 'declarationGroup' }).classes()).toContain('has-multiple-lines');
  });

  it('runs the displaysMultipleLines, after `indentDeclaration` for ObjC code', async () => {
    const callStack = [];
    displaysMultipleLines.mockImplementationOnce(() => {
      callStack.push('displaysMultipleLines');
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
      .toHaveBeenCalledWith(wrapper.find({ ref: 'code' }).vm, Language.objectiveC.key.api);
    expect(callStack).toEqual(['indentDeclaration', 'displaysMultipleLines']);
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

  const getText = tokens => tokens.wrappers.reduce((txt, token) => (
    `${txt}${token.props('text')}`
  ), '');

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
    expect(getText(tokenComponents)).toBe('init(_ foo: Foo)');
  });

  it('breaks apart each param onto its own line for multi-param symbols', () => {
    // Before:
    // func foo(_ a: A, _ b: B) -> Bar
    //
    // After:
    // func foo(
    //     _ a: A,
    //     _ b: B
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
    expect(getText(tokenComponents)).toBe(
`func foo(
    _ a: A,
    _ b: B
) -> Bar`,
    );
  });

  it('breaks apart each param onto its own line for a tuple return type', () => {
    // Before:
    // func foo(_ a: A, _ b: B) -> (A, B)
    //
    // After:
    // func foo(
    //     _ a: A,
    //     _ b: B
    // ) -> (A, B)
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
        text: ') -> (',
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
        kind: TokenKind.typeIdentifier,
        identifier: 'doc://com.example/documentation/blah/b',
        text: 'B',
      },
      {
        kind: TokenKind.text,
        text: ')',
      },
    ];
    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(getText(tokenComponents)).toBe(
`func foo(
    _ a: A,
    _ b: B
) -> (A, B)`,
    );
  });

  it('breaks apart parameters in functions with generic where clauses', () => {
    /* eslint-disable max-len */
    // Before:
    // public func f(t: T, u: U) where U : Sequence, T : Sequence, T.Element : Equatable, U.Element == T.Element
    //
    // After:
    // public func f(
    //     t: T,
    //     u: U
    // ) where U : Sequence, T : Sequence, T.Element : Equatable, U.Element == T.Element
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
    expect(getText(tokenComponents)).toBe(
`public func f(
    t: T,
    u: U
) where U : Sequence, T : Sequence, U.Element : Equatable, U.Element == T.Element`,
    );
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
    //   _ b: B
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
    expect(getText(tokenComponents)).toBe(
`func foo(
  _ a: A,
  _ b: B
) -> Bar`,
    );

    themeSettingsState.theme = originalTheme;
  });

  it('breaks attributes onto their own line', () => {
    // Before:
    // @discardableResult @objc(baz) func foobarbaz() -> Int
    //
    // After:
    // @discardableResult @objc(baz)
    // func foobarbaz() -> Int
    const tokens = [
      {
        kind: 'attribute',
        text: '@discardableResult',
      },
      {
        kind: 'text',
        text: ' ',
      },
      {
        kind: 'attribute',
        text: '@objc',
      },
      {
        kind: 'text',
        text: '(baz) ',
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
        text: 'foobarbaz',
      },
      {
        kind: 'text',
        text: '() -> ',
      },
      {
        kind: 'typeIdentifier',
        text: 'Int',
        preciseIdentifier: 's:Si',
      },
    ];
    const wrapper = mountWithTokens(tokens);

    const tokenComponents = wrapper.findAll(Token);
    expect(getText(tokenComponents)).toBe(
`@discardableResult @objc(baz)
func foobarbaz() -> Int`,
    );
  });

  it('does not add newlines to attributes within param clause', () => {
    // func foo(bar: @escaping () -> ())
    const tokens = [
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
        text: 'foo',
      },
      {
        kind: 'text',
        text: '(',
      },
      {
        kind: 'externalParam',
        text: 'bar',
      },
      {
        kind: 'text',
        text: ': ',
      },
      {
        kind: 'attribute',
        text: '@escaping',
      },
      {
        kind: 'text',
        text: ' () -> ()',
      },
      {
        kind: 'text',
        text: ')',
      },
    ];
    let wrapper = mountWithTokens(tokens);

    let tokenComponents = wrapper.findAll(Token);
    expect(getText(tokenComponents)).toBe('func foo(bar: @escaping () -> ())');

    // @discardableResult func foo(bar: @escaping () -> ()) -> Int
    wrapper = mountWithTokens([
      { kind: 'attribute', text: '@discardableResult' },
      { kind: 'text', text: ' ' },
      ...tokens,
      { kind: 'text', text: ' -> ' },
      {
        kind: 'typeIdentifier',
        identifier: 'doc://com.example/documentation/blah/int',
        text: 'Int',
      },
    ]);
    tokenComponents = wrapper.findAll(Token);
    expect(getText(tokenComponents)).toBe(
`@discardableResult
func foo(bar: @escaping () -> ()) -> Int`,
    );
  });

  it('adds newlines for params that start with attribute tokens', () => {
    const param = name => ([
      {
        kind: TokenKind.externalParam,
        text: name,
      },
      {
        kind: TokenKind.text,
        text: ': ',
      },
      {
        kind: TokenKind.typeIdentifier,
        text: 'Int',
      },
    ]);
    const attributeParam = name => ([
      {
        kind: TokenKind.attribute,
        text: '@StringBuilder',
      },
      {
        kind: TokenKind.text,
        text: ' ',
      },
      {
        kind: TokenKind.externalParam,
        text: name,
      },
      {
        kind: TokenKind.text,
        text: ': () -> ',
      },
      {
        kind: TokenKind.typeIdentifier,
        text: 'String',
      },
    ]);
    const tokens = (paramA, paramB) => ([
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
        text: 'qux',
      },
      {
        kind: TokenKind.text,
        text: '(',
      },
      ...paramA,
      {
        kind: TokenKind.text,
        text: ', ',
      },
      ...paramB,
      {
        kind: TokenKind.text,
        text: ')',
      },
    ]);

    // Before:
    // func qux(a: Int, @StringBuilder b: () -> String)
    //
    // After:
    // func qux(
    //     a: Int,
    //     @StringBuilder b: () -> String
    // )
    const wrapper = mountWithTokens(tokens(param('a'), attributeParam('b')));
    const tokenComponents = wrapper.findAll(Token);
    expect(getText(tokenComponents)).toBe(
`func qux(
    a: Int,
    @StringBuilder b: () -> String
)`,
    );

    // Before:
    // func qux(@StringBuilder a: () -> String, b: Int)
    //
    // After:
    // func qux(
    //     @StringBuilder a: () -> String,
    //     b: Int
    // )
    const wrapper2 = mountWithTokens(tokens(attributeParam('a'), param('b')));
    const tokenComponents2 = wrapper2.findAll(Token);
    expect(getText(tokenComponents2)).toBe(
`func qux(
    @StringBuilder a: () -> String,
    b: Int
)`,
    );
  });
});

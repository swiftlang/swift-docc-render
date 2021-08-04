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
import ChangedToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/ChangedToken.vue';
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';
import RawText from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/RawText.vue';
import SyntaxToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/SyntaxToken.vue';
import TypeIdentifierLink
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken/TypeIdentifierLink.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';

const { TokenKind } = DeclarationToken.constants;

describe('DeclarationToken', () => {
  const mountToken = opts => shallowMount(DeclarationToken, opts);

  it('renders a `RawText` for `text` tokens', () => {
    const propsData = {
      kind: TokenKind.text,
      text: 'foo',
    };
    const wrapper = mountToken({ propsData });

    const rawText = wrapper.find(RawText);
    expect(rawText.exists()).toBe(true);
    expect(rawText.props()).toEqual({ text: propsData.text });
  });

  it('renders a `TypeIdentifierLink` for `typeIdentifier` tokens', () => {
    const propsData = {
      kind: TokenKind.typeIdentifier,
      identifier: 'foo',
      text: 'foo',
    };
    const wrapper = mountToken({ propsData });

    const link = wrapper.find(TypeIdentifierLink);
    expect(link.exists()).toBe(true);
    expect(link.props()).toEqual({ identifier: propsData.identifier });
    expect(link.contains(WordBreak)).toBe(true);
    expect(link.text()).toBe(propsData.text);
  });

  it('renders a `SyntaxToken` for other tokens', () => {
    const otherKinds = new Set(Object.values(TokenKind));
    otherKinds.delete(TokenKind.text);
    otherKinds.delete(TokenKind.typeIdentifier);
    otherKinds.delete(TokenKind.removed);
    otherKinds.delete(TokenKind.added);

    otherKinds.forEach((kind) => {
      const propsData = { kind, text: 'foo' };
      const wrapper = mountToken({ propsData });

      const syntaxToken = wrapper.find(SyntaxToken);
      expect(syntaxToken.exists()).toBe(true);
      expect(syntaxToken.props()).toEqual(propsData);
    });
  });

  it('renders a `ChangedToken` for `removed` tokens', () => {
    const propsData = {
      kind: TokenKind.removed,
      tokens: [{
        type: 'text',
        text: 'foo',
      }],
    };
    const wrapper = mountToken({ propsData });
    const token = wrapper.find(ChangedToken);
    expect(token.exists()).toBe(true);
    expect(token.props('tokens')).toEqual(propsData.tokens);
    expect(token.props('kind')).toEqual(propsData.kind);
  });

  it('renders a `ChangedToken` for `added` tokens', () => {
    const propsData = {
      kind: TokenKind.added,
      tokens: [{
        type: 'text',
        text: 'foo',
      }],
    };
    const wrapper = mountToken({ propsData });
    const token = wrapper.find(ChangedToken);
    expect(token.exists()).toBe(true);
    expect(token.props('tokens')).toEqual(propsData.tokens);
    expect(token.props('kind')).toEqual(propsData.kind);
  });
});

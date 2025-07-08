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
import Declaration from 'docc-render/components/DocumentationTopic/PrimaryContent/Declaration.vue';
import DeclarationToken
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';
import DeclarationDiff
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationDiff.vue';
import DeclarationSourceLink
  from '@/components/DocumentationTopic/PrimaryContent/DeclarationSourceLink.vue';

const {
  ConditionalConstraints,
  DeclarationList,
} = Declaration.components;

const { ChangeTypes } = Declaration.constants;

const { TokenKind } = DeclarationToken.constants;

describe('Declaration', () => {
  let wrapper;

  const identifier = 'foo';
  const propsData = {
    declarations: [
      {
        platforms: [
          'macOS',
        ],
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
            reference: 'Foo',
            text: 'Foo',
          },
        ],
      },
    ],
  };

  const provideFactory = (apiChanges = null) => ({
    identifier,
    store: {
      state: {
        apiChanges,
      },
    },
  });

  beforeEach(() => {
    wrapper = shallowMount(Declaration, { propsData, provide: provideFactory() });
  });

  it('renders an `section.declaration`', () => {
    expect(wrapper.is('section.declaration')).toBe(true);
  });

  it('renders 1 `DeclarationList` and 0 labels without multiple declarations', () => {
    const declarationLists = wrapper.findAll(DeclarationList);
    expect(declarationLists).toHaveLength(1);
    expect(declarationLists.at(0).props('shouldCaption')).toEqual(false);
  });

  it('renders a `DeclarationList`', async () => {
    const group = wrapper.findComponent(DeclarationList);
    expect(group.exists()).toBe(true);
    expect(group.props('declaration')).toEqual(propsData.declarations[0]);
    expect(group.props()).toHaveProperty('declListExpanded', false);

    await wrapper.setProps({
      declListExpanded: true,
    });
    expect(group.props()).toHaveProperty('declListExpanded', true);
  });

  it('renders a DeclarationSourceLink if `source` is available', async () => {
    expect(wrapper.findComponent(DeclarationSourceLink).exists()).toBe(false);
    await wrapper.setProps({
      source: {
        url: 'foo.com',
        fileName: 'Foo.swift',
      },
    });
    expect(wrapper.findComponent(DeclarationSourceLink).props()).toEqual({
      url: 'foo.com',
      fileName: 'Foo.swift',
    });
  });

  it('does not render a DeclarationSourceLink if other declaration list is expanded', async () => {
    await wrapper.setProps({
      source: {
        url: 'foo.com',
        fileName: 'Foo.swift',
      },
    });
    expect(wrapper.findComponent(DeclarationSourceLink).exists()).toBe(true);

    await wrapper.setProps({
      declListExpanded: true,
    });
    expect(wrapper.findComponent(DeclarationSourceLink).exists()).toBe(false);
  });

  it('renders a `ConditionalConstraints` for availability with `conformance` data', async () => {
    const conformance = {
      availabilityPrefix: [{ type: 'text', text: 'Available when' }],
      constraints: [{ type: 'codeVoice', code: 'Foo' }],
    };
    await wrapper.setProps({ conformance });

    const constraints = wrapper.findComponent(ConditionalConstraints);
    expect(constraints.exists()).toBe(true);
    expect(constraints.props()).toEqual({
      constraints: conformance.constraints,
      prefix: conformance.availabilityPrefix,
    });
  });

  it('forces the group to render captions when more than one declaration', async () => {
    const declarations = [
      propsData.declarations[0],
      {
        platforms: [
          'iOS',
          'tvOS',
          'watchOS',
        ],
        tokens: [
          {
            kind: TokenKind.keyword,
            text: 'let',
          },
          ...propsData.declarations[0].tokens.slice(1),
        ],
      },
    ];

    await wrapper.setProps({ declarations });

    const labels = wrapper.findAll(DeclarationList);
    expect(labels.length).toBe(declarations.length);
    expect(labels.at(0).props('shouldCaption')).toBe(true);
    expect(labels.at(1).props('shouldCaption')).toBe(true);
  });

  it('does not render captions when multiple declarations have the same platforms', async () => {
    const declarations = [
      propsData.declarations[0],
      {
        platforms: [
          'macOS',
        ],
        tokens: [
          {
            kind: TokenKind.keyword,
            text: 'let',
          },
          ...propsData.declarations[0].tokens.slice(1),
        ],
      },
    ];

    await wrapper.setProps({ declarations });

    const labels = wrapper.findAll(DeclarationList);
    expect(labels.length).toBe(declarations.length);
    expect(labels.at(0).props('shouldCaption')).toBe(false);
    expect(labels.at(1).props('shouldCaption')).toBe(false);
  });

  it('renders a `DeclarationDiff` when there are API changes for current and previous and collapsed other declaration list', async () => {
    // no DeclarationDiff if no changes
    expect(wrapper.findComponent(DeclarationDiff).exists()).toBe(false);
    // there is no `.changed` class applied by default
    expect(wrapper.findComponent('changed').exists()).toBe(false);

    const provide = provideFactory({
      [identifier]: {
        change: 'modified',
        declaration: {
          new: [{}],
          previous: [{}],
        },
      },
    });

    wrapper = shallowMount(Declaration, {
      propsData,
      provide,
    });

    const declarationDiff = wrapper.findComponent(DeclarationDiff);
    expect(declarationDiff.exists()).toBe(true);
    expect(declarationDiff.props()).toEqual({
      changes: provide.store.state.apiChanges.foo,
    });
    expect(declarationDiff.classes()).toContain('changed');
    expect(declarationDiff.classes()).toContain('changed-modified');

    await wrapper.setProps({
      declListExpanded: true,
    });
    expect(wrapper.findComponent(DeclarationDiff).exists()).toBe(false);
  });

  it('renders a `DeclarationList` with `added` change type prop', () => {
    const provide = provideFactory({
      [identifier]: {
        change: ChangeTypes.added,
        declaration: {
          new: [{}],
        },
      },
    });

    wrapper = shallowMount(Declaration, {
      propsData,
      provide,
    });

    expect(wrapper.findComponent(DeclarationDiff).exists()).toBe(false);

    const declarationList = wrapper.findComponent(DeclarationList);
    expect(declarationList.props('changeType')).toBe(ChangeTypes.added);
    expect(declarationList.props('declaration')).toBe(propsData.declarations[0]);
  });

  it('passes `added` type change prop if no declarations are present in the diff ', () => {
    const provide = provideFactory({
      [identifier]: {
        change: ChangeTypes.added,
      },
    });

    wrapper = shallowMount(Declaration, {
      propsData,
      provide,
    });

    expect(wrapper.findComponent(DeclarationDiff).exists()).toBe(false);

    const declarationList = wrapper.findComponent(DeclarationList);
    expect(declarationList.props('changeType')).toBe(ChangeTypes.added);
    expect(declarationList.props('declaration')).toBe(propsData.declarations[0]);
  });

  it('renders a `DeclarationList` with `deprecated` change type prop', () => {
    const provide = provideFactory({
      [identifier]: {
        change: ChangeTypes.deprecated,
        declaration: {
          previous: [{}],
        },
      },
    });

    wrapper = shallowMount(Declaration, {
      propsData,
      provide,
    });

    expect(wrapper.findComponent(DeclarationDiff).exists()).toBe(false);

    const declarationList = wrapper.findComponent(DeclarationList);
    expect(declarationList.props('changeType')).toBe(ChangeTypes.deprecated);
    expect(declarationList.props('declaration')).toBe(propsData.declarations[0]);
  });
});

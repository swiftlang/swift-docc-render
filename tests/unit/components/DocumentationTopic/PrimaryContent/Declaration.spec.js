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
import Declaration from 'docc-render/components/DocumentationTopic/PrimaryContent/Declaration.vue';
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';
import DeclarationDiff from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationDiff.vue';

const {
  ConditionalConstraints,
  OnThisPageSection,
  DeclarationGroup,
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

  it('renders an `OnThisPageSection`', () => {
    expect(wrapper.is('.declaration')).toBe(true);

    const section = wrapper.find(OnThisPageSection);
    expect(section.exists()).toBe(true);
    expect(section.classes('declaration')).toBe(true);
    expect(section.props()).toEqual({
      anchor: 'declaration',
      title: 'Declaration',
    });
  });

  it('renders an h2 title', () => {
    const h2 = wrapper.find('h2');
    expect(h2.exists()).toBe(true);
    expect(h2.text()).toBe('Declaration');
  });

  it('renders 1 `DeclarationGroup` and 0 labels without multiple declarations', () => {
    const declarationGroups = wrapper.findAll(DeclarationGroup);
    expect(declarationGroups).toHaveLength(1);
    expect(declarationGroups.at(0).props('shouldCaption')).toEqual(false);
  });

  it('renders a `DeclarationGroup`', () => {
    const group = wrapper.find(DeclarationGroup);
    expect(group.exists()).toBe(true);
    expect(group.props('declaration')).toEqual(propsData.declarations[0]);
  });

  it('renders a `ConditionalConstraints` for availability with `conformance` data', () => {
    const conformance = {
      availabilityPrefix: [{ type: 'text', text: 'Available when' }],
      constraints: [{ type: 'codeVoice', code: 'Foo' }],
    };
    wrapper.setProps({ conformance });

    const constraints = wrapper.find(ConditionalConstraints);
    expect(constraints.exists()).toBe(true);
    expect(constraints.props()).toEqual({
      constraints: conformance.constraints,
      prefix: conformance.availabilityPrefix,
    });
  });

  it('forces the group to render captions when more than one declaration', () => {
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

    wrapper.setProps({ declarations });

    const labels = wrapper.findAll(DeclarationGroup);
    expect(labels.length).toBe(declarations.length);
    expect(labels.at(0).props('shouldCaption')).toBe(true);
    expect(labels.at(1).props('shouldCaption')).toBe(true);
  });

  it('renders a `DeclarationDiff` when there are API changes for current and previous', () => {
    // no DeclarationDiff if no changes
    expect(wrapper.find(DeclarationDiff).exists()).toBe(false);
    // there is no `.changed` class applied by default
    expect(wrapper.find('changed').exists()).toBe(false);

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

    const declarationDiff = wrapper.find(DeclarationDiff);
    expect(declarationDiff.exists()).toBe(true);
    expect(declarationDiff.props()).toEqual({
      changes: provide.store.state.apiChanges.foo,
      // when `new` and `previous` are provided, change type is always `modified`
      changeType: ChangeTypes.modified,
    });
    expect(declarationDiff.classes()).toContain('changed');
    expect(declarationDiff.classes()).toContain('changed-modified');
  });

  it('renders a `DeclarationGroup` for `added` change type', () => {
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

    expect(wrapper.find(DeclarationDiff).exists()).toBe(false);

    const declarationGroup = wrapper.find(DeclarationGroup);
    expect(declarationGroup.props('changeType')).toBe(ChangeTypes.added);
    expect(declarationGroup.props('declaration')).toBe(propsData.declarations[0]);
    expect(declarationGroup.classes()).toContain('changed');
    expect(declarationGroup.classes()).toContain('changed-added');
  });

  it('renders a `DeclarationGroup` for `deprecated` change type', () => {
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

    expect(wrapper.find(DeclarationDiff).exists()).toBe(false);

    const declarationGroup = wrapper.find(DeclarationGroup);
    expect(declarationGroup.props('changeType')).toBe(ChangeTypes.deprecated);
    expect(declarationGroup.props('declaration')).toBe(propsData.declarations[0]);
    expect(declarationGroup.classes()).toContain('changed');
    expect(declarationGroup.classes()).toContain('changed-deprecated');
  });

  it('applies only `added` type change class if no declarations are present in the diff ', () => {
    const provide = provideFactory({
      [identifier]: {
        change: ChangeTypes.added,
      },
    });

    wrapper = shallowMount(Declaration, {
      propsData,
      provide,
    });

    expect(wrapper.find(DeclarationDiff).exists()).toBe(false);

    const declarationGroup = wrapper.find(DeclarationGroup);
    expect(declarationGroup.props('changeType')).toBe(ChangeTypes.added);
    expect(declarationGroup.props('declaration')).toBe(propsData.declarations[0]);
    expect(declarationGroup.classes()).toContain('changed');
    expect(declarationGroup.classes()).toContain('changed-added');
  });
});

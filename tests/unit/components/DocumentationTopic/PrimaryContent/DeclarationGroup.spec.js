/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationGroup from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';
import { shallowMount } from '@vue/test-utils';
import DeclarationSource
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';

const propsData = {
  declaration: {
    platforms: ['iOS', 'tvOS', 'watchOS'],
    tokens: [
      { type: 'text', text: 'foo' },
    ],
  },
  shouldCaption: true,
  change: '',
};

const provide = {
  interfaceLanguage: 'swift',
  languages: new Set(['swift', 'occ']),
};

const createWrapper = options => shallowMount(DeclarationGroup, {
  propsData,
  provide,
  ...options,
});

describe('DeclarationGroup', () => {
  it('renders a platforms label for each variant', () => {
    const wrapper = createWrapper();

    const labels = wrapper.find('.platforms');
    expect(labels.text()).toBe('iOS, tvOS, watchOS');
  });

  it('does not render a caption label if `shouldCaption` is false', () => {
    const wrapper = createWrapper({
      propsData: {
        ...propsData,
        shouldCaption: false,
      },
    });

    const labels = wrapper.find('.platforms');
    expect(labels.exists()).toBe(false);
  });

  it('adds a declaration-group--changed class when there are changes', () => {
    const wrapper = createWrapper({
      propsData: {
        ...propsData,
        changeType: 'added',
      },
    });
    expect(wrapper.classes()).toContain('declaration-group--changed');
    expect(wrapper.classes()).toContain('declaration-group--added');
  });

  it('renders a `Source` for each variant', () => {
    const wrapper = createWrapper();

    const source = wrapper.find(DeclarationSource);
    expect(source.props('tokens')).toEqual(propsData.declaration.tokens);
  });

  it('renders the `Source`', () => {
    const wrapper = createWrapper();
    const srcComponent = wrapper.find(DeclarationSource);
    expect(srcComponent.props('language')).toEqual('swift');
  });

  it('applies the `multipleLinesClass` class if `hasMultipleLinesAfterAPIChanges` is true', () => {
    const wrapper = shallowMount({
      ...DeclarationGroup,
      computed: {
        ...DeclarationGroup.computed,
        hasMultipleLinesAfterAPIChanges: () => true,
      },
    },
    {
      propsData,
      provide,
    });

    expect(wrapper.classes()).toContain(multipleLinesClass);
  });
});

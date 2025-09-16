/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
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
  changeType: '',
};

const store = {
  state: {
    references: {
      'doc://boo': { url: 'url-boo' },
    },
  },
};

const provide = {
  interfaceLanguage: 'swift',
  languages: new Set(['swift', 'occ']),
  store,
};

describe('DeclarationGroup', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(DeclarationGroup, {
      propsData,
      provide,
    });
  });

  it('renders a platforms label for each variant', () => {
    const labels = wrapper.findComponent('.platforms');
    expect(labels.text()).toBe('iOS, tvOS, watchOS');
  });

  it('does not render a caption label if `shouldCaption` is false', () => {
    wrapper = shallowMount(DeclarationGroup, {
      propsData: {
        ...propsData,
        shouldCaption: false,
      },
      provide,
    });

    const labels = wrapper.findComponent('.platforms');
    expect(labels.exists()).toBe(false);
  });

  it('renders a `Source` for each variant', () => {
    const source = wrapper.findComponent(DeclarationSource);
    expect(source.props('tokens')).toEqual(propsData.declaration.tokens);
  });

  it('renders the `Source`', () => {
    const srcComponent = wrapper.findComponent(DeclarationSource);
    expect(srcComponent.props('language')).toEqual('swift');
  });

  it('applies the `multipleLinesClass` class if `displaysMultipleLinesAfterAPIChanges` is true', () => {
    wrapper = shallowMount({
      ...DeclarationGroup,
      computed: {
        ...DeclarationGroup.computed,
        displaysMultipleLinesAfterAPIChanges: () => true,
      },
    },
    {
      propsData,
      provide,
    });

    expect(wrapper.classes()).toContain(multipleLinesClass);
  });
});

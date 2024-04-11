/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationGroup from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';
import { shallowMount } from '@vue/test-utils';
import DeclarationSource
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';
import { waitFor } from 'docc-render/utils/loading';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';
import { flushPromises } from '../../../../../test-utils';

jest.mock('docc-render/utils/loading');

const mocks = {
  $route: {
    path: '/documentation/foo',
    query: {
      context: 'foo',
    },
  },
  $router: {
    push: jest.fn(),
  },
};

const basicDeclaration = {
  platforms: ['iOS', 'tvOS', 'watchOS'],
  tokens: [
    { type: 'text', text: 'foo' },
  ],
};

const propsData = {
  declaration: basicDeclaration,
  shouldCaption: true,
  change: '',
};

const withOtherDeclarations = {
  declaration: {
    ...basicDeclaration,
    otherDeclarations: {
      declarations: [
        {
          identifier: 'doc://boo',
          tokens: [
            {
              type: 'identifier',
              text: 'Boo',
            },
          ],
        },
      ],
      displayIndex: 1,
    },
  },
};

const store = {
  state: {
    onThisPageSections: [],
    apiChanges: null,
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

  it('applies the `multipleLinesClass` class if `displaysMultipleLinesAfterAPIChanges` is true', () => {
    const wrapper = shallowMount({
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

describe('DeclarationGroup with otherDeclarations', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper({
      propsData: {
        ...propsData,
        ...withOtherDeclarations,
        declListExpanded: true,
      },
      mocks,
    });
  });

  it('renders only one `Source` when list is collapsed', () => {
    wrapper.setProps({ declListExpanded: false });
    const sources = wrapper.findAll(DeclarationSource);
    expect(sources.length).toBe(1);
    expect(sources.at(0).props('tokens')).toEqual(withOtherDeclarations.declaration.tokens);
  });

  it('renders one `Source` for each declaration in list in correct order when expanded', () => {
    const sources = wrapper.findAll(DeclarationSource);
    // second item is the currently selected declaration
    expect(sources.length).toBe(2);
    expect(sources.at(0).props('tokens')).toEqual(withOtherDeclarations.declaration.otherDeclarations.declarations[0].tokens);
    expect(sources.at(1).props('tokens')).toEqual(withOtherDeclarations.declaration.tokens);
  });

  it('adds a `declaration-pill-expanded` class only when list is expanded', () => {
    const declaration = wrapper.find('.declaration-pill');
    expect(declaration.classes()).toContain('declaration-pill--expanded');

    wrapper.setProps({ declListExpanded: false });
    expect(wrapper.find('.declaration-pill').classes()).not.toContain('declaration-pill--expanded');
  });

  it('adds a `selected-declaration` class to the selected declaration', () => {
    const sources = wrapper.findAll(DeclarationSource);
    // second item is the currently selected declaration
    expect(sources.at(0).classes()).not.toContain('selected-declaration');
    expect(sources.at(1).classes()).toContain('selected-declaration');
  });

  it('renders a `div` for selected declaration, otherwise renders a `button`', () => {
    const sourceWrapper = wrapper.findAll('.declaration-source-wrapper');
    expect(sourceWrapper.at(0).find('div').exists()).toBe(false);
    expect(sourceWrapper.at(0).find('button').exists()).toBe(true);
    expect(sourceWrapper.at(1).find('div').exists()).toBe(true);
    expect(sourceWrapper.at(1).find('button').exists()).toBe(false);
  });

  it('clicking on a pill from the expanded list selects that declaration with query param', async () => {
    const buttons = wrapper.findAll('.declaration-pill--expanded');
    const button = buttons.at(0).find('button');
    button.trigger('click');
    await flushPromises();

    const { identifier } = withOtherDeclarations.declaration.otherDeclarations.declarations[0];
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedIdentifier).toEqual(identifier);
    expect(wrapper.emitted('update:declListExpanded')).toEqual([[false]]);
    expect(waitFor).toHaveBeenCalledWith(500); // wait for animation to be finish
    const url = `${store.state.references[identifier].url}?context=foo`;
    expect(mocks.$router.push).toHaveBeenCalledWith(url);
  });
});

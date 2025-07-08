/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeclarationList from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationList.vue';
import { shallowMount } from '@vue/test-utils';
import DeclarationGroup
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationGroup.vue';
import { waitFor } from 'docc-render/utils/loading';
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
  changeType: '',
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
    references: {
      'doc://boo': { url: 'url-boo' },
    },
  },
};

const provide = {
  store,
  identifier: 'doc://foo',
};

const createWrapper = options => shallowMount(DeclarationList, {
  propsData,
  provide,
  ...options,
});

describe('DeclarationList', () => {
  it('renders `DeclarationGroup` with correct prop', () => {
    const wrapper = createWrapper();
    const srcComponent = wrapper.findComponent(DeclarationGroup);
    expect(srcComponent.props('declaration')).toEqual({
      ...propsData.declaration,
      identifier: provide.identifier,
    });
    expect(srcComponent.props('shouldCaption')).toEqual(propsData.shouldCaption);
    expect(srcComponent.props('changeType')).toEqual(propsData.changeType);
  });
});

describe('DeclarationList with otherDeclarations', () => {
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

  it('renders only one `DeclarationGroup` when list is collapsed', () => {
    wrapper.setProps({ declListExpanded: false });
    const groups = wrapper.findAll(DeclarationGroup);
    expect(groups.length).toBe(1);
    expect(groups.at(0).props('declaration')).toEqual({
      tokens: basicDeclaration.tokens,
      identifier: provide.identifier,
    });
  });

  it('renders one `DeclarationGroup` for each declaration in list in correct order when expanded', () => {
    const groups = wrapper.findAll(DeclarationGroup);
    // second item is the currently selected declaration
    expect(groups.length).toBe(2);
    expect(groups.at(0).props('declaration')).toEqual(withOtherDeclarations.declaration.otherDeclarations.declarations[0]);
    expect(groups.at(1).props('declaration')).toEqual({
      tokens: basicDeclaration.tokens,
      identifier: provide.identifier,
    });
  });

  it('adds a `declaration-pill-expanded` class only when list is expanded', () => {
    const declaration = wrapper.findComponent('.declaration-pill');
    expect(declaration.classes()).toContain('declaration-pill--expanded');

    wrapper.setProps({ declListExpanded: false });
    expect(wrapper.findComponent('.declaration-pill').classes()).not.toContain('declaration-pill--expanded');
  });

  it('adds a `selected-declaration` class to the selected declaration', () => {
    const declarations = wrapper.findAll('.declaration-pill');
    // second item is the currently selected declaration
    expect(declarations.at(0).classes()).not.toContain('selected-declaration');
    expect(declarations.at(1).classes()).toContain('selected-declaration');
  });

  it('renders a `div` for selected declaration, otherwise renders a `button`', () => {
    const sourceWrapper = wrapper.findAll('.declaration-group-wrapper');
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

describe('DeclarationList with changes', () => {
  it('renders `DeclarationGroup` with correct change type prop when no other declarations', () => {
    const wrapper = createWrapper({
      propsData: {
        ...propsData,
      },
      provide,
    });

    wrapper.setProps({
      changeType: 'added',
    });
    let declarationPill = wrapper.findComponent('.declaration-pill');
    expect(declarationPill.classes()).toContain('changed');
    expect(declarationPill.classes()).toContain('changed-added');

    wrapper.setProps({
      changeType: 'deprecated',
    });
    declarationPill = wrapper.findComponent('.declaration-pill');
    expect(declarationPill.classes()).toContain('changed');
    expect(declarationPill.classes()).toContain('changed-deprecated');

    wrapper.setProps({
      changeType: 'modified',
    });
    declarationPill = wrapper.findComponent('.declaration-pill');
    expect(declarationPill.classes()).toContain('changed');
    expect(declarationPill.classes()).toContain('changed-modified');

    const declarationGroup = declarationPill.find(DeclarationGroup);
    expect(declarationGroup.props('declaration')).toEqual({
      ...propsData.declaration,
      identifier: provide.identifier,
    });
  });

  it('renders 1 `DeclarationGroup` with correct change type prop when other declarations collapsed', () => {
    const wrapper = createWrapper({
      propsData: {
        ...propsData,
        ...withOtherDeclarations, // collapsed by default
      },
      provide,
    });

    wrapper.setProps({
      changeType: 'added',
    });
    const declarationPills = wrapper.findAll('.declaration-pill');
    expect(declarationPills.length).toBe(1);
    expect(declarationPills.at(0).classes()).toContain('changed');
    expect(declarationPills.at(0).classes()).toContain('changed-added');
  });

  it('renders the current symbol as a `DeclarationGroup` with correct change type prop when other declarations expanded', () => {
    const wrapper = createWrapper({
      propsData: {
        ...propsData,
        ...withOtherDeclarations,
        declListExpanded: true,
      },
      provide,
    });

    wrapper.setProps({
      changeType: 'added',
    });
    const declarationPills = wrapper.findAll('.declaration-pill');
    expect(declarationPills.at(1).classes()).toContain('changed'); // current symbol is second in the list
    expect(declarationPills.at(1).classes()).toContain('changed-added');
  });
});

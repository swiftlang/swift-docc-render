/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import RelationshipsList from 'docc-render/components/DocumentationTopic/RelationshipsList.vue';
import { multipleLinesClass } from 'docc-render/constants/multipleLines';

const {
  ConditionalConstraints,
  WordBreak,
} = RelationshipsList.components;

describe('RelationshipsList', () => {
  let wrapper;

  const store = {
    reset: jest.fn(),
    setAPIChanges: jest.fn(),
    state: {
      onThisPageSections: [],
      apiChanges: null,
    },
  };

  const provide = {
    store,
    identifier: 'foo',
  };

  const makeUnresolvedSymbol = (name, props = {}) => ({
    ...props,
    identifier: name,
    title: name,
  });

  const makeSymbol = (name, props = {}) => makeUnresolvedSymbol(name, {
    ...props,
    url: `/documentation/${name}`,
  });

  const propsData = {
    symbols: [
      makeSymbol('foo'),
      makeSymbol('bar'),
      makeSymbol('baz'),
      makeSymbol('qux'),
      makeUnresolvedSymbol('foobarbazqux'),
    ],
    type: 'inheritsFrom',
  };

  const stubs = { 'router-link': RouterLinkStub };

  const mocks = {
    $route: {
      query: {
        language: 'objc',
      },
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(RelationshipsList, {
      propsData, stubs, provide, mocks,
    });
  });

  it('renders a ul.relationships-list', () => {
    expect(wrapper.is('ul.relationships-list')).toBe(true);
    expect(wrapper.classes('inline')).toBe(false);
  });

  it('applies the `multipleLinesClass` class if `hasMultipleLinesAfterAPIChanges` is true', () => {
    wrapper = shallowMount({
      ...RelationshipsList,
      computed: {
        ...RelationshipsList.computed,
        hasMultipleLinesAfterAPIChanges: () => true,
      },
    },
    {
      propsData, stubs, provide, mocks,
    });

    expect(wrapper.classes()).toContain(multipleLinesClass);
  });

  it('renders a list item with word-break links for each resolved symbol', () => {
    const items = wrapper.findAll('li');
    expect(items.length).toBe(propsData.symbols.length);

    items.wrappers.slice(0, items.length - 1).forEach((item, i) => {
      const link = item.find(RouterLinkStub);
      expect(link.exists()).toBe(true);
      expect(link.classes('link')).toBe(true);
      // prepends the existing query parameters as well
      expect(link.props('to')).toBe(`${propsData.symbols[i].url}?language=objc`);

      const wb = link.find(WordBreak);
      expect(wb.exists()).toBe(true);
      expect(wb.attributes('tag')).toBe('code');
      expect(wb.text()).toBe(propsData.symbols[i].title);
    });
  });

  it('renders a non-linked word-break code for unresolved symbols', () => {
    const items = wrapper.findAll('li');

    const lastItem = items.at(items.length - 1);
    expect(lastItem.find(RouterLinkStub).exists()).toBe(false);

    const wb = lastItem.find(WordBreak);
    expect(wb.exists()).toBe(true);
    expect(wb.attributes('tag')).toBe('code');
    expect(wb.text()).toBe(propsData.symbols[4].title);
  });

  describe('with 3 or fewer symbols', () => {
    beforeEach(() => {
      wrapper.setProps({
        symbols: [
          propsData.symbols[0],
          propsData.symbols[1],
          propsData.symbols[2],
        ],
      });
    });

    it('adds the .inline class', () => {
      expect(wrapper.classes('inline')).toBe(true);
    });

    describe('when a symbol has availability constraints', () => {
      const conformance = {
        conformancePrefix: [
          { type: 'text', text: 'Available when' },
        ],
        constraints: [
          { type: 'codeVoice', code: 'Foo' },
          { type: 'text', text: ' is ' },
          { type: 'codeVoice', code: 'Bar' },
        ],
      };

      beforeEach(() => {
        wrapper.setProps({
          symbols: [
            propsData.symbols[0],
            {
              ...propsData.symbols[1],
              conformance,
            },
            propsData.symbols[2],
          ],
        });
      });

      it('does not add the .inline class', () => {
        expect(wrapper.classes('inline')).toBe(false);
      });

      it('renders a `ConditionalConstraints`', () => {
        const constraints = wrapper.find(ConditionalConstraints);
        expect(constraints.exists()).toBe(true);
        expect(constraints.props()).toEqual({
          constraints: conformance.constraints,
          prefix: conformance.conformancePrefix,
        });
      });
    });
  });

  describe('when a symbol has API Changes', () => {
    const assertChange = (change, expectedChange, type = propsData.type, relationship = {}) => {
      wrapper.setProps({ type });

      store.state.apiChanges = {
        [provide.identifier]: {
          change,
          ...relationship,
        },
      };

      expect(wrapper.classes()).toContain('changed');
      expect(wrapper.classes()).toContain(`changed-${expectedChange}`);
    };

    it('sets the correct classes for items that have been added', () => {
      assertChange('added', 'added');
    });

    it('sets the correct classes for items that have been deprecated', () => {
      assertChange('deprecated', 'deprecated');
    });

    it('sets the correct classes for items that have been modified with no previous content', () => {
      const types = [
        {
          type: 'conformsTo',
          key: 'conformance',
        },
        {
          type: 'inheritedBy',
          key: 'inheritedBy',
        },
        {
          type: 'inheritsFrom',
          key: 'inheritance',
        },
      ];

      types.forEach(({ type, key }) => {
        assertChange('modified', 'added', type, {
          [key]: {
            previous: [
              {
                content: [],
              },
            ],
            new: [
              {
                content: ['foo'],
              },
            ],
          },
        });
      });
    });

    it('sets the correct classes for items that have been modified with previous content', () => {
      const types = [
        {
          type: 'conformsTo',
          key: 'conformance',
        },
        {
          type: 'inheritedBy',
          key: 'inheritedBy',
        },
        {
          type: 'inheritsFrom',
          key: 'inheritance',
        },
      ];

      types.forEach(({ type, key }) => {
        assertChange('modified', 'modified', type, {
          [key]: {
            previous: [
              {
                content: ['foo'],
              },
            ],
            new: [
              {
                content: ['foo'],
              },
            ],
          },
        });
      });
    });

    it('does not add the .inline class', () => {
      expect(wrapper.classes('inline')).toBe(false);
    });
  });
});

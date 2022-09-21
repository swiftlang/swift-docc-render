/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { mount } from '@vue/test-utils';
import RestParameters
  from 'docc-render/components/DocumentationTopic/PrimaryContent/RestParameters.vue';
import Badge from 'docc-render/components/Badge.vue';

const {
  PossiblyChangedType,
  WordBreak,
  ParameterAttributes,
  PossiblyChangedTextAttribute,
  LinkableHeading,
} = RestParameters.components;

const { AttributeKind } = RestParameters.components.ParameterAttributes.constants;

describe('RestParameters', () => {
  const propsData = {
    kind: 'restParameters',
    title: 'Title',
    parameters: [
      {
        name: 'name',
        type: [{ kind: 'identifier', text: 'Foo' }],
        content: [{ type: 'text', text: 'foo' }],
      },
    ],
  };
  const provide = {
    identifier: 'foo',
    store: {
      addOnThisPageSection: () => ({}),
      state: {
        apiChanges: {},
      },
    },
  };

  function mountComponent({ propsData: props, ...others } = {}) {
    return mount(RestParameters, {
      stubs: ['ContentNode', 'router-link'],
      propsData: {
        ...propsData,
        ...props,
      },
      provide,
      ...others,
    });
  }

  it('renders an h2 section title', () => {
    const sectionTitle = mountComponent().find(LinkableHeading);
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toContain(propsData.title);
  });

  it('displays the parameters information', () => {
    const wrapper = mountComponent();
    const paramName = wrapper.find('.param-name');
    expect(paramName.contains(WordBreak)).toBe(true);
    expect(paramName.text()).toBe('name');
    expect(wrapper.find('.param-required').exists()).toBe(false);
    expect(wrapper.find('.property-type').text()).toBe('Foo');
    expect(wrapper.find({ name: 'ContentNode' }).props('content')).toEqual(
      propsData.parameters[0].content,
    );
  });

  it('renders a row as deprecated', () => {
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        parameters: [
          { deprecated: true, ...propsData.parameters[0] },
          {
            name: 'foo',
            type: [{ kind: 'identifier', text: 'Foo' }],
            content: [{ type: 'text', text: 'foo' }],
          },
        ],
      },
    });
    const allNames = wrapper.findAll('.param-name');
    expect(allNames.at(0).classes()).toContain('deprecated');
    expect(allNames.at(1).classes()).not.toContain('deprecated');
    const deprecatedBadges = wrapper.findAll('.param-deprecated');
    expect(deprecatedBadges).toHaveLength(1);
    expect(deprecatedBadges.at(0).is(Badge));
    expect(deprecatedBadges.at(0).props('variant')).toBe('deprecated');
  });

  it('renders type information using `PossiblyChangedType`', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.param-content').contains('.param-type'));

    const tokensGroup = wrapper.find(PossiblyChangedType);
    expect(tokensGroup.props('type')).toBe(propsData.parameters[0].type);
    expect(tokensGroup.props('changes')).toBe(undefined);
  });

  it('renders the `PossiblyChangedType` in the `param-content` if no `content` is provided, but has `name`', () => {
    const parameters = [
      {
        name: 'lastname',
        type: [{ kind: 'identifier', text: 'string' }],
        required: true,
        content: [],
      },
    ];
    const wrapper = mountComponent({
      propsData: {
        parameters,
      },
    });
    expect(wrapper.find('.param-symbol').contains(PossiblyChangedType)).toBe(false);
    expect(wrapper.find('.param-content').contains(PossiblyChangedType)).toBe(true);
  });

  it('renders the `PossiblyChangedType` ih the `param-symbol` if no `content` and no `name` provided', () => {
    const parameters = [
      {
        name: '',
        type: [{ kind: 'identifier', text: 'string' }],
        required: true,
        content: [],
      },
    ];
    const wrapper = mountComponent({
      propsData: {
        parameters,
      },
    });
    expect(wrapper.find('.param-symbol').contains(PossiblyChangedType)).toBe(true);
    expect(wrapper.find('.param-content').contains(PossiblyChangedType)).toBe(false);
  });

  it('displays the parameters as required', () => {
    const parameters = [
      {
        name: 'lastname',
        type: [{ kind: 'identifier', text: 'string' }],
        required: true,
        content: [{ type: 'text', text: 'bar' }],
      },
    ];
    const wrapper = mountComponent({
      propsData: {
        parameters,
      },
    });
    expect(wrapper.find('.param-name').text()).toBe('lastname');
    expect(wrapper.find(PossiblyChangedTextAttribute).exists()).toBe(true);
    expect(wrapper.find(PossiblyChangedType).text()).toBe('string');
    expect(wrapper.find({ name: 'ContentNode' }).props('content')).toEqual(
      parameters[0].content,
    );
  });

  it('renders `ParameterAttributes`', () => {
    const attributes = [{ kind: AttributeKind.minimum, value: 20 }];
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        parameters: [
          {
            name: 'columns', attributes, content: [], type: [],
          },
          {
            name: 'columns_2', attributes, content: [], type: [],
          },
        ],
      },
    });

    const allAttributes = wrapper.findAll(ParameterAttributes);
    expect(allAttributes).toHaveLength(2);
    expect(allAttributes.at(0).props('attributes')).toEqual(attributes);
  });

  describe('apiChanges', () => {
    const changes = {
      name: {
        type: {
          new: [],
          previous: [],
        },
        required: {
          new: false,
          previous: true,
        },
        attributes: {},
      },
    };
    const wrapper = mountComponent({
      provide: {
        ...provide,
        store: {
          ...provide.store,
          state: {
            apiChanges: {
              [provide.identifier]: { restParameters: changes },
            },
          },
        },
      },
    });

    expect(wrapper.find(PossiblyChangedType).props()).toHaveProperty('changes', changes.name.type);
    expect(wrapper.find(PossiblyChangedTextAttribute).props())
      .toHaveProperty('changes', changes.name.required);
    expect(wrapper.find(ParameterAttributes).props()).toHaveProperty('changes', changes.name);
  });
});

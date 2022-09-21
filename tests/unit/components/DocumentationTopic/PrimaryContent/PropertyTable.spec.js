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
import PropertyTable
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PropertyTable.vue';
import Badge from 'docc-render/components/Badge.vue';

const {
  PossiblyChangedType,
  ParameterAttributes,
  ParametersTable,
  WordBreak,
  LinkableHeading,
} = PropertyTable.components;

const { AttributeKind } = PropertyTable.components.ParameterAttributes.constants;

const {
  DeclarationToken,
} = PropertyTable.components.ParameterAttributes.components;

const store = {
  addOnThisPageSection: () => {},
  state: {
    apiChanges: {},
  },
};

describe('PropertyTable', () => {
  const propsData = {
    kind: 'restResponses',
    title: 'Title',
    // named items in original data
    properties: [
      {
        name: 'columns',
        type: [{ kind: 'identifier', text: 'integer' }],
        required: true,
        attributes: [],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'Required colums integer',
              },
            ],
          },
        ],
      },
      {
        name: 'other',
        type: [{ kind: 'text', text: '*' }],
        attributes: [],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'Required colums integer',
              },
            ],
          },
        ],
      },
      {
        name: 'rows',
        type: [{ kind: 'identifier', text: 'integer' }],
        attributes: [],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'Required colums integer',
              },
            ],
          },
        ],
      },
      {
        name: 'one type one value',
        type: [{ kind: 'identifier', text: 'string' }],
        attributes: [],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'only one type and value',
              },
            ],
          },
        ],
      },
    ],
  };
  const provide = {
    identifier: 'foo',
    store,
  };

  function mountComponent(options) {
    return mount(PropertyTable, {
      stubs: ['ContentNode', 'router-link'],
      propsData,
      provide,
      ...options,
    });
  }

  it('renders an h2 section title', () => {
    const sectionTitle = mountComponent().find(LinkableHeading);
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toContain(propsData.title);
  });

  it('displays the property information', () => {
    const wrapper = mountComponent();
    expect(
      wrapper
        .find('.property-name')
        .text()
        // condense all whitespace
        .replace(/\s+/g, ' '),
    ).toBe('columns');
    expect(wrapper.find(WordBreak).is('code')).toBe(true);
    expect(wrapper.find('.property-metadata').text()).toBe('integer');
    expect(wrapper.find({ name: 'ContentNode' }).props('content')).toEqual(
      propsData.properties[0].content,
    );
  });

  it('renders a row as deprecated', () => {
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        properties: [
          { deprecated: true, ...propsData.properties[0] },
          ...propsData.properties.splice(1),
        ],
      },
    });
    const allNames = wrapper.findAll('.property-name');
    expect(allNames.at(0).classes()).toContain('deprecated');
    expect(allNames.at(1).classes()).not.toContain('deprecated');
    const deprecatedBadges = wrapper.findAll('.property-deprecated');
    expect(deprecatedBadges).toHaveLength(1);
    expect(deprecatedBadges.at(0).is(Badge));
    expect(deprecatedBadges.at(0).props('variant')).toBe('deprecated');
  });

  it('renders the type using declaration tokens in code', () => {
    const wrapper = mountComponent();

    const code = wrapper.find('.property-type code');
    expect(code.exists()).toBe(true);

    const tokens = code.findAll(DeclarationToken);
    expect(tokens.length).toBe(propsData.properties[0].type.length);

    const type = propsData.properties[0].type[0];
    const token = tokens.at(0);
    expect(token.props('kind')).toEqual(type.kind);
    expect(token.props('text')).toEqual(type.text);
    expect(token.props('identifier')).toEqual(type.identifier);
    expect(token.props('tokens')).toEqual(type.tokens || []);
  });

  it('displays required metadata', () => {
    const wrapper = mountComponent();
    expect(
      wrapper
        .findAll('.property-text')
        .at(0)
        .text(),
    ).toBe('(Required)');
  });

  describe('displays the `type` in proper place', () => {
    it('in the `param-symbol` if `content` exists', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
        .toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);
    });

    it('in the `param-content` if no `content but `name` exists', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          properties: [{
            name: 'columns',
            type: [{ kind: 'identifier', text: 'integer' }],
            required: true,
            content: [],
            attributes: [],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
        .toBe(false);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(true);
    });

    it('in the `param-symbol` if no `content` and no `name`', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          properties: [{
            name: '',
            type: [{ kind: 'identifier', text: 'integer' }],
            required: true,
            content: [],
            attributes: [],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
        .toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);
    });
  });

  it('renders `ParameterAttributes`', () => {
    const attributes = [{ kind: AttributeKind.minimum, value: 20 }];
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        properties: [
          {
            name: 'columns',
            attributes,
            content: [],
            type: [],
          },
          {
            name: 'columns_2',
            attributes,
            content: [],
            type: [],
          },
        ],
      },
    });

    const allAttributes = wrapper.findAll(ParameterAttributes);
    expect(allAttributes).toHaveLength(2);
    expect(allAttributes.at(0).props('attributes')).toEqual(attributes);
    expect(allAttributes.at(0).props('changes')).toEqual({});
  });

  it('passes changes down to children', () => {
    const propertyName = 'foo';
    const attributes = [{ kind: AttributeKind.minimum, value: 20 }];
    const changes = {
      properties: {
        [propertyName]: {
          name: propertyName,
          type: {
            new: {
              values: [{
                kind: 'removed',
                tokens: [
                  {
                    kind: 'text',
                    text: 'number',
                  },
                ],
              }],
            },
            previous: {
              values: [
                {
                  kind: 'added',
                  tokens: [
                    {
                      kind: 'text',
                      text: 'integer',
                    },
                  ],
                },
              ],
            },
          },
          attributes: {
            [AttributeKind.minimum]: {
              new: { value: 'newVal' },
              previous: { value: 'oldVal' },
            },
          },
        },
      },
    };
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        properties: [
          {
            name: propertyName,
            attributes,
            content: [],
            type: [],
          },
        ],
      },
      provide: {
        ...provide,
        store: {
          ...store,
          state: {
            apiChanges: {
              [provide.identifier]: changes,
            },
          },
        },
      },
    });

    // assert it passes the current `properties` of the `changes` for this page identifier.
    expect(wrapper.find(ParametersTable).props('changes'))
      .toHaveProperty(propertyName, changes.properties[propertyName]);
    // the first available property
    expect(wrapper.find(ParameterAttributes).props('changes'))
      .toEqual(changes.properties[propertyName].attributes);
  });

  it('passes an empty object if no changes', () => {
    const attributes = [{ kind: AttributeKind.minimum, value: 20 }];

    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        properties: [
          {
            name: 'foo',
            attributes,
            type: [],
            content: [],
          },
        ],
      },
    });

    expect(wrapper.find(ParametersTable).props('changes')).toEqual({});
    expect(wrapper.find(ParameterAttributes).props('changes')).toEqual({});
  });
});

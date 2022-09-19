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
import RestBody from 'docc-render/components/DocumentationTopic/PrimaryContent/RestBody.vue';
import { ChangeTypes } from 'docc-render/constants/Changes';

const {
  ParametersTable,
  PossiblyChangedType,
  ParameterAttributes,
  PossiblyChangedMimetype,
  WordBreak,
  PossiblyChangedTextAttribute,
  LinkableHeading,
} = RestBody.components;

const { ChangesKey } = RestBody.constants;

describe('RestBody', () => {
  let wrapper;

  const propsData = {
    title: 'HTTP Body',
    mimeType: 'multipart/form-data',
    bodyContentType: [
      {
        kind: 'identifier',
        text: 'form-data',
      },
    ],
    content: [
      {
        type: 'paragraph',
        inlineContent: [
          {
            type: 'text',
            text: 'foo',
          },
        ],
      },
    ],
  };

  const provide = {
    identifier: 'foo',
    store: {
      state: {
        apiChanges: {},
      },
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(RestBody, {
      propsData,
      stubs: { ParametersTable },
      provide,
    });
  });

  it('renders an h2 section title', () => {
    const sectionTitle = wrapper.find(LinkableHeading);
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toContain(propsData.title);
  });

  it('renders a single `ParametersTable`', () => {
    const tables = wrapper.findAll(ParametersTable);
    expect(tables.length).toBe(1);

    expect(tables.at(0).props()).toHaveProperty('parameters', [
      {
        content: propsData.content,
        mimeType: propsData.mimeType,
        type: propsData.bodyContentType,
        key: ChangesKey,
      },
    ]);
    expect(tables.at(0).props()).toHaveProperty('keyBy', 'key');
    expect(tables.at(0).props()).toHaveProperty('changes', {});

    expect(wrapper.find(PossiblyChangedMimetype).exists()).toBe(true);
  });

  it('hides the mimetype, if not provided', () => {
    wrapper = shallowMount(RestBody, {
      propsData: {
        ...propsData,
        mimeType: '',
      },
      stubs: { ParametersTable },
      provide,
    });
    expect(wrapper.find(PossiblyChangedMimetype).exists()).toBe(false);
  });

  it('does not render an h3 for "Parts"', () => {
    expect(wrapper.contains('h3')).toBe(false);
  });

  it('displays the `PossiblyChangedType` in the `param-symbol` if content exists', () => {
    expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
      .toBe(true);
    expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
      .toBe(false);
    expect(wrapper.find('.param .param-symbol').find(PossiblyChangedType).props('type'))
      .toEqual(propsData.bodyContentType);
  });

  it('displays the `PossiblyChangedType` in the `param-symbol` if no content exists', () => {
    wrapper.setProps({
      content: [],
    });
    expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
      .toBe(true);
    expect(wrapper.find('.param .param-symbol').find(PossiblyChangedType).props('type'))
      .toEqual(propsData.bodyContentType);
    expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
      .toBe(false);
  });

  it('provides API changes', () => {
    const changes = {
      [ChangesKey]: {
        change: ChangeTypes.modified,
        type: {
          new: [],
          previous: [],
        },
        mimetype: {
          new: [],
          previous: [],
        },
      },
    };

    wrapper = shallowMount(RestBody, {
      propsData,
      stubs: { ParametersTable },
      provide: {
        ...provide,
        store: {
          state: {
            apiChanges: {
              [provide.identifier]: changes,
            },
          },
        },
      },
    });

    const table = wrapper.find(ParametersTable);
    expect(table.props()).toHaveProperty('changes', changes);
    expect(wrapper.find(PossiblyChangedType).props())
      .toHaveProperty('changes', changes[ChangesKey].type);

    expect(wrapper.find(PossiblyChangedMimetype).props())
      .toMatchObject({ changes: changes[ChangesKey].mimetype, change: changes[ChangesKey].change });
  });

  describe('with parts', () => {
    const firstKey = 'Any Key';
    const parts = [
      {
        name: firstKey,
        mimeType: 'application/octet-stream',
        required: true,
        type: [
          {
            kind: 'text',
            text: 'binary',
          },
        ],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'bar',
              },
            ],
          },
        ],
      },
      {
        name: 'article.json',
        mimeType: 'application/json',
        required: false,
        type: [
          {
            kind: 'identifier',
            text: 'string',
          },
        ],
        content: [
          {
            type: 'paragraph',
            inlineContent: [
              {
                type: 'text',
                text: 'baz',
              },
            ],
          },
        ],
      },
    ];

    beforeEach(() => wrapper.setProps({ parts }));

    it('renders an h3 for "Parts"', () => {
      const h3 = wrapper.find('h3');
      expect(h3.exists()).toBe(true);
      expect(h3.text()).toBe('Parts');
    });

    it('renders 2 param tables, using the second to render parts', () => {
      const tables = wrapper.findAll(ParametersTable);
      expect(tables.length).toBe(2);
      expect(tables.at(1).props()).toEqual({ parameters: parts, changes: {}, keyBy: 'name' });
    });

    it('renders a part name', () => {
      const partName = wrapper.find('.parts .part-name');
      expect(partName.contains(WordBreak));
      const wb = partName.find(WordBreak);
      expect(wb.attributes('tag')).toBe('code');
      expect(wb.text()).toEqual('Any Key');
    });

    it('displays the PossiblyChangedType in the `param-symbol` if content exists', () => {
      expect(wrapper.find('.parts .param .param-symbol').contains(PossiblyChangedType))
        .toBe(true);
      expect(wrapper.find('.parts .param .param-content').contains(PossiblyChangedType))
        .toBe(false);
      expect(wrapper.find('.parts .param .param-symbol').find(PossiblyChangedType).props('type'))
        .toEqual(parts[0].type);
    });

    it('displays the PossiblyChangedType in the `param-content` if no content exists', async () => {
      wrapper.setProps({
        parts: [
          {
            name: 'Any Key',
            mimeType: 'application/octet-stream',
            type: [
              {
                kind: 'text',
                text: 'binary',
              },
            ],
            content: undefined,
          },
        ],
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.parts .param .param-symbol').contains(PossiblyChangedType))
        .toBe(false);
      expect(wrapper.find('.parts .param .param-content').contains(PossiblyChangedType))
        .toBe(true);

      expect(wrapper.find('.parts .param .param-content').find(PossiblyChangedType).props('type'))
        .toEqual(parts[0].type);
    });

    it('renders a `ParameterAttributes`', async () => {
      const attributes = [{
        kind: 'minimum',
        title: 'Minimum',
        value: '10',
      }];

      wrapper.setProps({
        parts: [
          {
            name: 'Any Key',
            mimeType: 'application/octet-stream',
            type: [
              {
                kind: 'text',
                text: 'binary',
              },
            ],
            attributes,
          },
        ],
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.parts').find(ParameterAttributes).props('attributes'))
        .toEqual(attributes);
    });

    it('provides API changes', () => {
      const changes = {
        [ChangesKey]: {
          parts: {
            [firstKey]: {
              change: ChangeTypes.modified,
              type: {
                new: [],
                previous: [],
              },
              mimetype: {
                new: [],
                previous: [],
              },
              required: {
                new: true,
                previous: false,
              },
              attributes: {},
            },
          },
        },
      };

      wrapper = shallowMount(RestBody, {
        propsData: {
          ...propsData,
          parts,
        },
        stubs: { ParametersTable },
        provide: {
          ...provide,
          store: {
            state: {
              apiChanges: {
                [provide.identifier]: changes,
              },
            },
          },
        },
      });

      const table = wrapper.findAll(ParametersTable).at(1);
      expect(table.props()).toHaveProperty('changes', changes[ChangesKey].parts);

      const partsChange = changes[ChangesKey].parts[firstKey];
      expect(table.find(PossiblyChangedType).props())
        .toHaveProperty('changes', partsChange.type);

      expect(table.find(PossiblyChangedMimetype).props())
        .toMatchObject({ changes: partsChange.mimetype, change: partsChange.change });

      expect(table.find(PossiblyChangedTextAttribute).props())
        .toHaveProperty('changes', partsChange.required);

      expect(table.find(ParameterAttributes).props())
        .toHaveProperty('changes', partsChange.attributes);
    });
  });
});

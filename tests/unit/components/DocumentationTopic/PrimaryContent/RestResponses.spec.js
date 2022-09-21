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
import RestResponses from 'docc-render/components/DocumentationTopic/PrimaryContent/RestResponses.vue';
import { ChangeTypes } from 'docc-render/constants/Changes';

const {
  PossiblyChangedType,
  PossiblyChangedMimetype,
  ParametersTable,
  LinkableHeading,
} = RestResponses.components;

describe('RestResponses', () => {
  const propsData = {
    kind: 'restResponses',
    title: 'Title',
    // named items in original data
    responses: [
      {
        status: '200',
        reason: 'OK',
        mimetype: 'application/json',
        type: [
          {
            kind: 'identifier',
            text: 'Foo',
          },
        ],
        content: [
          {
            type: 'text',
            text: 'The request was successful.',
          },
        ],
      },
    ],
  };
  const provide = {
    identifier: 'foo',
    store: {
      addOnThisPageSection: () => ({}),
      state: {
        apiChanges: null,
      },
    },
  };

  function mountComponent(options) {
    const wrapper = mount(RestResponses, {
      stubs: ['ContentNode', 'router-link'],
      propsData,
      provide,
      ...options,
    });
    return wrapper;
  }

  it('renders an h2 section title', () => {
    const sectionTitle = mountComponent().find(LinkableHeading);
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toContain(propsData.title);
  });

  it('renders a `ParametersTable`', () => {
    const wrapper = mountComponent();
    const props = wrapper.find(ParametersTable).props();
    expect(props).toHaveProperty('keyBy', 'status');
    expect(props).toHaveProperty('parameters', propsData.responses);
    expect(props).toHaveProperty('changes', {});
  });

  it('displays the responses information', () => {
    const wrapper = mountComponent();
    expect(
      wrapper
        .find('.response-name')
        .text()
        // condense all whitespace
        .replace(/\s+/g, ' '),
    ).toBe('200 OK');
    expect(wrapper.find('.response-reason').text()).toBe('OK');
    expect(wrapper.find(PossiblyChangedMimetype).exists()).toBe(true);

    expect(
      wrapper
        .findAll({ name: 'ContentNode' })
        .at(0)
        .props('content'),
    ).toEqual(propsData.responses[0].content);
  });

  it('hides mime-type if absent', () => {
    const { mimetype, ...otherProps } = propsData.responses[0];
    const wrapper = mountComponent({
      propsData: {
        ...propsData,
        responses: [{ ...otherProps }],
      },
    });
    expect(wrapper.find(PossiblyChangedMimetype).exists()).toBe(false);
  });

  describe('moves the `PossiblyChangedType`', () => {
    it('to the `param-symbol` if content or reason is provided', () => {
      const wrapper = mountComponent();

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType)).toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);

      expect(
        wrapper
          .find({ name: 'PossiblyChangedType' })
          .props('type'),
      ).toEqual(propsData.responses[0].type);
    });

    it('to the `param-symbol` if no `content` but `reason`', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          responses: [{
            status: '200',
            reason: 'OK',
            mimetype: 'application/json',
            type: [
              {
                kind: 'identifier',
                text: 'Foo',
              },
            ],
            content: [],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType)).toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);
    });

    it('to the `param-symbol` if no reason but content exists', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          responses: [{
            status: '200',
            mimetype: 'application/json',
            type: [
              {
                kind: 'identifier',
                text: 'Foo',
              },
            ],
            content: [{
              type: 'text',
              text: 'The request was successful.',
            }],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType)).toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);
    });

    it('to the `param-content` if no `content` or `reason` and has `status`', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          responses: [{
            status: '200',
            mimetype: 'application/json',
            type: [
              {
                kind: 'identifier',
                text: 'Foo',
              },
            ],
            content: [],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
        .toBe(false);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(true);

      expect(
        wrapper
          .find({ name: 'PossiblyChangedType' })
          .props('type'),
      ).toEqual(propsData.responses[0].type);
    });

    it('to the `param-symbol` if no `content` or `reason` and no `status`', () => {
      const wrapper = mountComponent({
        propsData: {
          ...propsData,
          responses: [{
            status: undefined,
            content: [],
            reason: undefined,
            mimetype: 'application/json',
            type: [
              {
                kind: 'identifier',
                text: 'Foo',
              },
            ],
          }],
        },
      });

      expect(wrapper.find('.param .param-symbol').contains(PossiblyChangedType))
        .toBe(true);
      expect(wrapper.find('.param .param-content').contains(PossiblyChangedType))
        .toBe(false);
    });
  });

  it('renders API changes', () => {
    const changes = {
      200: {
        change: ChangeTypes.modified,
        type: {
          new: {},
          previous: {},
        },
        mimetype: {
          new: {},
          previous: {},
        },
      },
    };
    const wrapper = mountComponent({
      provide: {
        ...provide,
        store: {
          ...provide.store,
          state: {
            apiChanges: {
              [provide.identifier]: {
                restResponses: changes,
              },
            },
          },
        },
      },
    });
    expect(wrapper.find(PossiblyChangedType).props()).toHaveProperty('changes', changes['200'].type);
    expect(wrapper.find(PossiblyChangedMimetype).props()).toMatchObject({ changes: changes['200'].mimetype, change: changes['200'].change });
  });
});

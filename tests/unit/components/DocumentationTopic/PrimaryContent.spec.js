/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import PrimaryContent from 'docc-render/components/DocumentationTopic/PrimaryContent.vue';

const {
  Attributes,
  ContentNode,
  Parameters,
  PossibleValues,
  PropertyListKeyDetails,
  RestEndpoint,
  RestParameters,
  RestResponses,
  Mentions,
} = PrimaryContent.components;
const { SectionKind } = PrimaryContent.constants;

const attributesSection = {
  kind: SectionKind.attributes,
  attributes: [
    {
      kind: 'default',
      title: 'Default',
      value: 'foobar',
    },
  ],
};

const genericContentSection = {
  kind: SectionKind.content,
  content: [
    {
      type: 'text',
      text: 'foo',
    },
  ],
};

const detailsSection = {
  kind: SectionKind.details,
  details: {
    value: [
      { baseType: 'string' },
    ],
  },
};

const possibleValuesSection = {
  kind: SectionKind.possibleValues,
  values: ['Development', 'Production'],
};

const parametersSection = {
  kind: SectionKind.parameters,
  parameters: [
    {
      name: 'foo',
      content: [{ type: 'text', text: 'foo' }],
    },
    {
      name: 'bar',
      content: [{ type: 'text', text: 'bar' }],
    },
  ],
};

const restParametersSection = {
  kind: SectionKind.restParameters,
  title: 'Title',
  // could be just an empty array since we just check the reference
  items: [
    {
      name: 'foo',
      type: 'string',
      content: [{ type: 'text', text: 'it is foo' }],
    },
    {
      name: 'bar',
      type: 'number',
      content: [{ type: 'text', text: 'it is bar' }],
    },
  ],
};

const restHeadersSection = {
  kind: SectionKind.restHeaders,
  title: 'Title',
  items: [
    {
      name: 'foo',
      content: [{ type: 'text', text: 'it is foo' }],
    },
    {
      name: 'bar',
      content: [{ type: 'text', text: 'it is bar' }],
    },
  ],
};

const restCookiesSection = {
  kind: SectionKind.restCookies,
  title: 'Title',
  items: [
    {
      name: 'foo',
      content: [{ type: 'text', text: 'it is foo' }],
    },
  ],
};

const restResponsesSection = {
  kind: SectionKind.restResponses,
  title: 'Title',
  items: [
    {
      status: '200',
      reason: 'OK',
      mimetype: 'application/json',
      type: {
        identifier: 'topic://url',
        type: 'reference',
      },
      content: [{ type: 'text', text: 'it is foo' }],
    },
  ],
};

const restEndpointSection = {
  kind: 'restEndpoint',
  title: 'URL',
  tokens: [{ kind: 'method', text: 'POST' }, { kind: 'text', text: ' ' }],
};

const mentions = {
  kind: 'mentions',
  mentions: [
    'topic://url',
  ],
};

const propsData = {
  conformance: { availbilityPrefix: [], constraints: [] },
  source: { url: 'foo.com' },
  sections: [
    attributesSection,
    detailsSection,
    genericContentSection,
    parametersSection,
    restParametersSection,
    restHeadersSection,
    restCookiesSection,
    restResponsesSection,
    possibleValuesSection,
    restEndpointSection,
    mentions,
  ],
};

describe('PrimaryContent', () => {
  it('renders ".primary-content" class at the root', () => {
    const wrapper = shallowMount(PrimaryContent, { propsData });
    expect(wrapper.classes('primary-content')).toBe(true);
  });

  /**
   * Assert given props are the one passed to the rendered wrapper
   *
   * @param {*} Component Component to find and check props
   * @param {*} props expected props
   * @param {{ info?: string, at?: number }} [options] Extra options
   */
  function checkProps(Component, props, { info = '', at = 0 } = {}) {
    it(`renders a "${Component.name}"${info ? `: ${info}` : ''}`, () => {
      const wrapper = shallowMount(PrimaryContent, { propsData });
      const component = wrapper.findAllComponents(Component).at(at);
      expect(component.exists()).toBe(true);
      expect(component.props()).toEqual(props);
    });
  }

  checkProps(Attributes, { attributes: attributesSection.attributes });
  checkProps(PropertyListKeyDetails, { details: detailsSection.details });
  checkProps(ContentNode, { content: genericContentSection.content, tag: 'div' });
  checkProps(Parameters, { parameters: parametersSection.parameters });
  checkProps(RestParameters, { parameters: restParametersSection.items, title: 'Title' });
  checkProps(
    RestParameters,
    { parameters: restHeadersSection.items, title: 'Title' },
    { info: 'headers', at: 1 },
  );
  checkProps(RestEndpoint, { tokens: restEndpointSection.tokens, title: 'URL' });
  checkProps(
    RestParameters,
    { parameters: restCookiesSection.items, title: 'Title' },
    { info: 'cookies', at: 2 },
  );
  checkProps(RestResponses, { responses: restResponsesSection.items, title: 'Title' });
  checkProps(PossibleValues, { values: possibleValuesSection.values });
  checkProps(Mentions, { mentions: ['topic://url'] });
});

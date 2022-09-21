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
import Parameters from 'docc-render/components/DocumentationTopic/PrimaryContent/Parameters.vue';

const {
  ContentNode,
  LinkableHeading,
} = Parameters.components;

describe('Parameters', () => {
  let wrapper;

  const propsData = {
    parameters: [
      {
        name: 'foo',
        content: [
          {
            type: 'text',
            text: 'foo',
          },
        ],
      },
      {
        name: 'bar',
        content: [
          {
            type: 'text',
            text: 'foo',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(Parameters, { propsData });
  });

  it('renders an `section.parameters`', () => {
    expect(wrapper.is('section.parameters')).toBe(true);
  });

  it('renders an h2 with "Parameters"', () => {
    const h2 = wrapper.find(LinkableHeading);
    expect(h2.exists()).toBe(true);
    expect(h2.props('level')).toBe(2);
    expect(h2.text()).toContain('Parameters');
  });

  it('renders a <dl>', () => {
    const dl = wrapper.find('dl');
    expect(dl.exists()).toBe(true);
  });

  it('renders a <dt> with code voice for each parameter name', () => {
    const names = wrapper.findAll('dl dt.param-name');
    expect(names.length).toBe(propsData.parameters.length);

    names.wrappers.forEach((name, i) => {
      const code = name.find('code');
      expect(code.exists()).toBe(true);
      expect(code.text()).toBe(propsData.parameters[i].name);
    });
  });

  it('renders a <dd> with a `ContentNode` for each parameter\'s content', () => {
    const contents = wrapper.findAll('dl dd.param-content');
    expect(contents.length).toBe(propsData.parameters.length);

    contents.wrappers.forEach((content, i) => {
      const node = content.find(ContentNode);
      expect(node.exists()).toBe(true);
      expect(node.props('content')).toEqual(propsData.parameters[i].content);
    });
  });
});

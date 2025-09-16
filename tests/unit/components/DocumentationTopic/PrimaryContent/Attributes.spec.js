/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';

import { PrimaryContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import Attributes from 'docc-render/components/DocumentationTopic/PrimaryContent/Attributes.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import ParameterAttributes from 'docc-render/components/DocumentationTopic/PrimaryContent/ParameterAttributes.vue';

const propsData = {
  attributes: [
    {
      kind: 'default',
      title: 'Default',
      value: 'foobar',
    },
  ],
};

const createWrapper = (opts = {}) => shallowMount(Attributes, {
  propsData,
  ...opts,
});

describe('Attributes', () => {
  it('renders a section', () => {
    const wrapper = createWrapper();
    const section = wrapper.findComponent('section.attributes');
    expect(section.exists()).toBe(true);
  });

  it('renders a linkable heading', () => {
    const wrapper = createWrapper();
    const heading = wrapper.findComponent(LinkableHeading);

    const {
      anchor,
      level,
      title,
    } = PrimaryContentSectionAnchors[SectionKind.attributes];
    expect(heading.exists()).toBe(true);
    expect(heading.props('anchor')).toBe(anchor);
    expect(heading.props('level')).toBe(level);
    expect(heading.text()).toBe(title);
  });

  it('renders a `ParameterAttributes`', () => {
    const wrapper = createWrapper();
    const attrs = wrapper.findComponent(ParameterAttributes);
    expect(attrs.exists()).toBe(true);
    expect(attrs.props('attributes')).toEqual(propsData.attributes);
  });
});

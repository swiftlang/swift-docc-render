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
import BodyContent from 'docc-render/components/Article/BodyContent.vue';
import Columns from 'docc-render/components/Article/Layouts/Columns.vue';
import ContentAndMedia from 'docc-render/components/Article/Layouts/ContentAndMedia.vue';
import FullWidth from 'docc-render/components/Article/Layouts/FullWidth.vue';

describe('BodyContent', () => {
  let wrapper;

  const columnsSection = {
    kind: 'columns',
    content: [
      {
        content: [{ type: 'text', text: 'a' }],
        media: 'a.png',
      },
      {
        media: 'b.png',
      },
      {
        content: [{ type: 'text', text: 'c' }],
        media: 'c.png',
      },
    ],
  };

  const contentAndMediaSection = {
    kind: 'contentAndMedia',
    content: [{ type: 'text', text: 'foo' }],
    media: 'bar.jpg',
    mediaPosition: 'trailing',
  };

  const fullWidthSection = {
    kind: 'fullWidth',
    content: [{ type: 'text', text: 'Foobar' }],
  };

  const propsData = {
    content: [
      columnsSection,
      fullWidthSection,
      contentAndMediaSection,
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(BodyContent, { propsData });
  });

  it('renders an article.bodycontent', () => {
    expect(wrapper.is('article.body-content')).toBe(true);
  });

  it('renders a `Columns` layout', () => {
    const section = wrapper.find(Columns);
    expect(section.exists()).toBe(true);
    expect(section.props('columns')).toEqual(columnsSection.content);
  });

  it('renders a `ContentAndMedia` layout', () => {
    const { kind, ...expectedProps } = contentAndMediaSection;
    const section = wrapper.find(ContentAndMedia);
    expect(section.exists()).toBe(true);
    expect(section.props()).toEqual(expectedProps);
  });

  it('renders a `FullWidth` layout', () => {
    const { kind, ...expectedProps } = fullWidthSection;
    const section = wrapper.find(FullWidth);
    expect(section.exists()).toBe(true);
    expect(section.props('content')).toEqual(expectedProps.content);
  });
});

/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TopicLinkBlockIcon from '@/components/DocumentationTopic/TopicLinkBlockIcon.vue';
import { mount } from '@vue/test-utils';
import { TopicRole } from '@/constants/roles';
import ArticleIcon from '@/components/Icons/ArticleIcon.vue';
import SVGIcon from '@/components/SVGIcon.vue';

const defaultProps = {
  role: TopicRole.article,
};

const createWrapper = ({ propsData, ...others } = {}) => mount(TopicLinkBlockIcon, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('TopicLinkBlockIcon', () => {
  it('renders an icon from a `role`', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.topic-icon').is(ArticleIcon)).toBe(true);
  });

  it('renders an override icon from an image override', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: {
          variants: [{
            url: '/foo/bar',
            svgID: 'foo',
          }],
        },
      },
    });
    const icon = wrapper.find('.topic-icon');
    expect(icon.is(ArticleIcon)).toBe(false);
    expect(icon.is(SVGIcon)).toBe(true);
    expect(icon.props()).toMatchObject({
      iconUrl: '/foo/bar',
      themeId: 'foo',
    });
  });

  it('renders nothing if no role or image override', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: null,
        role: TopicRole.devLink, // no icon for this
      },
    });
    expect(wrapper.html()).toBeFalsy();
  });
});

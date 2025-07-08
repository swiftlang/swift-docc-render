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
import TechnologyIcon from '@/components/Icons/TechnologyIcon.vue';

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
    expect(wrapper.findComponent('.topic-icon').is(ArticleIcon)).toBe(true);
  });

  it('renders nothing if no role', () => {
    const wrapper = createWrapper({
      propsData: {
        role: TopicRole.devLink, // no icon for this
      },
    });
    expect(wrapper.html()).toBeFalsy();
  });

  it('uses the technology icon for collections', () => {
    const propsData = { role: TopicRole.collection };
    const wrapper = createWrapper({ propsData });
    expect(wrapper.findComponent('.topic-icon').is(TechnologyIcon)).toBe(true);
  });
});

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
import Card from '@/components/Card.vue';
import { TopicRole } from '@/constants/roles';
import TopicTypeIcon from '@/components/TopicTypeIcon.vue';
import TopicsLinkCardGridItem, {
  ROLE_LINK_TEXT,
} from '@/components/DocumentationTopic/TopicsLinkCardGridItem.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';

const defaultProps = {
  item: {
    url: 'http://foo.com',
    images: [{
      type: 'card',
      identifier: 'card-reference',
    }],
    title: 'Foo',
    abstract: [{ type: 'text', text: 'Content' }],
    role: TopicRole.article,
  },
};

const iconRef = {
  identifier: 'iconRef',
  variants: [{
    url: 'path/to/icon',
    traits: [
      '2x',
      'light',
    ],
  }],
};
const references = {
  iconRef,
  'card-reference': {
    variants: [{
      url: '/path/to/card',
      traits: [
        '2x',
        'light',
      ],
    }],
  },
};

const createWrapper = ({ propsData, ...others } = {}) => mount(TopicsLinkCardGridItem, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  provide: { references },
  ...others,
});

describe('TopicsLinkCardGridItem', () => {
  it('renders the TopicsLinkCardGridItem', () => {
    const wrapper = createWrapper();
    const card = wrapper.find(Card);
    expect(card.props()).toMatchObject({
      url: defaultProps.item.url,
      image: defaultProps.item.images[0].identifier,
      title: defaultProps.item.title,
      floatingStyle: true,
      size: undefined,
      linkText: '',
    });
    expect(wrapper.find('.reference-card-grid-item__image').exists()).toBe(false);
    expect(wrapper.find(ContentNode).exists()).toBe(false);
  });

  it('renders a TopicsLinkCardGridItem, with an icon as a fallback', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          images: [],
        },
      },
    });
    const card = wrapper.find(Card);
    expect(card.props()).toMatchObject({
      url: defaultProps.item.url,
      image: null,
      title: defaultProps.item.title,
      floatingStyle: true,
      size: undefined,
      linkText: '',
    });
    expect(wrapper.find(ContentNode).exists()).toBe(false);
    const imageWrapper = wrapper.find('.reference-card-grid-item__image');
    expect(imageWrapper.exists()).toBe(true);
    const icon = imageWrapper.find(TopicTypeIcon);
    expect(icon.props()).toEqual({
      type: defaultProps.item.role,
      imageOverride: null,
      withColors: false,
      shouldCalculateOptimalWidth: true,
    });
  });

  it('renders the TopicsLinkCardGridItem, with a specific icon override', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          images: [{
            type: 'icon',
            identifier: iconRef.identifier,
          }],
        },
      },
    });
    expect(wrapper.find(TopicTypeIcon).props('imageOverride')).toEqual(iconRef);
  });

  it('renders a TopicsLinkCardGridItem, in a none compact variant', async () => {
    const wrapper = createWrapper({
      propsData: {
        ...defaultProps,
        compact: false,
      },
    });
    await wrapper.vm.$nextTick();
    const card = wrapper.find(Card);
    expect(card.props()).toMatchObject({
      url: defaultProps.item.url,
      image: defaultProps.item.images[0].identifier,
      title: defaultProps.item.title,
      floatingStyle: true,
      size: 'large',
      linkText: ROLE_LINK_TEXT[TopicRole.article],
    });
    expect(wrapper.find(ContentNode).props('content')).toBe(defaultProps.item.abstract);
  });

  it('renders different text for diff roles', () => {
    const wrapper = createWrapper({
      propsData: {
        ...defaultProps,
        compact: false,
        item: { ...defaultProps.item, role: TopicRole.overview },
      },
    });
    // overview
    const card = wrapper.find(Card);
    expect(card.props('linkText')).toBe(ROLE_LINK_TEXT[TopicRole.overview]);
    // collection
    wrapper.setProps({ item: { ...defaultProps.item, role: TopicRole.collection } });
    expect(card.props('linkText')).toBe(ROLE_LINK_TEXT[TopicRole.collection]);
    // symbol
    wrapper.setProps({ item: { ...defaultProps.item, role: TopicRole.symbol } });
    expect(card.props('linkText')).toBe(ROLE_LINK_TEXT[TopicRole.symbol]);
    // sampleCode
    wrapper.setProps({ item: { ...defaultProps.item, role: TopicRole.sampleCode } });
    expect(card.props('linkText')).toBe(ROLE_LINK_TEXT[TopicRole.sampleCode]);
    // other
    wrapper.setProps({ item: { ...defaultProps.item, role: TopicRole.link } });
    expect(card.props('linkText')).toBe('Learn more');
  });
});

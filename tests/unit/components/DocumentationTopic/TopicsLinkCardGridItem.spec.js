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
import TopicsLinkCardGridItem from '@/components/DocumentationTopic/TopicsLinkCardGridItem.vue';

const defaultProps = {
  item: {
    url: 'http://foo.com',
    images: [{
      type: 'card',
      reference: 'card-reference',
    }],
    title: 'Foo',
    abstract: [{ type: 'text', text: 'Content' }],
    role: TopicRole.article,
  },
};

const iconRef = {
  identifier: 'iconRef',
  variants: [{ url: 'path/to/icon' }],
};
const references = {
  iconRef,
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
      image: defaultProps.item.images[0].reference,
      title: defaultProps.item.title,
      content: [], // compact items do not have content
      floatingStyle: true,
      size: undefined,
      linkText: '',
    });
    expect(wrapper.find('.reference-card-grid-item__image').exists()).toBe(false);
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
      content: [], // compact items do not have content
      floatingStyle: true,
      size: undefined,
      linkText: '',
    });
    const imageWrapper = wrapper.find('.reference-card-grid-item__image');
    expect(imageWrapper.exists()).toBe(true);
    const icon = imageWrapper.find(TopicTypeIcon);
    expect(icon.props()).toEqual({
      type: defaultProps.item.role,
      imageOverride: null,
      withColors: false,
    });
  });

  it('renders the TopicsLinkCardGridItem, with a specific icon override', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          ...defaultProps.item,
          images: [{
            type: 'icon',
            reference: iconRef.identifier,
          }],
        },
      },
    });
    expect(wrapper.find(TopicTypeIcon).props('imageOverride')).toEqual(iconRef);
  });

  it('renders a TopicsLinkCardGridItem, in a none compact variant', () => {
    const wrapper = createWrapper({
      propsData: {
        ...defaultProps,
        compact: false,
      },
    });
    expect(wrapper.find(Card).props()).toMatchObject({
      url: defaultProps.item.url,
      image: defaultProps.item.images[0].reference,
      title: defaultProps.item.title,
      content: defaultProps.item.abstract,
      floatingStyle: true,
      size: 'large',
      linkText: 'Visit page',
    });
  });
});

/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Card from 'docc-render/components/Card.vue';
import CardSize from 'docc-render/constants/CardSize';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import { flushPromises } from '../../../test-utils';

const {
  CardCover, ButtonLink, DiagonalArrowIcon, InlineChevronRightIcon,
} = Card.components;

describe('Card', () => {
  const image = {
    identifier: 'identifier',
  };

  const references = {
    [image.identifier]: {
      variants: [{ url: 'image.com', traits: ['1x'] }],
    },
  };

  const propsData = {
    linkText: 'Watch',
    image: image.identifier,
    url: 'https://external.com',
    title: 'Foo Bar',
    eyebrow: 'eyebrow',
    hasButton: false,
  };

  const provide = { references };

  const mountCard = options => shallowMount(Card, {
    propsData,
    provide,
    slots: {
      default: '<div>Default content</div>',
    },
    ...options,
  });

  const cardTitleIdRE = /card_title_[0-9]+/;
  const cardEyebrowIdRE = /card_eyebrow_[0-9]+/;
  const cardContentIdRE = /card_content_[0-9]+/;

  it('renders a .card root', () => {
    const card = mountCard();
    expect(card.is('.card')).toBe(true);
    expect(card.classes('ide')).toBe(false);
  });

  it('applies the correct AX tags', () => {
    const card = mountCard();
    expect(card.attributes('aria-labelledby')).toMatch(/card_title_[0-9]+ card_eyebrow_[0-9]+/);
    expect(card.attributes('aria-describedby')).toMatch(cardContentIdRE);

    const eyebrow = card.find('.eyebrow');
    expect(eyebrow.attributes('aria-label')).toBe(`- ${propsData.eyebrow}`);
    expect(eyebrow.attributes('id')).toMatch(cardEyebrowIdRE);

    const title = card.find('.title');
    expect(title.attributes('id')).toMatch(cardTitleIdRE);
    // not visible by default
    expect(title.find('.visuallyhidden').exists()).toBe(false);

    expect(card.find('.details').attributes('aria-hidden')).toBe('true');
  });

  it('does not add invisible component IDs in the AX tags', () => {
    const card = mountCard({
      propsData: {
        ...propsData,
        eyebrow: '',
      },
      slots: {
        default: '',
      },
    });
    expect(card.attributes('aria-labelledby')).not.toContain('card_eyebrow_');
    expect(card.attributes('aria-describedby')).toBeFalsy();
  });

  it('renders `.link` with an `DiagonalArrowIcon` if external', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        showExternalLinks: true,
      },
    });
    const icon = wrapper.find('.link .link-icon');
    expect(icon.exists()).toBeTruthy();
    expect(icon.is(DiagonalArrowIcon)).toBeTruthy();
  });

  it('allows providing an AX helper text formatter, for external links', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        formatAriaLabel: label => `${label} (opens in browser)`,
      },
    });
    expect(wrapper.find('.eyebrow').attributes('aria-label')).toMatch(/- .* \(opens in browser\)$/);
  });

  it('renders `.link` with a ChevronIcon for internal links', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        showExternalLinks: false,
        hasButton: false,
      },
    });
    const icon = wrapper.find('.link .link-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.is(InlineChevronRightIcon)).toBe(true);
    // check if the special AX helper is visible for `references`
    expect(wrapper.find('.title .visuallyhidden').exists()).toBe(false);
  });

  it('renders a `ButtonLink` if hasButton is true', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        hasButton: true,
      },
    });
    const button = wrapper.find(ButtonLink);
    expect(button.exists()).toBe(true);
    expect(button.classes()).toEqual(['link']);
    const icon = wrapper.find('.link .link-icon');
    expect(icon.exists()).toBe(false);
  });

  it('renders a `div` if hasButton is false', () => {
    const wrapper = mountCard({
      propsData,
    });
    const div = wrapper.find('.link');
    expect(div.exists()).toBe(true);
    expect(div.is('div')).toBe(true);
  });

  it('renders no `.link`, if no `linkText` is provided', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        linkText: '',
      },
    });
    expect(wrapper.find('.link').exists()).toBe(false);
  });

  it('renders a CardCover components', () => {
    const wrapper = mountCard({
      propsData,
      provide,
      stubs: {
        CardCover,
      },
    });
    const cardCover = wrapper.find(CardCover);
    expect(cardCover.exists()).toBe(true);
    expect(cardCover.props()).toHaveProperty('variants', references[propsData.image].variants);
  });

  it('renders a `.link` with appropriate classes and aria label in WEB', () => {
    const wrapper = mountCard();
    const link = wrapper.find('.link');

    expect(link.attributes('aria-labelledby')).toBe(undefined);
    expect(link.attributes('aria-describedby')).toBe(undefined);
  });

  it('renders a Reference component at the root', () => {
    expect(mountCard().find(Reference).props('url')).toBe(propsData.url);
  });

  it('renders a .large or .small modifier depending on the size', () => {
    const smallCard = mountCard({ propsData: { ...propsData, size: CardSize.small } });
    expect(smallCard.classes('small')).toBe(true);
    expect(smallCard.classes('large')).toBe(false);

    const largeCard = mountCard({ propsData: { ...propsData, size: CardSize.large } });
    expect(largeCard.classes('small')).toBe(false);
    expect(largeCard.classes('large')).toBe(true);
  });

  it('renders a title', () => {
    const h3 = mountCard().find('.title');
    expect(h3.exists()).toBe(true);
    expect(h3.text()).toBe(propsData.title);
  });

  it('renders content in the default slot', async () => {
    const content = 'Foo bar baz';
    const wrapper = mountCard({
      slots: {
        default: content,
      },
    });
    await flushPromises();
    const contentDiv = wrapper.find('.card-content');
    expect(contentDiv.exists()).toBe(true);
    expect(contentDiv.text()).toEqual(content);
    expect(contentDiv.attributes('id')).toMatch(cardContentIdRE);
  });

  it('does not render the card-content, if no default slot provided', async () => {
    const wrapper = mountCard({
      slots: {
        default: '',
      },
    });
    await flushPromises();
    expect(wrapper.find('.card-content').exists()).toBe(false);
  });

  it('renders card as a `floatingStyle`', () => {
    const wrapper = mountCard({
      propsData: {
        ...propsData,
        floatingStyle: true,
      },
    });
    expect(wrapper.find(CardCover).props('rounded')).toBe(true);
    expect(wrapper.classes()).toContain('floating-style');
  });
});

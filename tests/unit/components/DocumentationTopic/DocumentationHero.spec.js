/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DocumentationHero from '@/components/DocumentationTopic/DocumentationHero.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicTypes, TopicTypeAliases } from '@/constants/TopicTypes';
import TopicTypeIcon from 'docc-render/components/TopicTypeIcon.vue';
import { HeroColors, HeroColorsMap } from '@/constants/HeroColors';
import { TopicRole } from '@/constants/roles';

const defaultProps = {
  role: TopicTypes.class,
  enhanceBackground: true,
  shortHero: true,
  shouldShowLanguageSwitcher: true,
  iconOverride: { variants: ['foo'] },
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(DocumentationHero, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  slots: {
    default: '<div class="default-slot">Default Slot</div>',
    'above-content': '<div class="above-content-slot">Above Content Slot</div>',
  },
  ...others,
});

describe('DocumentationHero', () => {
  it('renders the right classes based on the presence of the background', () => {
    const withBackground = createWrapper();
    expect(withBackground.classes('documentation-hero')).toBe(true);
    expect(withBackground.classes('documentation-hero--disabled')).toBe(false);
    expect(withBackground.classes('theme-dark')).toBe(true);

    const withoutBackground = createWrapper({
      propsData: {
        enhanceBackground: false,
      },
    });
    expect(withoutBackground.classes('documentation-hero')).toBe(true);
    expect(withoutBackground.classes('documentation-hero--disabled')).toBe(true);
    expect(withoutBackground.classes('theme-dark')).toBe(false);
  });

  it('renders the DocumentationHero, enabled', () => {
    const wrapper = createWrapper();
    const allIcons = wrapper.findAll(TopicTypeIcon);
    expect(allIcons).toHaveLength(1);
    expect(allIcons.at(0).props()).toEqual({
      withColors: true,
      type: defaultProps.role,
      imageOverride: defaultProps.iconOverride,
      shouldCalculateOptimalWidth: true,
    });
    expect(allIcons.at(0).classes()).toEqual(['background-icon', 'first-icon']);
    // assert slot
    expect(wrapper.find('.default-slot').text()).toBe('Default Slot');
    expect(wrapper.find('.above-content-slot').text()).toBe('Above Content Slot');
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-documentation-intro-accent, var(--color-type-icon-${HeroColorsMap[defaultProps.role]}, var(--color-figure-gray-secondary)))`,
    });
  });

  it('renders the right classes based on `shortHero` prop', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.short-hero').exists()).toBe(true);

    wrapper.setProps({
      shortHero: false,
    });
    expect(wrapper.find('.short-hero').exists()).toBe(false);
  });

  it('renders the right classes based on `shouldShowLanguageSwitcher` prop', () => {
    const wrapper = createWrapper();
    const content = wrapper.find('.documentation-hero__content');

    expect(content.classes()).toContain('extra-bottom-padding');

    wrapper.setProps({
      shouldShowLanguageSwitcher: false,
    });
    expect(content.classes()).not.toContain('extra-bottom-padding');
  });

  it('finds aliases, for the color', () => {
    const wrapper = createWrapper({
      propsData: {
        role: TopicTypes.init,
      },
    });
    const color = HeroColorsMap[TopicTypeAliases[TopicTypes.init]];
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-documentation-intro-accent, var(--color-type-icon-${color}, var(--color-figure-gray-secondary)))`,
    });
  });

  it('falls back to the teal color for types without a color', () => {
    const wrapper = createWrapper({
      propsData: {
        role: TopicTypes.section,
      },
    });
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-documentation-intro-accent, var(--color-type-icon-${HeroColors.teal}, var(--color-figure-gray-secondary)))`,
    });
  });

  it('utilizes the "sky" color for top level collection pages', () => {
    const wrapper = createWrapper({
      propsData: { role: TopicTypes.collection },
    });
    expect(wrapper.vm.styles['--accent-color'])
      .toBe('var(--color-documentation-intro-accent, var(--color-type-icon-sky, var(--color-figure-gray-secondary)))');
  });

  it('renders the DocumentationHero, disabled', () => {
    const wrapper = createWrapper();
    wrapper.setProps({
      enhanceBackground: false,
    });
    // assert no icon
    const allIcons = wrapper.findAll(TopicTypeIcon);
    expect(allIcons).toHaveLength(0);
    // assert slot
    expect(wrapper.find('.default-slot').text()).toBe('Default Slot');
    expect(wrapper.vm.styles).toEqual({
      '--accent-color': `var(--color-documentation-intro-accent, var(--color-type-icon-${HeroColorsMap[defaultProps.role]}, var(--color-figure-gray-secondary)))`,
    });
  });

  it('maps the "collection" role to the "module" type', () => {
    const wrapper = createWrapper({
      propsData: {
        enhanceBackground: true,
        role: TopicRole.collection,
      },
    });
    expect(wrapper.find(TopicTypeIcon).props('type')).toBe(TopicTypes.module);
  });

  it('maps the "collectionGroup" role to the "collection" type', () => {
    const wrapper = createWrapper({
      propsData: {
        enhanceBackground: true,
        role: TopicRole.collectionGroup,
      },
    });
    expect(wrapper.find(TopicTypeIcon).props('type')).toBe(TopicTypes.collection);
  });
});

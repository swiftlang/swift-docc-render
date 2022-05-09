/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorLeafIcon from '@/components/Navigator/NavigatorLeafIcon.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicTypes, TopicTypeAliases } from '@/constants/TopicTypes';
import { HeroColorsMap } from 'docc-render/constants/HeroColors';
import CollectionIcon from '@/components/Icons/CollectionIcon.vue';

const createWrapper = opts => shallowMount(NavigatorLeafIcon, opts);
const {
  TopicTypeIcons,
  TopicTypeProps,
} = NavigatorLeafIcon.constants;

const cases = Object.keys(TopicTypes).map((type) => {
  const k = TopicTypeAliases[type] || type;
  const icon = TopicTypeIcons[k] || CollectionIcon;
  const color = HeroColorsMap[k];
  return [type, icon.name, TopicTypeProps[type] || {}, color, icon];
});

describe('NavigatorLeafIcon', () => {
  it.each(cases)('Should render %s as %s, with %O bindings, and a %s color', (type, iconName, bindings, color, icon) => {
    const wrapper = createWrapper({
      propsData: {
        type,
        withColors: true,
      },
    });
    const iconComponent = wrapper.find(icon);
    expect(iconComponent.props()).toMatchObject(bindings);
    if (color) {
      // we cannot assert on component, because JSDOM does not work with custom CSS vars
      expect(wrapper.vm.styles).toHaveProperty('color', `var(--color-type-icon-${color})`);
    }
  });

  it('renders an icon, without color class', () => {
    const wrapper = createWrapper({
      propsData: {
        type: TopicTypes.class,
        withColors: false,
      },
    });
    expect(wrapper.vm.styles).not.toHaveProperty('color');
  });
});

/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorLeafIcon, {
  TopicKindIcons,
  TopicKindProps,
} from '@/components/Navigator/NavigatorLeafIcon.vue';
import { shallowMount } from '@vue/test-utils';
import { TopicKind, TopicKindAliases, TopicKindColorsMap } from '@/constants/kinds';
import CollectionIcon from '@/components/Icons/CollectionIcon.vue';

const createWrapper = opts => shallowMount(NavigatorLeafIcon, opts);

const cases = Object.keys(TopicKind).map((kind) => {
  const k = TopicKindAliases[kind] || kind;
  const icon = TopicKindIcons[k] || CollectionIcon;
  const color = TopicKindColorsMap[k];
  return [kind, icon.name, TopicKindProps[kind] || {}, color, icon];
});

describe('NavigatorLeafIcon', () => {
  it.each(cases)('Should render %s as %s, with %O bindings, and a %s color', (kind, iconName, bindings, color, icon) => {
    const wrapper = createWrapper({
      propsData: {
        kind,
        withColors: true,
      },
    });
    const iconComponent = wrapper.find(icon);
    expect(iconComponent.props()).toMatchObject(bindings);
    if (color) {
      // we cannot assert on component, because JSDOM does not work with custom CSS vars
      expect(wrapper.vm.styles).toHaveProperty('color', `var(--color-kind-icon-${color})`);
    }
  });

  it('renders an icon, without color class', () => {
    const wrapper = createWrapper({
      propsData: {
        kind: TopicKind.class,
        withColors: false,
      },
    });
    expect(wrapper.vm.styles).not.toHaveProperty('color');
  });
});

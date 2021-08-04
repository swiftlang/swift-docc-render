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
import FrameworkList from 'docc-render/components/DocumentationTopic/Summary/FrameworkList.vue';

const {
  Item,
  List,
  Section,
  Title,
  WordBreak,
} = FrameworkList.components;

describe('FrameworkList', () => {
  let wrapper;

  const propsData = {
    frameworks: [
      { name: 'FooKit' },
      { name: 'BarKit' },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(FrameworkList, { propsData });
  });

  it('renders a `Section', () => {
    expect(wrapper.is('.frameworks')).toBe(true);

    const section = wrapper.find(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('frameworks')).toBe(true);
    expect(section.attributes('aria-label')).toBe('Frameworks');
    expect(section.attributes('role')).toBe('complementary');
  });

  it('renders a `Title`', () => {
    const title = wrapper.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Frameworks');
  });

  it('allows overriding the title via a prop', () => {
    wrapper.setProps({
      title: 'Foobar',
    });
    const title = wrapper.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Foobars');
    expect(wrapper.find(Section).attributes('aria-label')).toBe('Foobars');
  });

  it('renders a `List` with an `Item/WordBreak` for each framework', () => {
    const list = wrapper.find(List);
    expect(list.exists()).toBe(true);

    const items = list.findAll(Item);
    expect(items.length).toBe(propsData.frameworks.length);

    propsData.frameworks.forEach((framework, i) => {
      const wbreak = items.at(i).find(WordBreak);
      expect(wbreak.exists()).toBe(true);
      expect(wbreak.text()).toBe(framework.name);
    });
  });

  it('uses the singular "Framework" title with only a single framework', () => {
    wrapper.setProps({ frameworks: [propsData.frameworks[0]] });
    expect(wrapper.find(Section).attributes('aria-label')).toBe('Framework');
    expect(wrapper.find(Title).text()).toBe('Framework');
  });

  it('renders multiple names of any related modules', () => {
    wrapper.setProps({
      frameworks: [
        propsData.frameworks[0],
        {
          name: 'BarKit',
          relatedModules: ['BazKit', 'QuxKit'],
        },
      ],
    });

    const items = wrapper.findAll(Item);
    expect(items.length).toBe(2);

    const lastItem = items.at(items.length - 1);
    const names = lastItem.findAll('.name');
    expect(names.length).toBe(3);
    expect(names.at(0).text()).toBe('BarKit');
    expect(names.at(1).text()).toBe('BazKit');
    expect(names.at(2).text()).toBe('QuxKit');
  });
});

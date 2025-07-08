/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import Language from 'docc-render/constants/Language';
import LanguageSwitcher
  from 'docc-render/components/DocumentationTopic/Summary/LanguageSwitcher.vue';

const {
  LanguageSwitcherLink,
  Section,
  Title,
} = LanguageSwitcher.components;

jest.mock('docc-render/utils/assets', () => ({
  normalizeRelativePath: jest.fn(name => `/${name}`),
}));

describe('LanguageSwitcher', () => {
  let wrapper;

  const propsData = {
    interfaceLanguage: Language.swift.key.api,
    objcPath: 'documentation/foo',
    swiftPath: 'documentation/foo',
  };

  const mocks = {
    $route: {
      path: '/documentation/foo',
      query: {
        context: 'foo',
      },
    },
    $router: {
      push: jest.fn(),
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(LanguageSwitcher, {
      mocks,
      propsData,
    });
  });

  it('renders a summary `Section`', () => {
    expect(wrapper.classes()).toContain('language');

    const section = wrapper.findComponent(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes()).toContain('language');
    expect(section.attributes('role')).toBe('complementary');
    expect(section.attributes('aria-label')).toBe('language');
  });

  it('renders a summary `Title` of "Language"', () => {
    const title = wrapper.findComponent(Title);
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('formats.colon language');
  });

  it('renders a `LanguageSwitcherLink` for swift and objc', () => {
    const links = wrapper.findAllComponents(LanguageSwitcherLink);
    expect(links.length).toBe(2);

    expect(links.at(0).classes()).toContain('language-option');
    expect(links.at(0).classes()).toContain('swift');
    expect(links.at(0).classes()).toContain('active');
    expect(links.at(0).props('url')).toBeNull();
    expect(links.at(0).text()).toBe(Language.swift.name);

    expect(links.at(1).classes()).toContain('language-option');
    expect(links.at(1).classes()).toContain('objc');
    expect(links.at(1).classes()).not.toContain('active');
    expect(links.at(1).props('url').startsWith('/documentation/foo?')).toBe(true);
    expect(links.at(1).props('url')).toContain('language=objc');
    expect(links.at(1).props('url')).toContain('context=foo');
    expect(links.at(1).text()).toBe(Language.objectiveC.name);
  });

  it('renders the right links when the paths differ', async () => {
    await wrapper.setProps({
      ...propsData,
      interfaceLanguage: Language.objectiveC.key.api,
      objcPath: 'documentation/bar',
    });

    await wrapper.vm.$nextTick();

    const links = wrapper.findAllComponents(LanguageSwitcherLink);
    expect(links.length).toBe(2);

    expect(links.at(0).classes()).toContain('language-option');
    expect(links.at(0).classes()).toContain('swift');
    expect(links.at(0).classes()).not.toContain('active');
    expect(links.at(0).props('url')).toBe('/documentation/foo?context=foo');
    expect(links.at(0).text()).toBe(Language.swift.name);

    expect(links.at(1).classes()).toContain('language-option');
    expect(links.at(1).classes()).toContain('objc');
    expect(links.at(1).classes()).toContain('active');
    expect(links.at(1).props('url')).toBeNull();
    expect(links.at(1).text()).toBe(Language.objectiveC.name);
  });

  it('works fine without a `context` query parameter', () => {
    wrapper = shallowMount(LanguageSwitcher, {
      mocks: {
        $route: {
          path: '/documentation/foo',
          query: {},
        },
      },
      propsData,
    });
    const links = wrapper.findAllComponents(LanguageSwitcherLink);
    expect(links.length).toBe(2);

    expect(links.at(0).props('url')).toEqual(null);
    expect(links.at(1).props('url')).toBe('/documentation/foo?language=objc');
  });

  it('stores the preferred language when a link is clicked', () => {
    const store = { setPreferredLanguage: jest.fn() };
    wrapper = shallowMount(LanguageSwitcher, {
      mocks,
      propsData,
      provide: { store },
    });

    let link = wrapper.findAllComponents(LanguageSwitcherLink).at(1);
    link.vm.$emit('click');
    expect(store.setPreferredLanguage).toBeCalledWith(Language.objectiveC.key.url);

    link = wrapper.findAllComponents(LanguageSwitcherLink).at(0);
    link.vm.$emit('click');
    expect(store.setPreferredLanguage).toBeCalledWith(Language.swift.key.url);
  });

  it('does not store the preferred language when links are clicked for IDE targets', () => {
    const store = { setPreferredLanguage: jest.fn() };
    wrapper = shallowMount(LanguageSwitcher, {
      mocks,
      propsData,
      provide: {
        isTargetIDE: true,
        store,
      },
    });

    wrapper.findAllComponents(LanguageSwitcherLink).at(1).vm.$emit('click');
    expect(store.setPreferredLanguage).not.toBeCalled();
  });
});

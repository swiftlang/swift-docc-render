/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
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
    expect(wrapper.is('.language')).toBe(true);

    const section = wrapper.find(Section);
    expect(section.exists()).toBe(true);
    expect(section.classes('language')).toBe(true);
    expect(section.attributes('role')).toBe('complementary');
    expect(section.attributes('aria-label')).toBe('Language');
  });

  it('renders a summary `Title` of "Language"', () => {
    const title = wrapper.find(Title);
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Language:');
  });

  it('renders a `LanguageSwitcherLink` for swift and objc', () => {
    const links = wrapper.findAll(LanguageSwitcherLink);
    expect(links.length).toBe(2);

    expect(links.at(0).classes('language-option')).toBe(true);
    expect(links.at(0).classes('swift')).toBe(true);
    expect(links.at(0).classes('active')).toBe(true);
    expect(links.at(0).props('url')).toBeNull();
    expect(links.at(0).text()).toBe(Language.swift.name);

    expect(links.at(1).classes('language-option')).toBe(true);
    expect(links.at(1).classes('objc')).toBe(true);
    expect(links.at(1).classes('active')).toBe(false);
    expect(links.at(1).props('url').startsWith('/documentation/foo?')).toBe(true);
    expect(links.at(1).props('url')).toContain('language=objc');
    expect(links.at(1).props('url')).toContain('context=foo');
    expect(links.at(1).text()).toBe(Language.objectiveC.name);
  });

  it('renders the right links when the paths differ', () => {
    wrapper.setProps({
      ...propsData,
      interfaceLanguage: Language.objectiveC.key.api,
      objcPath: 'documentation/bar',
    });

    const links = wrapper.findAll(LanguageSwitcherLink);
    expect(links.length).toBe(2);

    expect(links.at(0).classes('language-option')).toBe(true);
    expect(links.at(0).classes('swift')).toBe(true);
    expect(links.at(0).classes('active')).toBe(false);
    expect(links.at(0).props('url')).toBe('/documentation/foo?context=foo');
    expect(links.at(0).text()).toBe(Language.swift.name);

    expect(links.at(1).classes('language-option')).toBe(true);
    expect(links.at(1).classes('objc')).toBe(true);
    expect(links.at(1).classes('active')).toBe(true);
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
    const links = wrapper.findAll(LanguageSwitcherLink);
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

    let link = wrapper.findAll(LanguageSwitcherLink).at(1);
    link.vm.$emit('click');
    expect(store.setPreferredLanguage).toBeCalledWith(Language.objectiveC.key.url);

    link = wrapper.findAll(LanguageSwitcherLink).at(0);
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

    wrapper.findAll(LanguageSwitcherLink).at(1).vm.$emit('click');
    expect(store.setPreferredLanguage).not.toBeCalled();
  });
});

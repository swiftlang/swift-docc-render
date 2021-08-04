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
    expect(title.text()).toBe('Language');
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
    expect(links.at(1).props('url')).toEqual({
      path: null,
      query: { language: Language.objectiveC.key.url, context: 'foo' },
    });
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
    // make sure the `language` parameter is `undefined`,
    // otherwise Vue-Router has issues with navigating to Swift pages
    expect(links.at(0).props('url'))
      .toStrictEqual({ path: null, query: { context: 'foo', language: undefined } });
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
    expect(links.at(1).props('url'))
      .toStrictEqual({
        path: null,
        query: { context: undefined, language: Language.objectiveC.key.url },
      });
  });
});

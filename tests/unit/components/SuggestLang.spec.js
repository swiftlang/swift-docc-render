/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import SuggestLang from 'docc-render/components/SuggestLang.vue';
import AppStore from 'docc-render/stores/AppStore';
import { getLocaleParam, getCodeForSlug } from 'docc-render/utils/i18n-utils';

jest.mock('docc-render/utils/i18n-utils', () => ({
  getCodeForSlug: jest.fn(value => value),
  getLocaleParam: jest.fn(slug => ({ params: { locale: slug } })),
}));

jest.mock('docc-render/stores/AppStore', () => ({
  setPreferredLocale: jest.fn(),
  state: {
    preferredLocale: '',
  },
}));

const {
  InlineChevronRightIcon,
  CloseIcon,
} = SuggestLang.components;

const matchingLocale = 'en-US';

const messages = {
  [matchingLocale]: { 'view-in': 'View in English' },
};

const currentLocale = 'zh-CN';

const href = '/en-US/documentation/bar';

const $route = { path: '/documentation/bar', params: {}, query: { language: 'objc' } };

const resolve = jest.fn(() => ({ href }));

const createWrapper = (mocks = {}) => shallowMount(SuggestLang, {
  mocks: {
    $i18n: {
      messages,
      locale: currentLocale,
    },
    $router: {
      push: jest.fn(),
      resolve,
    },
    $route,
    ...mocks,
  },
});

describe('SuggestLang', () => {
  let wrapper;
  let link;
  let closeIcon;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-GB');
    wrapper = createWrapper();

    link = wrapper.find('.suggest-lang__link');
    closeIcon = wrapper.find('.suggest-lang__close-icon-button');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a <SuggestLang> if preferredLocale is different to currentLocale', () => {
    expect(wrapper.element.matches('.suggest-lang')).toBe(true);
  });

  it('does not render if preferredLocale is the currentLocale', () => {
    wrapper = createWrapper({
      $i18n: {
        messages,
        locale: matchingLocale,
      },
    });

    expect(wrapper.find('.suggest-lang').exists()).toBe(false);
  });

  it('renders a link with the preferredLocale view-in text and lang tag using the matching locale', () => {
    expect(link.text()).toBe(messages[matchingLocale]['view-in']);
    expect(getCodeForSlug).toHaveBeenCalledWith(matchingLocale);
    expect(link.attributes('lang')).toBe(matchingLocale);
  });

  it('sets the preferred locale when the link is clicked', () => {
    link.trigger('click');

    expect(AppStore.setPreferredLocale).toHaveBeenCalledWith(matchingLocale);
  });

  it('links to the preferredLocale url with a page load', () => {
    expect(getLocaleParam).toHaveBeenCalledWith(matchingLocale);
    expect(resolve).toHaveBeenCalledWith({
      params: { locale: matchingLocale },
      query: $route.query,
    });
    expect(link.element.matches('a')).toBe(true);
    expect(link.attributes('href')).toBe(href);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
  });

  it('renders a InlineChevronRightIcon', () => {
    expect(wrapper.findComponent(InlineChevronRightIcon).exists()).toBe(true);
  });

  it('renders a close icon', () => {
    expect(closeIcon.exists()).toBe(true);
    expect(wrapper.findComponent(CloseIcon).exists()).toBe(true);
    expect(closeIcon.attributes('aria-label')).toBe('continue-viewing');
  });

  it('set PreferredLocale as current locale when close icon is clicked', () => {
    closeIcon.trigger('click');
    expect(AppStore.setPreferredLocale).toHaveBeenCalledWith(currentLocale);
  });
});

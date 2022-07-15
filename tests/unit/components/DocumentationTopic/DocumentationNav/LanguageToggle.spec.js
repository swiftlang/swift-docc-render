/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { waitFrames } from 'docc-render/utils/loading';
import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import Language from 'docc-render/constants/Language';
import LanguageToggle
  from 'docc-render/components/DocumentationTopic/DocumentationNav/LanguageToggle.vue';
import InlineChevronDownIcon from 'theme/components/Icons/InlineChevronDownIcon.vue';
import { createEvent, flushPromises } from '../../../../../test-utils';

const { NavMenuItemBase } = LanguageToggle.components;

const closeNav = jest.fn().mockResolvedValue('');

describe('LanguageToggle', () => {
  let wrapper;

  const propsData = {
    interfaceLanguage: Language.swift.key.api,
    objcPath: 'documentation/foo',
    swiftPath: 'documentation/foo',
    breadcrumbCount: 1,
    closeNav,
  };

  const mocks = {
    $route: {
      path: '/documentation/foo',
    },
    $router: {
      push: jest.fn(),
    },
  };

  const provide = {
    store: {
      setPreferredLanguage: jest.fn(),
    },
  };

  const stubs = {
    'router-link': RouterLinkStub,
  };

  const createWrapper = (props = propsData, mocksData = mocks) => (
    shallowMount(LanguageToggle, {
      mocks: mocksData,
      propsData: props,
      provide,
      stubs,
    })
  );

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  it('renders `NavMenuItemBase` at the root', () => {
    const menuItemBase = wrapper.find(NavMenuItemBase);
    expect(menuItemBase.exists()).toBe(true);
    expect(menuItemBase.classes()).toContain('nav-menu-setting');
    expect(menuItemBase.classes()).toContain('language-container');
  });

  it('renders the toggle element', () => {
    const toggle = wrapper.find('#language-toggle');
    expect(toggle.exists()).toBe(true);
    expect(toggle.attributes('style')).toMatch(/width: [0-9]+px/);
  });

  it('renders a faux select element', () => {
    const select = wrapper.find({ ref: 'language-sizer' });
    expect(select.exists()).toBe(true);
    expect(select.classes()).toEqual(['language-dropdown', 'language-sizer']);
    expect(select.attributes()).toHaveProperty('aria-hidden', 'true');
    expect(select.attributes()).toHaveProperty('tabindex', '-1');
    const options = select.findAll('option');
    expect(options).toHaveLength(1);
    expect(options.at(0).attributes()).toHaveProperty('selected');
    expect(options.at(0).text()).toBe(Language[propsData.interfaceLanguage].name);
  });

  it('renders an inline chevron icon', () => {
    expect(wrapper.find('.language-toggle-container > .toggle-icon').is(InlineChevronDownIcon))
      .toBe(true);
  });

  it('applies the faux select width on the language toggle, on select', async () => {
    const sizer = wrapper.find({ ref: 'language-sizer' }).element;
    const toggle = wrapper.find('#language-toggle');
    // clientWidth is now 0
    expect(toggle.attributes()).toHaveProperty('style', 'width: 6px;');
    Object.defineProperty(sizer, 'clientWidth', {
      get: () => 20,
    });
    toggle.setValue(Language.objectiveC.key.api);
    await wrapper.vm.$nextTick();
    expect(toggle.attributes()).toHaveProperty('style', 'width: 26px;');
  });

  it('applies the faux select width on the language toggle, on screen resize', async () => {
    const sizer = wrapper.find({ ref: 'language-sizer' }).element;
    const toggle = wrapper.find('#language-toggle');
    Object.defineProperty(sizer, 'clientWidth', {
      get: () => 20,
    });
    // clientWidth was 0
    expect(toggle.attributes()).toHaveProperty('style', 'width: 6px;');
    const resizeEvent = createEvent('resize');
    window.dispatchEvent(resizeEvent);
    await wrapper.vm.$nextTick();
    await waitFrames(3);
    expect(toggle.attributes()).toHaveProperty('style', 'width: 26px;');
  });

  it('applies the faux select width on the language toggle, on orientationchange', async () => {
    const sizer = wrapper.find({ ref: 'language-sizer' }).element;
    const toggle = wrapper.find('#language-toggle');
    Object.defineProperty(sizer, 'clientWidth', {
      get: () => 20,
    });
    // clientWidth was 0
    expect(toggle.attributes()).toHaveProperty('style', 'width: 6px;');
    const orientationchangeEvent = createEvent('orientationchange');
    window.dispatchEvent(orientationchangeEvent);
    await waitFrames(3);
    expect(toggle.attributes()).toHaveProperty('style', 'width: 26px;');
  });

  it('does not render the chevron if it has no languages', () => {
    wrapper.setProps({
      objcPath: '',
      swiftPath: '',
    });
    expect(wrapper.find('.language-toggle-container > .toggle-icon').exists()).toBe(false);
  });

  it('renders a span.nav-menu-toggle-none.current-language with only one variant', () => {
    wrapper.setProps({ objcPath: undefined });
    expect(wrapper.find('#language-toggle').exists()).toBe(false);

    const current = wrapper.find('span.nav-menu-toggle-none.current-language');
    expect(current.exists()).toBe(true);
    // text content makes sure there are no new lines
    expect(current.element.textContent).toBe(Language.swift.name);
  });

  it('renders options inside select for each language', () => {
    const options = wrapper.findAll('#language-toggle option');
    expect(options.length).toBe(2);

    expect(options.at(0).attributes('value')).toBe(Language.swift.key.api);
    expect(options.at(0).text()).toBe(Language.swift.name);

    expect(options.at(1).attributes('value')).toBe(Language.objectiveC.key.api);
    expect(options.at(1).text()).toBe(Language.objectiveC.name);
  });

  it('calls router and changes v-model when different option is selected', async () => {
    expect(wrapper.find('.current-language').text()).toBe(Language.swift.name);

    wrapper.findAll('#language-toggle option').at(1).element.selected = true;
    wrapper.find('#language-toggle').trigger('change');

    expect(wrapper.find('.current-language').text()).toBe(Language.objectiveC.name);
    expect(closeNav).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mocks.$router.push).toHaveBeenCalledWith({ path: null, query: { language: 'objc' } });
    expect(provide.store.setPreferredLanguage).toHaveBeenCalledWith('objc');
  });

  it('renders `language-list-container` if page has more than a language', () => {
    const listContainer = wrapper.find('.language-list-container');
    expect(listContainer.exists()).toBe(true);
  });

  it('does not render `language-list-container` if page has only one language', () => {
    wrapper.setProps({ objcPath: undefined });

    const listContainer = wrapper.find('.language-list-container');
    expect(listContainer.exists()).toBe(false);
  });

  it('renders `nav-menu-toggle-label` without spaces', () => {
    const label = wrapper.find('span.nav-menu-setting-label');
    expect(label.exists()).toBe(true);
    // textContent makes sure there are no new lines or empty spaces
    expect(label.element.textContent).toEqual('Language:');
  });

  it('renders `.nav-menu-setting-label` in `language-list-container` without spaces', () => {
    const label = wrapper.find('label.nav-menu-setting-label');
    expect(label.exists()).toBe(true);
    expect(label.attributes()).toHaveProperty('for', 'language-toggle');
    // textContent makes sure there are no new lines or empty spaces
    expect(label.element.textContent).toEqual('Language:');
  });

  it('renders a `span.current-language` for the current language inside `language-list-container`', () => {
    const currentLanguage = wrapper.find('.language-list-container').find('span.current-language');
    expect(currentLanguage.exists()).toBe(true);
    expect(currentLanguage.text()).toBe(Language.swift.name);
  });

  it('renders a link for the alternative language inside `language-list-container`', async () => {
    const link = wrapper.find('.language-list-container').find('a.nav-menu-link');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe(Language.objectiveC.name);
    link.trigger('click');
    expect(closeNav).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mocks.$router.push)
      .toHaveBeenCalledWith({
        path: null,
        query: { language: Language.objectiveC.key.url },
      });
  });

  it('clears out the language query if language is Swift', async () => {
    wrapper.setData({ languageModel: Language.objectiveC.key.api });

    const link = wrapper.find('.language-list-container').find('a.nav-menu-link');
    link.trigger('click');
    expect(closeNav).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mocks.$router.push)
      .toHaveBeenCalledWith({
        path: null,
        query: {
          language: undefined,
        },
      });
  });

  it('keeps extra query parameters when changing language', async () => {
    const query = {
      foo: 'foo',
      bar: 'bar',
    };
    const mocksWithQuery = {
      ...mocks,
      $route: {
        path: '/documentation/foo',
        query,
      },
    };
    wrapper = createWrapper(undefined, mocksWithQuery);

    const link = wrapper.find('.language-list-container').find('a.nav-menu-link');
    link.trigger('click');
    expect(closeNav).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mocks.$router.push)
      .toHaveBeenCalledWith({
        path: null,
        query: { ...query, language: Language.objectiveC.key.url },
      });
  });

  it('renders different paths if languages have different paths', async () => {
    // Re-mount component to be able to update data() through new props
    wrapper = createWrapper({ ...propsData, objcPath: 'documentation/bar' });

    const link = wrapper.find('.language-list-container').find('a.nav-menu-link');
    link.trigger('click');
    expect(closeNav).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mocks.$router.push)
      .toHaveBeenCalledWith({
        path: '/documentation/bar',
        query: { language: Language.objectiveC.key.url },
      });
  });

  it('changes the model, if the interfaceLanguage changes', () => {
    // assert proper language name is shown
    expect(wrapper.find('.current-language').text()).toBe(Language.swift.name);
    // change the language from outside
    wrapper.setProps({
      interfaceLanguage: Language.objectiveC.key.api,
    });
    // assert the language changes as well
    expect(wrapper.find('.current-language').text()).toBe(Language.objectiveC.name);
  });
});

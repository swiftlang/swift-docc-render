/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import DocumentationNav from 'docc-render/components/DocumentationTopic/DocumentationNav.vue';
import { BreakpointName } from '@/utils/breakpoints';
import BreakpointEmitter from '@/components/BreakpointEmitter.vue';
import { SIDEBAR_HIDE_BUTTON_ID } from 'docc-render/constants/sidebar';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/changeElementVOVisibility');
jest.mock('docc-render/utils/scroll-lock');
jest.mock('docc-render/utils/FocusTrap');

const {
  NavBase,
  LanguageToggle,
  NavMenuItems,
} = DocumentationNav.components;

const stubs = {
  'router-link': RouterLinkStub,
  NavBase,
};

const mocks = {
  $router: {
    push: jest.fn(),
  },
  $route: {
    query: {},
  },
};

const menuItems = 'Menu Items';

describe('DocumentationNav', () => {
  let wrapper;

  const propsData = {
    title: 'FooKit',
    parentTopicIdentifiers: [
      'topic://foo',
      'topic://bar',
    ],
    interfaceLanguage: 'swift',
    swiftPath: 'documentation/foo',
    objcPath: 'documentation/bar',
    displaySidenav: true,
  };

  beforeEach(() => {
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
    });
  });

  it('renders a `NavBase` at the root with appropriate attributes', () => {
    const nav = wrapper.findComponent(NavBase);
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('aria-label')).toBe('api-reference');
    expect(nav.classes('nav-hero')).toBe(false);
    expect(nav.classes('theme-dark')).toBe(false);
    expect(nav.classes()).toContain('documentation-nav');
    expect(nav.props()).toHaveProperty('hasSolidBackground', false);
    expect(nav.props()).toHaveProperty('hasNoBorder', false);
    expect(nav.props()).toHaveProperty('hasFullWidthBorder', true);
    expect(nav.props()).toHaveProperty('hasOverlay', false);
    expect(nav.props()).toHaveProperty('breakpoint', BreakpointName.medium);
    expect(nav.props()).toHaveProperty('isWideFormat', true);
  });

  it('accepts an isDark prop', async () => {
    await wrapper.setProps({
      isDark: true,
    });
    const nav = wrapper.findComponent(NavBase);
    expect(nav.classes('theme-dark')).toBe(true);
  });

  it('accepts a showActions prop', () => {
    // it has language toggle but it hasn't slots
    expect(wrapper.findComponent(NavBase).props()).toHaveProperty('showActions', true);

    wrapper = shallowMount(DocumentationNav, {
      propsData: {
        ...propsData,
        interfaceLanguage: null,
        swiftPath: null,
        objcPath: null,
      },
      slots: {
        'menu-items': menuItems,
      },
    });
    // it doesn't have language toggle but it has slots
    expect(wrapper.findComponent(NavBase).props()).toHaveProperty('showActions', true);

    wrapper = shallowMount(DocumentationNav, {
      propsData: {
        ...propsData,
        interfaceLanguage: null,
        swiftPath: null,
        objcPath: null,
      },
    });

    // it doesn't have language toggle or sloths
    expect(wrapper.findComponent(NavBase).props()).toHaveProperty('showActions', false);
  });

  it('accepts a hasNoBorder prop', async () => {
    await wrapper.setProps({
      hasNoBorder: true,
    });
    const nav = wrapper.findComponent(NavBase);
    expect(nav.props()).toHaveProperty('hasNoBorder', true);
  });

  it('exposes a `tray-after` scoped slot', () => {
    const fooBar = 'Foo bar';
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      scopedSlots: {
        'tray-after': () => fooBar,
      },
    });
    expect(wrapper.text()).toContain(fooBar);
  });

  it('renders a LanguageToggle', () => {
    // make sure the LanguageToggle is inside the NavMenuItems
    const navMenuItemsComponent = wrapper.findComponent(NavMenuItems);
    const toggle = navMenuItemsComponent.find(LanguageToggle);
    expect(toggle.exists()).toBe(true);
    expect(toggle.props()).toEqual({
      interfaceLanguage: propsData.interfaceLanguage,
      swiftPath: propsData.swiftPath,
      objcPath: propsData.objcPath,
      closeNav: expect.any(Function),
    });
  });

  it('does not render a `LanguageToggle` when there is no swift nor objc path', async () => {
    expect(wrapper.contains(LanguageToggle)).toBe(true);
    await wrapper.setProps({ swiftPath: null, objcPath: null });
    expect(wrapper.contains(LanguageToggle)).toBe(false);
  });

  it('exposes a `menu-items` slot ', () => {
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      slots: {
        'menu-items': menuItems,
      },
    });
    expect(wrapper.text()).toContain(menuItems);
  });

  it('exposes a `after-content` slot ', () => {
    const afterContent = 'After Content';
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      slots: {
        'after-content': afterContent,
      },
    });
    expect(wrapper.text()).toContain(afterContent);
  });

  it('exposes a `title` slot', () => {
    const fooBar = 'Foo bar';
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      slots: {
        title: fooBar,
      },
    });
    expect(wrapper.text()).toContain(fooBar);
  });

  it('renders a sidenav toggle, emitting `@toggle-sidenav` event', async () => {
    const btn = document.createElement('button');
    btn.id = SIDEBAR_HIDE_BUTTON_ID;
    document.body.appendChild(btn);
    const sidenavToggleWrapper = wrapper.findComponent('.sidenav-toggle-wrapper');
    // assert its visible
    expect(sidenavToggleWrapper.isVisible()).toBe(true);
    // interact with button
    const button = sidenavToggleWrapper.findComponent('.sidenav-toggle');
    button.trigger('click');
    await flushPromises();
    // assert the button works and is rendered as expected
    expect(button.attributes('aria-label')).toBe('navigator.open-navigator');
    expect(wrapper.emitted('toggle-sidenav')).toBeTruthy();
    // assert the nav-hide button is focused
    expect(document.activeElement).toEqual(btn);
  });

  it('closes the nav, if open and clicking on the sidenav-toggle', async () => {
    const backup = window.Event;
    window.Event = null;

    wrapper.findComponent(BreakpointEmitter).vm.$emit('change', BreakpointName.medium);
    await flushPromises();
    wrapper.findComponent('.nav-menucta').trigger('click');
    expect(wrapper.classes()).toContain('nav--is-open');
    const toggle = wrapper.findComponent('.sidenav-toggle');
    expect(toggle.attributes()).toHaveProperty('tabindex', '-1');
    toggle.trigger('click');
    wrapper.findComponent('.nav-menu-tray').trigger('transitionend', { propertyName: 'max-height' });
    expect(wrapper.classes()).not.toContain('nav--is-open');
    expect(wrapper.emitted('toggle-sidenav')).toBeFalsy();
    await flushPromises();
    expect(wrapper.emitted('toggle-sidenav')).toEqual([[BreakpointName.medium]]);
    expect(toggle.attributes()).not.toHaveProperty('tabindex');
    window.Event = backup;
  });

  it('does not render the sidenav toggle if displaySidenav is false', async () => {
    await wrapper.setProps({
      displaySidenav: false,
    });
    expect(wrapper.findComponent(NavBase).props()).toMatchObject({
      isWideFormat: true,
      breakpoint: BreakpointName.medium,
    });
    expect(wrapper.findComponent('.sidenav-toggle').exists()).toBe(false);
  });
});

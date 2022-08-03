/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
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
  Hierarchy,
  NavBase,
  LanguageToggle,
  NavMenuItems,
} = DocumentationNav.components;

const stubs = {
  'router-link': RouterLinkStub,
  NavBase,
};

const TechnologiesRootIdentifier = 'topic://technologies';

const references = {
  [TechnologiesRootIdentifier]: { kind: 'technologies', url: '/documentation/technologies' },
  'topic://foo': {},
  'topic://bar': {},
};

const mocks = {
  $router: {
    push: jest.fn(),
  },
  $route: {
    query: {},
  },
};

describe('DocumentationNav', () => {
  let wrapper;

  const propsData = {
    title: 'FooKit',
    parentTopicIdentifiers: [
      'topic://foo',
      'topic://bar',
    ],
    currentTopicTags: [{
      type: 'foo',
    }],
    interfaceLanguage: 'swift',
    swiftPath: 'documentation/foo',
    objcPath: 'documentation/bar',
    references,
  };

  beforeEach(() => {
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
    });
  });

  it('renders a `NavBase` at the root with appropriate attributes', () => {
    const nav = wrapper.find(NavBase);
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('aria-label')).toBe('API Reference');
    expect(nav.classes('nav-hero')).toBe(false);
    expect(nav.classes('theme-dark')).toBe(false);
    expect(nav.classes()).toContain('documentation-nav');
    expect(nav.props()).toHaveProperty('hasSolidBackground', true);
    expect(nav.props()).toHaveProperty('hasNoBorder', false);
    expect(nav.props()).toHaveProperty('hasFullWidthBorder', true);
    expect(nav.props()).toHaveProperty('hasOverlay', false);
    expect(nav.props()).toHaveProperty('breakpoint', BreakpointName.medium);
    expect(nav.props()).toHaveProperty('isWideFormat', true);
  });

  it('accepts an isDark prop', () => {
    wrapper.setProps({
      isDark: true,
    });
    const nav = wrapper.find(NavBase);
    expect(nav.classes('theme-dark')).toBe(true);
  });

  it('accepts a hasNoBorder prop', () => {
    wrapper.setProps({
      hasNoBorder: true,
    });
    const nav = wrapper.find(NavBase);
    expect(nav.props()).toHaveProperty('hasNoBorder', true);
  });

  it('renders an inactive link, when no technologies root paths', () => {
    const title = wrapper.find('.nav-title-link');
    expect(title.classes()).toContain('inactive');
    expect(title.is('span')).toBe(true);
    expect(title.text()).toBe('Documentation');
  });

  it('renders the title "Documentation" link, when there is a Technology root', () => {
    wrapper.setProps({
      parentTopicIdentifiers: [
        TechnologiesRootIdentifier,
        ...propsData.parentTopicIdentifiers,
      ],
    });
    const title = wrapper.find('.nav-title-link');
    expect(title.exists()).toBe(true);
    expect(title.is(RouterLinkStub)).toBe(true);
    expect(title.props('to')).toEqual({
      path: references[TechnologiesRootIdentifier].url,
      query: {},
    });
    expect(title.text()).toBe('Documentation');
  });

  it('renders the title "Documentation" link and preservers query params, using the root reference path', () => {
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData: {
        ...propsData,
        parentTopicIdentifiers: [
          TechnologiesRootIdentifier,
          ...propsData.parentTopicIdentifiers,
        ],
      },
      mocks: {
        $route: {
          query: {
            changes: 'latest_minor',
          },
        },
      },
    });
    expect(wrapper.find('.nav-title-link').props('to'))
      .toEqual({
        path: references[TechnologiesRootIdentifier].url,
        query: { changes: 'latest_minor' },
      });
  });

  it('renders a Hierarchy', () => {
    const hierarchy = wrapper.find(Hierarchy);
    expect(hierarchy.exists()).toBe(true);
    expect(hierarchy.props()).toEqual({
      currentTopicTitle: propsData.title,
      parentTopicIdentifiers: propsData.parentTopicIdentifiers,
      isSymbolBeta: false,
      isSymbolDeprecated: false,
      currentTopicTags: propsData.currentTopicTags,
      references,
    });
  });

  it('renders a Hierarchy with correct items, if first hierarchy item is the root link', () => {
    const parentTopicIdentifiers = [
      TechnologiesRootIdentifier,
      ...propsData.parentTopicIdentifiers,
    ];

    wrapper.setProps({ parentTopicIdentifiers });
    const hierarchy = wrapper.find(Hierarchy);
    expect(hierarchy.props())
      // passes all items, without the first one
      .toHaveProperty('parentTopicIdentifiers', parentTopicIdentifiers.slice(1));
  });

  it('exposes a `tray-after` scoped slot', () => {
    let slotProps = null;
    const fooBar = 'Foo bar';
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      scopedSlots: {
        'tray-after': (props) => {
          slotProps = props;
          return fooBar;
        },
      },
    });
    expect(wrapper.text()).toContain(fooBar);
    expect(slotProps).toEqual({
      breadcrumbCount: 3,
    });
  });

  it('renders a LanguageToggle', () => {
    // make sure the LanguageToggle is inside the NavMenuItems
    const menuItems = wrapper.find(NavMenuItems);
    const toggle = menuItems.find(LanguageToggle);
    expect(toggle.exists()).toBe(true);
    expect(toggle.props()).toEqual({
      interfaceLanguage: propsData.interfaceLanguage,
      swiftPath: propsData.swiftPath,
      objcPath: propsData.objcPath,
      closeNav: expect.any(Function),
    });
  });

  it('does not render a `LanguageToggle` when there is no swift nor objc path', () => {
    expect(wrapper.contains(LanguageToggle)).toBe(true);
    wrapper.setProps({ swiftPath: null, objcPath: null });
    expect(wrapper.contains(LanguageToggle)).toBe(false);
  });

  it('exposes a `menu-items` slot ', () => {
    const menuItems = 'Menu Items';
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
    let slotProps = null;
    const fooBar = 'Foo bar';
    wrapper = shallowMount(DocumentationNav, {
      stubs,
      propsData,
      mocks,
      scopedSlots: {
        title: (props) => {
          slotProps = props;
          return fooBar;
        },
      },
    });
    expect(wrapper.text()).toContain(fooBar);
    expect(slotProps)
      .toEqual({ inactiveClass: 'inactive', linkClass: 'nav-title-link', rootLink: null });
    expect(wrapper.find('.nav-title-link').exists()).toBe(false);
  });

  it('renders a sidenav toggle, emitting `@toggle-sidenav` event', async () => {
    const btn = document.createElement('button');
    btn.id = SIDEBAR_HIDE_BUTTON_ID;
    document.body.appendChild(btn);
    // assert the wrapper is hidden
    const sidenavToggleWrapper = wrapper.find('.sidenav-toggle-wrapper');
    expect(sidenavToggleWrapper.isVisible()).toBe(false);
    // show the wrapper
    wrapper.setProps({ sidenavHiddenOnLarge: true });
    // assert its visible
    expect(sidenavToggleWrapper.isVisible()).toBe(true);
    // interact with button
    const button = sidenavToggleWrapper.find('.sidenav-toggle');
    button.trigger('click');
    await flushPromises();
    // assert the button works and is rendered as expected
    expect(button.attributes('aria-label')).toBe('Open documentation navigator');
    expect(wrapper.emitted('toggle-sidenav')).toBeTruthy();
    // assert the nav-hide button is focused
    expect(document.activeElement).toEqual(btn);
  });

  it('closes the nav, if open and clicking on the sidenav-toggle', async () => {
    const backup = window.Event;
    window.Event = null;

    wrapper.find(BreakpointEmitter).vm.$emit('change', BreakpointName.medium);
    await flushPromises();
    wrapper.find('.nav-menucta').trigger('click');
    expect(wrapper.classes()).toContain('nav--is-open');
    const toggle = wrapper.find('.sidenav-toggle');
    expect(toggle.attributes()).toHaveProperty('tabindex', '-1');
    toggle.trigger('click');
    wrapper.find('.nav-menu-tray').trigger('transitionend', { propertyName: 'max-height' });
    expect(wrapper.classes()).not.toContain('nav--is-open');
    expect(wrapper.emitted('toggle-sidenav')).toBeFalsy();
    await flushPromises();
    expect(wrapper.emitted('toggle-sidenav')).toEqual([[BreakpointName.medium]]);
    expect(toggle.attributes()).not.toHaveProperty('tabindex');
    window.Event = backup;
  });

  it('renders the nav, with `isWideFormat` to `false`', () => {
    wrapper.setProps({
      isWideFormat: false,
    });
    expect(wrapper.find(NavBase).props()).toMatchObject({
      isWideFormat: false,
      breakpoint: BreakpointName.medium,
    });
    expect(wrapper.find('.sidenav-toggle').exists()).toBe(false);
  });
});

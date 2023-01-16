/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import ColorScheme from 'docc-render/constants/ColorScheme';
import Footer from 'docc-render/components/Footer.vue';
import InitialLoadingPlaceholder from 'docc-render/components/InitialLoadingPlaceholder.vue';
import { shallowMount } from '@vue/test-utils';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';
import { AppTopID } from '@/constants/AppTopID';
import { flushPromises } from '../../test-utils';

jest.mock('docc-render/utils/theme-settings', () => ({
  fetchThemeSettings: jest.fn(),
  themeSettingsState: { theme: {} },
}));

let App;
let fetchThemeSettings = jest.fn();

const matchMedia = {
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

const setPropertySpy = jest.spyOn(document.body.style, 'setProperty');
const removePropertySpy = jest.spyOn(document.body.style, 'removeProperty');

const path = '/the/new/path';
const pushMock = jest.fn();

const LightDarkModeCSSSettings = {
  text: {
    light: 'light',
    dark: 'dark',
  },
};

const GenericCSSSettings = {
  text: {
    color: 'light',
    background: 'dark',
  },
};

const createWrapper = props => shallowMount(App, {
  stubs: {
    'custom-header': true,
    'router-view': true,
    'custom-footer': true,
  },
  mocks: {
    $bridge: {
      on(type, handler) {
        if (type === 'navigation') {
          handler(path);
        }
      },
      off: () => {},
    },
    $route: {
      path: '/the/old/path',
    },
    $router: {
      push: pushMock,
    },
  },
  ...props,
});

function setThemeSetting(theme) {
  fetchThemeSettings.mockResolvedValue({ theme });
}

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    /* eslint-disable global-require */
    App = require('docc-render/App.vue').default;
    ({ fetchThemeSettings } = require('docc-render/utils/theme-settings'));

    setThemeSetting({});
    window.matchMedia = jest.fn().mockReturnValue(matchMedia);

    Object.defineProperty(window, 'customElements', {
      writable: true,
      value: { get: jest.fn().mockImplementation(() => false) },
    });
  });

  it('does not render a <custom-header> or <custom-footer> if they have not been defined', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes('hascustomheader')).toBe(false);

    const header = wrapper.find('custom-header-stub');
    expect(header.exists()).toBe(false);

    const footer = wrapper.find('custom-footer-stub');
    expect(footer.exists()).toBe(false);
  });

  it('navigates when receiving a navigation request', () => {
    createWrapper();
    expect(pushMock).toHaveBeenCalledWith(path);
  });

  it('renders Skip Navigation', () => {
    const wrapper = createWrapper();
    const skipNavigation = wrapper.find('#skip-nav');
    expect(skipNavigation.text()).toBe('Skip Navigation');
    expect(skipNavigation.attributes('href')).toBe('#main');
  });

  it('exposes a header slot', () => {
    const wrapper = createWrapper({
      slots: {
        header: '<div class="header">Header</div>',
      },
    });
    const header = wrapper.find('.header');
    expect(header.text()).toBe('Header');
  });

  it('renders the `#nav-sticky-anchor` between the header and the content', () => {
    const wrapper = createWrapper({
      slots: {
        header: '<div class="header">Footer</div>',
        default: '<div class="default">Default</div>',
      },
    });
    const header = wrapper.find('.header');
    const content = wrapper.find('.default');
    const stickyAnchor = wrapper.find(`#${baseNavStickyAnchorId}`);
    // make sure the anchor is below the header and above the content
    expect(header.element.nextElementSibling).toBe(stickyAnchor.element);
    expect(stickyAnchor.element.nextElementSibling).toBe(content.element);
  });

  it('exposes a footer slot', () => {
    const wrapper = createWrapper({
      slots: {
        footer: '<div class="footer">Footer</div>',
      },
    });
    const footer = wrapper.find('.footer');
    expect(footer.text()).toBe('Footer');
  });

  it('exposes a default slot', () => {
    const wrapper = createWrapper({
      slots: {
        default: '<div class="default">Default</div>',
      },
    });
    const slotContent = wrapper.find('.default');
    expect(slotContent.text()).toBe('Default');
    expect(wrapper.find('router-view-stub').exists()).toBe(false);
  });

  it('renders an `InitialLoadingPlaceholder`', () => {
    const wrapper = createWrapper();

    expect(wrapper.find(InitialLoadingPlaceholder).exists()).toBe(true);
  });

  it('renders a default `Footer` for non-IDE targets', () => {
    const wrapper = createWrapper();
    expect(wrapper.contains(Footer)).toBe(true);

    wrapper.setData({ isTargetIDE: true });
    expect(wrapper.contains(Footer)).toBe(false);
  });

  it('renders the app-top element', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(`#${AppTopID}`).exists()).toBe(true);
  });

  describe('Custom CSS Properties', () => {
    beforeEach(() => {
      setThemeSetting(LightDarkModeCSSSettings);
    });

    it('fetches the JSON settings and applies them by default', async () => {
      createWrapper();
      await flushPromises();
      expect(fetchThemeSettings).toHaveBeenCalledTimes(1);
    });

    it('does not fetch JSON settings, if `enableThemeSettings` is false', async () => {
      createWrapper({
        propsData: {
          enableThemeSettings: false,
        },
      });
      await flushPromises();
      expect(fetchThemeSettings).toHaveBeenCalledTimes(0);
    });

    it('adds custom css properties to the root element', async () => {
      setThemeSetting(GenericCSSSettings);
      createWrapper();
      await flushPromises();
      // expect(setPropertySpy).toHaveBeenCalledTimes(2);
      expect(setPropertySpy).toHaveBeenCalledWith('--text-color', 'light');
      expect(setPropertySpy).toHaveBeenCalledWith('--text-background', 'dark');
    });

    it('does not error out if no custom properties for path', async () => {
      setThemeSetting({});
      createWrapper();
      await flushPromises();
      expect(setPropertySpy).toHaveBeenCalledTimes(0);
    });

    it('attaches a listener for dark mode switching', () => {
      createWrapper();
      expect(window.matchMedia).toHaveBeenCalledTimes(1);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(matchMedia.addListener).toHaveBeenCalledTimes(1);
    });

    it('returns dark mode colors', async () => {
      // if "Auto" is preferred and the system is "Dark":
      window.matchMedia.mockReturnValueOnce({
        ...matchMedia,
        matches: true,
      });
      const wrapper = createWrapper();
      wrapper.setData({
        appState: {
          ...wrapper.vm.appState,
          preferredColorScheme: ColorScheme.auto.value,
        },
      });
      await flushPromises();
      expect(setPropertySpy)
        .toHaveBeenCalledWith('--text', LightDarkModeCSSSettings.text.dark);
    });

    it('dynamically changes the data, upon color scheme change (in auto mode)', async () => {
      const wrapper = createWrapper();
      wrapper.setData({
        appState: {
          ...wrapper.vm.appState,
          preferredColorScheme: ColorScheme.auto.value,
        },
      });
      await flushPromises();
      expect(setPropertySpy).toHaveBeenCalledWith('--text', LightDarkModeCSSSettings.text.light);
      matchMedia.addListener.mock.calls[0][0].call(wrapper.vm, { matches: true });
      expect(setPropertySpy).toHaveBeenCalledTimes(2);
      expect(setPropertySpy).toHaveBeenCalledWith('--text', LightDarkModeCSSSettings.text.dark);
    });

    it('updates the values applied to the root, if the colors update', async () => {
      const wrapper = createWrapper();
      wrapper.setData({
        appState: {
          ...wrapper.vm.appState,
          preferredColorScheme: ColorScheme.auto.value,
        },
      });
      await flushPromises();
      expect(removePropertySpy).toHaveBeenCalledTimes(1);
      expect(setPropertySpy).toHaveBeenCalledTimes(1);
      expect(setPropertySpy).toHaveBeenCalledWith('--text', 'light');
      matchMedia.addListener.mock.calls[0][0].call(wrapper.vm, { matches: true });
      expect(removePropertySpy).toHaveBeenCalledTimes(2);
      expect(removePropertySpy).toHaveBeenLastCalledWith('--text');
      expect(setPropertySpy).toHaveBeenCalledWith('--text', 'dark');
    });

    it('removes all custom css properties render and on destroy', async () => {
      setThemeSetting(GenericCSSSettings);

      const wrapper = createWrapper();
      await flushPromises();

      expect(removePropertySpy).toHaveBeenCalledTimes(2);
      wrapper.destroy();
      expect(removePropertySpy).toHaveBeenCalledTimes(4);
      expect(removePropertySpy).toHaveBeenCalledWith('--text-color');
      expect(removePropertySpy).toHaveBeenCalledWith('--text-background');
    });

    describe('when a <custom-header> exists', () => {
      let wrapper;

      beforeEach(() => {
        window.customElements.get.mockImplementation(name => name === 'custom-header');
        wrapper = createWrapper();
      });

      it('adds the "hascustomheader" class', () => {
        expect(wrapper.classes('hascustomheader')).toBe(true);
      });

      it('renders a <custom-header>', () => {
        const header = wrapper.find('custom-header-stub');
        expect(header.exists()).toBe(true);
        expect(header.attributes('data-color-scheme')).toBeDefined();
      });

      it('does not render a <custom-header>, if a header slot is passed', () => {
        wrapper = createWrapper({
          slots: {
            header: '<div class="header">Header</div>',
          },
        });
        const header = wrapper.find('custom-header-stub');
        expect(header.exists()).toBe(false);
      });
    });

    it('renders a <custom-footer> if one has been defined', () => {
      window.customElements.get.mockImplementation(name => name === 'custom-footer');
      const wrapper = createWrapper();
      const footer = wrapper.find('custom-footer-stub');
      expect(footer.exists()).toBe(true);
      expect(footer.attributes('data-color-scheme')).toBeDefined();
    });
  });
});

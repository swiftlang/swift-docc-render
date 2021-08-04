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
import BreakpointEmitter, { createMediaQueryString } from 'docc-render/components/BreakpointEmitter.vue';

const { BreakpointName, BreakpointAttributes, BreakpointScopes } = BreakpointEmitter.constants;
const defaultBreakpoints = BreakpointAttributes[BreakpointScopes.default];

const matchesNone = query => ({
  matches: false,
  media: query,
  addListener: jest.fn(),
  removeListener: () => {},
});

const matchesMedium = (query) => {
  const matches = query === createMediaQueryString(defaultBreakpoints.medium);
  return {
    matches,
    query,
    addListener: listener => listener({ matches }),
    removeListener: () => {},
  };
};

const matchesSmall = (query) => {
  const matches = query === createMediaQueryString(defaultBreakpoints.small);
  return {
    matches,
    query,
    addListener: listener => listener({ matches }),
    removeListener: () => {},
  };
};

const matchesSmallNav = (query) => {
  const matches = query === createMediaQueryString(
    BreakpointAttributes[BreakpointScopes.nav].small,
  );
  return {
    matches,
    query,
    addListener: listener => listener({ matches }),
    removeListener: () => {},
  };
};

describe('BreakpointEmitter', () => {
  let originalMatchMedia;

  const scopedSlots = {
    default: '<div slot-scope="{ matchingBreakpoint }">{{ matchingBreakpoint }}</div>',
  };

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(matchesNone);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('creates a media query string', () => {
    expect(createMediaQueryString({ maxWidth: 100, minWidth: 0 }))
      .toBe('only screen and (max-width: 100px)');
    expect(createMediaQueryString({ maxWidth: 100, minWidth: undefined }))
      .toBe('only screen and (max-width: 100px)');
    expect(createMediaQueryString({ maxWidth: 100, minWidth: 50 }))
      .toBe('only screen and (min-width: 50px) and (max-width: 100px)');
  });

  it('renders nothing by default', async () => {
    const wrapper = shallowMount(BreakpointEmitter);
    expect(wrapper.html()).toBeFalsy();
  });

  it('renders its default scoped slot', () => {
    const wrapper = shallowMount(BreakpointEmitter, { scopedSlots });
    expect(wrapper.is('div')).toBe(true);
    expect(wrapper.text()).toBe('');
  });

  it('does not emit anything if it does not match anything', async () => {
    window.matchMedia = jest.fn().mockImplementation(matchesNone);
    const wrapper = shallowMount(BreakpointEmitter, { scopedSlots });
    expect(wrapper.is('div')).toBe(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('');
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('emits a "medium" change when the appropriate media query matches', async () => {
    window.matchMedia = jest.fn().mockImplementation(matchesMedium);
    const wrapper = shallowMount(BreakpointEmitter, { scopedSlots });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('medium');
    // the initial invoke and a second one for the tests
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.emitted('change')[0]).toEqual([BreakpointName.medium]);
  });

  it('emits a "small" change when the appropriate media query matches', async () => {
    window.matchMedia = jest.fn().mockImplementation(matchesSmall);
    const wrapper = shallowMount(BreakpointEmitter, { scopedSlots });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('small');
    // the initial invoke and a second one for the tests
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.emitted('change')[0]).toEqual([BreakpointName.small]);
  });

  it('cleans up media query listeners when destroyed', () => {
    const removeListener = jest.fn();
    window.matchMedia = jest.fn().mockImplementation(query => ({
      ...matchesNone(query),
      removeListener,
    }));
    shallowMount(BreakpointEmitter, { scopedSlots }).destroy();
    expect(removeListener).toBeCalledTimes(3);
  });

  it('supports scopes', async () => {
    window.matchMedia = jest.fn().mockImplementation(matchesSmallNav);
    const wrapper = shallowMount(BreakpointEmitter, {
      scopedSlots,
      propsData: { scope: 'nav' },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe('small');
    expect(wrapper.emitted('change')[0]).toEqual(['small']);
    expect(window.matchMedia).toHaveBeenCalledTimes(3);
    expect(window.matchMedia).toHaveBeenCalledWith(createMediaQueryString(
      BreakpointAttributes[BreakpointScopes.nav].small,
    ));
  });

  it('does not work if you add a scope that is not defined', () => {
    window.matchMedia = jest.fn().mockImplementation(matchesMedium);
    const spy = jest.spyOn(console, 'error').mockReturnValueOnce('');
    const wrapper = shallowMount(BreakpointEmitter, {
      scopedSlots,
      propsData: { scope: 'foo' },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/Invalid prop: custom validator check failed for prop "scope"/),
    );
    expect(window.matchMedia).toHaveBeenCalledTimes(0);
    expect(wrapper.emitted('change')).toBeFalsy();
  });
});

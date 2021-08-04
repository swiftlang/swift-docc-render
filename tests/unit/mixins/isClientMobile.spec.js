/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import isClientMobile from '@/mixins/isClientMobile';
import { shallowMount } from '@vue/test-utils';

const Component = {
  name: 'ComponentName',
  template: '<div>Foo</div>',
  mixins: [isClientMobile],
};

describe('isClientMobile', () => {
  describe('multi touch devices', () => {
    it('renders as mobile, if maxTouchPoints', () => {
      navigator.maxTouchPoints = 3;
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(true);
      delete navigator.maxTouchPoints;
    });

    it('renders as mobile, if msMaxTouchPoints', () => {
      window.navigator.msMaxTouchPoints = 3;
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(true);
      delete navigator.msMaxTouchPoints;
    });

    it('does not set as mobile, if has 0 touchPoints', () => {
      window.navigator.maxTouchPoints = 0;
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(false);
      delete navigator.maxTouchPoints;
    });
  });

  describe('no touchpoints', () => {
    beforeEach(() => {
      delete navigator.maxTouchPoints;
      window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    });
    it('sets a device as mobile, if it has a coarse pointer', () => {
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(pointer:coarse)');
    });

    it('sets a device as not mobile, if it has a precise pointer', () => {
      window.matchMedia.mockReturnValueOnce({ matches: false });
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(pointer:coarse)');
    });

    it('falls back to `window.orientation`, if it has no `matchMedia` support', () => {
      delete window.matchMedia;
      window.orientation = 'portrait';
      const wrapper = shallowMount(Component);
      expect(wrapper.vm.isClientMobile).toBe(true);
    });
  });
});

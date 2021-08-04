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
import onIntersectViewport from 'docc-render/mixins/onIntersectViewport';

describe('onIntersectViewport', () => {
  let wrapper;

  beforeEach(() => (
    import('intersection-observer').then(() => {
      // mock methods that can fail in jsdom
      IntersectionObserver.prototype.disconnect = jest.fn();
      IntersectionObserver.prototype.observe = jest.fn();

      wrapper = shallowMount({
        name: 'TestComponentForOnIntersectViewportCenter',
        mixins: [onIntersectViewport],
        render() {
          return null;
        },
        methods: {
          onIntersectViewport() {},
        },
      });
    })
  ));

  it('provides an `intersectionObserver', () => {
    expect(wrapper.vm.intersectionObserver).toBeDefined();
    expect(wrapper.vm.intersectionObserver.observe.mock.calls.length).toBe(1);
  });

  it('provides a `null` intersection root (for the viewport)', () => {
    expect(wrapper.vm.intersectionObserver.root).toBeNull();
  });

  it('provides a root margin for the center of the viewport', () => {
    expect(wrapper.vm.intersectionObserver.rootMargin)
      .toBe('-50% 0% -50% 0%');
  });

  it('disconnects the observer when the component is destroyed', () => {
    wrapper.destroy();
    expect(wrapper.vm.intersectionObserver.disconnect.mock.calls.length)
      .toBe(1);
  });

  it('calls the `onIntersectViewport callback when appropriate`', () => {
    wrapper.vm.onIntersectViewport = jest.fn();
    wrapper.vm.onIntersect({ isIntersecting: true });
    expect(wrapper.vm.onIntersectViewport.mock.calls.length)
      .toBe(1);
  });
});

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
import onIntersect from 'docc-render/mixins/onIntersect';

jest.mock('intersection-observer', () => ({}));

window.IntersectionObserver = jest.fn((cb, props) => ({
  // return mocks
  disconnect: jest.fn(),
  observe: jest.fn(),
  // mimic config
  ...props,
  thresholds: props.threshold,
}));

const { IntersectionDirections } = onIntersect.constants;

const createWrapper = async (options) => {
  const wrapper = shallowMount({
    name: 'TestComponentForOnIntersect',
    mixins: [onIntersect],
    render() {
      return '<div/>';
    },
    ...options,
  });
  // await the observer to download
  await wrapper.vm.$nextTick();
  return wrapper;
};
const spyScrollTo = jest.fn();

describe('onIntersect', () => {
  let wrapper;
  beforeEach(async () => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollY', { get: spyScrollTo });
  });

  it('provides an `intersectionObserver` and calls it with the current component by default', async () => {
    wrapper = await createWrapper();

    expect(wrapper.vm.intersectionObserver).toBeDefined();
    expect(wrapper.vm.intersectionObserver.observe).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.intersectionObserver.observe).toHaveBeenCalledWith(wrapper.element);
  });

  it('allows specifying the intercection targets via `getIntersectionTargets`', async () => {
    wrapper = await createWrapper({
      render: null,
      template: '<div><div class="foo"/><div class="foo"/><div class="foo"/></div>',
      methods: {
        getIntersectionTargets() { return this.$el.querySelectorAll('.foo'); },
      },
    });
    expect(wrapper.vm.intersectionObserver.observe).toHaveBeenCalledTimes(3);
  });

  it('provides a default `intersectionThreshold`', async () => {
    wrapper = await createWrapper();

    const threshold = wrapper.vm.intersectionThreshold;
    expect(threshold.length).toBeGreaterThan(99);
    expect(threshold.length).toBeLessThan(101);
    expect(threshold[0]).toBe(0.0);
    expect(threshold[99]).toBeCloseTo(1.0, 1);
    expect(wrapper.vm.intersectionObserver.thresholds).toEqual(threshold);
  });

  it('provides a default `intersectionRoot`', async () => {
    wrapper = await createWrapper();

    const root = wrapper.vm.intersectionRoot;
    expect(root).toBeNull();
    expect(wrapper.vm.intersectionObserver.root).toEqual(root);
  });

  it('provides a default `intersectionRootMargin`', async () => {
    wrapper = await createWrapper();

    const rootMargin = wrapper.vm.intersectionRootMargin;
    expect(rootMargin).toBe('0px 0px 0px 0px');
    expect(wrapper.vm.intersectionObserver.rootMargin).toBe(rootMargin);
  });

  it('provides a default `intersectionObserverOptions`', async () => {
    wrapper = await createWrapper();

    const options = wrapper.vm.intersectionObserverOptions;
    expect(options).toEqual({
      root: wrapper.vm.intersectionRoot,
      rootMargin: wrapper.vm.intersectionRootMargin,
      threshold: wrapper.vm.intersectionThreshold,
    });
    expect(wrapper.vm.intersectionObserver.root).toEqual(options.root);
    expect(wrapper.vm.intersectionObserver.rootMargin).toEqual(options.rootMargin);
    expect(wrapper.vm.intersectionObserver.thresholds).toEqual(options.threshold);
  });

  it('disconnects the observer when the component is destroyed', async () => {
    wrapper = await createWrapper();

    wrapper.destroy();
    expect(wrapper.vm.intersectionObserver.disconnect.mock.calls.length).toBe(1);
  });

  it('calls `onIntersect` method', async () => {
    const onIntersectMock = jest.fn();
    const entries = ['foo', 'bar', 'baz'];
    wrapper = await createWrapper({
      methods: {
        onIntersect: onIntersectMock,
      },
    });
    // invoke the callback
    IntersectionObserver.mock.calls[0][0](entries);
    expect(onIntersectMock).toHaveBeenCalledTimes(3);
    expect(onIntersectMock).toHaveBeenNthCalledWith(1, 'foo', 0, entries);
    expect(onIntersectMock).toHaveBeenNthCalledWith(2, 'bar', 1, entries);
    expect(onIntersectMock).toHaveBeenNthCalledWith(3, 'baz', 2, entries);
  });

  it('figures out the scroll direction', async () => {
    const onIntersectMock = jest.fn();
    const entries = ['foo', 'bar', 'baz'];
    spyScrollTo.mockReturnValue(10);
    wrapper = await createWrapper({
      methods: {
        onIntersect: onIntersectMock,
      },
    });
    const callback = IntersectionObserver.mock.calls[0][0];
    callback(entries);
    expect(wrapper.vm.intersectionScrollDirection).toBe(IntersectionDirections.up);
    spyScrollTo.mockReturnValue(20);
    callback(entries);
    expect(wrapper.vm.intersectionScrollDirection).toBe(IntersectionDirections.up);
    spyScrollTo.mockReturnValue(10);
    callback(entries);
    expect(wrapper.vm.intersectionScrollDirection).toBe(IntersectionDirections.down);
    spyScrollTo.mockReturnValue(0);
    callback(entries);
    expect(wrapper.vm.intersectionScrollDirection).toBe(IntersectionDirections.down);
  });
});

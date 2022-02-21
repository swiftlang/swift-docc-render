/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import handleScrollbar from 'docc-render/mixins/handleScrollbar';

const { ScrollingDebounceDelay } = handleScrollbar.constants;

const scrollBarAppearsEvent = {
  target: {
    offsetWidth: 605,
    scrollWidth: 900,
    offsetHeight: 150,
    scrollTop: 0,
    style: {
      setProperty: jest.fn(),
      getPropertyValue: jest.fn().mockReturnValue(''),
    },
  },
  preventDefault: jest.fn(),
};

const scrollBarDoesNotAppearEvent = {
  ...scrollBarAppearsEvent,
  target: {
    ...scrollBarAppearsEvent.target,
    offsetWidth: 605,
    scrollWidth: 625,
  },
};

describe('handleScrollbar', () => {
  let wrapper;
  jest.useFakeTimers();

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({
      name: 'MyComponent',
      mixins: [handleScrollbar],
      render() {
        return null;
      },
    });
  });

  it('shows the scrollbar', () => {
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(wrapper.vm.isScrolling).toEqual(true);
  });

  it('sets the current height as a custom css property', () => {
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(scrollBarAppearsEvent.target.style.setProperty)
      .toHaveBeenCalledWith('--scroll-target-height', '150px');
  });

  it('does not set the height a second time', () => {
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(scrollBarAppearsEvent.target.style.setProperty)
      .toHaveBeenCalledWith('--scroll-target-height', '150px');
    scrollBarAppearsEvent.target.style.getPropertyValue.mockReturnValueOnce(150);
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(scrollBarAppearsEvent.target.style.setProperty).toHaveBeenCalledTimes(1);
  });

  it('hides the scrollbar after the scrolling debounce delay time has passed', () => {
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    // Wait longer than 1000 miliseconds
    jest.advanceTimersByTime(ScrollingDebounceDelay + 10);
    expect(wrapper.vm.isScrolling).toEqual(false);
  });

  it('does not hide the scrollbar if the scrolling debounce delay time has not passed yet', () => {
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    // Wait only 10 miliseconds
    jest.advanceTimersByTime(10);
    expect(wrapper.vm.isScrolling).toEqual(true);
  });

  it('does not hide the scrollbar, before enough time has passed', () => {
    const nowSpy = jest.spyOn(Date, 'now');
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(wrapper.vm.isScrolling).toEqual(true);
    // Wait longer than 1000 miliseconds
    jest.advanceTimersByTime(ScrollingDebounceDelay);
    // make sure we are not scrolling any more
    expect(wrapper.vm.isScrolling).toEqual(false);
    // scroll
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    // make sure scrolling does not begin again, as not enough time has passed
    expect(wrapper.vm.isScrolling).toEqual(false);
    // force 110 seconds to pass
    nowSpy.mockReturnValueOnce(Date.now() + 110);
    jest.advanceTimersByTime(110);
    // scroll again
    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    // assert the time is correct
    expect(wrapper.vm.isScrolling).toEqual(true);
    nowSpy.mockRestore();
  });

  it('prevent `isScrolling` from being true when scroll bars does not appear', () => {
    wrapper.vm.handleScroll(scrollBarDoesNotAppearEvent);
    expect(wrapper.vm.isScrolling).toEqual(false);

    wrapper.vm.handleScroll(scrollBarAppearsEvent);
    expect(wrapper.vm.isScrolling).toEqual(true);
  });

  it('does not allow events that change the scrollTop property', () => {
    const event = {
      ...scrollBarAppearsEvent,
      target: {
        ...scrollBarAppearsEvent.target,
        scrollTop: 150,
      },
    };
    wrapper.vm.handleScroll(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.target.scrollTop).toEqual(0);
    expect(wrapper.vm.isScrolling).toBe(false);
  });
});

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
import scrollToElement from 'docc-render/mixins/scrollToElement';
import * as loading from 'docc-render/utils/loading';

const framesWait = jest.spyOn(loading, 'waitFrames');
window.innerHeight = 700;
window.scrollY = 300;
Object.defineProperty(document.body, 'scrollHeight', {
  value: 1000,
});

describe('scrollToElement', () => {
  const scrollOffset = { x: 0, y: 14 };
  const anchor = 'heres-why';

  const wrapper = shallowMount({
    name: 'MyComponent',
    mixins: [scrollToElement],
    render() {
      return `<div id="${anchor}"/>`;
    },
  }, {
    mocks: {
      $router: {
        resolve: ({ hash }) => ({ route: { hash } }),
        options: {
          scrollBehavior(to) {
            return new Promise(resolve => (
              resolve({ selector: to.hash, offset: scrollOffset })
            ));
          },
        },
      },
    },
  });

  it('scrolls to the correct element when "scrollToElement" is called', async () => {
    const scrollIntoViewMock = jest.fn();
    const mockElement = { scrollIntoView: scrollIntoViewMock };

    const querySelectorMock = jest.fn((selector) => {
      // mimic selecting non existent element
      if (selector === anchor) return mockElement;
      return null;
    });

    const scrollByMock = jest.fn();

    document.querySelector = querySelectorMock;
    window.scrollBy = scrollByMock;

    // start asserting
    const noneExistResponse = await wrapper.vm.scrollToElement('none-existent');
    expect(noneExistResponse).toEqual(null);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    expect(scrollByMock).not.toHaveBeenCalled();
    expect(framesWait).toHaveBeenCalledTimes(1);
    expect(framesWait).toHaveBeenCalledWith(8);

    const response = await wrapper.vm.scrollToElement(anchor);

    expect(response).toEqual(mockElement);
    expect(querySelectorMock).toBeCalledWith(anchor);
    expect(scrollIntoViewMock).toBeCalled();
    expect(framesWait).toHaveBeenCalledTimes(2);
    expect(framesWait).toHaveBeenLastCalledWith(8);

    // it does not call `scrollBy` if already at the bottom
    expect(scrollByMock).toBeCalledTimes(0);
    // change the scroll position
    window.scrollY = 100;
    await wrapper.vm.scrollToElement(anchor);
    // assert `scrollBy` is called
    expect(scrollByMock).toBeCalledWith(-scrollOffset.x, -scrollOffset.y);
  });

  it('focuses element and scrolls to it', async () => {
    wrapper.vm.scrollToElement = jest.fn();
    const hash = 'foo';
    const mockObject = { focus: jest.fn() };
    const getElementSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockObject);

    await wrapper.vm.handleFocusAndScroll(hash);
    // focus element
    expect(mockObject.focus).toHaveBeenCalledTimes(1);
    expect(getElementSpy).toHaveBeenCalledTimes(1);
    // scrolls to element
    expect(wrapper.vm.scrollToElement).toBeCalled();
    expect(wrapper.vm.scrollToElement).toBeCalledWith(`#${hash}`);
    getElementSpy.mockRestore();
  });

  it('does not focus element and scroll if element is not in the document', async () => {
    wrapper.vm.scrollToElement = jest.fn();
    const hash = 'foo';
    const getElementSpy = jest.spyOn(document, 'getElementById').mockReturnValue(null);

    await wrapper.vm.handleFocusAndScroll(hash);
    // scrolls to element
    expect(wrapper.vm.scrollToElement).not.toBeCalled();
    getElementSpy.mockRestore();
  });
});

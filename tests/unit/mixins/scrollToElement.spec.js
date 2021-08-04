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

describe('scrollToElement', () => {
  it('scrolls to the correct element when "scrollToElement" is called', async () => {
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

    const noneExistResponse = await wrapper.vm.scrollToElement('none-existent');
    expect(noneExistResponse).toEqual(null);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    expect(scrollByMock).not.toHaveBeenCalled();

    const response = await wrapper.vm.scrollToElement(anchor);

    expect(response).toEqual(mockElement);
    expect(querySelectorMock).toBeCalledWith(anchor);
    expect(scrollIntoViewMock).toBeCalled();

    expect(scrollByMock).toBeCalledWith(-scrollOffset.x, -scrollOffset.y);
  });
});

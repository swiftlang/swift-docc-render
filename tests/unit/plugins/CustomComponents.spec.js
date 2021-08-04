/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import CustomComponents from 'docc-render/plugins/CustomComponents';
import { createLocalVue } from '@vue/test-utils';

Object.defineProperty(window, 'customElements', {
  value: { define: jest.fn() },
});

describe('CustomComponents', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  it('configures Vue to ignore elements that start with "custom-"', () => {
    localVue.use(CustomComponents);
    expect(localVue.config.ignoredElements.test('custom-header')).toBe(true);
    expect(localVue.config.ignoredElements.test('custom-footer')).toBe(true);
    expect(localVue.config.ignoredElements.test('custom-foo-bar')).toBe(true);
    expect(localVue.config.ignoredElements.test('FakeComponent')).toBe(false);
  });

  it('does not utilize `customElements.define` when no templates exist', () => {
    localVue.use(CustomComponents);
    expect(window.customElements.define).not.toBeCalled();
  });

  it('utilizes `customElements.define` to register custom elements when templates exist', () => {
    const customHeader = document.createElement('template');
    customHeader.id = 'custom-header';
    const customFooter = document.createElement('template');
    customFooter.id = 'custom-footer';
    document.body.appendChild(customHeader);
    document.body.appendChild(customFooter);

    localVue.use(CustomComponents);
    expect(window.customElements.define).toHaveBeenCalledTimes(2);

    const { mock: { calls } } = window.customElements.define;
    expect(calls[0][0]).toBe(customHeader.id);
    expect(calls[1][0]).toBe(customFooter.id);
    // eslint-disable-next-line no-prototype-builtins
    expect(HTMLElement.isPrototypeOf(calls[0][1])).toBe(true);
    // eslint-disable-next-line no-prototype-builtins
    expect(HTMLElement.isPrototypeOf(calls[1][1])).toBe(true);
  });
});

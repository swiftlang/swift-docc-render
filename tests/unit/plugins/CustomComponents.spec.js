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
import { createApp } from 'vue';

const defineSpy = vi.spyOn(window.customElements, 'define');

describe('CustomComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not utilize `customElements.define` when no templates exist', () => {
    createApp({}).use(CustomComponents);
    expect(defineSpy).not.toBeCalled();
  });

  it('utilizes `customElements.define` to register custom elements when templates exist', () => {
    const customHeader = document.createElement('template');
    customHeader.id = 'custom-header';
    const customFooter = document.createElement('template');
    customFooter.id = 'custom-footer';
    document.body.appendChild(customHeader);
    document.body.appendChild(customFooter);

    createApp({}).use(CustomComponents);
    expect(defineSpy).toHaveBeenCalledTimes(2);

    const { mock: { calls } } = defineSpy;
    expect(calls[0][0]).toBe(customHeader.id);
    expect(calls[1][0]).toBe(customFooter.id);
    // eslint-disable-next-line no-prototype-builtins
    expect(HTMLElement.isPrototypeOf(calls[0][1])).toBe(true);
    // eslint-disable-next-line no-prototype-builtins
    expect(HTMLElement.isPrototypeOf(calls[1][1])).toBe(true);
  });
});

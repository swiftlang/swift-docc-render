/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import FocusTrap from 'docc-render/utils/FocusTrap';
import { parseHTMLString } from '../../../test-utils';

const DOM = parseHTMLString(`
  <button class="before">Before</button>
  <div class="container">
    <input class="first">
    <button class="second">Button</button>
    <a href="#" class="third">Anchor</a>
    <a href="" tabindex="-1" class="none-tabbable">None Tabbable</a>
  </div>
  <button class="after">After</button>
`);
document.body.appendChild(DOM);

const beforeElement = DOM.querySelector('.before');
const containerElement = DOM.querySelector('.container');
const firstElement = DOM.querySelector('.first');
const secondElement = DOM.querySelector('.second');
const thirdElement = DOM.querySelector('.third');
const afterElement = DOM.querySelector('.after');
const noneTabbable = DOM.querySelector('.none-tabbable');

let focusInstance;

Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() {
    const element = this.parentElement;
    if (element.style.display === 'none') return null;
    return element;
  },
});

describe('FocusTrap', () => {
  beforeEach(() => {
    focusInstance = new FocusTrap(containerElement);
    focusInstance.start();
  });
  afterEach(() => {
    focusInstance.destroy();
  });
  it('warns if no elements to focus', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockReturnValue('');
    const emptyDOM = parseHTMLString('<div>Just Text</div>');
    const emptyFocusInstance = new FocusTrap(emptyDOM);
    emptyFocusInstance.start();
    expect(warnSpy)
      .toHaveBeenCalledWith('There are no focusable elements. FocusTrap needs at least one.');
    warnSpy.mockReset();
    emptyFocusInstance.destroy();
  });

  it('on start, moves focuses the first tabbable element, if `activeElement` is not in container', () => {
    expect(document.activeElement).toEqual(firstElement);
  });

  it('on start, moves focuses the first tabbable element, if `activeElement` is in container, but its not tabbable', () => {
    // stop focus tracking
    focusInstance.stop();
    // focus a none tabbable element
    noneTabbable.focus();
    expect(document.activeElement).toEqual(noneTabbable);
    // start the focus tracking again
    focusInstance.start();
    expect(document.activeElement).toEqual(firstElement);
  });

  it('on start, does not focus the first target, if active element is inside container', () => {
    focusInstance.stop();
    expect(document.activeElement).toEqual(firstElement);
    thirdElement.focus();
    expect(document.activeElement).toEqual(thirdElement);
    focusInstance.start();
    expect(document.activeElement).toEqual(thirdElement);
  });

  it('on focus, does nothing if new focus target is inside container', () => {
    secondElement.focus();
    expect(document.activeElement).toEqual(secondElement);
  });

  it('on focus, moves focus the first element if focusing outer element after reaching the end', () => {
    // focus the last element
    thirdElement.focus();
    // move focus outside
    afterElement.focus();
    // assert the new focus target is the first available element
    expect(document.activeElement).toEqual(firstElement);
  });

  it('on focus, moves the focus to the last element if in the beginning', () => {
    // focus is now in the beginning
    // focus the first element, before the container
    beforeElement.focus();
    // assert the new focus target is the last available element
    expect(document.activeElement).toEqual(thirdElement);
  });

  it('on focus, moves focus the first element if focusing element that was focused last, but is no longer in DOM', () => {
    // focus the last element
    thirdElement.focus();
    // now delete the last element
    thirdElement.parentElement.removeChild(thirdElement);
    // move focus outside
    afterElement.focus();
    // assert the new focus target is the first available element
    expect(document.activeElement).toEqual(firstElement);
    // revert the removal
    containerElement.appendChild(thirdElement);
  });

  it('updates the container', () => {
    focusInstance.updateFocusContainer(afterElement);
    afterElement.focus();
    expect(document.activeElement).toEqual(afterElement);
    expect(focusInstance.focusContainer).toEqual(afterElement);
  });

  it('on destroy, stops listening to focus event', () => {
    focusInstance.destroy();
    // assert focusing works like normal
    beforeElement.focus();
    expect(document.activeElement).toEqual(beforeElement);
  });
});

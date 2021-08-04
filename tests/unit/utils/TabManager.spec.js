/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable */

import TabManager from "docc-render/utils/TabManager";
import { parseHTMLString } from "../../../test-utils";

const DOM = parseHTMLString(`
        <div class="container">
            <a href="#" class="a-href">A with HREF</a>
            <a class="a-no-href">A without HREF</a>
            <button class="button">Button</button>
            <button tabindex="-1" class="button-negative-tabindex">Button</button>
            plain text
            <div class="div-plain">Div with text</div>
            <div tabindex="0" class="div-tabindex">Div with tabindex</div>
            <select class="select"></select>
            <fieldset>Fieldset</fieldset>
            <div contenteditable="true" class="div-contenteditable">Editable Content</div>
            <div contenteditable="false" class="div-contenteditable-disabled">Editable Content</div>
            <input disabled class="input--disabled">
            <input type="text" class="input">
            <object>Something</object>
            <div style="display: none;">
                <ul tabindex="0" class="invisible-list"></ul>
                <button class="invisible-button">Button</button>
            </div>
        </div>
        <input class="outside">
    `);

Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    const element = this.parentElement;
    if (element.style.display === "none") return null;
    return element;
  }
});

describe("TabManager", () => {
  it("collects only tabbable elements, of the passed element", () => {
    const container = DOM.querySelector(".container");
    const tabElements = TabManager.getTabbableElements(container);
    expect(tabElements).toHaveLength(8);
    expect(tabElements.find(el => el.matches(".outside"))).toBeFalsy();
    expect(tabElements).toMatchInlineSnapshot(`
      Array [
        <a
          class="a-href"
          href="#"
        >
          A with HREF
        </a>,
        <button
          class="button"
        >
          Button
        </button>,
        <div
          class="div-tabindex"
          tabindex="0"
        >
          Div with tabindex
        </div>,
        <select
          class="select"
        />,
        <fieldset>
          Fieldset
        </fieldset>,
        <div
          class="div-contenteditable"
          contenteditable="true"
        >
          Editable Content
        </div>,
        <input
          class="input"
          type="text"
        />,
        <object>
          Something
        </object>,
      ]
    `);
  });

  it("checks if an element is tabbable", () => {
    expect(TabManager.isTabbableElement(DOM.querySelector(".a-href"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".a-no-href"))).toBe(false);
    expect(TabManager.isTabbableElement(DOM.querySelector(".button"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".button-negative-tabindex"))).toBe(
      false
    );
    expect(TabManager.isTabbableElement(DOM.querySelector(".div-plain"))).toBe(false);
    expect(TabManager.isTabbableElement(DOM.querySelector(".div-tabindex"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector("select"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector("fieldset"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".div-contenteditable"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".div-contenteditable-disabled"))).toBe(
      false
    );
    expect(TabManager.isTabbableElement(DOM.querySelector(".input"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".input--disabled"))).toBe(false);
    expect(TabManager.isTabbableElement(DOM.querySelector("object"))).toBe(true);
    expect(TabManager.isTabbableElement(DOM.querySelector(".invisible-list"))).toBe(false);
    expect(TabManager.isTabbableElement(DOM.querySelector(".invisible-button"))).toBe(false);
  });
});

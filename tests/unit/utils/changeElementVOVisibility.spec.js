/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable */

import changeElementVOVisibility from "docc-render/utils/changeElementVOVisibility";
import { parseHTMLString } from "../../../test-utils";

let DOM;

describe("changeElementVOVisibility", () => {
  beforeEach(() => {
    DOM = parseHTMLString(`
      <div>
        <div class="header">Header</div>
        <main class="main">
            <nav class="navigation">Navigation</nav>
            <div class="target">
                <div class="inside">Inside</div>
            </div>
        </main>
        <div class="footer">Footer</div>
      </div>
    `);
  });
  // cleanup the DOM
  afterEach(() => {
    document.getElementsByTagName("html")[0].innerHTML = "";
  });
  it("hides all siblings elements, of the current element, up the chain.", () => {
    document.body.appendChild(DOM);

    changeElementVOVisibility.hide(document.querySelector(".target"));
    expect(document.body.getAttribute("aria-hidden")).toBeFalsy();
    expect(document.querySelector(".header").getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".main").getAttribute("aria-hidden")).toBeFalsy();
    expect(document.querySelector(".main .navigation").getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".main .target").getAttribute("aria-hidden")).toBeFalsy();
    expect(document.querySelector(".footer").getAttribute("aria-hidden")).toBe("true");

    expect(document.querySelector(".header").getAttribute("tabindex")).toBe("-1");
    expect(document.querySelector(".main .navigation").getAttribute("tabindex")).toBe("-1");
    expect(document.querySelector(".footer").getAttribute("tabindex")).toBe("-1");

    expect(document.body.outerHTML).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            <div class="header" data-original-aria-hidden="" data-original-tabindex="" aria-hidden="true" tabindex="-1">Header</div>
            <main class="main">
              <nav class="navigation" data-original-aria-hidden="" data-original-tabindex="" aria-hidden="true" tabindex="-1">Navigation</nav>
              <div class="target">
                <div class="inside">Inside</div>
              </div>
            </main>
            <div class="footer" data-original-aria-hidden="" data-original-tabindex="" aria-hidden="true" tabindex="-1">Footer</div>
          </div>
        </div>
      </body>
    `);
  });

  it("reveals all sibling elements, of the current element, up the chain, removing extra attrs", () => {
    document.body.appendChild(DOM);
    // cache the html
    const previousHTML = document.body.outerHTML;
    const target = document.querySelector(".target");
    // hide all
    changeElementVOVisibility.hide(target);
    // reveal back
    changeElementVOVisibility.show(target);
    // assert the content is identical
    expect(document.body.outerHTML).toEqual(previousHTML);
    expect(document.body.outerHTML).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            <div class="header">Header</div>
            <main class="main">
              <nav class="navigation">Navigation</nav>
              <div class="target">
                <div class="inside">Inside</div>
              </div>
            </main>
            <div class="footer">Footer</div>
          </div>
        </div>
      </body>
    `);
  });

  it("preserves previously set aria-hidden values", () => {
    DOM.querySelector(".header").setAttribute("aria-hidden", true);
    DOM.querySelector(".navigation").setAttribute("aria-hidden", false);
    document.body.appendChild(DOM);
    const cachedHTML = document.body.outerHTML;

    const target = document.querySelector(".target");
    // hide all
    changeElementVOVisibility.hide(target);
    expect(document.querySelector(".header").getAttribute("data-original-aria-hidden")).toBe(
      "true"
    );
    expect(document.querySelector(".navigation").getAttribute("data-original-aria-hidden")).toBe(
      "false"
    );
    expect(document.body.outerHTML).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            <div class="header" aria-hidden="true" data-original-aria-hidden="true" data-original-tabindex="" tabindex="-1">Header</div>
            <main class="main">
              <nav class="navigation" aria-hidden="true" data-original-aria-hidden="false" data-original-tabindex="" tabindex="-1">Navigation</nav>
              <div class="target">
                <div class="inside">Inside</div>
              </div>
            </main>
            <div class="footer" data-original-aria-hidden="" data-original-tabindex="" aria-hidden="true" tabindex="-1">Footer</div>
          </div>
        </div>
      </body>
    `);
    changeElementVOVisibility.show(target);
    expect(document.body.outerHTML).toEqual(cachedHTML);
  });

  it("preserves previously set tabindex values", () => {
    DOM.querySelector(".header").setAttribute("tabindex", "2");
    DOM.querySelector(".navigation").setAttribute("tabindex", "-1");
    document.body.appendChild(DOM);
    const cachedHTML = document.body.outerHTML;

    const target = document.querySelector(".target");
    // hide all
    changeElementVOVisibility.hide(target);
    expect(document.querySelector(".header").getAttribute("data-original-tabindex")).toBe(
      "2"
    );
    expect(document.querySelector(".navigation").getAttribute("data-original-tabindex")).toBe(
      "-1"
    );
    expect(document.body.outerHTML).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            <div class="header" tabindex="-1" data-original-aria-hidden="" data-original-tabindex="2" aria-hidden="true">Header</div>
            <main class="main">
              <nav class="navigation" tabindex="-1" data-original-aria-hidden="" data-original-tabindex="-1" aria-hidden="true">Navigation</nav>
              <div class="target">
                <div class="inside">Inside</div>
              </div>
            </main>
            <div class="footer" data-original-aria-hidden="" data-original-tabindex="" aria-hidden="true" tabindex="-1">Footer</div>
          </div>
        </div>
      </body>
    `);
    changeElementVOVisibility.show(target);
    expect(document.body.outerHTML).toEqual(cachedHTML);
  });
});

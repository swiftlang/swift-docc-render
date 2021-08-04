/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// attach the "custom-" prefix to any component name to make it easy for Vue
// to ignore these in its own templates
function getTemplateIdentifier(name) {
  return `custom-${name}`;
}

// dynamically creates a class definition for a given identifier, which will be
// used as the tag name for a new autonomous custom web element
function createCustomElementDefinition(template) {
  return (class extends HTMLElement {
    constructor() {
      super();
      // eslint-disable-next-line no-shadow
      const shadowRoot = this.attachShadow({ mode: 'open' });

      const templateInstance = template.content.cloneNode(true);
      shadowRoot.appendChild(templateInstance);
    }
  });
}

// Register a custom web component for a given name.
//
// Example:
// `registerCustomComponent('header')` will register the custom web component
// <custom-header> whose template has already been defined in a <template> with
// the "custom-header" ID
function registerCustomComponent(name) {
  // create an identifier for the custom component name which will be used as
  // the tag name for instances and the id value for the <template> definition
  const id = getTemplateIdentifier(name);

  // register the custom web component if a <template> has been provided for it
  // the raw HTML
  const template = document.getElementById(id);
  if (template) {
    window.customElements.define(id, createCustomElementDefinition(template));
  }
}

export default function CustomComponents(Vue, options = {
  names: [
    'header',
    'footer',
  ],
}) {
  const { names } = options;

  // Force Vue to ignore any components that start with the "custom-" prefix,
  // which will be used to signify custom web components defined outside of this
  // application.
  //
  // Example: <custom-header>
  //
  // eslint-disable-next-line no-param-reassign
  Vue.config.ignoredElements = /^custom-/;

  // eslint-disable-next-line no-param-reassign
  names.forEach(registerCustomComponent);
}

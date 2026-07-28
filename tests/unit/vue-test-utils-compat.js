/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// Keep the test suite readable while its mount options move from Vue Test
// Utils 1's top-level API to Vue Test Utils 2's `global` API.
const { h, isReactive, reactive } = require('vue');
// eslint-disable-next-line import/extensions, import/no-unresolved
const VueTestUtils = require('../../node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js');

const enhancedWrappers = new WeakSet();

// Vue Test Utils 1 exposed stubs at `config.stubs`; retain that alias for the
// handful of tests that temporarily toggle transition stubbing.
VueTestUtils.config.stubs = VueTestUtils.config.global.stubs;

const legacyCreateElement = (type, data, children) => {
  const normalizedData = data === undefined ? {} : data;
  if (
    Array.isArray(normalizedData)
    || typeof normalizedData !== 'object'
    || normalizedData === null
  ) {
    return h(type, null, normalizedData);
  }
  const {
    attrs,
    on,
    props,
    ...otherData
  } = normalizedData;
  const listeners = Object.fromEntries(
    Object.entries(on || {}).map(([name, listener]) => [
      `on${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      listener,
    ]),
  );
  return h(type, {
    ...(attrs || {}),
    ...(props || {}),
    ...otherData,
    ...listeners,
  }, children);
};

const createLocalVue = () => {
  const registrations = {
    components: {},
    directives: {},
    plugins: [],
  };

  return {
    config: {},
    component(name, component) {
      registrations.components[name] = component;
    },
    directive(name, directive) {
      registrations.directives[name] = directive;
    },
    use(plugin, ...options) {
      if (plugin && (typeof plugin === 'function' || plugin.install)) {
        registrations.plugins.push([plugin, ...options]);
      }
    },
    registrations,
  };
};

const normalizeMountOptions = (options = {}) => {
  const {
    attachToDocument,
    localVue,
    mocks,
    provide,
    router,
    scopedSlots,
    stubs,
    ...mountOptions
  } = options;
  delete mountOptions.sync;
  const global = { ...(mountOptions.global || {}) };
  const registrations = localVue && localVue.registrations;

  global.components = {
    ...(registrations ? registrations.components : {}),
    ...(global.components || {}),
  };
  global.directives = {
    ...(registrations ? registrations.directives : {}),
    ...(global.directives || {}),
  };
  global.mocks = { ...(global.mocks || {}), ...(mocks || {}) };
  const normalizedProvide = Object.fromEntries(
    Object.entries(provide || {}).map(([key, value]) => {
      if (value && value.state && !isReactive(value.state)) {
        // Vue 2 observed a provided store's original state object when a
        // component returned it from data(). Vue 3 proxies the object instead,
        // so make legacy test stores explicitly reactive.
        // eslint-disable-next-line no-param-reassign
        value.state = reactive(value.state);
      }
      return [key, value];
    }),
  );
  global.provide = { ...(global.provide || {}), ...normalizedProvide };
  global.stubs = { ...(global.stubs || {}), ...(stubs || {}) };
  global.plugins = [
    ...(registrations ? registrations.plugins : []),
    ...(global.plugins || []),
    ...(router ? [router] : []),
  ];

  mountOptions.global = global;
  const normalizedScopedSlots = Object.fromEntries(
    Object.entries(scopedSlots || {}).map(([name, slot]) => [
      name,
      typeof slot === 'string'
        ? `<template #default="props">${slot}</template>`
        : props => slot.call({ $createElement: legacyCreateElement }, props),
    ]),
  );
  mountOptions.slots = { ...(mountOptions.slots || {}), ...normalizedScopedSlots };
  if (attachToDocument && !mountOptions.attachTo) {
    mountOptions.attachTo = document.body;
  }

  return mountOptions;
};

const enhanceWrapper = (wrapper) => {
  if (!wrapper || enhancedWrappers.has(wrapper) || !wrapper.exists()) return wrapper;

  const find = wrapper.find.bind(wrapper);
  const findAll = wrapper.findAll.bind(wrapper);
  const findComponent = wrapper.findComponent.bind(wrapper);
  const findAllComponents = wrapper.findAllComponents.bind(wrapper);
  const attributes = wrapper.attributes.bind(wrapper);
  const html = wrapper.html.bind(wrapper);
  const emitted = typeof wrapper.emitted === 'function'
    ? wrapper.emitted.bind(wrapper)
    : null;
  const setData = typeof wrapper.setData === 'function'
    ? wrapper.setData.bind(wrapper)
    : null;
  enhancedWrappers.add(wrapper);
  const enhanceWrappers = (wrappers) => {
    wrappers.forEach(enhanceWrapper);
    // Vue Test Utils 1 exposed the underlying array as `.wrappers`.
    // eslint-disable-next-line no-param-reassign
    wrappers.wrappers = wrappers;
    // eslint-disable-next-line no-param-reassign
    wrappers.exists = () => wrappers.length > 0;
    return wrappers;
  };
  const withoutDuplicateNativeEvents = (events) => {
    if (!Array.isArray(events)) return events;
    const containsComponentPayload = events.some(
      args => !(args[0] instanceof window.Event),
    );
    return containsComponentPayload
      ? events.filter(args => !(args[0] instanceof window.Event))
      : events;
  };
  Object.assign(wrapper, {
    attributes(attributeName) {
      if (attributeName) return attributes(attributeName);
      return Object.fromEntries(
        Object.entries(attributes()).filter(([name]) => !name.startsWith('data-v-')),
      );
    },
    destroy: wrapper.unmount ? wrapper.unmount.bind(wrapper) : undefined,
    find(selector) {
      return enhanceWrapper(find(selector));
    },
    findComponent(selector) {
      let result = findComponent(selector);
      if (!result.exists() && typeof selector === 'string') result = find(selector);
      if (!result.exists() && selector && selector.ref && wrapper.vm) {
        const ref = wrapper.vm.$refs[selector.ref];
        if (ref instanceof Element) result = new VueTestUtils.DOMWrapper(ref);
      }
      return enhanceWrapper(result);
    },
    findAll(selector) {
      const domWrappers = findAll(selector);
      if (typeof selector !== 'string') return enhanceWrappers(domWrappers);
      const componentWrappers = findAllComponents(selector);
      return enhanceWrappers(
        componentWrappers.length === domWrappers.length && componentWrappers.length
          ? componentWrappers
          : domWrappers,
      );
    },
    findAllComponents(selector) {
      let results = findAllComponents(selector);
      if (!results.length && selector && selector.ref && wrapper.vm) {
        const refs = wrapper.vm.$refs[selector.ref];
        const elements = Array.isArray(refs) ? refs : [refs];
        results = elements
          .filter(ref => ref instanceof Element)
          .map(ref => new VueTestUtils.DOMWrapper(ref));
      }
      return enhanceWrappers(results);
    },
    html() {
      return html().replace(/ data-v-[\da-f]+=""/g, '');
    },
    emitted(eventName) {
      if (!emitted) return undefined;
      const events = emitted(eventName);
      if (eventName || !events) return withoutDuplicateNativeEvents(events);
      return Object.fromEntries(
        Object.entries(events).map(([name, payloads]) => [
          name,
          withoutDuplicateNativeEvents(payloads),
        ]),
      );
    },
    async setData(data) {
      if (!setData) return undefined;
      const dataProperties = {};
      Object.entries(data).forEach(([key, value]) => {
        const computed = wrapper.vm.$options.computed
          && wrapper.vm.$options.computed[key];
        if (computed && typeof computed.set === 'function') {
          Reflect.set(wrapper.vm, key, value);
        } else {
          dataProperties[key] = value;
        }
      });
      if (Object.keys(dataProperties).length) await setData(dataProperties);
      return wrapper.vm.$nextTick();
    },
  });
  return wrapper;
};

const mount = (component, options) => enhanceWrapper(
  VueTestUtils.mount(component, normalizeMountOptions(options)),
);

const shallowMount = (component, options) => enhanceWrapper(
  VueTestUtils.shallowMount(component, normalizeMountOptions(options)),
);

module.exports = {
  ...VueTestUtils,
  createLocalVue,
  mount,
  shallowMount,
};

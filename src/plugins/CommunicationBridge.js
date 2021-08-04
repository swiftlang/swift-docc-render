/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable max-classes-per-file */
class NullBackend {
  constructor() {
    this.$send = () => {};
  }

  send(event) {
    this.$send(event);
  }
}

export class WebKitBackend {
  constructor() {
    const {
      webkit: {
        messageHandlers: {
          bridge = {},
        } = {},
      } = {},
    } = window;

    this.bridge = bridge;

    const {
      postMessage = () => {},
    } = bridge;

    // postMessage must always be called with the bridge as the receiver.
    this.$send = postMessage.bind(bridge);
  }

  send(event) {
    this.$send(event);
  }
}

export class CommunicationBridge {
  constructor(backend = new NullBackend()) {
    this.backend = backend;
    this.listeners = {};
  }

  send(event) {
    this.backend.send(event);
  }

  receive(event) {
    this.emit(event.type, event.data);
  }

  emit(type, data) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(l => l(data));
    }
  }

  on(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(listener);
  }

  off(type, listener) {
    if (!this.listeners[type]) {
      return;
    }

    this.listeners[type].delete(listener);
  }
}

export default {
  install(Vue, options) {
    let backend;

    if (options.performanceMetricsEnabled || options.appTarget === 'ide') {
      backend = new WebKitBackend();
    } else {
      backend = new NullBackend();
    }

    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$bridge = new CommunicationBridge(backend);
  },
};

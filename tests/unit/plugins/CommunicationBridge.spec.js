/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  CommunicationBridge,
  WebKitBackend,
} from 'docc-render/plugins/CommunicationBridge';

describe('CommunicationBridge', () => {
  let bridge;

  let sendMock;

  beforeEach(() => {
    sendMock = jest.fn();

    bridge = new CommunicationBridge({
      send: sendMock,
    });
  });

  it('delegates send calls to its base', () => {
    const event = 'myevent';
    bridge.send(event);
    expect(sendMock).toBeCalledWith(event);
  });

  it('notifies the correct listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    bridge.on('type1', listener1);
    bridge.on('type1', listener2);
    bridge.on('type2', listener3);

    bridge.receive({ type: 'type1', data: 'data1' });
    bridge.receive({ type: 'type2', data: 'data2' });

    expect(listener1).toBeCalledWith('data1');
    expect(listener2).toBeCalledWith('data1');
    expect(listener3).toBeCalledWith('data2');
  });

  it('does not notify removed listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    bridge.on('type1', listener1);
    bridge.on('type1', listener2);

    bridge.off('type1', listener2);

    bridge.receive({ type: 'type1', data: 'data1' });
    expect(listener1).toBeCalledWith('data1');
    expect(listener2).not.toBeCalled();
  });
});

describe('WebKitBackend', () => {
  let backend;
  let postMessageMock;

  beforeEach(() => {
    postMessageMock = jest.fn();
    global.webkit = {
      messageHandlers: {
        bridge: {
          postMessage: postMessageMock,
        },
      },
    };
    backend = new WebKitBackend();
  });

  afterEach(() => {
    global.webkit = null;
  });

  it('calls postMessage on send', () => {
    const event = 'myevent';
    backend.send(event);
    expect(postMessageMock).toBeCalledWith(event);
  });
});

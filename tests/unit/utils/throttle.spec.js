/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import throttle from 'docc-render/utils/throttle';

const func = jest.fn();
const time = 10;
const timeout = t => new Promise(r => setTimeout(r, t));

describe('throttle', () => {
  it('registers only the last call to a function, in a timespan', async () => {
    const throttled = throttle(func, time);
    // register first
    throttled(1);
    // drop the rest
    throttled(2);
    throttled(3);
    expect(func).toHaveBeenCalledTimes(1);
    await timeout(5);
    throttled(4);
    // this is the last call before the timeout ends
    throttled(5);
    expect(func).toHaveBeenCalledTimes(1);
    await timeout(time);
    expect(func).toHaveBeenCalledTimes(2);
    // register new call
    throttled(6);
    // make sure its called after it ends
    await timeout(time + 1);

    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenNthCalledWith(1, 1);
    expect(func).toHaveBeenNthCalledWith(2, 5);
    expect(func).toHaveBeenNthCalledWith(3, 6);
  });
});

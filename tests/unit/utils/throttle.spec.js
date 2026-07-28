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

vi.useFakeTimers();

describe('throttle', () => {
  let nowSpy;

  beforeEach(() => {
    nowSpy = vi.spyOn(global.Date, 'now');
    nowSpy.mockReturnValue(1664227837751);
  });

  // Fake timers do not handle `Date.now()` here,
  // so we need to carefully advance it in the same manner that the timeouts
  // are since `throttle` relies on both APIs in its implementation
  const advanceTime = (duration) => {
    const t = Date.now();
    nowSpy.mockReturnValue(t + duration);
    vi.advanceTimersByTime(duration);
  };

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('calls a function only once within the given interval of time', () => {
    // simulate throttling a function so that it only ever runs once per 50ms
    const func = vi.fn();
    const interval = 50;
    const throttled = throttle(func, interval);

    // simulate attempting to call this throttled function every 1ms for 100ms
    const fullTime = interval * 2 - 1;
    for (let i = 0; i < fullTime; i += 1) {
      throttled(i);
      advanceTime(1);
    }

    // ensure that the function was only actually run twice during the 100ms
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenNthCalledWith(1, 0);
    expect(func).toHaveBeenNthCalledWith(2, 49);
  });

  it('never schedules a negative timeout after the interval has elapsed', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    const interval = 50;
    const throttled = throttle(vi.fn(), interval);
    const initialTime = Date.now();

    throttled();
    nowSpy.mockReturnValue(initialTime + interval + 1);
    throttled();

    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 0);
    setTimeoutSpy.mockRestore();
  });
});

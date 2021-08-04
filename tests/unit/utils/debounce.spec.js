/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import debounce from 'docc-render/utils/debounce';

describe('debounce', () => {
  jest.useFakeTimers();
  const defaultTime = 5;
  const func = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls a function after X time passes between invocations', () => {
    const debouncedFunc = debounce(func, defaultTime);
    debouncedFunc(1);
    debouncedFunc(2);
    jest.advanceTimersByTime(1);
    debouncedFunc(3);
    jest.advanceTimersByTime(1);
    // this gets called because the time passes
    debouncedFunc(4);
    jest.advanceTimersByTime(defaultTime);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenLastCalledWith(4); // last parameter
    debouncedFunc(5);
    jest.advanceTimersByTime(defaultTime);
    expect(func).toHaveBeenCalledTimes(2);
  });

  it('calls a function at the start and debounces all other calls untill time passes', () => {
    const debouncedFunc = debounce(func, defaultTime, true);
    // gets called
    debouncedFunc(1);
    // does nothing
    debouncedFunc(2);
    expect(func).toHaveBeenCalledTimes(1);
    debouncedFunc(2);
    expect(func).toHaveBeenCalledTimes(1);
    debouncedFunc(2);
    // elapse time
    jest.advanceTimersByTime(defaultTime);
    // gets called
    debouncedFunc(3);
    expect(func).toHaveBeenCalledTimes(2);
    // assert the properties it is called with
    expect(func.mock.calls[0]).toContain(1);
    expect(func.mock.calls[1]).toContain(3);
  });

  it('calls a function at exactly the same intervals, with extra invocations not extending the period', () => {
    const debouncedFunc = debounce(func, defaultTime, false, true);
    debouncedFunc(1);
    debouncedFunc(2);
    jest.advanceTimersByTime(1);
    debouncedFunc(3);
    jest.advanceTimersByTime(1);
    // this gets called because the time passes
    debouncedFunc(4);
    jest.advanceTimersByTime(3);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenLastCalledWith(1); // last parameter
    debouncedFunc(5);
    jest.advanceTimersByTime(1);
    debouncedFunc(6);
    jest.advanceTimersByTime(2);
    debouncedFunc(7);
    jest.advanceTimersByTime(2);
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith(5);
  });
});

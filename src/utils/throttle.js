/**
 * Throttles calls to a function, across an interval
 * @param {Function} func
 * @param {Number} limit
 * @return {function(): (undefined)}
 */
export default function throttle(func, limit) {
  let timer;
  let ranLastTimeOn;
  return function innerThrottle(...args) {
    const context = this;
    if (!ranLastTimeOn) {
      func.apply(context, args);
      ranLastTimeOn = Date.now();
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if ((Date.now() - ranLastTimeOn) >= limit) {
        func.apply(context, args);
        ranLastTimeOn = Date.now();
      }
    }, limit - (Date.now() - ranLastTimeOn));
  };
}

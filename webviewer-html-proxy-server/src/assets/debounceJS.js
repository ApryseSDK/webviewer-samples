/* eslint-disable-next-line */
const debounceJS = (func, wait, leading) => {
  let timeout = null;
  return (...args) => {
    const callNow = leading && !timeout;
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!leading) {
        func.apply(null, args);
      }
    }, wait);
    if (callNow) {
      func.apply(null, args);
    }
  };
};

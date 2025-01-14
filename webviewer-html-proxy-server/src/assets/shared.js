/* eslint-disable-next-line */
const getPageHeight = () => {
  let sum = 0;
  // for some web pages, <html> and <body> have height: 100%
  // sum up the <body> children's height for an accurate page height
  // example: when page expands and then shrinks, <body> height will not reflect this change since it's 100% (which is the iframe height)
  document.body.childNodes.forEach((el) => {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(el);
      // filter hidden/collapsible elements
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || style.position === 'fixed' || style.position === 'absolute') {
        return;
      }
      // some elements have undefined clientHeight
      // favor scrollHeight since clientHeight does not include padding
      if (!isNaN(el.scrollHeight) && !isNaN(el.clientHeight)) {
        sum += (el.clientHeight > 0 ? (el.scrollHeight || el.clientHeight) : el.clientHeight);
      }
    }
  });
  const bodyHeight = document.body.scrollHeight || document.body.clientHeight || 0;
  return bodyHeight > 0 && bodyHeight > sum ? bodyHeight : sum;
};

/* eslint-disable-next-line */
const linkSelectors = `
  a:not([href]), 
  a[href=""], 
  a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="sms:"]):not([href^="mailto:"]):not([href^="javascript:"])
`;

/* eslint-disable-next-line */
const mutationObserverConfig = {
  attributes: false,
  childList: true,
  subtree: true,
  characterData: false,
};

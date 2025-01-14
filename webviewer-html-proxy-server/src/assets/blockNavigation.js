const onKeydownCallback = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

const blockNavigation = () => {
  const { urlToProxy } = window.PDFTron;

  // block navigation for suspicious <a> that don't have href or empty href: stubbing onclick
  // block navigation for all a tags that don't start with #
  /* eslint-disable-next-line no-undef */
  document.querySelectorAll(linkSelectors).forEach((elem) => {
    // in subsequent debouncing, make sure to only run this for new <a>
    if (elem.dataset.pdftron !== 'pdftron') {
      // set this attibute to identify if <a> href has been modified
      elem.setAttribute('data-pdftron', 'pdftron');

      // if href doesn't exist, use elem.href will not throw errors
      if (elem.href) {
        elem.setAttribute('target', '_blank');
        elem.setAttribute('data-href', elem.getAttribute('href'));
        // If the url is absolute then new URL won't mess it up.
        // It will only append urlToProxy if it is relative.
        elem.setAttribute('href', new URL(elem.getAttribute('href'), urlToProxy).href);
        elem.addEventListener('click', (event) => {
          event.stopImmediatePropagation();
          event.stopPropagation();
        });
      } else if (elem.onclick) {
        elem.onclick = null;
      }
    }
  });

  // for all a tags that start with #, copy to data-href for WV link annotation
  document.querySelectorAll('a[href^="#"]').forEach((elem) => {
    if (elem.dataset.pdftron !== 'pdftron') {
      elem.setAttribute('data-pdftron', 'pdftron');
      elem.setAttribute('data-href', elem.getAttribute('href'));
    }
  });

  // for keyboard tabbing
  document.querySelectorAll('a, button, [role="button"], input').forEach((elem) => elem.setAttribute('tabindex', -1));

  document.querySelectorAll('input').forEach((elem) => {
    if (!elem.readOnly) {
      elem.readOnly = true;
      // for amazon search input keypress enter
      elem.onkeydown = onKeydownCallback;
    }
  });

  // for wikipedia <select> language keypress enter
  document.querySelectorAll('select').forEach((elem) => {
    elem.onkeydown = onKeydownCallback;
  });
};

const debounceBlockNavigationOnMutation = debounceJS(blockNavigation, 500, false);
const debounceBlockNavigationOnTransition = debounceJS(blockNavigation, 50, false);

document.addEventListener('DOMContentLoaded', () => {
  blockNavigation();

  // nytimes has a delayed-appended pre-footer section
  const observer = new MutationObserver(() => {
    debounceBlockNavigationOnMutation();
  });
  /* eslint-disable-next-line no-undef */
  observer.observe(document.body, mutationObserverConfig);
});

document.addEventListener('transitionend', () => {
  debounceBlockNavigationOnTransition();
});
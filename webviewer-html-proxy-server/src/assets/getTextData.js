const getTextData = (body) => {
  const traverseTextNode = (parentNode, struct, offsets, quads, str, linksArray) => {
    const range = document.createRange();
    parentNode.childNodes?.forEach((child) => {
      if (isInvalidNode(child)) {
        return;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(child);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === 0) {
          return;
        }
      }

      if (child.tagName === 'A' && !!child.getAttribute('data-href')) {
        const clientRect = child.getBoundingClientRect();
        linksArray.push({ clientRect, href: child.getAttribute('data-href') });
      }

      if (child.nodeType === Node.TEXT_NODE) {
        const cText = child.textContent;
        const cTextLength = cText.length;
        const isValidText = Array.from(cText).filter((c) => !(c === '\n' || c === ' ' || c === '\t')).length > 0;
        if (cTextLength === 0 || !isValidText) {
          return;
        }

        const cQuads = [];
        const origQuadsOffset = quads.length / 8;
        const lines = [];
        let canAppendWord = false;
        let lineBreakCount = 0;

        for (let i = 0; i < cTextLength; i++) {
          // quads
          range.setStart(child, i);
          range.setEnd(child, i + 1);
          const { bottom, top, left, right } = range.getBoundingClientRect();
          cQuads.push(left, bottom, right, bottom, right, top, left, top);
          // offsets
          const curChar = cText[i];
          if (curChar === ' ') {
            offsets.push(-1);
          } else if (curChar === '\n') {
            offsets.push(-2);
          } else {
            offsets.push(offsets.length * 2);
          }
          // Build lines
          if (curChar === ' ' || curChar === '\n') {
            canAppendWord = false;
            str += curChar;
            continue;
          }
          const j = i + lineBreakCount;
          if (lines.length === 0 || Math.abs(cQuads[8 * (j - 1) + 1] - cQuads[8 * j + 1]) > 0.1) {
            // Add extra line break if needed
            if (lines.length !== 0) {
              const prevChar = cText[i - 1];
              if (!(prevChar === ' ' || prevChar === '\n')) {
                str += '\n';
                cQuads.push(...cQuads.slice(-8));
                offsets.push(offsets[offsets.length - 1]);
                offsets[offsets.length - 2] = -2;
                lineBreakCount++;
              }
            }
            // Create new line
            lines.push([[i + lineBreakCount]]);
            canAppendWord = true;
          } else {
            const words = lines[lines.length - 1];
            if (canAppendWord) {
              // Append to last word
              words[words.length - 1].push(j);
            } else {
              // Create new word
              words.push([j]);
              canAppendWord = true;
            }
          }
          str += curChar;
        }

        quads.push(...cQuads);

        // Add extra line break if needed
        const lastChar = cText[cTextLength - 1];
        if (!(lastChar === ' ' || lastChar === '\n')) {
          str += '\n';
          quads.push(...quads.slice(-8));
          offsets.push(-2);
        }

        // struct
        const lineCount = lines.length;
        struct[0] += lineCount;
        for (let i = 0; i < lineCount; i++) {
          const words = lines[i];
          const startWord = words[0];
          const endWord = words[words.length - 1];
          const lineStart = startWord[0];
          const lineEnd = endWord[endWord.length - 1];
          struct.push(
            words.length,
            0,
            cQuads[8 * lineStart],
            cQuads[8 * lineStart + 1],
            cQuads[8 * lineEnd + 4],
            cQuads[8 * lineEnd + 5]
          );
          for (let j = 0; j < words.length; j++) {
            const word = words[j];
            const wordLen = word.length;
            const wordStart = word[0];
            const wordEnd = word[wordLen - 1];
            struct.push(
              wordLen,
              wordStart + origQuadsOffset,
              wordLen,
              cQuads[8 * wordStart],
              cQuads[8 * wordEnd + 2]
            );
          }
        }
      } else {
        str = traverseTextNode(child, struct, offsets, quads, str, linksArray);
      }
    });
    return str;
  };

  const struct = [0];
  const offsets = [];
  const quads = [];
  const linksArray = [];
  const str = traverseTextNode(body, struct, offsets, quads, '', linksArray);

  return { selectionData: { struct, str, offsets, quads }, linkData: linksArray };
};

const isInvalidNode = (node) => {
  // optional chaining on https://www.bloomberg.com/
  return (!node) || (node.getBoundingClientRect && (node.getBoundingClientRect()?.width === 0 || node.getBoundingClientRect()?.height === 0));
};

const getClientUrl = () => {
  const { origin } = new URL(document.referrer);
  return origin;
};

const sendDataToClient = () => {
  const { selectionData, linkData } = getTextData(document.body);
  const iframeHeight = getPageHeight();
  window.parent.postMessage({ type: 'websiteData', selectionData, linkData, iframeHeight }, getClientUrl());
};

const debounceSendDataOnMutation = debounceJS(sendDataToClient, 500, false);
const debounceSendDataOnTransition = debounceJS(sendDataToClient, 50, false);

window.addEventListener('message', (e) => {
  if (e.origin === getClientUrl() && e.data === 'loadTextData') {
    sendDataToClient();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  window.parent.postMessage({ type: 'proxyFinishSuccess' }, getClientUrl());

  sendDataToClient();

  const observer = new MutationObserver(() => {
    debounceSendDataOnMutation();
  });
  /* eslint-disable-next-line no-undef */
  observer.observe(document.body, mutationObserverConfig);
});

document.addEventListener('transitionend', () => {
  debounceSendDataOnTransition();
});

// e.source from eventListener "message" is the host page, window.top
// use window.parent.postMessage() instead of e.source.postMessage() to communicate back to WV
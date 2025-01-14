const express = require('express');
const { PDFNet } = require('@pdftron/pdfnet-node');
const licenseKey = 'YOUR_LICENSE_KEY';
const router = express.Router();
const MAX_RESULTS = 1000;

function buildSearchMode(options = {}) {
  const SearchMode = PDFNet.TextSearch.Mode;
  let searchMode = SearchMode.e_page_stop | SearchMode.e_highlight;

  if (options.caseSensitive) {
    searchMode |= SearchMode.e_case_sensitive;
  }
  if (options.wholeWord) {
    searchMode |= SearchMode.e_whole_word;
  }
  if (options.regex) {
    searchMode |= SearchMode.e_reg_expression;
  }
  if (options.ambientString) {

  }
  searchMode |= SearchMode.e_ambient_string;
  return searchMode;
}

function searchFromDocument(searchString, searchOptions, onSearchResultFound, onSearchDone) {
  return async function searchFromDocument() {
    if (!searchString) {
      // if no search string given, do not proceed any further
      return onSearchDone();
    }
    // Open document
    const document = await PDFNet.PDFDoc.createFromFilePath('./assets/webviewer-demo-annotated.pdf');
    let textSearchMode = buildSearchMode(searchOptions);
    // create new text search for document and set correct search mode
    const textSearch = await PDFNet.TextSearch.create();
    await textSearch.begin(document, searchString, textSearchMode);
    let iteration = 1;
    let done = false;
    while (!done && iteration < MAX_RESULTS) {
      // run() return results one by one. We'll run search as long as document has not reach to the end
      // or if the max result size is not limited
      // TODO: make sure this is not awaiting the response
      const result = await textSearch.run();
      if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
        // highlight information is returned in result. We return all quads to the client
        // so we can show where in the document search keyword was found.
        const highlight = result.highlights;
        highlight.begin(document);
        let quadsInResults = [];
        while ((await highlight.hasNext())) {
          const quads = await highlight.getCurrentQuads();
          quadsInResults = quadsInResults.concat(quads);
          await highlight.next();
        }
        result.quads = quadsInResults;
        onSearchResultFound(result);
      }
      if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
        onSearchDone();
        done = true;
      }
      iteration++;
    }
  }
}

function stringToBoolean(value) {
  return value === 'true';
}

router.get('/search', function(req, res) {
  // use search keyword from request query parameter
  let keyword = req.query.keyword;
  const searchOptions = {
    caseSensitive: stringToBoolean(req.query.caseSensitive),
    wholeWord: stringToBoolean(req.query.wholeWord),
    regex: stringToBoolean(req.query.regex),
  }
  if (!keyword) {
    return res.status(400).send('Bad request. Keyword query parameter missing');
  }

  res.setHeader('Content-Type', 'application/json');
  const results = [];
  function onSearchResultFound(result) {
    results.push(result);
  }

  function onSearchDone() { }

  PDFNet.runWithCleanup(searchFromDocument(keyword, searchOptions, onSearchResultFound, onSearchDone), licenseKey).then(
    function onFulfilled() {
      res.status(200).json(results);
    },
    function onRejected(error) {
      // log error and close response
      console.error('Error while searching', error);
      res.status(503).send();
    }
  );
});

module.exports = router;

if(!fetch || !Promise){
  // check if browser supports fetch and Promises
  const viewerElement = document.getElementById('viewer');
  viewerElement.innerHTML = 'This example requires browser supporting both fetch and Promise API. Internet Explorer 11 not supported.'
}

function requestSearch(keyword, options){
  const apiUrl = new URL('http://localhost:8080/api/search');
  // add keyword as a url query parameter
  apiUrl.searchParams.append("keyword", keyword);
  const optionKeys = Object.keys(options);
  // Add all search options as a url query parameters
  optionKeys.forEach(function(key){
    apiUrl.searchParams.append(key, options[key]);
  });
  return fetch(apiUrl.href)
    .then(function(response){
      if(response.ok){
        return response.json();
      } else {
        console.log('Backend call failed, ', response.statusText);
      }
    });
}

function convertQuadCoordinatesToPdfCoordinates(document, pageNumber, quad){
  // PDFNet search result coordinate space is different than WebViewer coordinate space
  // so we need to convert them to be able to show highlights correctly
  // https://docs.apryse.com/documentation/web/guides/coordinates/
  const point1 = document.getPDFCoordinates(pageNumber, quad.p1x, quad.p1y);
  const point2 = document.getPDFCoordinates(pageNumber, quad.p2x, quad.p2y);
  const point3 = document.getPDFCoordinates(pageNumber, quad.p3x, quad.p3y);
  const point4 = document.getPDFCoordinates(pageNumber, quad.p4x, quad.p4y);
  return {
    'x1': point1.x,
    'y1': point1.y,
    'x2': point2.x,
    'y2': point2.y,
    'x3': point3.x,
    'y3': point3.y,
    'x4': point4.x,
    'y4': point4.y,
  }
}

function convertSearchResultForWebViewer(document, result){
  const webViewerFormattedQuads = result.quads.map((quad) => {
    // PDFNet search result coordinate space is different than WebViewer coordinate space
    // so we need to convert them to be able to show highlights correctly
    // https://docs.apryse.com/documentation/web/guides/coordinates/
    return convertQuadCoordinatesToPdfCoordinates(document, result.page_num, quad);
  });
  // WebViewer uses slightly modified result format than PDFNet on the server side.
  // To support displaying results on default UI, we need to convert it to match WebViewer format
  const searchResult = {
    resultCode: result.code,
    resultStr: result.out_str,
    resultStrStart: -1,
    resultStrEnd: -1,
    result_str: result.out_str,
    result_str_start: -1,
    result_str_end: -1,
    page_num: result.page_num,
    pageNum: result.page_num,
    ambient_str: result.ambient_str,
    ambientStr: result.ambient_str,
    quads: webViewerFormattedQuads
  };
  return searchResult;
}

function executeSearchOnBackendFactory(docViewer){
  // Function that will be executed instead of default search
  return function executeSearchOnBackend(searchValue, searchOptions){
    docViewer.clearSearchResults();
    const document = docViewer.getDocument();
    requestSearch(searchValue, searchOptions).then((data) => {
      if(data && data.length > 0) {
        const extendedResult = data.map((result) => {
          return convertSearchResultForWebViewer(document, result);
        });
        docViewer.displayAdditionalSearchResults(extendedResult);
        docViewer.setActiveSearchResult(extendedResult[0]);
      }
    });
  }
}

const WebViewer = window.WebViewer;
WebViewer({
  initialDoc: 'assets/webviewer-demo-annotated.pdf',
  enableFilePicker: true,
  path: 'webviewer/lib',
}, document.getElementById('viewer')).then((instance) => {
  const { documentViewer } = instance.Core;
  documentViewer.addEventListener('documentLoaded', function() {
    instance.UI.overrideSearchExecution(executeSearchOnBackendFactory(documentViewer));
  });
});

function getPoints() {
  return {
    'x1': this.x1,
    'y1': this.y1,
    'x2': this.x2,
    'y2': this.y2,
    'x3': this.x3,
    'y3': this.y3,
    'x4': this.x4,
    'y4': this.y4,
  };
}

import React, { useState, useEffect } from 'react';
import ClearSearch from '../../assets/icons/ic_close_black_24px.svg'
import LeftChevronArrow from '../../assets/icons/ic_chevron_left_black_24px.svg'
import RightChevronArrow from '../../assets/icons/ic_chevron_right_black_24px.svg'
import Search from '../../assets/icons/ic_search_black_24px.svg'
import './SearchContainer.css';

const SearchContainer = (props) => {
  const [searchResults, setSearchResults] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [toggledSearchModes, setToggledSearchModes] = useState([]);

  const {
    Annotations,
    annotationManager,
    documentViewer,
    open = false,
    searchContainerRef,
    searchTermRef: searchTerm,
  } = props;

  const pageRenderTracker = {};

  /**
   * Coupled with the function `changeActiveSearchResult`
   */
  useEffect(() => {
    if (activeResultIndex >= 0 && activeResultIndex < searchResults.length) {
      documentViewer.setActiveSearchResult(searchResults[activeResultIndex]);
    }
  }, [ activeResultIndex ]);

  /**
   * Side-effect function that invokes `documentViewer.textSearchInit`, and stores
   * every result in the state Array `searchResults`, and jumps the user to the
   * first result is found.
   */
  const performSearch = () => {
    clearSearchResults(false);
    const {
      current: {
        value: textToSearch
      }
    } = searchTerm;

    const {
      PAGE_STOP,
      HIGHLIGHT,
      AMBIENT_STRING
    } = window.Core.Search.Mode;

    const mode = toggledSearchModes.reduce(
      (prev, value) => prev | value,
      (PAGE_STOP | HIGHLIGHT | AMBIENT_STRING),
    );
    const fullSearch = true;
    let jumped = false;
    documentViewer.textSearchInit(textToSearch, mode, {
      fullSearch,
      onResult: result => {
        setSearchResults(prevState => [...prevState, result]);
        const {
          resultCode,
          quads,
          page_num: pageNumber,
        } = result;
        const {
          e_found: eFound,
        } = window.PDFNet.TextSearch.ResultCode
        if (resultCode === eFound) {
          const highlight = new Annotations.TextHighlightAnnotation();
          /**
           * The page number in Annotations.TextHighlightAnnotation is not
           * 0-indexed
           */
          highlight.setPageNumber(pageNumber);
          highlight.Quads.push(quads[0].getPoints());
          annotationManager.addAnnotation(highlight);
          annotationManager.drawAnnotations(highlight.PageNumber);
          if (!jumped) {
            jumped = true;
            // This is the first result found, so set `activeResult` accordingly
            setActiveResultIndex(0);
            documentViewer.displaySearchResult(result, () => {
              /**
               * The page number in documentViewer.displayPageLocation is not
               * 0-indexed
               */
              documentViewer.displayPageLocation(pageNumber, 0, 0, true);
            });
          }
        }
      }
    });
  };

  /**
   * Side-effect function that invokes the internal functions to clear the
   * search results
   *
   * @param {Boolean} clearSearchTermValue For the guard clause to determine
   * if `searchTerm.current.value` should be mutated (would not want this to
   * occur in the case where a subsequent search is being performed after a
   * previous search)
   */
  const clearSearchResults = (clearSearchTermValue = true) => {
    if (clearSearchTermValue) {
      searchTerm.current.value = '';
    }
    documentViewer.clearSearchResults();
    annotationManager.deleteAnnotations(annotationManager.getAnnotationsList());
    setSearchResults([]);
    setActiveResultIndex(-1);
  };

  /**
   * Checks if the key that has been released was the `Enter` key, and invokes
   * `performSearch` if so
   *
   * @param {SyntheticEvent} event The event passed from the `input` element
   * upon the function being invoked from a listener attribute, such as
   * `onKeyUp`
   */
  const listenForEnter = (event) => {
    const {
      keyCode,
    } = event;
    // The key code for the enter button
    if (keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      performSearch();
    }
  };

  /**
   * Changes the active search result in `documentViewer`
   *
   * @param {Number} newSearchResult The index to set `activeResult` to,
   * indicating which `result` object that should be passed to
   * `documentViewer.setActiveSearchResult`
   */
  const changeActiveSearchResult = (newSearchResult) => {
    /**
     * @todo Figure out why only the middle set of search results can be
     * iterated through, but not the first or last results.
     */
    /**
     * Do not try to set a search result that is outside of the index range of
     * searchResults
     */
    if (newSearchResult >= 0 && newSearchResult < searchResults.length) {
      setActiveResultIndex(newSearchResult);
    }
  };

  /**
   * Toggles the given `searchMode` value within `toggledSearchModes`
   *
   * @param {CoreControls.DocumentViewer.SearchMode} searchMode The bitwise
   * search mode value to toggle on or off
   */
  const toggleSearchMode = (searchMode) => {
    if (!toggledSearchModes.includes(searchMode)) {
      setToggledSearchModes(prevState => [...prevState, searchMode])
    } else {
      setToggledSearchModes(
        prevState => prevState.filter(value => value !== searchMode)
      )
    }
  }

  /**
   * Side-effect function that toggles whether or not to perform a text search
   * with case sensitivty
   */
  const toggleCaseSensitive = () => {
    toggleSearchMode(window.Core.Search.Mode.CASE_SENSITIVE);
  }

  /**
   * Side-effect function that toggles whether or not to perform a text search
   * that finds the whole word
   */
  const toggleWholeWord = () => {
    toggleSearchMode(window.Core.Search.Mode.WHOLE_WORD);
  }

  if (!open) {
    return (null);
  }

  return (
    <span
      id="search-container"
      ref={searchContainerRef}
    >
      <div id="search-input">
        <input
          ref={searchTerm}
          type={'text'}
          placeholder={'Search'}
          onKeyUp={listenForEnter}
        />
        <button onClick={performSearch}>
          <img src={Search} alt="Search"/>
        </button>
      </div>
      <div>
        <span>
          <input
            type="checkbox"
            value={toggledSearchModes.includes(window.Core.Search.Mode.CASE_SENSITIVE)}
            onChange={toggleCaseSensitive}
          />
          Case sensitive
        </span>
        <span>
          <input
            type="checkbox"
            value={toggledSearchModes.includes(window.Core.Search.Mode.WHOLE_WORD)}
            onChange={toggleWholeWord}
          />
          Whole word
        </span>
      </div>
      <div className="divider"></div>
      <div id='search-buttons'>
        <span>
          <button onClick={clearSearchResults}>
            <img src={ClearSearch} alt="Clear Search"/>
          </button>
        </span>
        <span id="search-iterators">
          <button
            onClick={() => { changeActiveSearchResult(activeResultIndex - 1); }}
            disabled={activeResultIndex < 0}
          >
            <img src={LeftChevronArrow} alt="Previous Search Result"/>
          </button>
          <button
            onClick={() => { changeActiveSearchResult(activeResultIndex + 1); }}
            disabled={activeResultIndex < 0}
          >
            <img src={RightChevronArrow} alt="Next Search Result"/>
          </button>
        </span>
      </div>
      <div>
        {
          searchResults.map((result, idx) => {
            const {
              ambient_str: ambientStr,
              page_num: pageNum,
              result_str_start: resultStrStart,
              result_str_end: resultStrEnd,
            } = result;
            const textBeforeSearchValue = ambientStr.slice(0, resultStrStart);
            const searchValue = ambientStr.slice(
              resultStrStart,
              resultStrEnd,
            );
            const textAfterSearchValue = ambientStr.slice(resultStrEnd);
            let pageHeader = null;
            if (!pageRenderTracker[pageNum]) {
              pageRenderTracker[pageNum] = true;
              pageHeader = <div>Page {pageNum}</div>
            }
            return (
              <div key={`search-result-${idx}`} >
                {pageHeader}
                <div
                  className='search-result'
                  onClick={() => {documentViewer.setActiveSearchResult(result)}}
                >
                  {textBeforeSearchValue}
                  <span className="search-value">
                    {searchValue}
                  </span>
                  {textAfterSearchValue}
                </div>
              </div>
            )
          })
        }
      </div>
    </span>
  );
};

export default SearchContainer;

import React, { useRef, useEffect, useState } from 'react';
import SearchContainer from './components/SearchContainer';
import { ReactComponent as ZoomIn } from './assets/icons/ic_zoom_in_black_24px.svg';
import { ReactComponent as ZoomOut } from './assets/icons/ic_zoom_out_black_24px.svg';
import { ReactComponent as AnnotationRectangle } from './assets/icons/ic_annotation_square_black_24px.svg';
import { ReactComponent as AnnotationRedact } from './assets/icons/ic_annotation_add_redact_black_24px.svg';
import { ReactComponent as AnnotationApplyRedact} from './assets/icons/ic_annotation_apply_redact_black_24px.svg';
import { ReactComponent as Search } from './assets/icons/ic_search_black_24px.svg';
import { ReactComponent as Select } from './assets/icons/ic_select_black_24px.svg';
import { ReactComponent as EditContent } from './assets/icons/ic_edit_page_24px.svg';
import { ReactComponent as AddParagraph } from './assets/icons/ic_paragraph_24px.svg';
import { ReactComponent as AddImageContent } from './assets/icons/ic_add_image_24px.svg';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);

  const [documentViewer, setDocumentViewer] = useState(null);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);
  const [isInContentEditMode, setIsInContentEditMode] = useState(false);

  const Annotations = window.Core.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const Core = window.Core;
    Core.setWorkerPath('/webviewer');
    Core.enableFullPDF();

    const documentViewer = new Core.DocumentViewer();
    documentViewer.setScrollViewElement(scrollView.current);
    documentViewer.setViewerElement(viewer.current);
    documentViewer.enableAnnotations();
    documentViewer.loadDocument('/files/demo.pdf');

    setDocumentViewer(documentViewer);

    documentViewer.addEventListener('documentLoaded', () => {
      console.log('document loaded');
      documentViewer.setToolMode(documentViewer.getTool(Core.Tools.ToolNames.EDIT));
      setAnnotationManager(documentViewer.getAnnotationManager());
    });
  }, []);

  const zoomOut = () => {
    documentViewer.zoomTo(documentViewer.getZoomLevel() - 0.25);
  };

  const zoomIn = () => {
    documentViewer.zoomTo(documentViewer.getZoomLevel() + 0.25);
  };

  const startEditingContent = () => {
    const contentEditManager = documentViewer.getContentEditManager();
    contentEditManager.startContentEditMode();
    setIsInContentEditMode(true);
  }

  const endEditingContent = () => {
    setIsInContentEditMode(false);
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.EDIT));
    const contentEditManager = documentViewer.getContentEditManager();
    contentEditManager.endContentEditMode();
  }

  const addParagraph = () => {
    if (isInContentEditMode) {
      const addParagraphTool = documentViewer.getTool(window.Core.Tools.ToolNames.ADD_PARAGRAPH);
      documentViewer.setToolMode(addParagraphTool);
    } else {
      alert('Content Edit mode is not enabled.')
    }
  };

  const addImageContent = () => {
    if (isInContentEditMode) {
      const addImageContentTool = documentViewer.getTool(window.Core.Tools.ToolNames.ADD_IMAGE_CONTENT);
      documentViewer.setToolMode(addImageContentTool);
    } else {
      alert('Content Edit mode is not enabled.')
    }
  };

  const createRectangle = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.RECTANGLE));
  };

  const selectTool = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.EDIT));
  };

  const createRedaction = () => {
    documentViewer.setToolMode(documentViewer.getTool(window.Core.Tools.ToolNames.REDACTION));
  };

  const applyRedactions = async () => {
    const annotationManager = documentViewer.getAnnotationManager();
    annotationManager.enableRedaction();
    await annotationManager.applyRedactions();
  };

  return (
    <div className="App">
      <div id="main-column">
        <div className="center" id="tools">
          <button onClick={zoomOut}>
            <ZoomOut />
          </button>
          <button onClick={zoomIn}>
            <ZoomIn />
          </button>
          <button onClick={startEditingContent} title="Switch to edit mode">
            <EditContent />
          </button>
          <button onClick={addParagraph} title="Add new paragraph">
            <AddParagraph />
          </button>
          <button onClick={addImageContent} title="Add new content image">
            <AddImageContent />
          </button>
          <button onClick={endEditingContent} title="End edit mode">
            Finish Editing
          </button>
          <button onClick={createRectangle}>
            <AnnotationRectangle />
          </button>
          <button onClick={createRedaction} title="Create Redaction">
            <AnnotationRedact />
          </button>
          <button onClick={applyRedactions} title="Apply Redactions">
            <AnnotationApplyRedact />
          </button>
          <button onClick={selectTool}>
            <Select />
          </button>
          <button
            onClick={() => {
              // Flip the boolean
              setSearchContainerOpen(prevState => !prevState);
            }}
          >
            <Search />
          </button>
        </div>
        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          <div id="viewer" ref={viewer}></div>
        </div>
      </div>
      <div className="flexbox-container">
        <SearchContainer
          Annotations={Annotations}
          annotationManager={annotationManager}
          documentViewer={documentViewer}
          searchTermRef={searchTerm}
          searchContainerRef={searchContainerRef}
          open={searchContainerOpen}
        />
      </div>
    </div>
  );
};

export default App;

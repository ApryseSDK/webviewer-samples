import {
  Button,
  ButtonGroup,
  File,
  FileOrganizer,
  Spinner,
  Thumbnail,
  ThumbnailDragLayer,
  useManagedFiles,
} from '@pdftron/webviewer-react-toolkit';
import fileSaver from 'file-saver';
import React, { useState } from 'react';
import './App.css';
import { ThemeButton } from './ThemeButton';
import { joinPages, splitPages } from './utils';

function App() {
  const [loading, setLoading] = useState(false);
  const { files, setFiles, draggingIds, fileOrganizerProps, getThumbnailSelectionProps } = useManagedFiles<File>();

  const hasFiles = files.length > 0;

  const handleLoadPDF = async () => {
    // If called while files exist, clear the files.
    if (hasFiles) {
      return setFiles([]);
    }

    setLoading(true);

    // Set the source to point to your PDF. In this example, we have the PDF
    // inside of `public/assets`. You can add any path, or a URL to a PDF.
    const source = process.env.PUBLIC_URL + '/assets/PDFTRON_about.pdf';

    const newFiles = await splitPages(source);

    setFiles(newFiles);
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);

    const file = await joinPages(files);
    const blob = await file.fileObj.get();
    const name = file.name;

    fileSaver.saveAs(blob, name);

    setLoading(false);
  };

  return (
    <div className="app">
      <main className="app__main">
        {hasFiles ? (
          <FileOrganizer
            {...fileOrganizerProps}
            className="organizer"
            onRenderDragLayer={() => <ThumbnailDragLayer numFiles={draggingIds.length} />}
            onRenderThumbnail={({ id, onRenderThumbnailProps }) => (
              <Thumbnail {...getThumbnailSelectionProps(id)} {...onRenderThumbnailProps} />
            )}
          />
        ) : (
          <div className="app__placeholder">{loading ? <Spinner /> : 'Click Load PDF to begin organizing pages.'}</div>
        )}
      </main>
      <footer className="app__footer">
        <ButtonGroup centerMobile position="space-between">
          <ThemeButton />
          <ButtonGroup centerMobile>
            <Button disabled={loading} buttonStyle="borderless" onClick={handleLoadPDF}>
              {hasFiles ? 'Delete PDF' : 'Load PDF'}
            </Button>
            <Button disabled={loading || !hasFiles} onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </footer>
    </div>
  );
}

export default App;

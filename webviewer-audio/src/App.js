import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import WebViewer from '@pdftron/webviewer';
import { initializeAudioViewer } from '@pdftron/webviewer-audio';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const inputFile = useRef(null);

  const [audioInstance, setAudioInstance] = useState(null);

  const initializeHeader = useCallback(instance => {
    const { UI: { setHeaderItems } } = instance;

    setHeaderItems(header => {
      // Add upload file button
      header.push({
        type: 'actionButton',
        img: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 15H13V9H16L12 4L8 9H11V15Z" fill="currentColor"/>
          <path d="M20 18H4V11H2V18C2 19.103 2.897 20 4 20H20C21.103 20 22 19.103 22 18V11H20V18Z" fill="currentColor"/>
          </svg>`,
        title: 'Load file',
        dataElement: 'audio-loadFileButton',
        onClick: () => {
          inputFile.current.click();
        }
      });
    });
  }, []);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer.Iframe(
      {
        path: '/webviewer/lib',
      },
      viewer.current,
    ).then(async instance => {
      instance.UI.setTheme('dark');
      instance.UI.openElements(['notesPanel']);

      const license = `---- Insert commercial license key here after purchase ----`;
      // Extends WebViewer to allow loading media files (.mp3, .mp4, ogg, webm, etc.)
      const audioInstance = await initializeAudioViewer(
        instance,
        { license, isDemoMode: process.env.DEMO },
      );

      setAudioInstance(audioInstance);

      // Load a media element at a specific url. Can be a local or public link
      // If local it needs to be relative to lib/ui/index.html.
      // Or at the root. (eg '/audio.mp3')
      const audioUrl = 'https://pdftron.s3.amazonaws.com/downloads/pl/video/audio.mp3';

      audioInstance.loadAudio(audioUrl);
      initializeHeader(instance);
    });
  }, [initializeHeader]);

  const onFileChange = async event => {
    const file = event.target.files[0];

    // There won't be file if the file dialog is canceled
    if (file) {
      audioInstance.loadAudio(file, { fileName: file.name });
    }
  };

  return (
    <div className="App">
      <input type="file" hidden ref={inputFile} onChange={onFileChange} value=""/>
      <div className="webviewer" ref={viewer}/>
    </div>
  );
};

export default App;

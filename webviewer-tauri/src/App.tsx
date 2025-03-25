import { useRef, useEffect } from "react";
import WebViewer from "@pdftron/webviewer";


function App() {
  const viewer = useRef<HTMLDivElement | null>(null);
  const instantiated = useRef<Boolean>(false)
  useEffect(() => {
    if (!instantiated.current) {
      WebViewer({
        path: "./lib/webviewer",
        licenseKey: '[Your license key]',
        enableFilePicker: true,
        enableOfficeEditing: true,
        //@ts-ignore
      }, viewer.current).then(instance => {
      })
    }
    instantiated.current = true;
  }, [])
  return (
    <>
      <div className='webviewer' ref={viewer} style={{ height: "90vh" }}></div>
    </>
  )
}
export default App;

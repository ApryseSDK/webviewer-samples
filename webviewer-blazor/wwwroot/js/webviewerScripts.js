window.webviewerFunctions = {
  initWebViewer: function (licenseKey) {
    const viewerElement = document.getElementById("viewer");
    WebViewer(
      {
        path: "lib",
        licenseKey: licenseKey || "", // set DEMO_KEY in .env
        initialDoc:
          "https://apryse.s3.amazonaws.com/public/files/samples/demo-annotated.pdf", // replace with your own PDF file
      },
      viewerElement,
    ).then((instance) => {
      // call apis here
    });
  },
};

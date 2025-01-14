// @link WebViewerInstance: https://www.pdftron.com/api/web/WebViewerInstance.html
// @link UI.setLanguage: https://www.pdftron.com/api/web/UI.html#setLanguage__anchor

WebViewer(
  {
    path: '../../../lib',
    additionalTranslations: {
      language: 'en',
      translations: { 'option.toolbarGroup.toolbarGroup-View': 'Edited View Label' },
    },
    webviewerServerURL: 'https://demo.pdftron.com/', // comment this out to do client-side only
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);
  document.getElementById('form').onchange = e => {
    // Set language
    instance.UI.setLanguage(e.target.id);
  };

  // To Create a new button into the settings menu and set the translation
  instance.UI.settingsMenuOverlay.add(
    {
      type: 'actionButton',
      className: 'row',
      dataElement: 'languageButton',
      label: 'Language',
    },
    'downloadButton'
  );
});

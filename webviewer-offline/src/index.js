var viewerElement = document.getElementById('viewer');

var files = [
  '/files/webviewer-demo-annotated.xod',
  '/files/webviewer-demo-annotated.pdf',
  '/files/legal-contract.docx',
];

WebViewer({
  path: '/public/lib',
  preloadWorker: WebViewer.WorkerTypes.ALL,
}, viewerElement).then(instance => {
  var store = localforage.createInstance({ name: 'store' });
  var documentsDiv = document.getElementById('documents');

  files.forEach(function(file) {
    var list = document.createElement('li');
    var div = document.createElement('div');
    var button = document.createElement('button');
    var fileName = file.split('/').slice(-1)[0];

    div.innerHTML = fileName;
    button.innerHTML = 'Open';
    button.onclick = function() {
      if (button.innerHTML === 'Open') {
        store
          .getItem(fileName)
          .then(function(blob) {
            blob.name = fileName;
            instance.UI.loadDocument(blob, { filename: fileName });
          });
      } else {
        fetch(file)
          .then(function(response) {
            return response.blob();
          })
          .then(function(blob) {
            store.setItem(fileName, blob);
            button.innerHTML = 'Open';
          })
          .catch(() => {
            console.log('Error fetching the file');
          });
      }
    };

    list.appendChild(div);
    list.appendChild(button);

    documentsDiv.appendChild(list);

    // Change button text to Open if the file is cached, otherwise set the text to Download
    store.keys().then(function(keys) {
      if (keys.indexOf(fileName) === -1) {
        button.innerHTML = 'Download';
      }
    });
  });
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(function(registration) {
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    }).catch(function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
} else {
  alert('This browser does not support service worker.');
}





// WPA app installer
const Installer = function(root) {
  let promptEvent;

  const install = function(e) {
    if(promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice
        .then(function(choiceResult) {
          // The user actioned the prompt (good or bad).
          // good is handled in
          promptEvent = null;
          root.classList.remove('available');
        })
        .catch(function(installError) {
          // Boo. update the UI.
          promptEvent = null;
          root.classList.remove('available');
        });
    }
  };

  const installed = function(e) {
    promptEvent = null;
    // This fires after onbeforinstallprompt OR after manual add to homescreen.
    root.classList.remove('available');
  };

  const beforeinstallprompt = function(e) {
    promptEvent = e;
    promptEvent.preventDefault();
    root.classList.add('available');
    return false;
  };

  window.addEventListener('beforeinstallprompt', beforeinstallprompt);
  window.addEventListener('appinstalled', installed);

  root.addEventListener('click', install.bind(this));
  root.addEventListener('touchend', install.bind(this));
};


window.addEventListener('load', function() {
  const installEl = document.getElementById('installer');
  const installer = new Installer(installEl);

  var headerElement = document.getElementsByTagName('header')[0];
  var asideElement = document.getElementsByTagName('aside')[0];

  var menuButton = document.createElement('div');
  menuButton.className = 'menu';
  menuButton.onclick = function() {
    if (asideElement.style.display === 'block') {
      asideElement.style.display = 'none';
    } else {
      asideElement.style.display = 'block';
    }
  };


  var div = document.createElement('div');
  menuButton.appendChild(div);
  menuButton.appendChild(div.cloneNode());
  menuButton.appendChild(div.cloneNode());

  headerElement.appendChild(menuButton);
})

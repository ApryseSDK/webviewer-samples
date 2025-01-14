import { CollabClient } from '@pdftron/collab-client';
import WebViewer from '@pdftron/webviewer';

// @ts-ignore
import faker from 'faker';

const url = `http://localhost:3000`;
const subscriptionUrl = `ws://localhost:3000/subscribe`;
const viewerElement = document.getElementById('viewer') as HTMLDivElement;
const currentUser = faker.name.firstName();
const documentId = '1';
const documentURL = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";

WebViewer(
  {
    path: '/public/webviewer'
  },
  viewerElement
).then(async (instance) => {
  const client = new CollabClient({
    instance,
    url,
    subscriptionUrl
  });
  const user = await client.loginAnonymously(currentUser);


  let doc = await user.getDocument(documentId);
  if(!doc) {
    doc = await user.createDocument({
      document: documentURL,
      name: 'demo-annotated.pdf',
      isPublic: true,
      id: documentId
    })
  }

  if(!(await doc.isMember())) {
    await doc.join();
  }
 
  await doc.view(documentURL);
});

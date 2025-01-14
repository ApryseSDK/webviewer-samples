// @ts-ignore
import TestResolvers from '@pdftron/collab-server/tests/resolvers';

import resolvers from './resolvers';
import getDB from './db';

const runTestResolvers = async () => {
  const db = await getDB();
  const errorMessages = await TestResolvers(resolvers);
  if (errorMessages.length) {
    console.log('error messages', errorMessages);
  } else {
    console.log('Pass all tests!');
  }
  db.close();
};

runTestResolvers();

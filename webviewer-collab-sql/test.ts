import TestResolvers from '@pdftron/collab-server/tests/resolvers'
import resolvers from './server/resolvers'

(async () => {
  const errors = await TestResolvers(resolvers);
  console.log(errors.filter(error => error.error.type !== 'resolver_missing'));
})()
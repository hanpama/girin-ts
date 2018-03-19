import { ApolloClient } from 'apollo-client';
import { SchemaLink } from 'apollo-link-schema';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';

import { schema } from './schema';


export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: new SchemaLink({ schema }),
  cache: new InMemoryCache()
})

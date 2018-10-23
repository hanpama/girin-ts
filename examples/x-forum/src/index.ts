import { girin } from '@girin/framework';
import { Query, Mutation } from '@girin/typelink';
import { printSchema } from 'graphql';
import { User } from './models';
import SchemaModule from '@girin/framework/schema';


const myApp = girin({
  schema: {
    Query,
    Mutation,
  },
  auth: {
    JWT_SECRET_KEY: 'X-FORUM-SECRET-KEY',
    USER: User,
  },
  mongo: {

    URL: 'mongodb://test:verystrongpassword@localhost',
    DBNAME: 'girin-x-forum',
    CLIENT_OPTIONS: { useNewUrlParser: true },
  },
  server: {
    listen: {
      host: 'localhost',
      port: 4000,
    }
  },
});

myApp.run().then((info: any) => {
  console.log(printSchema(info.get(SchemaModule)));
  console.log('Server is running on localhost:4000');
}).catch(async (err) => {
  console.error(err);
  await myApp.destroy();
  process.exit(1);
});

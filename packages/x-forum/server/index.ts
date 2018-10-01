import { app } from '@girin/girin';
import { Query, Mutation } from '@girin/typelink';
import { User } from './models';


app({
  Query,
  Mutation,
  // AUTH_MODEL: User,
  AUTH_JWT_SECRET_KEY: 'X-FORUM-SECRET-KEY',
  AUTH_MODEL: User as any,
  AUTH_PASSWORD_SALT: 'saltsalt',
  MONGO_URL: 'mongodb://test:verystrongpassword@localhost',
  MONGO_DBNAME: 'mongorelay',
  SERVER_LISTEN: {
    host: '0.0.0.0',
    port: 4000,
  },
}).then(() => {
  return Promise.all([
    User.getManager().collection.createIndex({ username: 1 }, { unique: true })
  ]);
}).catch(console.error);

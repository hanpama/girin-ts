import { MongoClient } from 'mongodb';


interface Environment {
  client?: MongoClient;
  dbName?: string;
}
const environment: Environment = {
  dbName: 'test',
};

export function setEnvironment(updater: Environment) {
  Object.assign(environment, updater);
}

export function getEnvironment<T extends keyof Environment>(key: T) {
  return environment[key]!;
}

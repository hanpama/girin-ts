import 'reflect-metadata';

import { TypeORMFrameworkDatastore } from '../src';
import { testFrameworkDatastoreSpec } from '@girin/framework';
import { Entity, Column, PrimaryGeneratedColumn, Connection } from 'typeorm';
import { createTestingConnections, reloadTestingDatabases, closeTestingConnections } from './testenv';


describe('typeorm-framework-datastore', () => {

  @Entity('typeorm-framework-datastore-foo')
  class Foo {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() foo: string;
  }

  @Entity('typeorm-framework-datastore-bar')
  class Bar {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() bar: string;
  }

  let connections: Connection[];

  beforeAll(async () => {
    connections = await createTestingConnections({
      entities: [Foo, Bar],
    });
  });
  beforeEach(async () => reloadTestingDatabases(await connections));
  afterAll(async () => closeTestingConnections(await connections));

  it('meets specification', () => Promise.all(connections.map(async dbConn => {
    const mod = new TypeORMFrameworkDatastore({
      connectionName: dbConn.name,
    });

    await testFrameworkDatastoreSpec(mod, Foo, Bar);
  })));
});

import { createReadStream, readFileSync } from 'fs';

import { defineType, gql } from '@girin/typelink';
import MediaModule, { FileUpload } from '@girin/media';
import { TestClient, prepareTestEnv, destroyTestEnv, TestHttpServer } from '@girin/framework/lib/test';

import { TestMedia } from './TestMedia';


@defineType(gql`
  type Query {
    getMedia(id: String!): ${TestMedia}!
  }
`)
class Query {

}

@defineType(gql`
  type Mutation {
    echoFileContent(upload: Upload!): String
    createMedia(upload: Upload!): ${TestMedia}!
    deleteMedia(id: String!): String!
  }
`)
class Mutation {
  static async echoFileContent(_source: null, args: { upload: Promise<FileUpload> }) {
    const upload = await args.upload;

    const stream = upload.stream;
    let bufs: string = '';
    stream.on('data', buf => {
      bufs += buf.toString();
    });
    return new Promise((resolve, reject) => {
      stream.once('end', () => resolve(bufs));
      stream.once('error', err => reject(err));
    });
  }

  static async createMedia(_source: null, args: { upload: Promise<FileUpload> }) {
    const mediaModule = MediaModule.object();
    return mediaModule.createMedia(await args.upload);
  }

  static async deleteMedia(_source: null, args: { id: string }): Promise<string> {
    await MediaModule.object().deleteMedia(args.id);
    return args.id;
  }
}

describe('media', () => {

  let client: TestClient;
  beforeAll(async () => {
    await prepareTestEnv({ Query, Mutation })
      .load(new MediaModule({
        endpoint: '/media',
        mediaConstructor: TestMedia,
      }))
      .run();
    client = TestHttpServer.object().getClient();
  });
  afterAll(destroyTestEnv);

  const fileContent = readFileSync('./LICENSE').toString();
  it('works', async () => {
    const res = await client.sendQueryWithFiles({
      query: `
        mutation($upload: Upload!) {
          echoFileContent(upload: $upload)
        }
      `,
      map: { 0: ['variables.upload'] },
      variables: {
        upload: null,
      },
      files: [
        createReadStream('./LICENSE'),
      ],
    });

    expect(res.data.echoFileContent).toBe(fileContent);
  });

  it('works with basic CRUD actions', async () => {
    const { data, errors } = await client.sendQueryWithFiles({
      query: `
        mutation($upload: Upload!) {
          createMedia(upload: $upload) {
            id
            url
            size
            uploadedAt
          }
        }
      `,
      map: { 0: ['variables.upload'] },
      variables: {
        upload: null,
      },
      files: [
        createReadStream('./LICENSE'),
      ],
    });
    /* { id: '5bdfd7d2293cf86a0ae95d82',
            mimetype: null,
            url: '/media/5bdfd7d2293cf86a0ae95d80',
            size: 1085,
            uploadedAt: '2018-11-05T05:40:34.545Z' } } */
    expect(errors).toBeUndefined();
    const { createMedia } = data;
    expect(typeof createMedia.id).toBe('string');
    expect(typeof createMedia.url).toBe('string');
    expect(typeof createMedia.size).toBe('number');
    expect(typeof createMedia.uploadedAt).toBe('string');

    const { res: resMaybe200, body } = await client.request('GET', createMedia.url);
    expect(resMaybe200.statusCode).toBe(200);
    expect(body.toString()).toEqual(fileContent);

    const deleteMediaMutation = await client.sendQuery({
      query: `
        mutation($id: String!) {
          deleteMedia(id: $id)
        }
      `,
      variables: { id: createMedia.id },
    });
    expect(deleteMediaMutation.errors).toBeUndefined();
    expect(deleteMediaMutation.data).toEqual({
      deleteMedia: createMedia.id,
    });

    const { res: resMaybe404 } = await client.request('GET', createMedia.url);

    expect(resMaybe404.statusCode).toBe(404);
  });
});

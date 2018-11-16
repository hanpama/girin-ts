import { readFileSync, createReadStream } from 'fs';
import { ObjectStorage, StorageObjectNotFoundError } from '../core/ObjectStorage';


export async function testObjectStorageSpec(mod: ObjectStorage) {
  const fileBuffer = readFileSync('./LICENSE');
  const fileString = fileBuffer.toString();

  // should save data to a file and returns the id as string
  const { id: storageObjectId } = await mod.save('myfile', createReadStream('./LICENSE'));

  if (typeof storageObjectId !== 'string') {
    throw new Error(`should retrieve fileId which type is string: but got ${storageObjectId}`);
  }

  const { id: nextObjectId } = await mod.save('myfile', createReadStream('./LICENSE'));
  if (storageObjectId === nextObjectId) {
    throw new Error('should generate unique id for every object');
  }

  // should refetch the data with its id
  const storageObject = await mod.get(storageObjectId);

  if (storageObject.filename !== 'myfile') {
    throw new Error(`Expected filename to be myfile but got ${storageObject.filename}`);
  }
  if (storageObject.contentLength !== fileBuffer.byteLength) {
    throw new Error(`Expected contentLength to be ${fileBuffer.byteLength} but got ${storageObject.contentLength}`);
  }
  // const expectedContentMD5 = createHash('md5').update(fileBuffer).digest('base64');
  // if (storageObject.contentMD5 !== expectedContentMD5) {
  //   throw new Error(`MD5 hash ${storageObject.contentMD5} is different from ${expectedContentMD5}`);
  // }

  const dataStream = storageObject.open();

  const dataString = await new Promise((resolve, reject) => {
    let dataString: string = '';
    dataStream.on('data', (buffer: Buffer) => {
      dataString += buffer.toString();
    });
    dataStream.once('end', () => resolve(dataString));
    dataStream.once('error', err => reject(err));
  });
  if (dataString !== fileString) {
    throw new Error(`refetched data should be equal to the original. expected ${fileString} but got ${dataString}`);
  }

  // deleting object
  await mod.delete(storageObjectId);
  let error = null;

  // opening id with no corresponding object should raise error
  try {
    await mod.get(storageObjectId);
  } catch (e) {
    error = e;
  }
  if (!error) {
    throw new Error(`expected to get error but got ${error}`);
  }
  const expectedError = new StorageObjectNotFoundError(storageObjectId);
  if (error.message !== expectedError.message) {
    throw new Error(`Expected error message to be ${expectedError.message} but got ${error.message}`);
  }
}

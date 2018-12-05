import { readFileSync, createReadStream } from 'fs';
import { ObjectStorage, StorageObjectNotFoundError, FileAlreadyExistsError } from '../core/ObjectStorage';


export async function testObjectStorageSpec(mod: ObjectStorage) {
  const fileBuffer = readFileSync('./LICENSE');
  const fileString = fileBuffer.toString();
  let error = undefined;
  let expectedError = undefined;

  // should save data to a file and returns the id as string
  const { filename, contentLength, open } = await mod.save('test', 'myfile', createReadStream('./LICENSE'));

  if (filename === 'myfile') {} else {
    throw new Error('Saved file should have the filename given to save method');
  }
  if (typeof contentLength === 'number') {} else {
    throw new Error(`Saved file should return its content length but got ${contentLength}`);
  }
  if (typeof open === 'function') {} else {
    throw new Error('Saved file should have `open()` method');
  }

  // should refetch the data with its filename
  const storageObject = await mod.get('test', filename);

  if (storageObject.filename !== 'myfile') {
    throw new Error(`Expected filename to be myfile but got ${storageObject.filename}`);
  }
  if (storageObject.contentLength !== fileBuffer.byteLength) {
    throw new Error(`Expected contentLength to be ${fileBuffer.byteLength} but got ${storageObject.contentLength}`);
  }

  // filename should be unique in a bucket
  try {
    await mod.save('test', 'myfile', createReadStream('./LICENSE'));
  } catch (e) {
    error = e;
  }
  if (!error) {
    throw new Error(`expected to get error but got ${error}`);
  }
  expectedError = new FileAlreadyExistsError('test', 'myfile');
  if (error.message !== expectedError.message) {
    throw new Error(`Expected error message to be "${expectedError.message}" but got: "${error.message}"`);
  }
  error = undefined;

  // open()
  const dataStream = storageObject.open();

  const dataString: string = await new Promise((resolve, reject) => {
    let str: string = '';
    dataStream.on('data', (buffer: Buffer) => {
      str += buffer.toString();
    });
    dataStream.once('end', () => { resolve(str); });
    dataStream.once('error', err => { reject(err); });
  });
  if (dataString !== fileString) {
    throw new Error(`refetched data should be equal to the original. expected ${fileString} but got ${dataString}`);
  }

  // deleting object
  await mod.delete('test', filename);

  // opening filename with no corresponding object should raise error
  try {
    await mod.get('test', filename);
  } catch (e) {
    error = e;
  }
  if (!error) {
    throw new Error(`expected to get error but got ${error}`);
  }
  expectedError = new StorageObjectNotFoundError(filename);
  if (error.message !== expectedError.message) {
    throw new Error(`Expected error message to be "${expectedError.message}" but got "${error.message}"`);
  }
}

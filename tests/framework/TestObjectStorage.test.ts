import { testObjectStorageSpec } from '@girin/framework/lib/spec';
import { TestObjectStorage } from '@girin/framework/lib/test';


test('TestObjectStorageModule', () => testObjectStorageSpec(new TestObjectStorage()));

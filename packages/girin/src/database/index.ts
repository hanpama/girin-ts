import { loadPredefinedConnectionFields } from './connection/relay';
import { getGlobalMetadataStorage } from 'girin-typelinker';

loadPredefinedConnectionFields(getGlobalMetadataStorage());

export * from './model';
export * from './connection';

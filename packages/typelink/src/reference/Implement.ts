import { Reference, ReferenceConfig, MetadataStorage } from '../metadata';


export interface ImplementConfig extends ReferenceConfig {}

export class Implement<TConfig extends ImplementConfig = ImplementConfig> extends Reference<TConfig> {
  // override
  public resolveType(storage: MetadataStorage) {
    return this.targetType.getType(storage, 'output');
  }
}

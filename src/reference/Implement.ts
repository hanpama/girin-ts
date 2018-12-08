import { Reference, ReferenceConfig } from '../metadata/Reference';


export interface ImplementConfig extends ReferenceConfig {}

export class Implement<TConfig extends ImplementConfig = ImplementConfig> extends Reference<TConfig> {
  protected get kind(): 'output' { return 'output'; }
}

import { Reference, ReferenceConfig } from '../metadata';


export interface ImplementConfig extends ReferenceConfig {}

export class Implement<TConfig extends ImplementConfig = ImplementConfig> extends Reference<TConfig> {
  get kind(): 'output' { return 'output'; }
}

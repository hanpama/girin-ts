import { TypeExpression } from '../type-expression';
import { Reference } from '../metadata';


export interface ImplementConfig {
  interfaceType: TypeExpression;
  extendingTypeName?: string;
}

export class Implement<TConfig extends ImplementConfig = ImplementConfig> extends Reference<TConfig> {
  get interfaceType() { return this.config.interfaceType; }
}

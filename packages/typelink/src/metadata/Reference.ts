export interface ReferenceConfig {
  extendingTypeName?: string;
}

export class Reference<TConfig extends ReferenceConfig = ReferenceConfig> {
  public constructor(public config: TConfig) { }

  public definitionClass: Function;

  get extendingTypeName() { return this.config.extendingTypeName; }
}

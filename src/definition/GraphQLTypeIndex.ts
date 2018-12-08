import { Definition, DefinitionConfig } from '../metadata/Definition';
import { GraphQLNamedType } from 'graphql';
import { isOutputType, isInputType } from 'graphql/type/definition';


export interface GraphQLTypeIndexConfig extends DefinitionConfig {
  typeInstance: GraphQLNamedType;
}

/**
 * Metadata for GraphQLType object.
 */
export class GraphQLTypeIndex extends Definition<GraphQLTypeIndexConfig> {
  constructor(config: {
    definitionClass: Function | null;
    typeInstance: GraphQLNamedType;
  }) {
    const configs: GraphQLTypeIndexConfig = {
      definitionClass: config.definitionClass,
      definitionName: config.typeInstance.name,
      typeInstance: config.typeInstance,
    };
    super(configs);
  }

  public get definitionName() { return this.config.definitionName; }
  public isOutputType() { return isOutputType(this.config.typeInstance); }
  public isInputType() { return isInputType(this.config.typeInstance); }

  public buildTypeInstance() {
    return this.config.typeInstance;
  }
}

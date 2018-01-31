import { GraphQLFieldConfigMap, GraphQLTypeResolver, InterfaceTypeDefinitionNode, GraphQLInterfaceType } from "graphql";
import { MetadataStorage } from "../index";

export interface InterfaceTypeMetadataConfig {
  name: string;
  meta?: MetadataStorage;
  fields?: () => GraphQLFieldConfigMap<any, any>;

  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
  astNode?: InterfaceTypeDefinitionNode;

  definitionClass: Function;
}

export interface InterfaceTypeMetadataBuild {
  typeInstance: GraphQLInterfaceType;
}

export class InterfaceTypeMetadata {
  public static create(config: InterfaceTypeMetadataConfig) {
    const metadata = new InterfaceTypeMetadata(config);
    metadata.meta.interfaceTypeMetadata.push(metadata);
    return metadata;
  }

  public meta: MetadataStorage;
  public definitionClass: Function;
  public config: InterfaceTypeMetadataConfig;
  public name: string;

  protected constructor(config: InterfaceTypeMetadataConfig) {
    this.definitionClass = config.definitionClass;
    this.config = config;
    this.meta = config.meta || MetadataStorage.getMetadataStorage();
    this.name = config.name;
  }

  protected memoziedBuild: InterfaceTypeMetadataBuild;
  get build() {
    if (!this.memoziedBuild) {
      this.memoziedBuild = {
        typeInstance: this.buildTypeInstance(),
      }
    }
    return this.memoziedBuild;
  }

  protected buildTypeInstance() {
    const { name, fields, description, astNode } = this.config;
    return new GraphQLInterfaceType({
      name,
      fields: fields || this.fields.bind(this),
      description,
      astNode,
      resolveType: this.config.resolveType,
    });
  }

  protected fields(): GraphQLFieldConfigMap<any, any> {
    const fieldMetadata = this.meta.filterFieldMetadata(this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.config.fieldName] = metadata.build.fieldConfig;
      return results;
    }, {} as GraphQLFieldConfigMap<any, any>);
  }
}
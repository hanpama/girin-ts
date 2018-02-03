import { GraphQLFieldConfigMap, GraphQLTypeResolver, InterfaceTypeDefinitionNode, GraphQLInterfaceType } from "graphql";
import { Metadata, MetadataConfig } from "./Metadata";
import { FieldMetadata } from "./FieldMetadata";


export interface InterfaceTypeMetadataConfig extends MetadataConfig {
  name: string;

  fields?: () => GraphQLFieldConfigMap<any, any>;

  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
  astNode?: InterfaceTypeDefinitionNode;

  definitionClass: Function;
}

export interface InterfaceTypeMetadataBuild {
  typeInstance: GraphQLInterfaceType;
}

export class InterfaceTypeMetadata extends Metadata<InterfaceTypeMetadataConfig, InterfaceTypeMetadataBuild> {

  public get definitionClass() {
    return this.config.definitionClass;
  }
  public get name() {
    return this.config.name;
  }

  protected buildMetadata() {
    return {
      typeInstance: this.buildTypeInstance(),
    };
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
    const fieldMetadata = this.meta.filter(FieldMetadata, this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.fieldName] = metadata.build.fieldConfig;
      return results;
    }, {} as GraphQLFieldConfigMap<any, any>);
  }
}
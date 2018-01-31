import { GraphQLInputObjectTypeConfig, GraphQLInputObjectType, GraphQLInputFieldConfigMap } from "graphql";
import { MetadataStorage } from "./MetadataStorage";


export interface InputObjectTypeMetadataConfig {
  name: string;
  meta?: MetadataStorage;
  fields?: () => GraphQLInputFieldConfigMap;
  description?: string;
  astNode?: GraphQLInputObjectTypeConfig["astNode"];
  definitionClass: Function;
}

export interface InputObjectTypeMetadataBuild {
  typeInstance: GraphQLInputObjectType;
  instantiate: (args: any) => any;
}

export class InputObjectTypeMetadata {
  public static create(config: InputObjectTypeMetadataConfig) {
    const metadata = new InputObjectTypeMetadata(config);
    metadata.meta.inputObjectTypeMetadata.push(metadata);
    return metadata;
  }

  public meta: MetadataStorage;
  public definitionClass: Function;
  public config: InputObjectTypeMetadataConfig;
  public name: string;

  protected constructor(config: InputObjectTypeMetadataConfig) {
    this.definitionClass = config.definitionClass;
    this.config = config;
    this.name = config.name;
    this.meta = config.meta || MetadataStorage.getMetadataStorage();
  }

  protected memoizedBuild: InputObjectTypeMetadataBuild
  public get build() {
    if (!this.memoizedBuild) {
      this.memoizedBuild = {
        typeInstance: this.buildTypeInstance(),
        instantiate: this.buildInstantiator(),
      }
    }
    return this.memoizedBuild;
  }

  protected buildTypeInstance() {
    const { astNode, description, name } = this.config;
    return new GraphQLInputObjectType({
      name,
      fields: this.config.fields || this.fields.bind(this),
      astNode,
      description
    });
  }

  protected fields(): GraphQLInputFieldConfigMap {
    const fieldMetadata = this.meta.filterInputFieldMetadata(this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.config.fieldName] = metadata.build.inputFieldConfig;
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildInstantiator() {
    const inputFieldMetadata = this.meta.filterInputFieldMetadata(this.definitionClass);

    return (argsObject: any) => {
      const constructorArgs = inputFieldMetadata.reduce((results, metadata) => {
        if (metadata.build.targetMetadata instanceof InputObjectTypeMetadata) {
          results[metadata.definedOrder] = metadata.build.targetMetadata.build.instantiate(argsObject[metadata.fieldName]);
        } else {
          results[metadata.definedOrder] = argsObject[metadata.fieldName];
        }
        return results;
      }, [] as any[]);
      const ThisInputObjectSubclass: any = this.definitionClass;
      return new ThisInputObjectSubclass(...constructorArgs);
    }
  }
}


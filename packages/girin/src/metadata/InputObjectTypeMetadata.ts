import { GraphQLInputObjectTypeConfig, GraphQLInputObjectType, GraphQLInputFieldConfigMap } from "graphql";
import { Metadata, MetadataConfig } from "./Metadata";
import { InputFieldMetadata } from "./InputFieldMetadata";


export interface InputObjectTypeMetadataConfig extends MetadataConfig {
  name: string;
  fields?: () => GraphQLInputFieldConfigMap;
  description?: string;
  astNode?: GraphQLInputObjectTypeConfig["astNode"];
  definitionClass: Function;
}

export interface InputObjectTypeMetadataBuild {
  typeInstance: GraphQLInputObjectType;
  instantiate: (args: any, context: any, info: any) => any;
}

export class InputObjectTypeMetadata extends Metadata<InputObjectTypeMetadataConfig, InputObjectTypeMetadataBuild> {

  public get definitionClass() { return this.config.definitionClass; }

  public get name() { return this.config.name; }

  protected buildMetadata() {
    return  {
      typeInstance: this.buildTypeInstance(),
      instantiate: this.buildInstantiator(),
    };
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
    const fieldMetadata = this.meta.filter(InputFieldMetadata, this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.fieldName] = metadata.build.inputFieldConfig;
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildInstantiator() {
    const inputFieldMetadata = this.meta.filter(InputFieldMetadata, this.definitionClass);

    return (argsObject: any, context: any, info: any) => {
      const constructorArgs = inputFieldMetadata.reduce((results, metadata) => {
        if (metadata.build.targetMetadata instanceof InputObjectTypeMetadata) {
          results[metadata.definedOrder] = metadata.build.targetMetadata.build.instantiate(argsObject[metadata.fieldName], context, info);
        } else {
          results[metadata.definedOrder] = argsObject[metadata.fieldName];
        }
        return results;
      }, [] as any[]);
      const ThisInputObjectSubclass: any = this.definitionClass;
      return new ThisInputObjectSubclass(...constructorArgs, context, info);
    }
  }
}



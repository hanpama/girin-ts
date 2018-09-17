import { GraphQLFieldConfigMap, GraphQLTypeResolver, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { Definition, DefinitionConfig, MetadataStorage, FieldReferenceEntry } from "../base";
import { ASTParser } from "../sdl/ast";


export interface InterfaceTypeConfig extends DefinitionConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends Definition<T> {
  public isOutputType() { return true; }
  public isInputType() { return false; }

  protected static decorate(astParser: ASTParser, storage: MetadataStorage, linkedClass: Function) {
    super.decorate(astParser, storage, linkedClass);

    astParser.interfaceTypeMetadataConfigs.forEach(config => {
      storage.register(new this(config), linkedClass);
    });
  }

  public buildFieldConfig(storage: MetadataStorage, targetClass: Function, entry: FieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = entry.field;

    return {
      type: entry.field.buildType(storage, targetClass),
      args: entry.field.buildArgs(storage, targetClass),
      description,
      deprecationReason,
      resolve: entry.resolver,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const refs = storage.queryFieldReferences(targetClass);
    return (
      refs.reduce((results, entry) => {
        const name = entry.field.defaultName;

        results[name] = this.buildFieldConfig(storage, targetClass, entry);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType {
    const name = this.typeName;
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);

    const description = this.description;
    return new GraphQLInterfaceType({ name, fields, description });
  }
}
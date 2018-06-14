import { GraphQLFieldConfigMap, GraphQLTypeResolver, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { MetadataStorage, FieldReferenceEntry } from "../base/MetadataStorage";
import { DefinitionClass } from "../types";
import { ASTParser } from "../sdl/ast";


export interface InterfaceTypeConfig extends DefinitionMetadataConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends DefinitionMetadata<T> {

  protected static decorate(astParser: ASTParser, storage: MetadataStorage, definitionClass: DefinitionClass) {
    astParser.interfaceTypeMetadataConfigs.forEach(config => {
      storage.register(new this(config), definitionClass);
    });
    astParser.fieldMetadataConfigs.forEach(config => {
      storage.registerFieldReference(config, definitionClass);
    });
  }

  public buildFieldConfig(storage: MetadataStorage, definitionClass: DefinitionClass, entry: FieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { name } = entry.reference;
    const config = Object.assign({}, entry.reference.field.buildConfig(storage), entry.reference.props);
    if ((definitionClass as any)[name] instanceof Function) {
      config.resolve = (definitionClass as any)[name];
    }
    return config;
  }

  public buildFieldConfigMap(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLFieldConfigMap<any, any> {
    const refs = storage.queryFieldReferences(definitionClass);
    return (
      refs.reduce((results, entry) => {
        results[entry.reference.name] = this.buildFieldConfig(storage, definitionClass, entry);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLInterfaceType {
    const name = this.typeName;
    const fields = this.buildFieldConfigMap.bind(this, storage, definitionClass);

    const description = this.description;
    return new GraphQLInterfaceType({ name, fields, description });
  }
}
import { GraphQLFieldConfigMap, GraphQLTypeResolver, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { MetadataStorage, FieldReferenceEntry } from "../base/MetadataStorage";
import { DefinitionClass } from "../types";


export interface InterfaceTypeMetadataConfig extends DefinitionMetadataConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceTypeMetadata<T extends InterfaceTypeMetadataConfig = InterfaceTypeMetadataConfig> extends DefinitionMetadata<T> {

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
    // const isTypeOf = this.isTypeOf.bind(this);

    const description = this.description;
    return new GraphQLInterfaceType({ name, fields, description });
  }

  /**
   * Get the instantiator function from definition class or return default
   */
  // public get instantiate(): Instantiator {
  //   const { definitionClass } = this;
  //   return definitionClass.instantiate
  //     ? definitionClass.instantiate.bind(definitionClass)
  //     : defaultInstantiator;
  // }
}
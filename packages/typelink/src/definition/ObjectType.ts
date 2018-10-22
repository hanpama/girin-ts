import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLObjectType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage } from '../metadata';
import { Field, Implement } from '../reference';


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {
  public isOutputType() { return true; }
  public isInputType() { return false; }

  public buildFieldConfig(storage: MetadataStorage, field: Field): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.buildType(storage, field.definitionClass),
      args: field.buildArgs(storage, field.definitionClass),
      resolve: field.buildResolver(storage, field.definitionClass),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const fields = [
      ...storage.findExtendReferences(Field, this.typeName()),
      ...storage.findDirectReferences(Field, targetClass),
    ];
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;
        results[name] = this.buildFieldConfig(storage, field);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLObjectType {
    const name = this.typeName();
    const description = this.description();
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);
    const interfaces = this.findInterfaces(storage, targetClass);
    const isTypeOf = this.buildIsTypeOf(storage, targetClass);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }

  public findInterfaces(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType[] {
    const impls = [
      ...storage.findExtendReferences(Implement, this.typeName()),
      ...storage.findDirectReferences(Implement, targetClass),
    ];
    return impls.map(impl => impl.interfaceType.getTypeInstance(storage) as GraphQLInterfaceType);
  }

  public buildIsTypeOf(storage: MetadataStorage, targetClass: Function) {
    return (source: any) => (source instanceof targetClass);
  }
}

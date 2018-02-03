import { GraphQLObjectTypeConfig, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType } from "graphql";
import { Metadata, MetadataConfig } from "./Metadata";
import { ImplementsMetadata } from "./ImplementsMetadata";
import { FieldMetadata } from "./FieldMetadata";


export interface ObjectTypeMetadataConfig extends MetadataConfig {
  name: string;
  // fields?: () => GraphQLFieldConfigMap<any, any>;

  interfaces?: GraphQLObjectTypeConfig<any, any>["interfaces"];
  isTypeOf?: GraphQLObjectTypeConfig<any, any>["isTypeOf"];
  description?: GraphQLObjectTypeConfig<any, any>["description"];
  astNode?: GraphQLObjectTypeConfig<any, any>["astNode"];
  extensionASTNodes?: GraphQLObjectTypeConfig<any, any>["extensionASTNodes"];
  definitionClass: Function;
}

export interface ObjectTypeMetadataBuild {
  typeInstance: GraphQLObjectType;
}

export class ObjectTypeMetadata extends Metadata<ObjectTypeMetadataConfig, ObjectTypeMetadataBuild> {

  public get definitionClass() { return this.config.definitionClass; }
  public get name() { return this.config.name; }

  protected buildMetadata() {
    return {
      typeInstance: this.buildTypeInstance(),
    };
  }

  protected buildTypeInstance() {
    const { name, interfaces, isTypeOf, description, astNode, extensionASTNodes } = this.config;
    return new GraphQLObjectType({
      name,
      fields: this.fields.bind(this),
      isTypeOf: isTypeOf || this.isTypeOf.bind(this),
      interfaces: interfaces || this.getInterfaces(),
      description,
      astNode,
      extensionASTNodes,
    });
  }

  protected getInterfaces(): GraphQLInterfaceType[] {
    const implementsMetadata = this.meta.filter(ImplementsMetadata, this.definitionClass);
    return implementsMetadata.map(meta => meta.build.targetMetadata.build.typeInstance);
  }

  protected fields(): GraphQLFieldConfigMap<any, any> {
    const fieldMetadata = this.meta.filter(FieldMetadata, this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.fieldName] = metadata.build.fieldConfig;
      return results;
    }, {} as GraphQLFieldConfigMap<any, any>);
  }

  protected isTypeOf(source: any) {
    return source instanceof this.definitionClass;
  }

}

import { GraphQLObjectTypeConfig, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType } from "graphql";
import { MetadataStorage } from "./index";


export interface ObjectTypeMetadataConfig {
  name: string;
  meta?: MetadataStorage;
  fields?: () => GraphQLFieldConfigMap<any, any>;

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

export class ObjectTypeMetadata {
  public static create(config: ObjectTypeMetadataConfig) {
    const metadata = new ObjectTypeMetadata(config);
    metadata.meta.objectTypeMetadata.push(metadata);
    return metadata;
  }

  public meta: MetadataStorage;
  public definitionClass: Function;
  public config: ObjectTypeMetadataConfig;
  public name: string;


  protected constructor(config: ObjectTypeMetadataConfig) {
    this.definitionClass = config.definitionClass;
    this.config = config;
    this.meta = config.meta || MetadataStorage.getMetadataStorage();
    this.name = config.name;
  }

  protected memoziedBuild: ObjectTypeMetadataBuild;
  get build() {
    if (!this.memoziedBuild) {
      this.memoziedBuild = {
        typeInstance: this.buildTypeInstance(),
      }
    }
    return this.memoziedBuild;
  }

  protected buildTypeInstance() {
    const { name, fields, interfaces, isTypeOf, description, astNode, extensionASTNodes } = this.config;
    return new GraphQLObjectType({
      name,
      fields: fields || this.fields.bind(this),
      isTypeOf: isTypeOf || this.isTypeOf.bind(this),
      interfaces: interfaces || this.getInterfaces(),
      description,
      astNode,
      extensionASTNodes,
    });
  }

  protected getInterfaces(): GraphQLInterfaceType[] {
    const implementsMetadata = this.meta.filterImplementsMetadata(this.definitionClass);
    return implementsMetadata.map(meta => meta.getTargetTypeInstance());
  }

  protected fields(): GraphQLFieldConfigMap<any, any> {
    const fieldMetadata = this.meta.filterFieldMetadata(this.definitionClass);
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.config.fieldName] = metadata.build.fieldConfig;
      return results;
    }, {} as GraphQLFieldConfigMap<any, any>);
  }

  protected isTypeOf(source: any) {
    return source instanceof this.definitionClass;
  }

}

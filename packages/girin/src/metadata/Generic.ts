import { GraphQLList, GraphQLNonNull, GraphQLType, isType } from "graphql";
import { MetadataStorage } from "./MetadataStorage";
import { Metadata } from "./Metadata";
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";


export interface GenericFunction {
  (type: GraphQLType): GraphQLType;
}

export class Generic {
  static of(arg: string | GraphQLType | Function, meta?: MetadataStorage) {
    const generic = new Generic(meta);
    if (typeof arg === 'string') {
      return this.fromTypeString(arg, generic);
    } else if (isType(arg)) {
      generic.rawTypeInstance = arg;
      return generic;
    } else {
      generic.definitionClass = arg;
      return generic;
    }
  }

  static LIST_PATTERN = /^\[[^\]]+\]$/;
  static NON_NULL_PATTERN = /\!$/;

  protected static fromTypeString(typeString: string, generic: Generic): Generic {
    let targetTypeName: string = typeString;
    const genericList: Array<"list" | "nonNull"> = [];

    let isList = this.LIST_PATTERN.exec(targetTypeName);
    let isNonNull = this.NON_NULL_PATTERN.exec(targetTypeName);

    while(isList || isNonNull) {
      if (isList) {
        targetTypeName = targetTypeName.slice(1, targetTypeName.length - 1);
        genericList.push('list');
      } else {
        targetTypeName = targetTypeName.slice(0, targetTypeName.length - 1);
        genericList.push('nonNull');
      }
      isList = this.LIST_PATTERN.exec(targetTypeName);
      isNonNull = this.NON_NULL_PATTERN.exec(targetTypeName);
    }

    generic.targetTypeName = targetTypeName;
    genericList.reverse().forEach(action => generic[action]());
    return generic;
  }

  protected DEFAULT_GENERIC_FUNCTION: GenericFunction = type => type;
  protected meta: MetadataStorage;

  constructor(meta?: MetadataStorage) {
    this.meta = meta || globalMetadataStorage;
    this.genericFn = this.DEFAULT_GENERIC_FUNCTION;
  }

  protected targetTypeName?: string;
  protected definitionClass?: Function;
  protected rawTypeInstance?: GraphQLType;
  protected genericFn: GenericFunction;

  public getTargetMetadata(): any {
    if (this.definitionClass) {
      return this.meta.getDefinitionMetadata(Metadata, this.definitionClass);
    } else if (this.targetTypeName) {
      return this.meta.getDefinitionMetadataByName(this.targetTypeName);
    } else {
      throw new Error('Generic type without definitionClass or targetTypeName has no targetMetadata');
    }
  }

  public getTypeInstance(): any { // TODO: ANY?
    if (!this.rawTypeInstance) {
      let metadata = this.getTargetMetadata();
      this.rawTypeInstance = metadata.build.typeInstance;
    }
    return this.genericFn(this.rawTypeInstance!);
  }

  public list() {
    const { genericFn } = this;
    this.genericFn = type => new GraphQLList(genericFn(type));
    return this;
  }

  public nonNull() {
    const { genericFn } = this;
    this.genericFn = type => new GraphQLNonNull(genericFn(type));
    return this;
  }
}


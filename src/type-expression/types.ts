import { MetadataStorage } from '../metadata/MetadataStorage';
import { DefinitionKind } from '../metadata/Definition';
import { GraphQLType } from 'graphql';


export interface TypeResolvingContext {
  storage: MetadataStorage;
  kind: DefinitionKind;
}

export type TypeArg = GraphQLType | Function | string;

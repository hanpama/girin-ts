import { DocumentNode } from "graphql";
import { TypeArg, TypeExpression } from "../type-expression/TypeExpression";
import { Lazy } from "../types";
import { DefinitionMetadata } from "../base/DefinitionMetadata";
import { GenericMetadata } from "../base/GenericMetadata";


export interface ASTParseResult {
  documentNode: DocumentNode;
  substitutionMap: TypeSubstitutionMap;
}

export interface TypeSubstitutionMap {
  [tempName: string]: TypeExpression | TypeArg | Lazy<TypeArg>;
}

export interface MetadataFromAST {
  definition: DefinitionMetadata;
  generics: GenericMetadata[];
}

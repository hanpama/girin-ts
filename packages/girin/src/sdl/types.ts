import { DocumentNode } from "graphql";
import { TypeArg, TypeExpression } from "../base/TypeExpression";
import { Lazy } from "../types";


export interface ASTParseResult {
  documentNode: DocumentNode;
  substitutionMap: TypeSubstitutionMap;
}

export interface TypeSubstitutionMap {
  [tempName: string]: TypeExpression | TypeArg | Lazy<TypeArg>;
}

import { DefinitionClass } from '../types';

import { globalMetadataStorage } from '../globalMetadataStorage';
import { ASTParseResult } from './types';
import { createMetadataFromAST } from './ast-to-metadata';


const storage = globalMetadataStorage;

/**
 * Register only generic metadata from parse result.
 * @param parseResult
 */
export function AbstractDefinition(parseResult: ASTParseResult) {
  const { documentNode, substitutionMap } = parseResult;
  const node = documentNode.definitions[0];

  return function(definitionClass: DefinitionClass) {
    const result = createMetadataFromAST(node, definitionClass, substitutionMap);
    result.generics.forEach(meta => meta.registerToStorage(storage));
  }
}

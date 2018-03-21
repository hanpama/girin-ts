import { DefinitionClass } from '../types';

import { globalMetadataStorage } from '../globalMetadataStorage';
import { ASTParseResult } from './types';
import { createMetadataFromAST } from './ast-to-metadata';


const storage = globalMetadataStorage;

/**
 * Register definition metadata and generic metadata from its given parse result
 * @param parseResult
 */
export function Definition(parseResult: ASTParseResult) {
  const { documentNode, substitutionMap } = parseResult;
  const node = documentNode.definitions[0];

  return function(definitionClass: DefinitionClass) {
    const result = createMetadataFromAST(node, definitionClass, substitutionMap);
    result.definition.registerToStorage(storage);
    result.generics.forEach(meta => meta.registerToStorage(storage));
  }
}

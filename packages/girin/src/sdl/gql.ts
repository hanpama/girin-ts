import { parse } from 'graphql';

import { TypeArg, TypeExpression } from '../type-expression/TypeExpression';
import { Lazy } from '../types';
import { ASTParseResult, TypeSubstitutionMap } from './types';


export function gql(strings: TemplateStringsArray, ...typeArgs: Array<TypeExpression | TypeArg | Lazy<TypeArg>>): ASTParseResult {
  const result = [];

  const substitution_prefix = '__girin__intermediate__'

  result.push(strings[0]);
  for (let i = 0; i < strings.length - 1; i++) {
    result.push(`${substitution_prefix}${i}`);
    result.push(strings[i + 1]);
  }
  return {
    documentNode: parse(result.join('')),
    substitutionMap: typeArgs.reduce((results, exp, i) => {
      const name = `${substitution_prefix}${i}`;
      results[name] = exp;
      return results;
    }, {} as TypeSubstitutionMap),
  };
}

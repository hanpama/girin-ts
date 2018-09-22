import { parse } from "graphql";

import { SubstitutionMap, DefinitionParser } from "./ast";
import { TypeExpression, TypeExpressionConstructorOptions } from "../type-expression";
import { Entry } from "../metadata";


const SUBSTITUTION_PREFIX = '__GIRIN__SUBS__';

export function gql(strings: TemplateStringsArray, ...interpolated: Array<TypeExpression | TypeExpressionConstructorOptions>) {
  const result = [strings[0]];
  const subsMap: SubstitutionMap = {};

  for (let i = 0; i < interpolated.length; i++) {
    const item = interpolated[i];
    let name: string;
    if (typeof item === 'string') {
      name = item;
    } else {
      name = `${SUBSTITUTION_PREFIX}${i}`;
      subsMap[name] = item;
    }
    result.push(name);
    result.push(strings[i + 1]);
  }

  const ast = parse(result.join(''));

  const entries = ast.definitions.reduce((results, rootNode) => {
    return results.concat(new DefinitionParser(rootNode, subsMap).entries)
  }, [] as Entry<any>[])
  return entries;
}

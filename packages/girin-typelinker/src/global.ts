import { TypeArg, TypeExpression, MetadataStorage, loadBuiltInScalar, TypeExpressionKind, TypeExpressionConstructorOptions, Definition } from "./base";
import { SubstitutionMap, DefinitionParser } from "./sdl/ast";
import { parse } from "graphql";
import { ObjectType, InputType, InterfaceType, loadFallbackRootTypes } from "./metadata";


export function createMetadataStorage() {

  const storage = new MetadataStorage();
  loadBuiltInScalar(storage);
  loadFallbackRootTypes(storage);
  return storage;
}

/**
 * Global MetadataStorage used by default.
 */
export let globalMetadataStorage: MetadataStorage;

export function getGlobalMetadataStorage() {
  if (!globalMetadataStorage) {
    globalMetadataStorage = createMetadataStorage();
  }
  return globalMetadataStorage;
}

/**
 * Get a GraphQLType instance from the given storage or default
 * global metadata storage.
 * @param typeArg
 * @param storage
 */
export function getGraphQLType(typeArg: TypeArg, as: TypeExpressionKind = 'any', maybeStorage?: MetadataStorage): any {
  const storage = maybeStorage || getGlobalMetadataStorage();
  const typeExpression = new TypeExpression(typeArg, as);
  return typeExpression.getTypeInstance(storage!);
}

const SUBSTITUTION_PREFIX = '__GIRIN__SUBS__';

export function gql(strings: TemplateStringsArray, ...interpolated: Array<TypeExpression | TypeExpressionConstructorOptions>): DefinitionParser[] {
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
  return ast.definitions.map(rootNode => new DefinitionParser(rootNode, subsMap));
}

// export interface TypeDefOptions {
//   defs: DefinitionParser[],
//   storage: MetadataStorage,
//   derive:
// }

// export function typedef(options: TypeDefOptions): void;
export function typedef(astParsers: DefinitionParser[], maybeStorage?: MetadataStorage) {
  const storage = maybeStorage || getGlobalMetadataStorage();

  return function defDecoratorFn(linkedClass: Function): void {
    astParsers.forEach(astParser => {

      astParser.objectTypeMetadataConfigs.forEach(config => {
        storage.register(new ObjectType(config), linkedClass);
      });
      astParser.inputObjectTypeMetadataConfigs.forEach(config => {
        storage.register(new InputType(config), linkedClass);
      });
      astParser.interfaceTypeMetadataConfigs.forEach(config => {
        storage.register(new InterfaceType(config), linkedClass);
      });
      astParser.implementTypeExpressions.forEach(exp => {
        if (astParser.extendingTypeName) {
          // later
        } else {
          storage.registerImplementReference({ definitionClass: linkedClass, interfaceType: exp });
        }
      });

      astParser.fieldMetadataConfigs.forEach(field => {
        const maybeStaticResolver = (linkedClass as any)[field.defaultName];
        const resolver = maybeStaticResolver instanceof Function ? maybeStaticResolver.bind(linkedClass) : undefined;
        if (astParser.extendingTypeName) {
          storage.registerExtensionFieldReference({ field, resolver, extendingTypeName: astParser.extendingTypeName });
        } else {
          storage.registerFieldReference({ field, definitionClass: linkedClass, resolver });
        }
      });
      astParser.inputFieldMetadataConfigs.forEach(config => {
        if (astParser.extendingTypeName) {
          storage.register
        } else {
          storage.registerInputFieldReference({ definitionClass: linkedClass, field: config })
        }
      });
    });
  }
}

import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  InputObjectTypeDefinitionNode,
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  InterfaceTypeDefinitionNode,
  DefinitionNode,
} from 'graphql';

import { DefinitionClass } from '../types';
import { TypeExpression } from '../type-expression/TypeExpression';
import { ObjectTypeMetadata } from '../metadata/ObjectTypeMetadata';
import { FieldMetadata } from '../metadata/FieldMetadata';
import { ArgumentMetadata } from '../metadata/ArgumentMetadata';
import { InputFieldMetadata } from '../metadata/InputFieldMetadata';
import { List, NonNull } from '../type-expression/structure';
import { InterfaceTypeMetadata } from '../metadata/InterfaceTypeMetadata';
import { InputObjectTypeMetadata } from '../metadata/InputObjectTypeMetadata';
import { TypeSubstitutionMap, MetadataFromAST } from './types';
import { GenericMetadata } from '../base/GenericMetadata';


export function createMetadataFromAST(
  node: DefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap,
): MetadataFromAST {
  if (node.kind === 'ObjectTypeDefinition') {
    return createObjectTypeMetadataFromAST(node, definitionClass, substitutionMap);
  }
  else if (node.kind === 'InterfaceTypeDefinition') {
    return createInterfaceTypeMetadataFromAST(node, definitionClass, substitutionMap);
  }
  else if (node.kind === 'InputObjectTypeDefinition') {
    return createInputObjectTypeMetadataFromAST(node, definitionClass, substitutionMap);
  }
  else {
    throw new Error(`Node type not supported: ${node.kind}(${definitionClass})`);
  }
}

export function createTypeExpressionFromAST(
  type: NamedTypeNode | ListTypeNode | NonNullTypeNode,
  substitutionMap: TypeSubstitutionMap,
): TypeExpression {
  if (type.kind === 'ListType') {
    return List.of(createTypeExpressionFromAST(type.type, substitutionMap));
  } else if (type.kind === 'NonNullType') {
    return NonNull.of(createTypeExpressionFromAST(type.type, substitutionMap));
  } else {
    const givenExpression = substitutionMap[type.name.value];

    if (!givenExpression) {
      return new TypeExpression(type.name.value);
    }
    else if (givenExpression instanceof TypeExpression) {
      return givenExpression;
    }
    return new TypeExpression(givenExpression);
  }
}

export function createObjectTypeMetadataFromAST(
  node: ObjectTypeDefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap,
): MetadataFromAST {
  const { name, description, interfaces } = node;

  const generics = node.fields.reduce((results, fieldNode) => (
    results.concat(createFieldMetadataFromAST(fieldNode, definitionClass, substitutionMap))
  ), [] as GenericMetadata[]);

  const interfacesTypeExpressions = interfaces && interfaces.map(interfaceNode => (
    createTypeExpressionFromAST(interfaceNode, substitutionMap)
  ))

  const definition = new ObjectTypeMetadata(definitionClass, {
    interfaces: interfacesTypeExpressions,
    typeName: name.value,
    description: description && description.value,
  });

  return { definition, generics };
}

export function createInterfaceTypeMetadataFromAST(
  node: InterfaceTypeDefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap,
): MetadataFromAST {
  const { name, description } = node;

  const generics = node.fields.reduce((results, fieldNode) => (
    results.concat(createFieldMetadataFromAST(fieldNode, definitionClass, substitutionMap))
  ), [] as GenericMetadata[]);

  const definition = new InterfaceTypeMetadata(definitionClass, {
    typeName: name.value,
    description: description && description.value,
  });

  return { definition, generics };
}

export function createInputObjectTypeMetadataFromAST(
  node: InputObjectTypeDefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap,
): MetadataFromAST {
  const { name, description } = node;

  const generics = node.fields.reduce((results, fieldNode) => (
    results.concat(createInputFieldMetadataFromAST(fieldNode, definitionClass, substitutionMap))
  ), [] as GenericMetadata[]);

  const definition = new InputObjectTypeMetadata(definitionClass, {
    typeName: name.value,
    description: description && description.value,
  });

  return { definition, generics };
}


function createFieldMetadataFromAST(
  node: FieldDefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap,
) {
  const { name, type, description } = node;

  const argumentMetadata = node.arguments.map(argumentNode => (
    createArgumentMetadataFromAST(argumentNode, definitionClass, name.value, substitutionMap)
  ));

  // static method to resolver
  const descriptor = Object.getOwnPropertyDescriptor(definitionClass, name.value);
  const describedFunction = descriptor && (descriptor.value || descriptor.get);
  const resolver = describedFunction instanceof Function
    ? describedFunction
    : undefined;

  const fieldMetadata = new FieldMetadata(definitionClass, {
    typeExpression: createTypeExpressionFromAST(type, substitutionMap),
    resolver,
    fieldName: name.value,
    description: description && description.value,
  });

  return [ fieldMetadata, ...argumentMetadata ];
}

function createArgumentMetadataFromAST(
  node: InputValueDefinitionNode,
  definitionClass: DefinitionClass,
  fieldName: string,
  substitutionMap: TypeSubstitutionMap,
): ArgumentMetadata {
  const { name, type, description } = node;

  return new ArgumentMetadata(definitionClass, {
    fieldName,
    description: description && description.value,
    argumentName: name.value,
    typeExpression: createTypeExpressionFromAST(type, substitutionMap),
  });
}

function createInputFieldMetadataFromAST(
  node: InputValueDefinitionNode,
  definitionClass: DefinitionClass,
  substitutionMap: TypeSubstitutionMap
): InputFieldMetadata {
  const { name, type, description } = node;

  return new InputFieldMetadata(definitionClass, {
    fieldName: name.value,
    description: description && description.value,
    typeExpression: createTypeExpressionFromAST(type, substitutionMap),
  });
}

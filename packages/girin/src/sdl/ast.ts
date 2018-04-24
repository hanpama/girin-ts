import {
  parse,
  DefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from 'graphql';

import { ArgumentMetadataConfig } from '../metadata/ArgumentMetadata';
import { FieldMetadataConfig } from '../metadata/FieldMetadata';
import { InputFieldMetadataConfig } from '../metadata/InputFieldMetadata';
import { InputObjectTypeMetadataConfig } from '../metadata/InputObjectTypeMetadata';
import { List, NonNull } from '../type-expression/structure';
import { ObjectTypeMetadataConfig } from '../metadata/ObjectTypeMetadata';
import { completeDirectives } from './directive';
import { TypeArg, TypeExpression } from '../type-expression/TypeExpression';
import { Lazy } from '../types';


export interface TypeSubstitutionMap {
  [tempName: string]: TypeExpression | TypeArg | Lazy<TypeArg>;
}

export function gql(strings: TemplateStringsArray, ...typeArgs: Array<TypeExpression | TypeArg | Lazy<TypeArg>>) {
  const result = [];

  const substitution_prefix = '__girin__intermediate__'

  result.push(strings[0]);
  for (let i = 0; i < strings.length - 1; i++) {
    result.push(`${substitution_prefix}${i}`);
    result.push(strings[i + 1]);
  }

  const rootNode = parse(result.join('')).definitions[0];
  const substitutionMap = typeArgs.reduce((results, exp, i) => {
    const name = `${substitution_prefix}${i}`;
    results[name] = exp;
    return results;
  }, {} as TypeSubstitutionMap);
  return new ASTParser(rootNode, substitutionMap);
}

export class ASTParser {

  public readonly objectTypeMetadataConfigs: ObjectTypeMetadataConfig[] = [];
  public readonly interfaceTypeMetadataConfigs: InputObjectTypeMetadataConfig[] = [];
  public readonly inputObjectTypeMetadataConfigs: InputObjectTypeMetadataConfig[] = [];

  public readonly fieldMetadataConfigs: FieldMetadataConfig[] = [];
  public readonly argumentMetadataConfigs: ArgumentMetadataConfig[] = [];
  public readonly inputFieldMetadataConfigs: InputFieldMetadataConfig[] = [];

  constructor(
    rootNode: DefinitionNode,
    substitutionMap: TypeSubstitutionMap,
  ) {
    this.rootNode = rootNode;
    this.substitutionMap = substitutionMap;

    this.createMetadataFromAST();
  }

  protected rootNode: DefinitionNode;
  protected substitutionMap: TypeSubstitutionMap;

  protected createMetadataFromAST(): void {
    const { rootNode } = this;

    if (rootNode.kind === 'ObjectTypeDefinition') {
      this.appendObjectTypeConfig(rootNode);
    }
    else if (rootNode.kind === 'InterfaceTypeDefinition') {
      this.appendInterfaceTypeMetadataConfig(rootNode);
    }
    else if (rootNode.kind === 'InputObjectTypeDefinition') {
      this.appendInputObjectTypeMetadataConfig(rootNode);
    }
    else {
      throw new Error(`Node type not supported: ${rootNode.kind}`);
    }
  }

  protected completeTypeExpression(
    type: NamedTypeNode | ListTypeNode | NonNullTypeNode,
  ): TypeExpression {
    const { substitutionMap } = this;

    if (type.kind === 'ListType') {
      return List.of(this.completeTypeExpression(type.type));
    } else if (type.kind === 'NonNullType') {
      return NonNull.of(this.completeTypeExpression(type.type));
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

  protected appendObjectTypeConfig(node: ObjectTypeDefinitionNode): void {
    const { name, description, interfaces } = node;

    node.fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode))

    const interfacesTypeExpressions = interfaces && interfaces.map(interfaceNode => (
      this.completeTypeExpression(interfaceNode)
    ));

    this.objectTypeMetadataConfigs.push({
      interfaces: interfacesTypeExpressions,
      typeName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendInterfaceTypeMetadataConfig(node: InterfaceTypeDefinitionNode): void {
    const { name, description } = node;

    node.fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode))

    this.interfaceTypeMetadataConfigs.push({
      typeName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendInputObjectTypeMetadataConfig(node: InputObjectTypeDefinitionNode): void {
    const { name, description } = node;

    node.fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode))

    this.inputObjectTypeMetadataConfigs.push({
      typeName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendFieldMetadataConfig(node: FieldDefinitionNode): void {
    const { name, type, description } = node;

    node.arguments.forEach(argumentNode => (
      this.appendArgumentMetadataConfig(argumentNode, name.value)
    ));

    this.fieldMetadataConfigs.push({
      typeExpression: this.completeTypeExpression(type),
      fieldName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendArgumentMetadataConfig(node: InputValueDefinitionNode, fieldName: string): void {
    const { name, type, description } = node;

    this.argumentMetadataConfigs.push({
      fieldName,
      description: description && description.value,
      argumentName: name.value,
      typeExpression: this.completeTypeExpression(type),
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode): void {
    const { name, type, description } = node;

    this.inputFieldMetadataConfigs.push({
      fieldName: name.value,
      description: description && description.value,
      typeExpression: this.completeTypeExpression(type),
      directives: node.directives && completeDirectives(node.directives),
    });
  }
}

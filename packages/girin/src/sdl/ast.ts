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

import { Field, FieldReference } from '../field/Field';
import { InputTypeMetadataConfig } from '../metadata/InputTypeMetadata';
import { List, NonNull } from '../type-expression/structure';
import { ObjectTypeMetadataConfig } from '../metadata/ObjectTypeMetadata';
import { completeDirectives, completeValueNode } from './directive';
import { TypeArg, TypeExpression } from '../type-expression/TypeExpression';
import { Lazy } from '../types';
import { InterfaceTypeMetadataConfig } from '../metadata/InterfaceTypeMetadata';
import { InputField, InputFieldReference } from '../field/InputField';


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
  public readonly interfaceTypeMetadataConfigs: InterfaceTypeMetadataConfig[] = [];
  public readonly inputObjectTypeMetadataConfigs: InputTypeMetadataConfig[] = [];

  public readonly fieldMetadataConfigs: FieldReference[] = [];
  public readonly inputFieldMetadataConfigs: InputFieldReference[] = [];

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
    const { name, description, interfaces, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode));
    }

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
    const { name, description, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode));
    }

    this.interfaceTypeMetadataConfigs.push({
      typeName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendInputObjectTypeMetadataConfig(node: InputObjectTypeDefinitionNode): void {
    const { name, description, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode))
    }

    this.inputObjectTypeMetadataConfigs.push({
      typeName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
    });
  }

  protected appendFieldMetadataConfig(node: FieldDefinitionNode): void {
    const { name, type, description, directives, arguments: args } = node;

    const argumentRefs = args && args.map(argumentNode => (
      this.createArgumentReference(argumentNode)
    ));
    const field = new Field(this.completeTypeExpression(type), argumentRefs);

    this.fieldMetadataConfigs.push({
      field,
      name: name.value,
      props: {
        description: description && description.value,
        directives: directives && completeDirectives(directives),
      },
    });
  }

  protected createArgumentReference(node: InputValueDefinitionNode): InputFieldReference {
    const { name, type, description, defaultValue, directives } = node;

    const field = new InputField(this.completeTypeExpression(type));
    return {
      field,
      name: name.value,
      props: {
        description: description && description.value,
        directives: directives && completeDirectives(directives),
        defaultValue: defaultValue && completeValueNode(defaultValue),
      }
    };
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode): void {
    const { name, type, description, defaultValue } = node;

    const field = new InputField(this.completeTypeExpression(type));

    this.inputFieldMetadataConfigs.push({
      field,
      name: name.value,
      props: {
        description: description && description.value,
        directives: node.directives && completeDirectives(node.directives),
        defaultValue: defaultValue && completeValueNode(defaultValue),
      }
    });
  }
}

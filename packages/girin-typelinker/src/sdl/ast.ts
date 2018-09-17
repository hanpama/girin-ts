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

import { List, NonNull, TypeArg, TypeExpression, TypeExpressionKind } from '../base';
import { completeDirectives, completeValueNode } from './directive';
import { InputTypeConfig, ObjectTypeConfig, InterfaceTypeConfig } from '../metadata';
import { Lazy } from '../types';
import { Field, InputField } from '../field';


const SUBSTITUTION_PREFIX = '__GIRIN__SUBS__';

export interface SubstitutionMap {
  [tempName: string]: GQLInterpolatable;

}
export type GQLInterpolatable =
  | TypeArg | TypeExpression
  | Lazy<TypeArg> | Lazy<TypeExpression>;


export function gql(strings: TemplateStringsArray, ...interpolated: Array<GQLInterpolatable>) {
  const result = [strings[0]];
  const subsMap: SubstitutionMap = {};

  for (let i = 0; i < interpolated.length; i++) {
    const item = interpolated[i];
    const name = `${SUBSTITUTION_PREFIX}${i}`;
    subsMap[name] = item;
    result.push(name);
    result.push(strings[i + 1]);
  }

  const ast = parse(result.join(''));
  if (ast.definitions.length > 1) {
    throw new Error('Only one type definition should be passed to gql tag');
  }
  const rootNode = ast.definitions[0];
  return new ASTParser(rootNode, subsMap);
}

export class ASTParser {

  public readonly objectTypeMetadataConfigs: ObjectTypeConfig[] = [];
  public readonly interfaceTypeMetadataConfigs: InterfaceTypeConfig[] = [];
  public readonly inputObjectTypeMetadataConfigs: InputTypeConfig[] = [];

  public readonly fieldMetadataConfigs: Field[] = [];
  public readonly inputFieldMetadataConfigs: InputField[] = [];

  constructor(
    rootNode: DefinitionNode,
    subsMap: SubstitutionMap,
  ) {
    this.rootNode = rootNode;
    this.subsMap = subsMap;

    this.createMetadataFromAST();
  }

  protected rootNode: DefinitionNode;
  protected subsMap: SubstitutionMap;

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
    asKind: TypeExpressionKind,
  ): TypeExpression {
    const { subsMap } = this;

    if (type.kind === 'ListType') {
      return List.of(this.completeTypeExpression(type.type, asKind));
    } else if (type.kind === 'NonNullType') {
      return NonNull.of(this.completeTypeExpression(type.type, asKind));
    } else {
      const sub = subsMap[type.name.value];

      if (!sub) {
        return new TypeExpression(type.name.value, asKind);
      }
      else if (sub instanceof TypeExpression) {
        return sub;
      }
      return new TypeExpression(sub as TypeArg | Lazy<TypeArg>, asKind);
    }
  }

  protected appendObjectTypeConfig(node: ObjectTypeDefinitionNode): void {
    const { name, description, interfaces, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode));
    }

    const interfacesTypeExpressions = interfaces && interfaces.map(interfaceNode => (
      this.completeTypeExpression(interfaceNode, 'output')
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
      this.createInputField(argumentNode)
    ));

    const field = new Field({
      defaultName: name.value,
      type: this.completeTypeExpression(type, 'output'),
      args: argumentRefs || [],
      description: description && description.value,
      directives: directives && completeDirectives(directives),
    });

    this.fieldMetadataConfigs.push(field);
  }

  protected createInputField(node: InputValueDefinitionNode): InputField {
    const { name, type, description, defaultValue, directives } = node;

    return new InputField({
      defaultName: name.value,
      type: this.completeTypeExpression(type, 'input'),
      directives: directives && completeDirectives(directives),
      defaultValue: defaultValue && completeValueNode(defaultValue),
      description: description && description.value,
    });
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode): void {
    this.inputFieldMetadataConfigs.push(this.createInputField(node));
  }
}

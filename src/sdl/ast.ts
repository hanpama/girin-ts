import {
  DefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  InterfaceTypeExtensionNode,
  InputObjectTypeExtensionNode,
  DirectiveNode,
  ArgumentNode,
  ObjectFieldNode,
  ValueNode,
  defaultFieldResolver,
} from 'graphql';

import { Metadata } from '../metadata/MetadataStorage';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { SubscriptionType } from '../definition/SubscriptionType';
import { ObjectType } from '../definition/ObjectType';
import { InterfaceType } from '../definition/InterfaceType';
import { InputType } from '../definition/InputType';
import { TypeExpression } from '../type-expression/TypeExpression';
import { coerceType } from '../type-expression/coerceType';
import { List, NonNull } from '../type-expression/structure';
import { Field } from '../reference/Field';
import { InputField } from '../reference/InputField';
import { Implement } from '../reference/Implement';
import { TypeArg } from '../type-expression/types';


export interface SubstitutionMap {
  [tempName: string]: TypeExpression | TypeArg;
}

export class DefinitionParser {

  private metadata: Metadata[];

  constructor(
    protected rootNode: DefinitionNode,
    protected subsMap: SubstitutionMap,
  ) {}

  public parse(definitionClass: Function): Metadata[] {
    const { rootNode } = this;
    this.metadata = [];

    if (rootNode.kind === 'ObjectTypeDefinition') {
      this.handleObjectTypeDefinition(rootNode, definitionClass);
    }
    else if (rootNode.kind === 'ObjectTypeExtension') {
      this.handleObjectTypeExtension(rootNode, definitionClass);
    }
    else if (rootNode.kind === 'InterfaceTypeDefinition') {
      this.handleInterfaceTypeDefinition(rootNode, definitionClass);
    }
    else if (rootNode.kind === 'InterfaceTypeExtension') {
      this.handleInterfaceTypeExtension(rootNode, definitionClass);
    }
    else if (rootNode.kind === 'InputObjectTypeDefinition') {
      this.handleInputObjectTypeDefinition(rootNode, definitionClass);
    }
    else if (rootNode.kind === 'InputObjectTypeExtension') {
      this.handleInputObjectExtension(rootNode, definitionClass);
    }
    else {
      throw new Error(`Node type not supported: ${rootNode.kind}`);
    }
    return this.metadata;
  }

  protected completeTypeExpression(
    typeNode: NamedTypeNode | ListTypeNode | NonNullTypeNode,
  ): TypeExpression {
    const { subsMap } = this;

    if (typeNode.kind === 'ListType') {
      return new List(this.completeTypeExpression(typeNode.type));
    } else if (typeNode.kind === 'NonNullType') {
      return new NonNull(this.completeTypeExpression(typeNode.type));
    }
    const subType = subsMap[typeNode.name.value];
    return coerceType(subType || typeNode.name.value);
  }

  protected handleObjectTypeDefinition(rootNode: ObjectTypeDefinitionNode, definitionClass: Function): void {
    const { name, interfaces, fields, description } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, definitionClass));
    }
    if (interfaces) {
      interfaces.forEach(interfaceNode => this.appendImplementTypeExpression(interfaceNode, definitionClass));
    }

    let metadata;
    if (name.value === 'Subscription') {
      metadata = new SubscriptionType({
        definitionClass,
        definitionName: name.value,
        description: description && description.value,
        directives: rootNode.directives && this.completeDirectives(rootNode.directives),
      });
    } else {
      metadata = new ObjectType({
        definitionClass,
        definitionName: name.value,
        description: description && description.value,
        directives: rootNode.directives && this.completeDirectives(rootNode.directives),
      });
    }

    this.metadata.push(metadata);
  }

  protected handleObjectTypeExtension(rootNode: ObjectTypeExtensionNode, definitionClass: Function): void {
    const { name, interfaces, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, definitionClass, name.value));
    }
    if (interfaces) {
      interfaces.forEach(interfaceNode => this.appendImplementTypeExpression(interfaceNode, definitionClass, name.value));
    }
  }

  protected handleInterfaceTypeDefinition(rootNode: InterfaceTypeDefinitionNode, definitionClass: Function): void {
    const { name, description, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, definitionClass));
    }

    this.metadata.push(new InterfaceType({
      definitionClass,
      definitionName: name.value,
      description: description && description.value,
      directives: rootNode.directives && this.completeDirectives(rootNode.directives),
    }));
  }

  protected handleInterfaceTypeExtension(rootNode: InterfaceTypeExtensionNode, definitionClass: Function): void {
    const { name, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, definitionClass, name.value));
    }
  }

  protected handleInputObjectTypeDefinition(node: InputObjectTypeDefinitionNode, definitionClass: Function): void {
    const { name, description, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode, definitionClass));
    }

    this.metadata.push(new InputType({
      definitionClass,
      definitionName: name.value,
      description: description && description.value,
      directives: node.directives && this.completeDirectives(node.directives),
    }));
  }

  protected handleInputObjectExtension(node: InputObjectTypeExtensionNode, definitionClass: Function): void {
    const { name, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode, definitionClass, name.value));
    }
  }

  protected appendFieldMetadataConfig(node: FieldDefinitionNode, definitionClass: Function, extendingTypeName?: string): void {
    const { name, type, description, directives, arguments: args } = node;

    const argumentRefs = args && args.map(argumentNode => (
      this.createInputField(argumentNode, definitionClass)
    ));

    const resolver = bindStaticResolver(definitionClass, name.value) || defaultFieldResolver;

    this.metadata.push(new Field({
      source: extendingTypeName || definitionClass,
      target: this.completeTypeExpression(type),
      fieldName: name.value,
      args: argumentRefs || [],
      description: description && description.value,
      directives: directives && this.completeDirectives(directives),
      extendingTypeName,
      resolver,
    }));
  }

  protected createInputField(node: InputValueDefinitionNode, definitionClass: Function, extendingTypeName?: string): InputField {
    const { name, type, description, defaultValue, directives } = node;

    return new InputField({
      source: extendingTypeName || definitionClass,
      target: this.completeTypeExpression(type),
      fieldName: name.value,
      directives: directives && this.completeDirectives(directives),
      defaultValue: defaultValue && this.completeValueNode(defaultValue),
      description: description && description.value,
      extendingTypeName,
    });
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode, definitionClass: Function, extendingTypeName?: string): void {
    const field = this.createInputField(node, definitionClass, extendingTypeName);
    this.metadata.push(field);
  }

  protected appendImplementTypeExpression(node: NamedTypeNode, definitionClass: Function, extendingTypeName?: string): void {
    this.metadata.push(new Implement({
      source: extendingTypeName || definitionClass,
      target: this.completeTypeExpression(node),
    }));
  }

  protected completeDirectives(directiveNodes: ReadonlyArray<DirectiveNode>): DirectiveMap {
    return directiveNodes.reduce((results, node) => {
      if (node.arguments instanceof Array) {
        results[node.name.value] = this.completeArgumentsOrObjectFields(node.arguments);
      } else {
        results[node.name.value] = {};
      }
      return results;
    }, {} as {[key: string]: any});
  }

  protected completeArgumentsOrObjectFields(nodes: ReadonlyArray<ArgumentNode | ObjectFieldNode>): any {
    return nodes.reduce((results, node) => {
      results[node.name.value] = this.completeValueNode(node.value);
      return results;
    }, {} as any);
  }

  protected completeValueNode(node: ValueNode): any {
    if (node.kind === 'ObjectValue') {
      return this.completeArgumentsOrObjectFields(node.fields);
    } else if (node.kind === 'NullValue') {
      return null;
    } else if (node.kind === 'ListValue') {
      return node.values.map(this.completeValueNode.bind(this));
    } else if (node.kind === 'Variable') {
      throw new Error(`Cannot use variable in schema directives: ${node.name}`);
    } else if (node.kind === 'IntValue' || node.kind === 'FloatValue') {
      return Number(node.value);
    }
    return node.value;
  }
}

export type DirectiveMap = { [key: string]: any };

export function bindStaticResolver(definitionClass: Function, fieldName: string): GraphQLFieldResolver<any, any> | null {
  const maybeStaticResolver = (definitionClass as any)[fieldName];
  return maybeStaticResolver instanceof Function
    ? maybeStaticResolver.bind(definitionClass)
    : null;
}

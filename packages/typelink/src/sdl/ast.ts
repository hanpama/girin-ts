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
} from 'graphql';

import { TypeArg, TypeExpression, TypeExpressionKind, TypeExpressionConstructorOptions, List, NonNull } from '../type-expression';
import { Entry, DefinitionEntry, ImplementReferenceEntry, FieldReferenceEntry, FieldMixinEntry, InputFieldMixinEntry, InputFieldReferenceEntry, ImplementMixinEntry } from '../metadata';
import { completeDirectives, completeValueNode } from './directive';
import { ObjectType, InterfaceType, InputType } from '../definition';
import { Lazy } from '../types';
import { Field, InputField } from '../field';
import { SubscriptionType } from '../definition/SubscriptionType';


export interface SubstitutionMap {
  [tempName: string]: TypeExpressionConstructorOptions | TypeExpression;
}

export class DefinitionParser {

  public entries: Entry<any>[];
  public extendingTypeName?: string;


  constructor(
    public rootNode: DefinitionNode,
    public subsMap: SubstitutionMap,
  ) {
    this.createMetadataFromAST();
  }

  protected createMetadataFromAST(): void {
    const { rootNode } = this;
    this.entries = [];

    if (rootNode.kind === 'ObjectTypeDefinition') {
      this.handleObjectTypeDefinition(rootNode);
    }
    else if (rootNode.kind === 'ObjectTypeExtension') {
      this.handleObjectTypeExtension(rootNode);
    }
    else if (rootNode.kind === 'InterfaceTypeDefinition') {
      this.handleInterfaceTypeDefinition(rootNode);
    }
    else if (rootNode.kind === 'InterfaceTypeExtension') {
      this.handleInterfaceTypeExtension(rootNode);
    }
    else if (rootNode.kind === 'InputObjectTypeDefinition') {
      this.handleInputObjectTypeDefinition(rootNode);
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

  protected handleObjectTypeDefinition(rootNode: ObjectTypeDefinitionNode): void {
    const { name, interfaces, fields, description } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode));
    }
    if (interfaces) {
      interfaces.forEach(interfaceNode => this.appendImplementTypeExpression(interfaceNode));
    }

    let metadata;
    if (name.value === 'Subscription') {
      metadata = new SubscriptionType({
        typeName: name.value,
        description: description && description.value,
        directives: rootNode.directives && completeDirectives(rootNode.directives),
      });
    } else {
        metadata = new ObjectType({
        typeName: name.value,
        description: description && description.value,
        directives: rootNode.directives && completeDirectives(rootNode.directives),
      });
    }

    this.entries.push(new DefinitionEntry({
      metadata,
    }));
  }

  protected handleObjectTypeExtension(rootNode: ObjectTypeExtensionNode): void {
    const { name, interfaces, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, name.value));
    }
    if (interfaces) {
      interfaces.forEach(interfaceNode => this.appendImplementTypeExpression(interfaceNode, name.value));
    }
  }

  protected handleInterfaceTypeDefinition(rootNode: InterfaceTypeDefinitionNode): void {
    const { name, description, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode));
    }

    this.entries.push(new DefinitionEntry({
      metadata: new InterfaceType({
        typeName: name.value,
        description: description && description.value,
        directives: rootNode.directives && completeDirectives(rootNode.directives),
      }),
    }));
  }

  protected handleInterfaceTypeExtension(rootNode: InterfaceTypeExtensionNode): void {
    const { name, fields } = rootNode;

    if (fields) {
      fields.forEach(fieldNode => this.appendFieldMetadataConfig(fieldNode, name.value));
    }
  }

  protected handleInputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): void {
    const { name, description, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode));
    }

    this.entries.push(new DefinitionEntry({
      metadata: new InputType({
        typeName: name.value,
        description: description && description.value,
        directives: node.directives && completeDirectives(node.directives),
      }),
    }));
  }

  protected handleInputObjectExtension(node: InputObjectTypeExtensionNode): void {
    const { name, fields } = node;

    if (fields) {
      fields.forEach(fieldNode => this.appendInputFieldMetadataConfig(fieldNode, name.value));
    }
  }

  protected appendFieldMetadataConfig(node: FieldDefinitionNode, extendingTypeName?: string): void {
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

    if (extendingTypeName) {
      this.entries.push(new FieldMixinEntry({ field, extendingTypeName }));
    } else {
      this.entries.push(new FieldReferenceEntry({ field }));
    }
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

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode, extendingTypeName?: string): void {
    const field = this.createInputField(node);
    if (extendingTypeName) {
      this.entries.push(new InputFieldMixinEntry({ field, extendingTypeName }));
    } else {
      this.entries.push(new InputFieldReferenceEntry({ field }));
    }
  }

  protected appendImplementTypeExpression(node: NamedTypeNode, extendingTypeName?: string): void {
    const interfaceType = this.completeTypeExpression(node, 'output');

    if (extendingTypeName) {
      this.entries.push(new ImplementMixinEntry({ extendingTypeName, interfaceType }));
    } else {
      this.entries.push(new ImplementReferenceEntry({ interfaceType, }));
    }
  }
}

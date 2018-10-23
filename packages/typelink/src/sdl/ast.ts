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

import { TypeExpression, Structure, List, NonNull, Metadata, TypeArg } from '../metadata';
import { completeDirectives, completeValueNode } from './directive';
import { ObjectType, InterfaceType, InputType, SubscriptionType } from '../definition';
import { Field, InputField, Implement } from '../reference';


export interface SubstitutionMap {
  [tempName: string]: TypeExpression | TypeArg;
}

export class DefinitionParser {

  public metadata: Metadata[];
  public extendingTypeName?: string;


  constructor(
    public rootNode: DefinitionNode,
    public subsMap: SubstitutionMap,
  ) {
    this.createMetadataFromAST();
  }

  protected createMetadataFromAST(): void {
    const { rootNode } = this;
    this.metadata = [];

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
    typeNode: NamedTypeNode | ListTypeNode | NonNullTypeNode,
  ): TypeExpression | Structure {
    const { subsMap } = this;

    if (typeNode.kind === 'ListType') {
      return List.of(this.completeTypeExpression(typeNode.type));
    } else if (typeNode.kind === 'NonNullType') {
      return NonNull.of(this.completeTypeExpression(typeNode.type));
    }

    const subType = subsMap[typeNode.name.value];

    if (subType instanceof TypeExpression) {
      return subType;
    } else if (subType) {
      return new TypeExpression(subType, null);
    } else {
      return new TypeExpression(typeNode.name.value, null);
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
        definitionName: name.value,
        description: description && description.value,
        directives: rootNode.directives && completeDirectives(rootNode.directives),
      });
    } else {
      metadata = new ObjectType({
        definitionName: name.value,
        description: description && description.value,
        directives: rootNode.directives && completeDirectives(rootNode.directives),
      });
    }

    this.metadata.push(metadata);
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

    this.metadata.push(new InterfaceType({
      definitionName: name.value,
      description: description && description.value,
      directives: rootNode.directives && completeDirectives(rootNode.directives),
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

    this.metadata.push(new InputType({
      definitionName: name.value,
      description: description && description.value,
      directives: node.directives && completeDirectives(node.directives),
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

    this.metadata.push(new Field({
      fieldName: name.value,
      targetType: this.completeTypeExpression(type),
      args: argumentRefs || [],
      description: description && description.value,
      directives: directives && completeDirectives(directives),
      extendingTypeName,
    }));
  }

  protected createInputField(node: InputValueDefinitionNode, extendingTypeName?: string): InputField {
    const { name, type, description, defaultValue, directives } = node;

    return new InputField({
      fieldName: name.value,
      targetType: this.completeTypeExpression(type),
      directives: directives && completeDirectives(directives),
      defaultValue: defaultValue && completeValueNode(defaultValue),
      description: description && description.value,
      extendingTypeName,
    });
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode, extendingTypeName?: string): void {
    const field = this.createInputField(node, extendingTypeName);
    this.metadata.push(field);
  }

  protected appendImplementTypeExpression(node: NamedTypeNode, extendingTypeName?: string): void {
    const targetType = this.completeTypeExpression(node);
    this.metadata.push(new Implement({ targetType, extendingTypeName }));
  }
}

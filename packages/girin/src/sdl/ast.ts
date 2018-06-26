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

import { Field, FieldMount } from '../field/Field';
import { InputTypeConfig } from '../metadata/InputType';
import { List, NonNull } from '../type-expression/structure';
import { ObjectTypeConfig } from '../metadata/ObjectType';
import { completeDirectives, completeValueNode } from './directive';
import { TypeArg, TypeExpression } from '../type-expression/TypeExpression';
import { Lazy } from '../types';
import { InterfaceTypeConfig } from '../metadata/InterfaceType';
import { InputField } from '../field/InputField';


const SUBSTITUTION_PREFIX = '__GIRIN__SUBS__';
const TEMP_PLACEHOLDER = '__GIRIN__TEMP__';

export interface SubstitutionMap {
  [tempName: string]: GQLInterpolatable;

}
export type GQLInterpolatable =
  | FieldMount | Array<FieldMount>
  | TypeArg | TypeExpression
  | Lazy<TypeArg> | Lazy<TypeExpression>;


export function gql(strings: TemplateStringsArray, ...interpolated: Array<GQLInterpolatable>) {
  const result = [strings[0]];
  const subsMap: SubstitutionMap = {};

  for (let i = 0; i < interpolated.length; i++) {
    const item = interpolated[i];
    const name = `${SUBSTITUTION_PREFIX}${i}`;
    if (item instanceof FieldMount) {
      subsMap[name] = item;
      result.push(`${name}: ${TEMP_PLACEHOLDER}`);
    } else {
      subsMap[name] = item;
      result.push(name);
    }
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

  public readonly fieldMetadataConfigs: FieldMount[] = [];
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
  ): TypeExpression {
    const { subsMap } = this;

    if (type.kind === 'ListType') {
      return List.of(this.completeTypeExpression(type.type));
    } else if (type.kind === 'NonNullType') {
      return NonNull.of(this.completeTypeExpression(type.type));
    } else {
      const sub = subsMap[type.name.value];

      if (!sub) {
        return new TypeExpression(type.name.value);
      }
      else if (sub instanceof TypeExpression) {
        return sub;
      }
      return new TypeExpression(sub as TypeArg | Lazy<TypeArg>);
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

    const sub = this.subsMap[name.value];
    let mount: FieldMount;
    if (sub) {
      mount = sub as FieldMount;
    } else {
      const argumentRefs = args && args.map(argumentNode => (
        this.createInputField(argumentNode)
      ));

      const field = new Field({
        defaultName: name.value,
        type: this.completeTypeExpression(type),
        args: argumentRefs || [],
        description: description && description.value,
        directives: directives && completeDirectives(directives),
      });

      mount = new FieldMount({ mountName: name.value, field });
    }

    this.fieldMetadataConfigs.push(mount);
  }

  protected createInputField(node: InputValueDefinitionNode): InputField {
    const { name, type, description, defaultValue, directives } = node;

    return new InputField({
      defaultName: name.value,
      type: this.completeTypeExpression(type),
      directives: directives && completeDirectives(directives),
      defaultValue: defaultValue && completeValueNode(defaultValue),
      description: description && description.value,
    });
  }

  protected appendInputFieldMetadataConfig(node: InputValueDefinitionNode): void {
    this.inputFieldMetadataConfigs.push(this.createInputField(node));
  }
}

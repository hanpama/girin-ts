import { DefinitionClass } from '../types';

import { ASTParser } from './ast';
import { globalMetadataStorage } from '../globalMetadataStorage';
import { MetadataStorage } from '../base/MetadataStorage';
import { ObjectTypeMetadata, ObjectTypeMetadataConfig } from '../metadata/ObjectTypeMetadata';
import { InterfaceTypeMetadataConfig, InterfaceTypeMetadata } from '../metadata/InterfaceTypeMetadata';
import { FieldReference } from '../field/Field';
import { InputFieldReference } from '../field/InputField';
import { InputTypeMetadata, InputTypeMetadataConfig } from '../metadata/InputTypeMetadata';


/**
 * Register definition metadata and generic metadata from its given parse result
 * @param parseResult
 */
export class TypeDefinition {
  protected constructor(parser: ASTParser, storage: MetadataStorage) {
    this.storage = storage;
    this.parser = parser;

    this.handleObjectType = this.handleObjectType.bind(this);
    this.handleInterfaceType = this.handleInterfaceType.bind(this);
    this.handleInputObjectType = this.handleInputObjectType.bind(this);
    this.handleField = this.handleField.bind(this);
    this.handleInputField = this.handleInputField.bind(this);
  }
  protected definitionClass: DefinitionClass;
  protected storage: MetadataStorage;
  protected parser: ASTParser;

  protected handleObjectType(config: ObjectTypeMetadataConfig) {
    this.storage.register(new ObjectTypeMetadata(config), this.definitionClass);
  }

  protected handleInterfaceType(config: InterfaceTypeMetadataConfig) {
    this.storage.register(new InterfaceTypeMetadata(config), this.definitionClass);
  }

  protected handleInputObjectType(config: InputTypeMetadataConfig) {
    this.storage.register(new InputTypeMetadata(config), this.definitionClass);
  }

  protected handleField(config: FieldReference) {
    this.storage.registerFieldReference(config, this.definitionClass);
  }

  protected handleInputField(config: InputFieldReference) {
    this.storage.registerInputFieldReference(config, this.definitionClass);
  }

  public decorate(definitionClass: DefinitionClass) {
    this.definitionClass = definitionClass;

    const {
      objectTypeMetadataConfigs,
      interfaceTypeMetadataConfigs,
      inputObjectTypeMetadataConfigs,
      fieldMetadataConfigs,
      inputFieldMetadataConfigs,
    } = this.parser;

    objectTypeMetadataConfigs.forEach(this.handleObjectType);
    interfaceTypeMetadataConfigs.forEach(this.handleInterfaceType);
    inputObjectTypeMetadataConfigs.forEach(this.handleInputObjectType);
    fieldMetadataConfigs.forEach(this.handleField);
    inputFieldMetadataConfigs.forEach(this.handleInputField);
  }

  public static createDecorator(parser: ASTParser, storage?: MetadataStorage) {
    return (definitionClass: DefinitionClass) => {
      (new this(parser, storage || globalMetadataStorage)).decorate(definitionClass);
    }
  }
}

export class AbstractTypeDefinition extends TypeDefinition {
  protected handleObjectType(config: ObjectTypeMetadataConfig) {}
  protected handleInterfaceType(config: InterfaceTypeMetadataConfig) {}
  protected handleInputObjectType(config: InputTypeMetadataConfig) {}
}

export const defineType: typeof TypeDefinition["createDecorator"] = TypeDefinition.createDecorator.bind(TypeDefinition);
export const defineAbstractType: typeof AbstractTypeDefinition["createDecorator"] = AbstractTypeDefinition.createDecorator.bind(AbstractTypeDefinition);

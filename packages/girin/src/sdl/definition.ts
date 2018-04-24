import { DefinitionClass } from '../types';

import { ASTParser } from './ast';
import { globalMetadataStorage } from '../globalMetadataStorage';
import { MetadataStorage } from '../base/MetadataStorage';
import { ObjectTypeMetadata, ObjectTypeMetadataConfig } from '../metadata/ObjectTypeMetadata';
import { InterfaceTypeMetadataConfig, InterfaceTypeMetadata } from '../metadata/InterfaceTypeMetadata';
import { InputFieldMetadataConfig, InputFieldMetadata } from '../metadata/InputFieldMetadata';
import { InputObjectTypeMetadataConfig, InputObjectTypeMetadata } from '../metadata/InputObjectTypeMetadata';
import { FieldMetadataConfig, FieldMetadata } from '../metadata/FieldMetadata';
import { ArgumentMetadata, ArgumentMetadataConfig } from '../metadata/ArgumentMetadata';

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
    this.handleArgument = this.handleArgument.bind(this);
    this.handleInputField = this.handleInputField.bind(this);
  }
  protected definitionClass: DefinitionClass;
  protected storage: MetadataStorage;
  protected parser: ASTParser;

  protected handleObjectType(config: ObjectTypeMetadataConfig) {
    (new ObjectTypeMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  protected handleInterfaceType(config: InterfaceTypeMetadataConfig) {
    (new InterfaceTypeMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  protected handleInputObjectType(config: InputObjectTypeMetadataConfig) {
    (new InputObjectTypeMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  protected handleField(config: FieldMetadataConfig) {
    (new FieldMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  protected handleArgument(config: ArgumentMetadataConfig) {
    (new ArgumentMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  protected handleInputField(config: InputFieldMetadataConfig) {
    (new InputFieldMetadata(this.definitionClass, config)).registerToStorage(this.storage);
  }

  public decorate(definitionClass: DefinitionClass) {
    this.definitionClass = definitionClass;

    const {
      objectTypeMetadataConfigs,
      interfaceTypeMetadataConfigs,
      inputObjectTypeMetadataConfigs,
      fieldMetadataConfigs,
      argumentMetadataConfigs,
      inputFieldMetadataConfigs,
    } = this.parser;

    objectTypeMetadataConfigs.forEach(this.handleObjectType);
    interfaceTypeMetadataConfigs.forEach(this.handleInterfaceType);
    inputObjectTypeMetadataConfigs.forEach(this.handleInputObjectType);
    fieldMetadataConfigs.forEach(this.handleField);
    argumentMetadataConfigs.forEach(this.handleArgument);
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
  protected handleInputObjectType(config: InputObjectTypeMetadataConfig) {}
}

export const defineType: typeof TypeDefinition["createDecorator"] = TypeDefinition.createDecorator.bind(TypeDefinition);
export const defineAbstractType: typeof AbstractTypeDefinition["createDecorator"] = AbstractTypeDefinition.createDecorator.bind(AbstractTypeDefinition);

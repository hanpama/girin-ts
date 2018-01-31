import { FieldMetadata } from './FieldMetadata';
import { ArgumentMetadata } from './ArgumentMetadata';
import { ObjectTypeMetadata } from './ObjectTypeMetadata';
import { InputFieldMetadata } from './InputFieldMetadata';
import { InputObjectTypeMetadata } from './InputObjectTypeMetadata';
import { InterfaceTypeMetadata } from './InterfaceTypeMetadata';
import { ScalarMetadata, builtInScalarMetadata } from './ScalarMetadata';
import { ImplementsMetadata } from './ImplementsMetadata';
import { isSubClassOf } from '../utils';


export type DefinitionMetadata = OutputMetadata | InputMetadata;

export type OutputMetadata = ScalarMetadata | ObjectTypeMetadata | InterfaceTypeMetadata;

export type InputMetadata = ScalarMetadata | InputObjectTypeMetadata;

export class MetadataStorage {
  static metadataStorage: MetadataStorage;
  static getMetadataStorage() {
    if (!this.metadataStorage) {
      this.metadataStorage = new MetadataStorage();
    }
    return this.metadataStorage;
  }

  public readonly scalarMetadata: ScalarMetadata[] = builtInScalarMetadata;
  public readonly objectTypeMetadata: ObjectTypeMetadata[] = [];
  public readonly inputObjectTypeMetadata: InputObjectTypeMetadata[] = [];
  public readonly interfaceTypeMetadata: InterfaceTypeMetadata[] = [];
  public readonly implementsMetadata: ImplementsMetadata[] = [];

  public readonly fieldMetadata: FieldMetadata[] = [];
  public readonly argumentMetadata: ArgumentMetadata[] = [];
  public readonly inputFieldMetadata: InputFieldMetadata[] = [];

  getDefinitionMetadata(typeNameOrDefinitionClass: string | Function): DefinitionMetadata {
    const metadata = (
      this.findScalarMetadata(typeNameOrDefinitionClass) ||
      this.findObjectTypeMetadata(typeNameOrDefinitionClass) ||
      this.findInputObjectTypeMetadata(typeNameOrDefinitionClass) ||
      this.findInterfaceTypeMetadata(typeNameOrDefinitionClass)
    );
    if (!metadata) {
      throw new Error(`Cannot get DefinitionMetadata of ${typeNameOrDefinitionClass} from MetadataStorage`);
    }
    return metadata;
  }

  getInputMetadata(typeNameOrDefinitionClass: string | Function): InputMetadata {
    const metadata = (
      this.findScalarMetadata(typeNameOrDefinitionClass) ||
      this.findInputObjectTypeMetadata(typeNameOrDefinitionClass)
    );
    if (!metadata) {
      throw new Error(`Cannot get InputMetadata of ${typeNameOrDefinitionClass} from MetadataStorage`);
    }
    return metadata;
  }

  getOutputtMetadata(typeNameOrDefinitionClass: string | Function): OutputMetadata {
    const metadata = (
      this.findScalarMetadata(typeNameOrDefinitionClass) ||
      this.findObjectTypeMetadata(typeNameOrDefinitionClass)
    );
    if (!metadata) {
      throw new Error(`Cannot get OutputMetadata of ${typeNameOrDefinitionClass} from MetadataStorage`);
    }
    return metadata;
  }

  findScalarMetadata(typeNameOrDefinitionClass: string | Function) {
    if (typeNameOrDefinitionClass instanceof Function) {
      return this.scalarMetadata.find(metadata => metadata.definitionClass === typeNameOrDefinitionClass);
    }
    return this.scalarMetadata.find(metadata => metadata.name === typeNameOrDefinitionClass);
  }

  findObjectTypeMetadata(typeNameOrDefinitionClass: string | Function) {
    if (typeNameOrDefinitionClass instanceof Function) {
      return this.objectTypeMetadata.find(metadata => metadata.definitionClass === typeNameOrDefinitionClass);
    }
    return this.objectTypeMetadata.find(metadata => metadata.name === typeNameOrDefinitionClass);
  }

  findInputObjectTypeMetadata(typeNameOrDefinitionClass: string | Function) {
    if (typeNameOrDefinitionClass instanceof Function) {
      return this.inputObjectTypeMetadata.find(metadata => metadata.definitionClass === typeNameOrDefinitionClass);
    }
    return this.inputObjectTypeMetadata.find(metadata => metadata.name === typeNameOrDefinitionClass);
  }

  findInterfaceTypeMetadata(typeNameOrDefinitionClass: string | Function) {
    if (typeNameOrDefinitionClass instanceof Function) {
      return this.interfaceTypeMetadata.find(metadata => metadata.definitionClass === typeNameOrDefinitionClass);
    }
    return this.interfaceTypeMetadata.find(metadata => metadata.name === typeNameOrDefinitionClass);
  }

  filterFieldMetadata(definitionClass: Function) {
    return this.fieldMetadata.filter(metadata => isSubClassOf(definitionClass, metadata.definitionClass));
  }

  filterArgumentMetadata(definitionClass: Function, fieldName: string) {
    return this.argumentMetadata.filter(metadata => (
      isSubClassOf(definitionClass, metadata.definitionClass)
      && metadata.fieldName === fieldName
    ));
  }

  filterInputFieldMetadata(definitionClass: Function) {
    return this.inputFieldMetadata.filter(metadata => (
      isSubClassOf(definitionClass, metadata.definitionClass)
    ));
  }

  filterImplementsMetadata(definitionClass: Function) {
    return this.implementsMetadata.filter(metadata => (
      definitionClass === metadata.definitionClass
    ));
  }
}
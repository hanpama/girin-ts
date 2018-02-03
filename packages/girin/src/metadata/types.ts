import { ScalarMetadata } from "./ScalarMetadata";
import { ObjectTypeMetadata } from "./ObjectTypeMetadata";
import { InterfaceTypeMetadata } from "./InterfaceTypeMetadata";
import { InputObjectTypeMetadata } from "./InputObjectTypeMetadata";


export type DefinitionMetadata = OutputMetadata | InputMetadata;

export type OutputMetadata = ScalarMetadata | ObjectTypeMetadata | InterfaceTypeMetadata;

export type InputMetadata = ScalarMetadata | InputObjectTypeMetadata;

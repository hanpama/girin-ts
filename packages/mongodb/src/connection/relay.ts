// import {
//   MetadataStorage,
//   ObjectType,
//   Field,
//   TypeExpression,
//   List,
//   NonNull,
//   StringScalar,
//   FieldReferenceEntry,
//   DefinitionEntry,
//   FieldMixinEntry,
// } from "@girin/typelink";

// import { Connection, Edge } from "./base";


// export function loadPredefinedConnectionFields(storage: MetadataStorage) {
//   const pageInfoField = new Field({
//     args: [],
//     defaultName: 'pageInfo',
//     type: new TypeExpression('PageInfo'),
//   });
//   const cursorField = new Field({
//     args: [],
//     defaultName: 'cursor',
//     type: NonNull.of(StringScalar),
//   });

//   storage.registerEntry(Connection, new FieldReferenceEntry({ field: pageInfoField }));
//   storage.registerEntry(Edge, new FieldReferenceEntry({ field: cursorField }));
// }

// export function defineConnection(target: Function, storage: MetadataStorage) {
//   const definition = storage.getDefinition(ObjectType, target, 'any');
//   const typeName = definition.metadata.typeName;

//   const connectionTypeName = `${typeName}Connection`;
//   const edgeTypeName = `${typeName}Edge`;

//   const connectionType = new ObjectType({
//     typeName: connectionTypeName,
//     description: '',
//   });
//   const edgeType = new ObjectType({
//     typeName: edgeTypeName,
//     description: '',
//   });

//   const edgesField = new Field({
//     args: [],
//     defaultName: 'edges',
//     type: List.of(target),
//   });
//   const nodeField = new Field({
//     args: [],
//     defaultName: 'node',
//     type: new TypeExpression(target)
//   });

//   storage.registerEntry(Connection, new DefinitionEntry({ metadata: connectionType }));
//   storage.registerEntry(Connection, new FieldMixinEntry({ field: edgesField, extendingTypeName: connectionTypeName }));
//   storage.registerEntry(Edge, new DefinitionEntry({ metadata: edgeType }));
//   storage.registerEntry(Edge, new FieldMixinEntry({ field: nodeField, extendingTypeName: edgeTypeName }));

//   return {
//     connectionType: new TypeExpression(connectionTypeName),
//     edgeType: new TypeExpression(edgeTypeName),
//   };
// }
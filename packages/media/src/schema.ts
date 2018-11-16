import { Field, NonNull, getGlobalMetadataStorage, ObjectType, type } from '@girin/typelink';
import { GraphQLDateTime } from 'graphql-iso-date';
import { MediaModule } from './module';
import { defaultFieldResolver, GraphQLInt } from 'graphql';


/**
 * ```graphql
type Media {
  id: String!
  filename: String!
  size: Int!
  uploadedAt: ${GraphQLDateTime}!
  url: String!
}```
 * @param definitionClass
 */
export const defineMedia = (definitionClass: Function) => {
  getGlobalMetadataStorage().registerMetadata([
    new ObjectType({
      definitionClass,
      definitionName: 'Media',
    }),
    new Field({
      fieldName: 'id',
      args: [],
      source: definitionClass,
      target: NonNull.of('String'),
      resolver: defaultFieldResolver,
    }),
    new Field({
      fieldName: 'filename',
      args: [],
      source: definitionClass,
      target: NonNull.of('String'),
      resolver: defaultFieldResolver,
    }),
    new Field({
      fieldName: 'uploadedAt',
      args: [],
      source: definitionClass,
      target: type(GraphQLDateTime),
      resolver: defaultFieldResolver,
    }),
    new Field({
      fieldName: 'size',
      args: [],
      source: definitionClass,
      target: type(GraphQLInt),
      resolver: defaultFieldResolver,
    }),
    new Field({
      fieldName: 'url',
      args: [],
      source: definitionClass,
      target: NonNull.of('String'),
      resolver: function(source: any, args: any, context: any, info: any) {
        if (source.url) {
          return defaultFieldResolver(source, args, context, info);
        }
        return MediaModule.object().getMediaURL(source.id);
      }
    }),
  ]);
};

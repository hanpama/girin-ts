import {  gql, defineType } from '@girin/typelink';
import { GraphQLDateTime } from 'graphql-iso-date';


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
  defineType(gql`
    type Media {
      id: String!
      filename: String!
      originalFilename: String!
      uploadedAt: ${GraphQLDateTime}!
      size: Int!
      url: String!
      uuid: String!
    }
  `)(definitionClass);
};

import { defineType, gql } from '..';


@defineType(gql`
  type RelayMutationPayload {
    clientMutationId: String!
  }
  input RelayMutationInput {
    clientMutationId: String!
  }
`)
export abstract class RelayMutation {
  clientMutationId: string;
}

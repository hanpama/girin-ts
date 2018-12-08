import { defineType } from '../global';
import { gql } from '../sdl/gql';


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

import { gql, getGraphQLType, List, StringScalar } from "../src";
import { Field } from "../src/field/Field";
import { GraphQLObjectType, GraphQLSchema, graphql, printSchema } from "graphql";
import { InputField } from "../src/field/InputField";
import { ObjectType } from "../src/metadata/ObjectType";


const tagListField = new Field({ output: List.of(StringScalar), args: [] });

@ObjectType.define(gql`
  type Room {
    name: String!
    ${tagListField.mountAs('tags')}
  }
`)
class Room {
  name: string;
  tags: string[];
}

class RoomsField extends Field {
  output = List.of(Room)
  args = [
    { name: 'count', field: new InputField('Int'), props: {} }
  ]
  buildResolver() {
    return (source: string, args: { count: number }) => {
      const rooms: Room[] = [];
      for(let i = 0; i < args.count; i ++) {
        const room = new Room();
        room.name = `My room ${i}`;
        room.tags = [String(i)];
        rooms.push(room)
      }
      return rooms;
    }
  }
}

@ObjectType.define(gql`
  type Host {
    name: String!
    ${(new RoomsField()).mountAs('rooms')}
  }
`)
class Host {
  name: string;
  rooms: Room[];
}

@ObjectType.define(gql`
  type Query {
    host: ${Host}
  }
`)
class Query {
  static host() {
    return new Host();
  }
}

describe('Fields', () => {
  it('should append fields to GraphQLType created', () => {
    const roomObjectType: GraphQLObjectType = getGraphQLType(Room);

    const fields = roomObjectType.getFields();
    expect(fields.tags).not.toBeUndefined();
    expect(fields.tags.type.toString()).toBe('[String]');
  });

  it('should create and execute schema as expected', async () => {
    const schema = new GraphQLSchema({
      query: getGraphQLType(Query),
    });

    expect(printSchema(schema)).toMatchSnapshot();

    const results = await graphql({ schema, source: `
      query {
        host {
          rooms(count: 5) {
            name
            tags
          }
        }
      }
    ` });

    expect(results).toEqual({
      "data": {
        "host": {
          "rooms": [
            { "name": "My room 0",
              "tags": [ "0" ] },
            { "name": "My room 1",
              "tags": [ "1" ] },
            { "name": "My room 2",
              "tags": [ "2" ] },
            { "name": "My room 3",
              "tags": [ "3" ] },
            { "name": "My room 4",
              "tags": [ "4" ] },
          ],
        },
      },
    });
  })
});

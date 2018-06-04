import { defineType, gql, getGraphQLType, List } from "../src";
import { Field } from "../src/field/Field";
import { mount } from "../src/field/mount";
import { GraphQLObjectType, GraphQLSchema, graphql, printSchema } from "graphql";
import { InputField } from "../src/field/InputField";


@defineType(gql`
  type Room {
    name: String!
  }
`)
class Room {
  name: string;

  @mount(new Field(List.of('String')))
  tags: string[];
}

class RoomsField extends Field {
  output = List.of(Room)
  args = [
    { name: 'count', field: new InputField('Int'), props: {} }
  ]
  resolve(source: string, args: { count: number }) {
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

@defineType(gql`
  type Host {
    name: String!
  }
`)
class Host {
  name: string;

  @mount(new RoomsField())
  rooms: Room[];
}

@defineType(gql`
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

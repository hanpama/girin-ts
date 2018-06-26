import { GraphQLResolveInfo } from "graphql";

import { PageInfo, Edge } from '.';
import { gql, Definition, List, ObjectType, Component } from "..";
import { ConcreteClass } from "../types";


export interface ConnectionArguments {
  before?: string;
  after?: string;
  first?: number;
  last?: number;
}

@Definition.define(gql`
  type Connection {
    """
    Information to aid in pagination.
    """
    pageInfo: ${PageInfo}
    edges: ${cls => cls.getOrCreatedEdgesType()}
  }
`)
export abstract class Connection<
  TSource,
  TArgs extends ConnectionArguments = ConnectionArguments,
  TContext = {}
> extends Component<TSource, TArgs, TContext> {
  static edgeType?: ConcreteClass<Edge<any>>;
  static nodeType?: any;

  protected static getOrCreatedEdgesType() {
    const { edgeType, nodeType } = this;
    if (edgeType) {
      return List.of(edgeType);
    }
    if (nodeType) {
      this.edgeType = class extends Edge<any> {
        static get nodeType() { return nodeType; };
      }
      Object.defineProperty(this.edgeType, 'name', {value: `${this.name}Edge`});
      ObjectType.define()(this.edgeType);
      return List.of(this.edgeType);
    }
    throw new Error('Should provide edgeType or nodeType to Connection subclass');
  }

  constructor(
    protected source: TSource,
    protected args?: TArgs,
    protected context?: TContext,
    protected info?: GraphQLResolveInfo,
  ) {
    super(source, args, context, info);
    if (args) {
      if (typeof args.first === 'number' && args.first < 0) {
        throw new Error('Argument "first" must be a non-negative integer');
      }
      if (typeof args.last === 'number' && args.last < 0) {
        throw new Error('Argument "last" must be a non-negative integer');
      }
    }
  }

  public pageInfo: PageInfo;
  public edges: any[];
}

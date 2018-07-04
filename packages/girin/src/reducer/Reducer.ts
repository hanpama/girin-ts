import { GraphQLResolveInfo } from "graphql";


export interface ReducerClass<TSource = any, TArgs = any, TContext = any> {
  new (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo): Reducer<TSource, TContext>;
}

/**
 * Class-based resolver context
 */
export class Reducer<TSource = undefined, TContext = {}> {
  public $env: IArguments;
  public get $source(): TSource {
    return this.$env[0];
  }
  public get $context(): TContext {
    return this.$env[1];
  }
  public get $info(): GraphQLResolveInfo {
    return this.$env[2];
  }

  constructor(
    _base: TSource = Object.create(null),
    _context?: TContext,
    _info?: GraphQLResolveInfo
  ) {
    this.$env = arguments;
  }
}

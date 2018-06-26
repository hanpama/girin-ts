import { GraphQLResolveInfo } from "graphql";


export interface ComponentClass<TSource = any, TArgs = any, TContext = any> {
  new (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo): Component<TSource, TArgs, TContext>;
}

/**
 * Class-based resolver context
 */
export class Component<TSource = { [key: string]: any }, TArgs = {}, TContext = {}> {
  public $env: IArguments;
  public get $source(): TSource {
    return this.$env[0];
  }
  public get $args(): TArgs {
    return this.$env[1];
  }
  public get $context(): TContext {
    return this.$env[2];
  }
  public get $info(): GraphQLResolveInfo {
    return this.$env[3];
  }

  constructor(
    source: TSource,
    args?: TArgs,
    context?: TContext,
    info?: GraphQLResolveInfo
  ) {
    this.$env = arguments;
  }
}

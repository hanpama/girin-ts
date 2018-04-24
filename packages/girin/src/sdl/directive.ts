import { DirectiveNode, ArgumentNode, ObjectFieldNode, ValueNode } from "graphql";


export type DirectiveMap = { [key: string]: any };


export function completeDirectives(directiveNodes: DirectiveNode[]): DirectiveMap {
  return directiveNodes.reduce((results, node) => {
    if (node.arguments instanceof Array) {
      results[node.name.value] = completeArgumentsOrObjectFields(node.arguments);
    } else {
      results[node.name.value] = {};
    }
    return results;
  }, {} as {[key: string]: any});
}

function completeArgumentsOrObjectFields(nodes: Array<ArgumentNode | ObjectFieldNode>): any {
  return nodes.reduce((results, node) => {
    results[node.name.value] = completeValueNode(node.value);
    return results;
  }, {} as any);
}

function completeValueNode(node: ValueNode): any {
  if (node.kind === 'ObjectValue') {
    return completeArgumentsOrObjectFields(node.fields);
  } else if (node.kind === 'NullValue') {
    return null;
  } else if (node.kind === 'ListValue') {
    return node.values.map(completeValueNode);
  } else if (node.kind === 'Variable') {
    throw new Error(`Cannot use variable in schema directives: ${node.name}`);
  } else if (node.kind === 'IntValue' || node.kind === 'FloatValue') {
    return Number(node.value);
  }
  return node.value;
}

import { TypeExpression } from './TypeExpression';


export interface GenericContext {
  typeName: string;
  args: TypeExpression[];
}

export class GenericParameter {
  constructor(public order: number) {}
}

export const genericParameters = [
  new GenericParameter(0),
  new GenericParameter(1),
  new GenericParameter(2),
  new GenericParameter(3),
  new GenericParameter(4),
  new GenericParameter(5),
  new GenericParameter(6),
  new GenericParameter(7),
  new GenericParameter(8),
  new GenericParameter(9),
];

export const emptyObject = Object.create(null);
export const emptyArray = [];

export function assert(expression: any, description?: string) {
  if (!expression) {
    throw new Error(`Assertion Error: ${description}`);
  }
}

export function toBase64(i: string): string {
  return Buffer.from(i, 'utf8').toString('base64');
}

export function fromBase64(i: string): string {
  return Buffer.from(i, 'base64').toString('utf8');
}

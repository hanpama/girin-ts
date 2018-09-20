export function toBase64(i: string): string {
  return Buffer.from(i, 'utf8').toString('base64');
}

export function fromBase64(i: string): string {
  return Buffer.from(i, 'base64').toString('utf8');
}

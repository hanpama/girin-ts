import { Document } from '../types';


export type EmbedClass<TEmbed extends Embed> = typeof Embed & {
  new(source: any): TEmbed;
};

export class Embed {
  constructor(public $source: Document = {}) {}
}

import { Module } from '@girin/environment';


/**
 * Minimal persistence layer for in framework objects
 */
export abstract class FrameworkDatastore extends Module {
  get label() { return 'FrameworkDatastore'; }

  abstract save<T extends { id: string }>(obj: T): Promise<T> ;

  abstract find<T extends { id: string }>(type: { prototype: T }, predicate: { [field: string]: any }): Promise<T | null>;

  abstract get<T extends { id: string }>(type: { prototype: T }, id: string): Promise<T | null>;

  abstract delete(type: Function, id: string): Promise<boolean>;
}

export class TypeNotSupportedError extends Error {}
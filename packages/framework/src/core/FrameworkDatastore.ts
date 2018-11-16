import { Module } from '@girin/environment';


/**
 * Minimal persistence layer for in framework objects
 */
export abstract class FrameworkDatastore extends Module {
  get label() { return 'FrameworkDatastore'; }

  abstract save<T extends { id: string | number }>(obj: T): Promise<T> ;

  abstract find<T extends { id: string | number }>(type: { prototype: T }, predicate: { [field: string]: any }): Promise<T | null>;

  abstract get<T extends { id: string | number }>(type: { prototype: T }, id: string | number): Promise<T | null>;

  abstract delete(type: Function, id: string | number): Promise<boolean>;
}

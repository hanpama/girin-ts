import { FrameworkDatastore } from '@girin/framework';
import { getRepository } from 'typeorm';


export class TypeORMFrameworkDatastore extends FrameworkDatastore {
  async save<T extends { id: string | number }>(obj: T): Promise<T> {
    await getRepository(obj.constructor).save(obj);
    return obj;
  }

  async find<T extends { id: string | number }>(type: { new(...args: any[]): T }, predicate: { [field: string]: any }): Promise<T | null> {
    const result = await getRepository(type).findOne({ where: { predicate } });
    return result || null;
  }

  async get<T extends { id: string | number }>(type: { new(...args: any[]): T }, id: string | number): Promise<T | null> {
    const result = await getRepository(type).findOne({ where: { id } });
    return result || null;
  }

  async delete(type: Function, id: string | number): Promise<boolean> {
    await getRepository(type).delete(id);
    return true;
  }
}

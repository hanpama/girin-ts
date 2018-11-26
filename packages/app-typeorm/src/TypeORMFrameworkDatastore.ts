import { FrameworkDatastore } from '@girin/framework';
import { getRepository, Brackets, getConnection } from 'typeorm';


export interface TypeORMFrameworkDatastoreConfigs {
  connectionName?: string;
}

export class TypeORMFrameworkDatastore extends FrameworkDatastore {
  constructor(public configs: TypeORMFrameworkDatastoreConfigs) {
    super();
  }

  get connection() {
    return getConnection(this.configs.connectionName);
  }

  protected formatPredicate(entityType: Function, predicate: { [field: string]: any }): Brackets {
    // field names should be alphanumeric
    const predicateFieldPatt = /^[\w\d]+$/;

    const predciateFields = Object.keys(predicate);
    const condition: { fieldName: string, value: any }[] = [];
    for (let i = 0; i < predciateFields.length; i++) {
      const fieldName = predciateFields[i];

      if (!predicateFieldPatt.test(fieldName)) {
        throw new Error('Invalid field name');
      }
      condition.push({ fieldName, value: predicate[fieldName] });
    }

    return new Brackets(qb => {
      condition.forEach(({ fieldName, value }) => qb.andWhere(
        `${fieldName} = :${fieldName}`,
        { [fieldName]: value },
      ));
    });
  }

  async save<T extends { id: string | number }>(obj: T): Promise<T> {
    await getRepository(obj.constructor, this.configs.connectionName).save(obj as any);
    return obj;
  }

  async find<T extends { id: string | number }>(type: { new(...args: any[]): T }, predicate: { [field: string]: any }): Promise<T | null> {
    const brackets = this.formatPredicate(type, predicate);
    const qb = getRepository(type, this.configs.connectionName)
      .createQueryBuilder()
      .where(brackets);
    const result = await qb.getOne();

    // TODO: double check the result matches predicate
    return result || null;
  }

  async get<T extends { id: string | number }>(type: { new(...args: any[]): T }, id: string | number): Promise<T | null> {
    const predicate = { id };
    const brackets = this.formatPredicate(type, predicate);
    const qb = getRepository(type, this.configs.connectionName).createQueryBuilder();
    const result = await qb.where(brackets).getOne();
    return result || null;
  }

  async delete(type: Function, id: string | number): Promise<boolean> {
    const predicate = { id };
    const brackets = this.formatPredicate(type, predicate);
    const qb = getRepository(type, this.configs.connectionName).createQueryBuilder();
    await qb.delete().where(brackets).execute();
    return true;
  }
}

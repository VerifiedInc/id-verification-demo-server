declare module '@feathersjs/rest-client/lib/base' {
  import { Id, NullableId, Paginated, Params, ServiceMethods, ServiceOverloads } from '@feathersjs/feathers';

  type Service<T> = ServiceMethods<T> & ServiceOverloads<T>
  interface BaseInterface<T> extends Service<T> {
    makeUrl(query: any, id: NullableId): string;
    getQuery(query: any): string;
  }
  class Base<T = any> implements BaseInterface<T> {
    options: any;
    name: string;
    connection: any;
    base: string;
    makeUrl(query: any, id: NullableId): string;
    getQuery(query: any): string;
    get (id: NullableId, params?: Params): Promise<T>;
    find (params?: Params): Promise<T[] | Paginated<T>>;
    create (data: Partial<T>, params?: Params): Promise<T>;
    create (data: Partial<T>[], params?: Params): Promise<T[]>;
    update (id: Id, data: T, params?: Params): Promise<T>;
    update (id: null, data: T, params?: Params): Promise<T[]>;
    patch (id: Id, data: Partial<T>, params?: Params): Promise<T>;
    patch (id: null, data: Partial<T>, params?: Params): Promise<T[]>;
    remove (id: Id, params?: Params): Promise<T>;
    remove (id: null, params?: Params): Promise<T[]>;
  }

  export default Base;
}

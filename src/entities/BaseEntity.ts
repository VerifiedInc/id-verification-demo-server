import { Property, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

export interface BaseEntityOptions {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class BaseEntity {
  @PrimaryKey()
  uuid: string;

  @Property()
  createdAt: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date;

  constructor (options: BaseEntityOptions) {
    const { uuid, createdAt, updatedAt } = options;

    this.uuid = uuid || v4();
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || this.createdAt;
  }
}

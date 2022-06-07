import crypto from 'crypto';
import { Entity, Unique, Property, OneToMany, Collection } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface UserEntityOptions extends BaseEntityOptions {
  phone: string;
  firstName?: string;
  did?: string;
  userCode?: string;
}

@Entity({ tableName: 'User' })
export class UserEntity extends BaseEntity {
  constructor (options: UserEntityOptions) {
    super(options);

    // this.email = options.email;
    this.phone = options.phone;
    this.did = options.did;
    this.firstName = options.firstName;
    this.userCode = options.userCode;
  }

  // @Property({ unique: true })
  // email: string;

  @Property()
  phone: string;

  @Property()
  did?: string;

  @Property()
  firstName?: string;

  @Property()
  userCode?: string;
}

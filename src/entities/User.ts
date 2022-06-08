import crypto from 'crypto';
import { Entity, Unique, Property, OneToMany, Collection } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface UserEntityOptions extends BaseEntityOptions {
  phone: string;
  firstName?: string;
  did?: string;
  userCode?: string;
  ssn: string;
  dob: string;
}

@Entity({ tableName: 'User' })
export class UserEntity extends BaseEntity {
  constructor (options: UserEntityOptions) {
    super(options);

    this.phone = options.phone;
    this.did = options.did;
    this.firstName = options.firstName;
    this.userCode = options.userCode;
    this.ssn = options.ssn;
    this.dob = options.dob;
  }

  @Property()
  phone: string;

  @Property()
  dob: string;

  @Property()
  ssn: string;

  @Property()
  did?: string;

  @Property()
  firstName?: string;

  @Property()
  userCode?: string;
}

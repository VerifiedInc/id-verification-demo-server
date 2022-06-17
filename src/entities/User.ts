import crypto from 'crypto';
import { Entity, Unique, Property, OneToMany, Collection } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface UserEntityOptions extends BaseEntityOptions {
  did?: string;
  userCode?: string;

  provePhone: string;
  proveFirstName?: string;
  proveSsn?: string;
  proveDob?: string;

  hvDob?: string;
  hvGender?: string;
  hvFullName?: string;
  hvAddress?: string;
}

@Entity({ tableName: 'User' })
export class UserEntity extends BaseEntity {
  constructor (options: UserEntityOptions) {
    super(options);

    this.did = options.did;
    this.userCode = options.userCode;

    this.provePhone = options.provePhone;
    this.proveFirstName = options.proveFirstName;
    this.proveSsn = options.proveSsn;
    this.proveDob = options.proveDob;

    this.hvDob = options.hvDob;
    this.hvGender = options.hvGender;
    this.hvFullName = options.hvFullName;
    this.hvAddress = options.hvAddress;
  }

  @Property()
  did?: string;

  @Property()
  userCode?: string;

  @Property()
  provePhone: string; // provePhone

  @Property()
  proveDob?: string; // proveDob

  @Property()
  proveSsn?: string; // proveSsn

  @Property()
  proveFirstName?: string;

  @Property()
  proveLastName?: string;

  @Property()
  hvDob?: string;

  @Property()
  hvGender?: string;

  @Property()
  hvFullName?: string;

  @Property()
  hvAddress?: string;
}

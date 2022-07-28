import crypto from 'crypto';
import { Entity, Unique, Property, OneToMany, Collection } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';
import { v4 } from 'uuid';

export interface UserEntityOptions extends BaseEntityOptions {
  did?: string;
  userCode?: string;

  provePhone?: string;
  proveFirstName?: string;
  proveSsn?: string;
  proveDob?: string;

  hvDob?: string;
  hvGender?: string;
  hvFullName?: string;
  hvAddress?: string;

  hvDocImage?: string; // base64
  hvFaceImage?: string; // base64
  hvDocCountry?: string; // i.e. 'usa'
  hvDocType?: string; // i.e. 'dl'
  hvLiveFace?: string;
  hvLiveFaceConfidence?: string;
  hvFaceMatch?: string;
  hvFaceMatchConfidence?: string;
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

    this.hvDocImage = options.hvDocImage;
    this.hvFaceImage = options.hvFaceImage;
    this.hvDocCountry = options.hvDocCountry;
    this.hvDocType = options.hvDocType;
    this.hvLiveFace = options.hvLiveFace;
    this.hvLiveFaceConfidence = options.hvLiveFaceConfidence;
    this.hvFaceMatch = options.hvFaceMatch;
    this.hvFaceMatchConfidence = options.hvFaceMatchConfidence;
    this.userCode = v4();
  }

  @Property()
  did?: string;

  @Property()
  userCode?: string;

  @Property()
  provePhone?: string; // provePhone

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

  @Property({ columnType: 'text' })
  hvDocImage?: string; // base64

  @Property({ columnType: 'text' })
  hvFaceImage?: string; // base64

  @Property()
  hvDocCountry?: string; // i.e. 'usa'

  @Property()
  hvDocType?: string; // i.e. 'dl'

  @Property()
  hvLiveFace?: string;

  @Property()
  hvLiveFaceConfidence?: string;

  @Property()
  hvFaceMatch?: string;

  @Property()
  hvFaceMatchConfidence?: string;
}

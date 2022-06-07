
import { Entity, Unique, Property } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface IssuerEntityOptions extends BaseEntityOptions {
  name: string;
  customerUuid: string;
  issuerUuid: string;
  apiKey: string;
  did: string;
  signingPrivateKey: string;
  encryptionPrivateKey: string;
  signingKeyId: string;
  encryptionKeyId: string;
  authToken: string;
}

@Entity({ tableName: 'Issuer' })
export class IssuerEntity extends BaseEntity {
  constructor (options: IssuerEntityOptions) {
    super(options);

    this.name = options.name;
    this.customerUuid = options.customerUuid;
    this.issuerUuid = options.issuerUuid;
    this.apiKey = options.apiKey;
    this.did = options.did;
    this.signingPrivateKey = options.signingPrivateKey;
    this.encryptionPrivateKey = options.encryptionPrivateKey;
    this.signingKeyId = options.signingKeyId;
    this.encryptionKeyId = options.encryptionKeyId;
    this.authToken = options.authToken;
  }

  @Property()
  name: string;

  @Unique()
  @Property()
  did: string;

  @Property()
  customerUuid: string;

  @Property()
  issuerUuid: string;

  @Property()
  apiKey: string;

  @Property({ columnType: 'text' })
  signingPrivateKey: string;

  @Property({ columnType: 'text' })
  encryptionPrivateKey: string; // not currently used, but opting to store regardless

  @Property({ columnType: 'text' })
  authToken: string;

  @Property()
  signingKeyId: string;

  @Property()
  encryptionKeyId: string;

  // public toDto (): WalletIssuerDto {
  //   return {
  //     uuid: this.uuid,
  //     createdAt: this.createdAt.toISOString(),
  //     updatedAt: this.updatedAt.toISOString(),
  //     customerUuid: this.customerUuid,
  //     issuerUuid: this.issuerUuid,
  //     did: this.did,
  //     name: this.name
  //   };
  // }

  // public clone (): IssuerEntity {
  //   const cloned = new IssuerEntity(this);
  //   return cloned;
  // }
}

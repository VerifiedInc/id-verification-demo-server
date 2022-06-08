import { Migration } from '@mikro-orm/migrations';

export class Migration20220607060025 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "Issuer" ("uuid" varchar(255) not null, "createdAt" timestamptz(0) not null, "updatedAt" timestamptz(0) not null, "name" varchar(255) not null, "did" varchar(255) not null, "customerUuid" varchar(255) not null, "issuerUuid" varchar(255) not null, "apiKey" varchar(255) not null, "signingPrivateKey" text not null, "encryptionPrivateKey" text not null, "authToken" text not null, "signingKeyId" varchar(255) not null, "encryptionKeyId" varchar(255) not null);');
    this.addSql('alter table "Issuer" add constraint "Issuer_pkey" primary key ("uuid");');
    this.addSql('alter table "Issuer" add constraint "Issuer_did_unique" unique ("did");');
  }
}

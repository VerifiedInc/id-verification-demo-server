import { Migration } from '@mikro-orm/migrations';

export class Migration20220607053955 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "User" ("uuid" varchar(255) not null, "createdAt" timestamptz(0) not null, "updatedAt" timestamptz(0) not null, "phone" varchar(255) not null, "did" varchar(255) null, "firstName" varchar(255) null, "userCode" varchar(255) null);');
    this.addSql('alter table "User" add constraint "User_pkey" primary key ("uuid");');
  }

}

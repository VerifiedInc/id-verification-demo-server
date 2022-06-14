import { Migration } from '@mikro-orm/migrations';

export class Migration20220614214951 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" drop constraint if exists "User_dob_check";');
    this.addSql('alter table "User" alter column "dob" type varchar(255) using ("dob"::varchar(255));');
    this.addSql('alter table "User" alter column "dob" drop not null;');
    this.addSql('alter table "User" drop constraint if exists "User_ssn_check";');
    this.addSql('alter table "User" alter column "ssn" type varchar(255) using ("ssn"::varchar(255));');
    this.addSql('alter table "User" alter column "ssn" drop not null;');
  }
}

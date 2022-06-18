import { Migration } from '@mikro-orm/migrations';

export class Migration20220618001729 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" drop constraint if exists "User_provePhone_check";');
    this.addSql('alter table "User" alter column "provePhone" type varchar(255) using ("provePhone"::varchar(255));');
    this.addSql('alter table "User" alter column "provePhone" drop not null;');
  }
}

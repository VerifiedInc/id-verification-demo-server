import { Migration } from '@mikro-orm/migrations';

export class Migration20220616221915 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" rename column "phone" to "provePhone";');

    this.addSql('alter table "User" rename column "firstName" to "proveDob";');

    this.addSql('alter table "User" rename column "dob" to "proveSsn";');

    this.addSql('alter table "User" rename column "ssn" to "proveFirstName";');

    this.addSql('alter table "User" add column "proveLastName" varchar(255) null, add column "hvDob" varchar(255) null, add column "hvGender" varchar(255) null, add column "hvFullName" varchar(255) null, add column "hvAddress" varchar(255) null;');
  }
}

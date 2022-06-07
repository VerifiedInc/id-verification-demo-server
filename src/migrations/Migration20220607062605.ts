import { Migration } from '@mikro-orm/migrations';

export class Migration20220607062605 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "User" add column "dob" varchar(255) not null, add column "ssn" varchar(255) not null;');
  }

}

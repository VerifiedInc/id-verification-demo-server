import { Migration } from '@mikro-orm/migrations';

export class Migration20220719152031 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" add column "hvDocImage" text null, add column "hvFaceImage" text null, add column "hvDocCountry" varchar(255) null, add column "hvDocType" varchar(255) null, add column "hvLiveFace" varchar(255) null, add column "hvLiveFaceConfidence" varchar(255) null, add column "hvFaceMatch" varchar(255) null, add column "hvFaceMatchConfidence" varchar(255) null;');
  }

  async down (): Promise<void> {
    this.addSql('alter table "User" drop column "hvDocImage", drop column "hvFaceImage", drop column "hvDocCountry", drop column "hvDocType", drop column "hvLiveFace", drop column "hvLiveFaceConfidence", drop column "hvFaceMatch", drop column "hvFaceMatchConfidence";');
  }
}

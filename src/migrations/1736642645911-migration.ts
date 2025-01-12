import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736642645911 implements MigrationInterface {
    name = 'Migration1736642645911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "foodId" integer NOT NULL, "triedDate" TIMESTAMP NOT NULL, "notes" character varying, "childId" uuid, CONSTRAINT "PK_9ff4018d66bc4142ac2222a3ad0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "children" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "dateOfBirth" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_8c5a7cbebf2c702830ef38d22b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "food_entries" ADD CONSTRAINT "FK_d673817edc7365c2501902a3e9b" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children" ADD CONSTRAINT "FK_045e714a8906182cae37c8dab89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children" DROP CONSTRAINT "FK_045e714a8906182cae37c8dab89"`);
        await queryRunner.query(`ALTER TABLE "food_entries" DROP CONSTRAINT "FK_d673817edc7365c2501902a3e9b"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "children"`);
        await queryRunner.query(`DROP TABLE "food_entries"`);
    }

}

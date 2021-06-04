import {MigrationInterface, QueryRunner} from "typeorm";

export class Email1622813729603 implements MigrationInterface {
    name = 'Email1622813729603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" ADD "email" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "UQ_2863682842e688ca198eb25c124"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "email"`);
    }

}

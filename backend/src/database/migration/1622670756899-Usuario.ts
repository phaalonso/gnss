import {MigrationInterface, QueryRunner} from "typeorm";

export class Usuario1622670756899 implements MigrationInterface {
    name = 'Usuario1622670756899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "nome" character varying(50) NOT NULL, "nickname" character varying(50) NOT NULL, "senha" character varying NOT NULL, CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "usuario"`);
    }

}

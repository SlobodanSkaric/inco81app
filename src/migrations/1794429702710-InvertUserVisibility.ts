import { MigrationInterface, QueryRunner } from "typeorm";

export class InvertUserVisibility1794429702710 implements MigrationInterface {
    name = 'InvertUserVisibility1794429702710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE \`users\` SET \`visibility\` = 1 - \`visibility\``);
        await queryRunner.query(`ALTER TABLE \`users\` ALTER \`visibility\` SET DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ALTER \`visibility\` SET DEFAULT 0`);
        await queryRunner.query(`UPDATE \`users\` SET \`visibility\` = 1 - \`visibility\``);
    }
}

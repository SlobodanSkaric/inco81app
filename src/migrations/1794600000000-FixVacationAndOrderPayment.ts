import { MigrationInterface, QueryRunner } from "typeorm";

export class FixVacationAndOrderPayment1794600000000 implements MigrationInterface {
    name = "FixVacationAndOrderPayment1794600000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE \`vacations\` SET \`status\` = 1 WHERE \`status\` = 0 OR \`status\` IS NULL
        `);
        await queryRunner.query(`
            UPDATE \`vacations\` v
            INNER JOIN \`users\` u ON u.\`user_id\` = v.\`user_id\`
            SET v.\`vacation_start\` = COALESCE(v.\`vacation_start\`, v.\`created_at\`),
                v.\`vacation_end\` = COALESCE(v.\`vacation_end\`, v.\`created_at\`)
            WHERE v.\`vacation_start\` IS NULL OR v.\`vacation_end\` IS NULL
        `);
        await queryRunner.query(`
            DELETE FROM \`vacations\` WHERE \`user_id\` IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`vacations\`
            MODIFY \`user_id\` INT NOT NULL,
            MODIFY \`vacation_start\` DATETIME NOT NULL,
            MODIFY \`vacation_end\` DATETIME NOT NULL,
            MODIFY \`status\` INT NOT NULL DEFAULT 1
        `);

        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD COLUMN \`payment_status\` ENUM('unpaid', 'paid', 'failed', 'refunded')
            NOT NULL DEFAULT 'unpaid'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`payment_status\``);
        await queryRunner.query(`
            ALTER TABLE \`vacations\`
            MODIFY \`user_id\` INT NULL,
            MODIFY \`vacation_start\` DATETIME NULL,
            MODIFY \`vacation_end\` DATETIME NULL,
            MODIFY \`status\` INT NULL DEFAULT 0
        `);
    }
}

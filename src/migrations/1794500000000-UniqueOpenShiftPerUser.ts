import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueOpenShiftPerUser1794500000000 implements MigrationInterface {
    name = 'UniqueOpenShiftPerUser1794500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Close duplicate open shifts, keep the newest (highest id) per user
        await queryRunner.query(`
            UPDATE \`time_of_worke\` t
            INNER JOIN (
                SELECT \`user_id\`, MAX(\`time_of_worke_id\`) AS keep_id
                FROM \`time_of_worke\`
                WHERE \`checked_out\` IS NULL
                  AND \`status\` = 0
                  AND \`checked_in\` IS NOT NULL
                  AND \`user_id\` IS NOT NULL
                GROUP BY \`user_id\`
                HAVING COUNT(*) > 1
            ) dups ON t.\`user_id\` = dups.\`user_id\`
            SET t.\`checked_out\` = COALESCE(t.\`checked_in\`, CURRENT_TIMESTAMP)
            WHERE t.\`checked_out\` IS NULL
              AND t.\`status\` = 0
              AND t.\`time_of_worke_id\` <> dups.keep_id
        `);

        await queryRunner.query(`
            ALTER TABLE \`time_of_worke\`
            ADD COLUMN \`open_user_id\` INT
            GENERATED ALWAYS AS (
                CASE
                    WHEN \`checked_out\` IS NULL
                     AND \`status\` = 0
                     AND \`checked_in\` IS NOT NULL
                    THEN \`user_id\`
                    ELSE NULL
                END
            ) STORED
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX \`UQ_time_of_worke_open_user\`
            ON \`time_of_worke\` (\`open_user_id\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`UQ_time_of_worke_open_user\` ON \`time_of_worke\``);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` DROP COLUMN \`open_user_id\``);
    }
}

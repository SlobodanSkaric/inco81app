import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShipped1795603589730 implements MigrationInterface {
    name = 'AddShipped1795603589730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`payments\` DROP FOREIGN KEY \`fk_payments_order\`
        `);
        await queryRunner.query(`
            DROP INDEX \`UQ_time_of_worke_open_user\` ON \`time_of_worke\`
        `);
        await queryRunner.query(`
            DROP INDEX \`uq_payments_order_id\` ON \`payments\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`time_of_worke\` CHANGE \`open_user_id\` \`open_user_id\` int AS (
                    CASE
                        WHEN \`checked_out\` IS NULL
                        AND \`status\` = 0
                        AND \`checked_in\` IS NOT NULL THEN \`user_id\`
                        ELSE NULL
                    END
                ) STORED
        `);
        await queryRunner.query(`
            UPDATE \`inco81app\`.\`typeorm_metadata\`
            SET \`value\` = ?
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
                AND \`table\` = ?
        `, ["CASE WHEN `checked_out` IS NULL AND `status` = 0 AND `checked_in` IS NOT NULL THEN `user_id` ELSE NULL END","GENERATED_COLUMN","open_user_id","inco81app","time_of_worke"]);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`order_status\` \`order_status\` enum (
                    'active',
                    'pending',
                    'completed',
                    'cancelled',
                    'shipped'
                ) NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD UNIQUE INDEX \`IDX_b2f7b823a21562eeca20e72b00\` (\`order_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`vacations\` CHANGE \`reason\` \`reason\` varchar(256) NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD CONSTRAINT \`FK_b2f7b823a21562eeca20e72b006\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_b2f7b823a21562eeca20e72b006\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`vacations\` CHANGE \`reason\` \`reason\` varchar(256) NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\` DROP INDEX \`IDX_b2f7b823a21562eeca20e72b00\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`order_status\` \`order_status\` enum ('active', 'pending', 'completed', 'cancelled') NOT NULL DEFAULT 'active'
        `);
        await queryRunner.query(`
            UPDATE \`inco81app\`.\`typeorm_metadata\`
            SET \`value\` = ?
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
                AND \`table\` = ?
        `, ["","GENERATED_COLUMN","open_user_id","inco81app","time_of_worke"]);
        await queryRunner.query(`
            ALTER TABLE \`time_of_worke\` CHANGE \`open_user_id\` \`open_user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`uq_payments_order_id\` ON \`payments\` (\`order_id\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`UQ_time_of_worke_open_user\` ON \`time_of_worke\` (\`open_user_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD CONSTRAINT \`fk_payments_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE
            SET NULL ON UPDATE CASCADE
        `);
    }

}

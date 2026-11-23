import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentsOrderIdAndRefund1794700000000 implements MigrationInterface {
    name = "PaymentsOrderIdAndRefund1794700000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD COLUMN \`order_id\` INT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`uq_payments_order_id\` ON \`payments\` (\`order_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD CONSTRAINT \`fk_payments_order\`
            FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`)
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`payments\` DROP FOREIGN KEY \`fk_payments_order\`
        `);
        await queryRunner.query(`
            DROP INDEX \`uq_payments_order_id\` ON \`payments\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`payments\` DROP COLUMN \`order_id\`
        `);
    }
}

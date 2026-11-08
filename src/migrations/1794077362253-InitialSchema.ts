import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1794077362253 implements MigrationInterface {
    name = 'InitialSchema1794077362253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`time_of_worke\` (\`time_of_worke_id\` int NOT NULL AUTO_INCREMENT, \`date_and_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`checked_in\` datetime NULL, \`checked_out\` datetime NULL, \`status\` int NOT NULL DEFAULT '0', \`user_id\` int NULL, PRIMARY KEY (\`time_of_worke_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`request_log\` (\`request_log_id\` int NOT NULL AUTO_INCREMENT, \`ip\` varchar(255) NULL, \`user_agent\` text NULL, \`accept_language\` varchar(255) NULL, \`device_fingerprint\` text NULL, \`route\` varchar(255) NULL, \`response_status\` int NULL, \`response_time\` int NULL, \`role\` enum ('user', 'administrator', 'superadministrator', 'customer') NULL, \`request_method\` varchar(255) NULL, \`ts\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`user_id\` int NULL, PRIMARY KEY (\`request_log_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job_information\` (\`job_information_id\` int NOT NULL AUTO_INCREMENT, \`job_title\` varchar(255) NOT NULL, \`company_name\` varchar(255) NOT NULL, \`location\` varchar(255) NULL, \`start_date\` date NOT NULL, \`end_date\` date NULL, \`job_description\` text NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`user_id\` int NULL, PRIMARY KEY (\`job_information_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`descriptions\` varchar(255) NULL, \`payment_date\` date NOT NULL, \`status\` enum ('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending', \`note\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL, \`lastname\` varchar(128) NOT NULL, \`email\` varchar(128) NOT NULL, \`password\` varchar(256) NOT NULL, \`phonenumber\` varchar(128) NULL, \`role\` enum ('user', 'administrator', 'superadministrator') NOT NULL DEFAULT 'user', \`manager_id\` int NULL, \`token\` varchar(256) NULL, \`visibility\` int NOT NULL DEFAULT '0', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_3e8a76e8712c22e796f60e6351\` (\`phonenumber\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vacations\` (\`vacation_id\` int NOT NULL AUTO_INCREMENT, \`vacation_start\` datetime NULL, \`vacation_end\` datetime NULL, \`reason\` varchar(256) NOT NULL DEFAULT '0', \`status\` int NOT NULL DEFAULT '0', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`admin_comment\` text NULL, \`user_comment\` text NULL, \`user_id\` int NULL, PRIMARY KEY (\`vacation_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`superprices\` (\`superprices_id\` int NOT NULL AUTO_INCREMENT, \`price_name\` varchar(255) NOT NULL, \`price_value\` decimal(10,2) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`superprices_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`items\` (\`item_id\` int NOT NULL AUTO_INCREMENT, \`item_name\` varchar(255) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`stock_quantity\` int NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`item_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders_items\` (\`order_item_id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`order_id\` int NOT NULL, \`item_id\` int NOT NULL, PRIMARY KEY (\`order_item_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customers\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`customer_name\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`role\` enum ('customer') NOT NULL DEFAULT 'customer', \`contact_email\` varchar(255) NOT NULL, \`phone_number\` varchar(20) NULL, \`address\` varchar(500) NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_0d6aa6ef0e581d1f5f2aaf30f7\` (\`contact_email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`order_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`order_status\` enum ('active', 'pending', 'completed', 'cancelled') NOT NULL DEFAULT 'active', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`payment_method\` enum ('cards', 'delivirs', 'paypal') NOT NULL DEFAULT 'cards', \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`order_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` ADD CONSTRAINT \`FK_aad4efa97c1eba423b9b8f21a1c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`request_log\` ADD CONSTRAINT \`FK_01fd002f639d6b678df73d5c75a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`job_information\` ADD CONSTRAINT \`FK_dfe79888a315664201cd9e3151f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_427785468fb7d2733f59e7d7d39\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_fba2d8e029689aa8fea98e53c91\` FOREIGN KEY (\`manager_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacations\` ADD CONSTRAINT \`FK_7483432adbbf72a858041efdc61\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders_items\` ADD CONSTRAINT \`FK_53c21b56c3eebe5cd88525ccd6e\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`orders_items\` ADD CONSTRAINT \`FK_68e3cca1c18928dc1116b4d79bc\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\`(\`item_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        await queryRunner.query(`ALTER TABLE \`orders_items\` DROP FOREIGN KEY \`FK_68e3cca1c18928dc1116b4d79bc\``);
        await queryRunner.query(`ALTER TABLE \`orders_items\` DROP FOREIGN KEY \`FK_53c21b56c3eebe5cd88525ccd6e\``);
        await queryRunner.query(`ALTER TABLE \`vacations\` DROP FOREIGN KEY \`FK_7483432adbbf72a858041efdc61\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_fba2d8e029689aa8fea98e53c91\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_427785468fb7d2733f59e7d7d39\``);
        await queryRunner.query(`ALTER TABLE \`job_information\` DROP FOREIGN KEY \`FK_dfe79888a315664201cd9e3151f\``);
        await queryRunner.query(`ALTER TABLE \`request_log\` DROP FOREIGN KEY \`FK_01fd002f639d6b678df73d5c75a\``);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` DROP FOREIGN KEY \`FK_aad4efa97c1eba423b9b8f21a1c\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d6aa6ef0e581d1f5f2aaf30f7\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP TABLE \`orders_items\``);
        await queryRunner.query(`DROP TABLE \`items\``);
        await queryRunner.query(`DROP TABLE \`superprices\``);
        await queryRunner.query(`DROP TABLE \`vacations\``);
        await queryRunner.query(`DROP INDEX \`IDX_3e8a76e8712c22e796f60e6351\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP TABLE \`job_information\``);
        await queryRunner.query(`DROP TABLE \`request_log\``);
        await queryRunner.query(`DROP TABLE \`time_of_worke\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchames1783184453789 implements MigrationInterface {
    name = 'InitialSchames1783184453789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`descriptions\` varchar(255) NULL, \`payment_date\` date NOT NULL, \`status\` enum ('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending', \`note\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`userUserId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL DEFAULT '0', \`lastname\` varchar(128) NOT NULL DEFAULT '0', \`email\` varchar(128) NOT NULL DEFAULT '0', \`password\` varchar(256) NOT NULL DEFAULT '0', \`phonenumber\` varchar(128) NOT NULL DEFAULT '0', \`role\` varchar(128) NULL DEFAULT '0', \`token\` varchar(256) NULL DEFAULT '0', \`visibility\` int NOT NULL DEFAULT '0', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`phonenumber\` (\`phonenumber\`), UNIQUE INDEX \`email\` (\`email\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_3e8a76e8712c22e796f60e6351\` (\`phonenumber\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`time_of_worke\` (\`time_of_worke_id\` int NOT NULL AUTO_INCREMENT, \`date_and_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`checked_in\` datetime NULL, \`checked_out\` datetime NULL, \`status\` int NOT NULL DEFAULT '0', \`admin_id\` int NULL, \`user_id\` int NULL, PRIMARY KEY (\`time_of_worke_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job_information\` (\`job_information_id\` int NOT NULL AUTO_INCREMENT, \`job_title\` varchar(255) NOT NULL, \`company_name\` varchar(255) NOT NULL, \`location\` varchar(255) NULL, \`start_date\` date NOT NULL, \`end_date\` date NULL, \`job_description\` text NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`admin_id\` int NULL, PRIMARY KEY (\`job_information_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`administrator\` (\`admin_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL DEFAULT '0', \`lastname\` varchar(128) NOT NULL DEFAULT '0', \`email\` varchar(128) NOT NULL DEFAULT '0', \`password\` varchar(256) NOT NULL DEFAULT '0', \`phonenumber\` varchar(128) NOT NULL DEFAULT '0', \`role\` varchar(128) NOT NULL DEFAULT '0', \`token\` varchar(256) NOT NULL DEFAULT '0', \`visibility\` int NOT NULL DEFAULT '0', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`phonenumber\` (\`phonenumber\`), INDEX \`email\` (\`email\`), UNIQUE INDEX \`IDX_be0ce9bef56d5a30b9e5752564\` (\`email\`), UNIQUE INDEX \`IDX_e0ffc8965b01cedef276b1075f\` (\`phonenumber\`), PRIMARY KEY (\`admin_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vacations\` (\`vacation_id\` int NOT NULL AUTO_INCREMENT, \`vacation_start\` datetime NULL, \`vacation_end\` datetime NULL, \`reason\` varchar(256) NOT NULL DEFAULT '0', \`status\` int NOT NULL DEFAULT '0', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`admin_comment\` text NULL, \`user_comment\` text NULL, \`admin_id\` int NULL, \`user_id\` int NULL, PRIMARY KEY (\`vacation_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`items\` (\`item_id\` int NOT NULL AUTO_INCREMENT, \`item_name\` varchar(255) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`stock_quantity\` int NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`item_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders_items\` (\`order_item_id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`order_id\` int NOT NULL, \`item_id\` int NOT NULL, PRIMARY KEY (\`order_item_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customers\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`customer_name\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`contact_email\` varchar(255) NOT NULL, \`phone_number\` varchar(20) NULL, \`address\` varchar(500) NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_0d6aa6ef0e581d1f5f2aaf30f7\` (\`contact_email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`order_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`order_status\` enum ('active', 'pending', 'completed', 'cancelled') NOT NULL DEFAULT 'active', \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`payment_method\` enum ('cards', 'delivirs', 'paypal') NOT NULL DEFAULT 'cards', \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`order_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`request_log\` ADD CONSTRAINT \`FK_01fd002f639d6b678df73d5c75a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`request_log\` ADD CONSTRAINT \`FK_b51f8ae154bbe09260bc731c33b\` FOREIGN KEY (\`admin_id\`) REFERENCES \`administrator\`(\`admin_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`request_log\` ADD CONSTRAINT \`FK_8c52698a019168078678cec7eb2\` FOREIGN KEY (\`superadministrator_id\`) REFERENCES \`superadministrator\`(\`superadministrator_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_24526171618809c2e8e9cc023f4\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` ADD CONSTRAINT \`FK_d5cf30f2932400ef5e621261475\` FOREIGN KEY (\`admin_id\`) REFERENCES \`administrator\`(\`admin_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` ADD CONSTRAINT \`FK_aad4efa97c1eba423b9b8f21a1c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job_information\` ADD CONSTRAINT \`FK_83285ff21aff46abb3f79993ecc\` FOREIGN KEY (\`admin_id\`) REFERENCES \`administrator\`(\`admin_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacations\` ADD CONSTRAINT \`FK_8d2da64812a4db286bbe1fe2e8d\` FOREIGN KEY (\`admin_id\`) REFERENCES \`administrator\`(\`admin_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE \`vacations\` DROP FOREIGN KEY \`FK_8d2da64812a4db286bbe1fe2e8d\``);
        await queryRunner.query(`ALTER TABLE \`job_information\` DROP FOREIGN KEY \`FK_83285ff21aff46abb3f79993ecc\``);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` DROP FOREIGN KEY \`FK_aad4efa97c1eba423b9b8f21a1c\``);
        await queryRunner.query(`ALTER TABLE \`time_of_worke\` DROP FOREIGN KEY \`FK_d5cf30f2932400ef5e621261475\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_24526171618809c2e8e9cc023f4\``);
        await queryRunner.query(`ALTER TABLE \`request_log\` DROP FOREIGN KEY \`FK_8c52698a019168078678cec7eb2\``);
        await queryRunner.query(`ALTER TABLE \`request_log\` DROP FOREIGN KEY \`FK_b51f8ae154bbe09260bc731c33b\``);
        await queryRunner.query(`ALTER TABLE \`request_log\` DROP FOREIGN KEY \`FK_01fd002f639d6b678df73d5c75a\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d6aa6ef0e581d1f5f2aaf30f7\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP TABLE \`orders_items\``);
        await queryRunner.query(`DROP TABLE \`items\``);
        await queryRunner.query(`DROP TABLE \`vacations\``);
        await queryRunner.query(`DROP INDEX \`IDX_e0ffc8965b01cedef276b1075f\` ON \`administrator\``);
        await queryRunner.query(`DROP INDEX \`IDX_be0ce9bef56d5a30b9e5752564\` ON \`administrator\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`administrator\``);
        await queryRunner.query(`DROP INDEX \`phonenumber\` ON \`administrator\``);
        await queryRunner.query(`DROP TABLE \`administrator\``);
        await queryRunner.query(`DROP TABLE \`job_information\``);
        await queryRunner.query(`DROP TABLE \`time_of_worke\``);
        await queryRunner.query(`DROP INDEX \`IDX_3e8a76e8712c22e796f60e6351\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`phonenumber\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
    }

}

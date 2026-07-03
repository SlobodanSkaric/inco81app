import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: process.env.DATABASE_DIALECT as any || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'root',
    entities: [__dirname + "/src/entitets/entities/*.{ts,js}"],
    migrations: [__dirname + "/src/migrations/*.{ts,js}"],
    synchronize: false, 
    logging: true,
});


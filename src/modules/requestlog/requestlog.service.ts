import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestLogs } from 'src/entitets/entities/RequestLogs';
import { Repository } from 'typeorm';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestlogService implements OnModuleInit, OnModuleDestroy {
    private client: any;
    private isConnected = false;
    private readonly logger = new Logger(RequestlogService.name);

    constructor(
        @InjectRepository(RequestLogs) private readonly logRepository: Repository<RequestLogs>,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit(): Promise<void> {
        try {
            this.client = createClient({ url: this.configService.get<string>("REDIS_URL") || undefined });
            this.client.on('error', (err: Error) => {
                this.logger.error('Redis connection error:', err.message || err);
                this.isConnected = false;
            });

            await this.client.connect();
            this.isConnected = true;
            this.logger.log('Redis client connected successfully');
        } catch (err: any) {
            this.isConnected = false;
            this.logger.warn(`Redis connection failed: ${err.message}. Request logging will be disabled.`);
        }
    }

    async onModuleDestroy(): Promise<void> {
       await this.client.quit();
       console.log('Redis client disconnected in RequestlogService');
    }

    async logRequest(userId: number, event: any): Promise<void> {
        if (!this.isConnected) {
            this.logger.warn(`Redis not connected - skipping log for user ${userId}`);
            return;
        }
        
        try {
            const key = `user:${userId}:events`;
            await this.client.lPush(key, JSON.stringify(event));
            await this.client.lTrim(key, 0, 49);
        } catch (err: any) {
            this.logger.error(`Failed to log request for user ${userId}:`, err.message);
            // Don't throw - logging failure shouldn't break the app
        }
    }
   
    async loadLogs(userId: number): Promise<any[]> {
        if (!this.isConnected) {
            this.logger.warn(`Redis not connected - returning empty logs for user ${userId}`);
            return [];
        }
        
        try {
            const key = `user:${userId}:events`;
            const events = await this.client.lRange(key, 0, 10);
            return events.map((result) => JSON.parse(result));
        } catch (err: any) {
            this.logger.error(`Failed to load logs for user ${userId}:`, err.message);
            return [];
        }
    }
}

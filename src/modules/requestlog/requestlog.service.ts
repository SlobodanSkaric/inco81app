import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestLogs } from 'entitets/entities/RequestLogs';
import { Repository } from 'typeorm';

import { createClient } from 'redis';

@Injectable()
export class RequestlogService implements OnModuleInit,OnModuleDestroy{
    private client;

    constructor(
        @InjectRepository(RequestLogs) private readonly logRepository: Repository<RequestLogs>,
    ) {}

    async onModuleInit(): Promise<void> {
        
            this.client = createClient({url: process.env.REDIS_URL || undefined});
            this.client.on('error', (err: Error) => { console.error('Redis error in RequestlogService:', err.message || err);});

            await this.client.connect();
            console.log('Redis client connected in RequestlogService');
    }

    async onModuleDestroy(): Promise<void> {
       await this.client.quit();
       console.log('Redis client disconnected in RequestlogService');
    }

    async logRequest(userId: number, event: any): Promise<void> {
        const key = `user:${userId}:events`;
        await this.client.lPush(key, JSON.stringify(event));
        await this.client.lTrim(key, 0, 49);
    }
   
    async loadLogs(userId: number): Promise<any[]> {
        const key = `user:${userId}:events`;
        const events = await this.client.lRange(key,0,10);
        return events.map((result) => JSON.parse(result));
    }
}

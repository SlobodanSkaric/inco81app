import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientOptions , RedisClientType} from 'redis';

export interface CacheOptions{
    ttl?: number;
    prefix?: string;
}

export interface  RiskScoreData{
    userId: string;
    score: number;
    flaggedAt: Date;
    reason: string;
}
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient!: RedisClientType;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) {
        this.initializeRedisClient();
    }

    private initializeRedisClient(): void {
        this.logger.log('Initializing Redis client...');
        const redisUrl = this.redisBuidersUrl();
        this.logger.log(`Redis URL: ${this.maskPassword(redisUrl)}`);

        this.redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    const delay = Math.min(retries * 100, 3000);
                    this.logger.warn(`Redis reconnect attempt #${retries}. Retrying in ${delay}ms...`);
                    return delay;
                }
            }
        });

        this.redisClient.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
        });

        this.redisClient.on('connect', () => {
            this.logger.log('Connected to Redis server.');
        });
    }

    async onModuleInit(): Promise<void> {
        try{
            this.logger.log('Connecting to Redis server...');

            await this.redisClient.connect();

            const pong = await this.redisClient.ping();
            this.logger.log(`Redis ping response: ${pong}`);
        }catch(err){
            this.logger.error(`Failed to connect to Redis server: ${err}`);
            throw err
          
        }
    }

    async onModuleDestroy(): Promise<void> {
        this.logger.log('Disconnecting from Redis server...');
        await this.redisClient.quit();
        this.logger.log('Disconnected from Redis server.');
    }

    private redisBuidersUrl(): string {
        const host = this.configService.get<string>('REDIS_HOST');
        const port = this.configService.get<number>('REDIS_PORT');
        const password = this.configService.get<string>('REDIS_PASSWORD');

        let url = ``;
        if (password) {
            url = `redis://:${password}@${host}:${port}`;
        }else{
            url = `redis://${host}:${port}`;
        }
        
        return url;
    }

    private maskPassword(url: string): string {
         return url.replace(/(:.*@)/, ':****@');
    }

    async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
        const ttl = options?.ttl || 3600; // Default TTL of 1 hour
        const prefix = "set:";
        const fullKey = `${prefix}${key}`;

        const result = await this.redisClient.lPush(fullKey, JSON.stringify(value));

        if (result <= 0) {
            this.logger.error(`Failed to set key ${fullKey} in Redis.`);
            return false;
        }

        return true;
    }

    async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
        const prefix = options?.prefix || '';
        const fullKey = `${prefix}${key}`;

        const value = await this.redisClient.get(fullKey);
        return value ? JSON.parse(value) as T : null;
    }

    async delete(key: string, options?: CacheOptions): Promise<void> {
        const prefix = options?.prefix || '';
        const fullKey = `${prefix}${key}`;

        await this.redisClient.del(fullKey);
    }

    async setRiskScore(data: RiskScoreData): Promise<void> {
        const key = `risk_score:${data.userId}`;
        await this.set(key, data, { ttl: 3600 }); // Store for 1 hour
    }

    async getRiskScore(userId: string): Promise<RiskScoreData | null> {
        const key = `risk_score:${userId}`;
        return await this.get<RiskScoreData>(key);
    }

}

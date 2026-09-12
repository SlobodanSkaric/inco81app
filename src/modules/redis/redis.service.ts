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

    async setCache(key: string, value: any, options?: CacheOptions): Promise<boolean> {
        const ttl = options?.ttl || 3600; // Default TTL of 1 hour
        const prefix = "set:cache:";
        const fullKey = `${prefix}${key}`;

        const result = await this.redisClient.set(fullKey, JSON.stringify(value), );
       

        if (result != "OK") {
            this.logger.error(`Failed to set key ${fullKey} in Redis.`);
            return false;
        }

        return true;
    }

    async get<T>(key: string, options?: CacheOptions): Promise<T | T[] | null> {
        const prefix = options?.prefix || '';
        const fullKey = `${prefix}${key}`;

        const values = await this.redisClient.get(fullKey);
       
        if (!values) {
            return null;
        }

        try {
            return JSON.parse(values) as T | T[];
        } catch (error) {
            this.logger.error(`Failed to parse value for key ${fullKey}: ${error}`);
            return null;
        }
    }

    async delete(key: string, options?: CacheOptions): Promise<void> {
        const prefix = options?.prefix || '';
        const fullKey = `${prefix}${key}`;

        await this.redisClient.del(fullKey);
    }

    async clearCacheByPattern(pattern: string, options?: CacheOptions): Promise<number> {
        let deleteCount = 0;
        const prefix = options?.prefix || null;
        let fullKey: string | null = null;

        if(prefix == null){
            fullKey = pattern;
        }else{
            fullKey = `${prefix}${pattern}`
        }


        for await (const key of this.redisClient.scanIterator({
            MATCH: fullKey,
            COUNT: 100,
        })) {
            deleteCount += await this.redisClient.del(key);
        }

        return deleteCount;
    }

    async setRiskScore(data: RiskScoreData): Promise<void> {
        const key = `risk_score:${data.userId}`;
        await this.redisClient.lPush(key, JSON.stringify(data));
    }

    async getRiskScore(userId: string): Promise<RiskScoreData | null> {
        const key = `risk_score:${userId}`;
        const values = await this.redisClient.lRange(key, 0, 0);
        if (!values || values.length === 0) {
            return null;
        }
        return JSON.parse(values[0]) as RiskScoreData;
    }

}

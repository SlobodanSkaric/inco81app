import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { CacheInvalidateService } from './cache/cache.invalidate.services';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';

@Module({
  controllers: [RedisController],
  providers: [RedisService,CacheInvalidateService, CacheRedisIntrceptor],
  exports: [RedisService, CacheRedisIntrceptor],
})
export class RedisModule {}

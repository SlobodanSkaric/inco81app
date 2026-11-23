import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersCleanupService {
    private readonly logger = new Logger(OrdersCleanupService.name);
    private static readonly DEFAULT_TTL_HOURS = 24;

    constructor(
        private readonly ordersService: OrdersService,
        private readonly configService: ConfigService,
    ) {}

    private ttlHours(): number {
        const raw = Number(this.configService.get<string>('PENDING_ORDER_TTL_HOURS'));
        return Number.isFinite(raw) && raw > 0 ? raw : OrdersCleanupService.DEFAULT_TTL_HOURS;
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cancelStalePendingOrders(): Promise<void> {
        try {
            const ttl = this.ttlHours();
            const cancelled = await this.ordersService.cancelExpiredPendingOrders(ttl);
            if (cancelled > 0) {
                this.logger.log(`Cancelled ${cancelled} pending unpaid order(s) older than ${ttl}h`);
            }
        } catch (error) {
            this.logger.error(`Pending order cleanup failed: ${error instanceof Error ? error.message : error}`);
        }
    }
}

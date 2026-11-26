export enum OrdersStatus {
    ACTIVE = "active",
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    SHIPPED = "shipped",
}

export enum OrderPaymentStatus {
    UNPAID = "unpaid",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
}

export enum OrderPaymentMethod {
    CARDS = "cards",
    DELIVIRS = "delivirs",
    PAYPAL = "paypal",
}

/** Allowed transitions for changeOrderStatus. Cancelled is only set via cancelOrder. */
export const ORDER_STATUS_TRANSITIONS: Record<OrdersStatus, readonly OrdersStatus[]> = {
    [OrdersStatus.PENDING]: [OrdersStatus.ACTIVE],
    [OrdersStatus.ACTIVE]: [OrdersStatus.SHIPPED],
    [OrdersStatus.SHIPPED]: [OrdersStatus.COMPLETED],
    [OrdersStatus.COMPLETED]: [],
    [OrdersStatus.CANCELLED]: [],
};

/** Statuses that require payment before transition. */
export const ORDER_STATUSES_REQUIRING_PAYMENT: readonly OrdersStatus[] = [
    OrdersStatus.ACTIVE,
    OrdersStatus.COMPLETED,
];

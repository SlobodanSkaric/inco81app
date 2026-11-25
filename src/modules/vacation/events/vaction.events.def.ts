export class VactionRequestCreatedEvent {
    constructor(
        public readonly requestId: number,
        public readonly userId: number,
        public readonly managerEmail: string | null = null,
    ) {}
}

export class VactionRequestUpdatedEvent {
    constructor(
        public readonly requestId: number,
        public readonly userId: number,
        public readonly userEmail: string,
        public readonly status: string,
        public readonly comments?: string,
    ) {}
}

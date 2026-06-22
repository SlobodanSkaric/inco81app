export class VactionRequestCreatedEvent{
    constructor(public readonly requestId: number,public readonly userId: number ){}
}

export class VactionRequestUpdatedEvent{
    constructor(public readonly requestId: number,public readonly status: string,public readonly comments?: string ){}
}
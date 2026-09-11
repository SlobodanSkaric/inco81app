export class CacheIvalidationEvent{
    constructor(
        public keys: string[],
        public patterns: string[],
        public entity: string,
        public actions: "create" | "update" | "delete"
    ){}
}
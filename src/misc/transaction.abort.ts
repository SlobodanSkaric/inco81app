import { DataSource, EntityManager } from "typeorm";
import { ApiResponse } from "./api.response.dto";

/**
 * Thrown inside a TypeORM transaction to force rollback, then converted
 * back to ApiResponse by runInTransaction / catchTxAbort.
 */
export class TransactionBusinessError extends Error {
    constructor(public readonly response: ApiResponse) {
        super(response.messages);
        this.name = "TransactionBusinessError";
    }
}

export function txAbort(status: string, code: number, messages: string): never {
    throw new TransactionBusinessError(new ApiResponse(status, code, messages));
}

export function isTxAbort(error: unknown): error is TransactionBusinessError {
    return error instanceof TransactionBusinessError;
}

export function catchTxAbort(error: unknown): ApiResponse {
    if (isTxAbort(error)) {
        return error.response;
    }
    throw error;
}

export async function runInTransaction<T>(
    dataSource: DataSource,
    work: (manager: EntityManager) => Promise<T>,
): Promise<T | ApiResponse> {
    try {
        return await dataSource.transaction(work);
    } catch (error) {
        return catchTxAbort(error);
    }
}

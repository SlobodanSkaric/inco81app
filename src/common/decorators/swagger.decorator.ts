import { applyDecorators, Type } from "@nestjs/common";
import {
    ApiCookieAuth,
    ApiExtraModels,
    ApiForbiddenResponse,
    ApiResponse as SwaggerApiResponse,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from "@nestjs/swagger";
import { ApiResponse } from "src/misc/api.response.dto";

export const ACCESS_TOKEN_COOKIE = "access_token";

export function ApiAuth(...roles: string[]) {
    const decorators = [
        ApiCookieAuth(ACCESS_TOKEN_COOKIE),
        ApiUnauthorizedResponse({ description: `Missing or invalid "${ACCESS_TOKEN_COOKIE}" cookie` }),
    ];

    if (roles.length > 0) {
        decorators.push(ApiForbiddenResponse({ description: `Allowed roles: ${roles.join(", ")}` }));
    }

    return applyDecorators(...decorators);
}

interface ApiResultOptions {
    status?: number;
    isArray?: boolean;
    description?: string;
}

/**
 * Services return either the requested data or an `ApiResponse` error object,
 * both with a 2xx status code, so the documented body is a `oneOf` of the two.
 */
export function ApiResult(model?: Type<unknown>, options: ApiResultOptions = {}) {
    const { status = 200, isArray = false, description = "Requested data or ApiResponse error object" } = options;

    const successSchema = !model
        ? { type: "object" }
        : isArray
            ? { type: "array", items: { $ref: getSchemaPath(model) } }
            : { $ref: getSchemaPath(model) };

    return applyDecorators(
        ApiExtraModels(ApiResponse, ...(model ? [model] : [])),
        SwaggerApiResponse({
            status,
            description,
            schema: { oneOf: [successSchema, { $ref: getSchemaPath(ApiResponse) }] },
        }),
    );
}

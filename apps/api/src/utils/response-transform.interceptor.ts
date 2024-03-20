import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Reflector } from "@nestjs/core";

export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const currentStatusCode = context.switchToHttp().getResponse().statusCode;

        const messageFromMetaData = this.reflector.get<string>("response-message", context.getHandler());
        return next.handle().pipe(
            map(item => ({
                status: "success",
                statusCode: currentStatusCode,
                message: messageFromMetaData || item.message || "",
                meta: item?.meta || false,
                data: item?.data || item,
            })),
        );
    }
}

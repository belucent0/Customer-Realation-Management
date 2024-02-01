import { Catch, ExceptionFilter, ArgumentsHost, UnauthorizedException, HttpException } from "@nestjs/common";
import { Response } from "express";
import * as dayjs from "dayjs";

export interface ExceptionResponse {
    timestamp: string;
    path: string;
    statusCode: number;
    message: string;
    result: boolean;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let errorResponse;

        if (exception instanceof UnauthorizedException) {
            errorResponse = {
                timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                path: request.url,
                statusCode: exception.getStatus(),
                message: "인증 정보가 없습니다.",
                result: false,
            };
        } else if (exception instanceof HttpException) {
            const response = exception.getResponse() as ExceptionResponse;

            if (Array.isArray(response.message)) {
                response.message = response.message[0];
            }

            errorResponse = {
                timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                path: request.url,
                statusCode: response.statusCode,
                message: response.message,
                result: false,
            };
        } else if (exception instanceof Error) {
            errorResponse = {
                timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                path: request.url,
                statusCode: 500,
                message: exception.message,
                result: false,
            };
        } else {
            errorResponse = {
                timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                path: request.url,
                statusCode: 500,
                message: "실행중 서버 에러 발생, 관리자에게 문의하세요.",
                result: false,
            };
        }

        response.status(errorResponse.statusCode).json(errorResponse);
    }
}

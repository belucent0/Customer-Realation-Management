import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "src/utils/exception.filter";
import { ConfigService } from "@nestjs/config";
import { LoggingInterceptor } from "src/utils/logging.interceptor";
import { ResponseTransformInterceptor } from "src/utils/response-transform.interceptor";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const PORT = configService.get<number>("port", 3000);
    const APIHOST = configService.get<string>("clientURL");
    const APIMethod = configService.get<string>("APIMethod");

    app.setGlobalPrefix("api");
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalInterceptors(new ResponseTransformInterceptor(new Reflector()));
    app.enableCors({
        origin: APIHOST,
        methods: APIMethod,
        credentials: true,
    });
    await app.listen(PORT);
}
bootstrap();

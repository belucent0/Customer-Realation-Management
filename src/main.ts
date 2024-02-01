import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "exception.filter";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const PORT = configService.get<number>("port", 3000);

    app.setGlobalPrefix("api");
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(PORT);
}
bootstrap();

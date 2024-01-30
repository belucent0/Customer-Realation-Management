import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const PORT = 5000;

    app.setGlobalPrefix("api");

    console.log(`Server started on port ${PORT}`);
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(PORT);
}
bootstrap();

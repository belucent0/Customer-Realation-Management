import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { GroupsModule } from "./groups/groups.module";
import configuration from "./config/configuration";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env",
            isGlobal: true,
            load: [configuration],
        }),
        GroupsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

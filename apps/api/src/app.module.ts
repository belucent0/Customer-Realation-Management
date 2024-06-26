import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { GroupsModule } from "./groups/groups.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { PaymentModule } from "./payment/payment.module";
import { QualificationModule } from './qualification/qualification.module';
import configuration from "./config/configuration";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env",
            isGlobal: true,
            load: [configuration],
        }),
        GroupsModule,
        UsersModule,
        AuthModule,
        PaymentModule,
        QualificationModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

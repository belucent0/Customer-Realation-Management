import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
            global: true,
        }),
    ],
    providers: [AuthService, PrismaService, ConfigService],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}

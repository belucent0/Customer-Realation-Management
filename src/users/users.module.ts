import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaService } from "src/prisma.service";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    controllers: [UsersController],
    providers: [PrismaService, UsersService, AuthService, JwtService],
})
export class UsersModule {}

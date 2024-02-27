import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaService } from "src/prisma.service";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { UsersRepository } from "./users.repository";

@Module({
    controllers: [UsersController],
    providers: [PrismaService, UsersService, AuthService, JwtService, UsersRepository],
})
export class UsersModule {}

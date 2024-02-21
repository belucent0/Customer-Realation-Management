import { Module } from "@nestjs/common";
import { QualificationService } from "./qualification.service";
import { QualificationController } from "./qualification.controller";
import { QualificationRepository } from "./qualification.repository";
import { PrismaService } from "src/prisma.service";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports: [PassportModule.register({ defaultStrategy: "jwt" })],
    controllers: [QualificationController],
    providers: [QualificationService, QualificationRepository, PrismaService],
})
export class QualificationModule {}

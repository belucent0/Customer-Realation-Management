import { Module } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { GroupsController } from "./groups.controller";
import { PrismaService } from "../prisma.service";
import { PassportModule } from "@nestjs/passport";
import { FileUploadService } from "src/providers/file-upload.service";
import { GroupsRepository } from "./groups.repository";

@Module({
    imports: [PassportModule.register({ defaultStrategy: "jwt" })],
    controllers: [GroupsController],
    providers: [GroupsService, PrismaService, FileUploadService, GroupsRepository],
})
export class GroupsModule {}

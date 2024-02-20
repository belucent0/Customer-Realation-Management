import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { PrismaService } from "src/prisma.service";
import { PassportModule } from "@nestjs/passport";
import { PaymentRepository } from "./payment.repository";
import { GroupsRepository } from "src/groups/groups.repository";

@Module({
    imports: [PassportModule.register({ defaultStrategy: "jwt" })],
    controllers: [PaymentController],
    providers: [PaymentService, PrismaService, PaymentRepository, GroupsRepository],
})
export class PaymentModule {}

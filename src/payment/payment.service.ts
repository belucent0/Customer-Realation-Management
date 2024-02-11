import { Injectable } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PrismaService } from "src/prisma.service";
import * as dayjs from "dayjs";

@Injectable()
export class PaymentService {
    constructor(private readonly prisma: PrismaService) {}

    async createPayment(userId: number, createPaymentDto: CreatePaymentDto) {
        try {
            const newPayment = await this.prisma.payment.create({
                data: {
                    userId: userId,
                    groupId: createPaymentDto.groupId,
                    memberId: createPaymentDto.memberId,
                    item: createPaymentDto.item,
                    amount: createPaymentDto.amount,
                    method: createPaymentDto.method,
                    paymentAt: dayjs(createPaymentDto.paymentAt).format().toString(),
                },
            });
            console.log(newPayment, "newPayment");
            return newPayment;
        } catch (error) {
            console.error(error);
            throw new Error("결제 내역 생성에 실패했습니다.");
        }
    }

    findAll() {
        return `This action returns all payment`;
    }

    findOne(id: number) {
        return `This action returns a #${id} payment`;
    }

    update(id: number, updatePaymentDto: UpdatePaymentDto) {
        return `This action updates a #${id} payment`;
    }

    remove(id: number) {
        return `This action removes a #${id} payment`;
    }
}

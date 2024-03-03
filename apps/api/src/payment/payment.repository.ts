import { Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import { PrismaService } from "src/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { Payment, Prisma } from "@prisma/client";
import { FindAllPaymentsDto } from "./dto/find-payment.dto";
import { PaginatedResult } from "src/utils/paginator";

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    //납부 내역 생성
    async createPayment(createPaymentDto: Prisma.PaymentCreateManyInput): Promise<Payment> {
        try {
            const newPayment = await this.prisma.payment.create({
                data: {
                    groupId: createPaymentDto.groupId,
                    memberId: createPaymentDto.memberId,
                    item: createPaymentDto.item,
                    amount: createPaymentDto.amount,
                    method: createPaymentDto.method,
                    paymentAt: dayjs(createPaymentDto.paymentAt).format().toString(),
                },
            });
            return newPayment;
        } catch (error) {
            console.error(error);
            throw new Error("결제 내역 생성에 실패했습니다.");
        }
    }

    // 그룹 내 모든 납부 내역 조회
    async findAllPayments({ page, take, groupId, startDate, endDate }: FindAllPaymentsDto): Promise<PaginatedResult<Payment>> {
        try {
            const [total, allPayments] = await Promise.all([
                this.prisma.payment.count({
                    where: {
                        groupId,
                        paymentAt: {
                            gte: dayjs(startDate).format().toString(),
                            lte: dayjs(endDate).format().toString(),
                        },
                    },
                }),
                this.prisma.payment.findMany({
                    where: {
                        groupId,
                        paymentAt: {
                            gte: dayjs(startDate).format().toString(),
                            lte: dayjs(endDate).format().toString(),
                        },
                    },
                    skip: (page - 1) * take,
                    take,
                }),
            ]);

            const currentPage = page;
            const lastPage = Math.ceil(total / take);

            return {
                data: allPayments,
                meta: { total, currentPage, lastPage, take },
            };
        } catch (error) {
            console.error(error);
            throw new Error("결제 내역 조회에 실패했습니다.");
        }
    }
}

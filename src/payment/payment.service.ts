import { BadRequestException, Injectable } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentRepository } from "./payment.repository";
import { FindAllPaymentsDto } from "./dto/find-payment.dto";
import { PaginatedResult } from "src/utils/paginator";
import { Payment } from "@prisma/client";
import { GroupsRepository } from "src/groups/groups.repository";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly groupsRepository: GroupsRepository,
    ) {}

    // 납부 내역 생성
    async createPayment(userId: number, createPaymentDto: CreatePaymentDto): Promise<Payment> {
        try {
            const memberRole = await this.groupsRepository.findOneMember(userId, createPaymentDto.groupId);

            if (!memberRole) {
                throw new BadRequestException("해당 그룹에 속해있지 않습니다.");
            }

            if (memberRole.role !== "admin" && memberRole.role !== "owner") {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.paymentRepository.createPayment(createPaymentDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("결제 내역 생성에 실패했습니다.");
        }
    }

    // 납부 내역 조회
    async findAllPayments(userId: number, findAllPaymentsDto: FindAllPaymentsDto): Promise<PaginatedResult<Payment>> {
        try {
            const memberRole = await this.groupsRepository.findOneMember(userId, findAllPaymentsDto.groupId);

            if (!memberRole) {
                throw new BadRequestException("해당 그룹에 속해있지 않습니다.");
            }

            if (memberRole.role !== "admin" && memberRole.role !== "owner") {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.paymentRepository.findAllPayments(findAllPaymentsDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("결제 내역 조회에 실패했습니다.");
        }
    }
}

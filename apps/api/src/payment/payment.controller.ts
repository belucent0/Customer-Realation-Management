import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, HttpStatus, Req, Query } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ResMessage } from "src/utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";
import { FindAllPaymentsDto } from "./dto/find-payment.dto";
import { Payment } from "@prisma/client";

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("납부 내역 추가 성공!")
    createPayment(@Req() req, @Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const userId = req.user.id;
        return this.paymentService.createPayment(userId, createPaymentDto);
    }

    @Get()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("납부 내역 조회 성공!")
    findAllPayments(@Req() req, @Query() findAllPaymentsDto: FindAllPaymentsDto) {
        const userId = req.user.id;
        return this.paymentService.findAllPayments(userId, findAllPaymentsDto);
    }
}

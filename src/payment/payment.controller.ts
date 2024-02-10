import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, HttpStatus, Req } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { ResMessage } from "utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("납부 내역 생성!")
    createPayment(@Req() req, @Body() createPaymentDto: CreatePaymentDto) {
        const userId = req.user.id;
        return this.paymentService.createPayment(userId, createPaymentDto);
    }

    @Get()
    findAll() {
        return this.paymentService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.paymentService.findOne(+id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentService.update(+id, updatePaymentDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.paymentService.remove(+id);
    }
}

export class CreatePaymentDto {
    groupId: number;

    item: string;

    amount: number;

    method: string;

    paymentAt: Date;
}

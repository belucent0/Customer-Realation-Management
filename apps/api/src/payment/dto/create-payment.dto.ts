export class CreatePaymentDto {
    groupId: number;

    memberId: number;

    item: string;

    amount: number;

    method: string;

    paymentAt: Date;
}

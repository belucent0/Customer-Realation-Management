import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateGroupDto {
    @IsNotEmpty({ message: "그룹명을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "그룹명은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    groupName: string;
}

export class CreatePaymentDto {
    @IsNotEmpty({ message: "납부 금액을 입력해주세요." })
    @IsString()
    amount: string;

    @IsNotEmpty({ message: "납부일을 입력해주세요." })
    @IsString()
    paymentAt: string;

    @IsNotEmpty({ message: "납부자를 입력해주세요." })
    @IsString()
    payer: string;

    @IsNotEmpty({ message: "납부 내용을 입력해주세요." })
    @IsString()
    content: string;
}

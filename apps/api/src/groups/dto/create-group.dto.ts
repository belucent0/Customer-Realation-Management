import { Transform } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateGroupDto {
    @IsNotEmpty({ message: "그룹명을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "그룹명은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    groupName: string;

    @IsNotEmpty({ message: "그룹 영문명을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "그룹 영문명은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    groupEngName: string;
}

export class CreateMemberDto {
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @IsNotEmpty({ message: "회원번호를 입력해주세요." })
    @Length(1, 30, { message: "회원번호는 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    memberNumber: string;

    @IsNotEmpty({ message: "이름을 입력해주세요." })
    @IsString({ message: "이름은 문자열로 입력해주세요." })
    @Length(1, 20, { message: "이름은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    userName: string;

    joinedAt?: string;

    grade?: string;
    @IsNotEmpty({ message: "이메일을 입력해주세요." })
    @IsEmail({}, { message: "이메일 형식에 맞지 않습니다." })
    @Length(1, 50, { message: "이메일은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    email: string;

    @IsNotEmpty({ message: "휴대전화를 입력해주세요." })
    @IsString()
    @Length(10, 11, { message: "휴대전화는 $constraint1자 혹은 $constraint2자로 입력해주세요." })
    phone: string;

    @IsOptional()
    @Length(5, 6, { message: "우편번호는 $constraint1자 혹은 $constraint2자로 입력해주세요." })
    postalCode?: string;

    @IsString()
    @Length(1, 200, { message: "주소는 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    address1?: string;

    @IsOptional()
    @IsString()
    @Length(1, 200, { message: "상세주소는 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    address2?: string;

    @IsOptional()
    @IsString()
    @Length(1, 10, { message: "회원상태는 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    status?;
}

export class MemberData {
    groupId: number;
    memberNumber: string;
    userName: string;
    joinedAt?: Date;
    grade?: string;
    phone: string;
    email: string;
    postalCode?: string;
    address1?: string;
    address2?: string;
    status?: string;
}

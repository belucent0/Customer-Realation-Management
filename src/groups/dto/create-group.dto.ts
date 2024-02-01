import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length, Max } from "class-validator";

export class CreateGroupDto {
    @IsNotEmpty({ message: "아이디를 입력해주세요." })
    @IsString({ message: "아이디는 문자열로 입력해주세요." })
    @Length(5, 20, { message: "아이디는 $constraint1자 이상 $constraint2자 이하로 입력해주세요." })
    loginId: string;

    @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
    @IsString()
    @Length(6, 20, { message: "비밀번호는 $constraint1자 이상 $constraint2자 이하로 입력해주세요." })
    password: string;

    @IsNotEmpty({ message: "그룹명을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "그룹명은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    groupName: string;

    @IsNotEmpty({ message: "이메일을 입력해주세요." })
    @IsEmail({}, { message: "이메일 형식에 맞지 않습니다." })
    email: string;

    @IsNotEmpty({ message: "연락처를 입력해주세요." })
    // @Length(10, 11, { message: "연락처는 $constraint1자 혹은 $constraint2자로 입력해주세요." })
    @IsPhoneNumber("KR", { message: "휴대전화는 10자 혹은 11자로 입력해주세요." })
    phone: string;
}

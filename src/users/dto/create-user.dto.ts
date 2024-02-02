import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: "아이디를 입력해주세요." })
    @IsString({ message: "아이디는 문자열로 입력해주세요." })
    @Length(5, 20, { message: "아이디는 $constraint1자 이상 $constraint2자 이하로 입력해주세요." })
    loginId: string;

    @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
    @IsString()
    @Length(6, 20, { message: "비밀번호는 $constraint1자 이상 $constraint2자 이하로 입력해주세요." })
    password: string;

    @IsNotEmpty({ message: "이름을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "이름은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    userName: string;

    @IsNotEmpty({ message: "이메일을 입력해주세요." })
    @IsEmail({}, { message: "이메일 형식에 맞지 않습니다." })
    email: string;

    @IsNotEmpty({ message: "휴대전화를 입력해주세요." })
    @IsPhoneNumber("KR", { message: "휴대전화는 10자 혹은 11자로 입력해주세요." })
    phone: string;
}

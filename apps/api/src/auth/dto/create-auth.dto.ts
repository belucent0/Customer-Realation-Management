import { IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "아이디를 입력해주세요." })
    @IsString({ message: "아이디는 문자열로 입력해주세요." })
    @Length(5, 20, { message: "아이디는 $constraint1자 이상 $constraint2자 이하로 입력해주세요." })
    loginId: string;

    @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
    @IsString()
    password: string;
}

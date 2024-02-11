import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateGroupDto {
    @IsNotEmpty({ message: "그룹명을 입력해주세요." })
    @IsString()
    @Length(1, 20, { message: "그룹명은 $constraint1자에서 $constraint2자 사이로 입력해주세요." })
    groupName: string;
}

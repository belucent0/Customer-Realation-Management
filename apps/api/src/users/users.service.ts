import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(createUserDto: CreateUserDto): Promise<{ loginId: string; userName: string }> {
        try {
            const isExist = await this.usersRepository.findUsersInformation(createUserDto);

            // 만약 동일한 값이 존재한다면, isExist의 요소들을 error에 push
            const error = [];
            isExist.forEach(element => {
                if (element.loginId === createUserDto.loginId) {
                    error.push("아이디");
                }
                if (element.email === createUserDto.email) {
                    error.push("이메일");
                }
                if (element.phone === createUserDto.phone) {
                    error.push("휴대전화");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(`${error.join(", ")}의 값을 변경해주세요. 이미 누군가 등록한 정보입니다.`);
            }

            if (isExist.length === 0) {
                const salt = bcrypt.genSaltSync(10);
                createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

                return await this.usersRepository.createUser(createUserDto);
            }
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("회원 등록에 실패했습니다.");
        }
    }
}

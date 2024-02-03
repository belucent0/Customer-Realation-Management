import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const isExist = await this.prisma.user.findMany({
                where: {
                    OR: [
                        { loginId: createUserDto.loginId },
                        { password: createUserDto.password },
                        { userName: createUserDto.userName },
                        { email: createUserDto.email },
                        { phone: createUserDto.phone },
                    ],
                },
            });

            // 만약 동일한 값이 존재한다면, isExist의 요소들을 error에 push
            const error = [];
            isExist.forEach(element => {
                if (element.loginId === createUserDto.loginId) {
                    error.push("아이디");
                }
                if (element.userName === createUserDto.userName) {
                    error.push("이름");
                }
                if (element.email === createUserDto.email) {
                    error.push("이메일");
                }
                if (element.phone === createUserDto.phone) {
                    error.push("휴대전화");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(`${error.join(", ")}의 값을 변경해주세요. 이미 동일한 값을 사용 중입니다.`);
            }

            if (isExist.length === 0) {
                const newUser = await this.prisma.user.create({
                    data: {
                        loginId: createUserDto.loginId,
                        password: createUserDto.password,
                        userName: createUserDto.userName,
                        email: createUserDto.email,
                        phone: createUserDto.phone,
                    },
                });

                return newUser;
            }
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("회원 등록에 실패했습니다.");
        }
    }

    findAll() {
        return `This action returns all users`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
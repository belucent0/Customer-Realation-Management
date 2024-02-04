import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma.service";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

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

    //jwt를 이용한 로그인, bycrypt를 이용한 비밀번호 암호화
    async signin(createUserDto: CreateUserDto): Promise<User> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    loginId: createUserDto.loginId,
                },
            });

            if (!user) {
                throw new BadRequestException("아이디를 확인해주세요.");
            }

            if (user.password !== createUserDto.password) {
                throw new BadRequestException("비밀번호를 확인해주세요.");
            }

            const isPasswordMatch = await bcrypt.compare(createUserDto.password, user.password);

            if (!isPasswordMatch) {
                throw new BadRequestException("비밀번호를 확인해주세요.");
            }

            const accessPayload = { loginId: user.loginId, sub: user.loginId };
            const accessToken = await this.jwtService.sign(accessPayload);

            const userWithToken = { ...user, accessToken };
            return userWithToken;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("로그인에 실패했습니다.");
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

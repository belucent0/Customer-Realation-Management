import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 유저 정보 중복 확인
    async findUsersInformation({
        loginId,
        userName,
        email,
        phone,
    }: CreateUserDto): Promise<{ loginId: string; userName: string; email: string; phone: string }[]> {
        return await this.prisma.user.findMany({
            where: {
                OR: [{ loginId: loginId }, { userName: userName }, { email: email }, { phone: phone }],
            },
        });
    }

    // 유저 생성
    async createUser(createUserDto: CreateUserDto): Promise<{ loginId: string; userName: string }> {
        return await this.prisma.user.create({
            data: {
                loginId: createUserDto.loginId,
                password: createUserDto.password,
                userName: createUserDto.userName,
                email: createUserDto.email,
                phone: createUserDto.phone,
            },
            select: {
                loginId: true,
                userName: true,
            },
        });
    }
}

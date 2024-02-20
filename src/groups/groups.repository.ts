import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class GroupsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 그룹 내 멤버 조회
    async findOneMember(userId: number, groupId: number) {
        const member = await this.prisma.member.findFirst({
            where: {
                groupId,
                userId,
            },
        });

        return member;
    }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class GroupsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 관리자 권한 확인
    async findMembersRole(userId: number, groupId: number) {
        const member = await this.prisma.member.findFirst({
            where: {
                userId,
                groupId,
            },
        });

        return member;
    }
    // 그룹 내 멤버 조회
    async findOneMember(memberId: number, groupId: number) {
        const member = await this.prisma.member.findFirst({
            where: {
                id: memberId,
                groupId,
            },
        });

        return member;
    }
}

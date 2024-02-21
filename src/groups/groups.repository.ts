import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class GroupsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 관리자 권한 확인
    async findMembersRole(userId: number, groupId: number) {
        return await this.prisma.member.findFirst({
            where: {
                userId,
                groupId,
            },
        });
    }

    // 그룹 내 멤버 조회
    async findOneMember(groupId: number, memberNumber: string) {
        return await this.prisma.member.findFirst({
            where: {
                groupId,
                memberNumber,
            },
        });
    }
}

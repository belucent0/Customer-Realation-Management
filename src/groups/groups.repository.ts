import { Injectable } from "@nestjs/common";
import { Group } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class GroupsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 관리자 권한 확인
    async findMembersRole(userId: number, groupId: number) {
        console.log(userId, groupId);
        return await this.prisma.member.findFirst({
            where: {
                userId,
                groupId,
            },
        });
    }

    // 유저가 소유한 그룹 수 조회
    async findGroupsYourOwned(userId: number) {
        return await this.prisma.member.findMany({
            where: {
                userId,
                role: "owner",
            },
            select: {
                groupId: true,
            },
        });
    }

    // 그룹 이름 중복 확인
    async findDuplicateGroupNames(groupName: string) {
        return await this.prisma.group.findFirst({
            where: {
                groupName,
            },
        });
    }

    // 그룹 생성 - 트랜잭션
    async createGroup(userId: number, groupName: string) {
        // 트랜잭션: 그룹 생성 -> 멤버 생성
        const newGroup = await this.prisma.$transaction(async prisma => {
            const group = await prisma.group.create({
                data: {
                    groupName,
                },
            });

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });

            await prisma.member.create({
                data: {
                    userId: userId,
                    groupId: group.id,
                    userName: user.userName,
                    memberNumber: "00000",
                    phone: user.phone,
                    email: user.email,
                    role: "owner",
                    status: "active",
                },
            });

            return group;
        });
        return newGroup;
    }

    // 자신이 소유한 그룹 목록 조회
    async getMyGroups(userId: number): Promise<Group[] | []> {
        return await this.prisma.group.findMany({
            where: {
                Member: {
                    some: {
                        userId,
                    },
                },
            },
            select: {
                id: true,
                groupName: true,
                createdAt: true,
            },
        });
    }

    // 그룹 상세 조회
    async getMyOneGroup(groupId: number): Promise<Group> {
        return await this.prisma.group.findFirst({
            where: {
                id: groupId,
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

    // 그룹 내 멤버 여부 일괄 조회
    async findOurMembers(groupId: number, memberIds: number[]) {
        return await this.prisma.member.findMany({
            where: {
                groupId,
                id: {
                    in: memberIds,
                },
            },
            select: {
                id: true,
                userName: true,
            },
        });
    }
}

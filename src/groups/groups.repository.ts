import { Injectable } from "@nestjs/common";
import { Group, Member } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { CreateMemberDto, MemberData } from "./dto/create-group.dto";

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

    // 멤버 중복 확인(memberNumber, phone, email)
    async findMembers({ groupId, memberNumber, phone, email }: CreateMemberDto): Promise<Member[]> {
        return await this.prisma.member.findMany({
            where: {
                OR: [
                    { groupId, memberNumber },
                    { groupId, phone },
                    { groupId, email },
                ],
            },
        });
    }

    // 멤버 개별 등록
    async addOneMember({ groupId, userName, memberNumber, phone, email, postalCode, address1, address2 }: CreateMemberDto): Promise<Member> {
        return await this.prisma.member.create({
            data: {
                groupId,
                userName,
                memberNumber,
                phone,
                email,
                postalCode: postalCode || "00000",
                address1,
                address2: address2 || "",
                role: "member",
            },
        });
    }

    // 멤버 목록 조회
    async getAllmembers(page: number, take: number, groupId: number) {
        const [members, total] = await Promise.all([
            await this.prisma.member.findMany({
                where: { groupId },
                take,
                skip: (page - 1) * take,
                orderBy: [{ userName: "asc" }, { createdAt: "asc" }],
            }),
            this.prisma.member.count({
                where: { groupId },
            }),
        ]);
        const lastPage = Math.ceil(total / take);

        return { total, currentPage: page, lastPage, members };
    }

    /**
     * ------------------멤버정보 일괄 업로드------------------
     * 1. memberNumber 중복 확인
     * 2. phone 중복 확인
     * 3. email 중복 확인
     * 4. 멤버정보 임시저장
     * 5. 임시저장된 멤버정보 memberNumber 조회 -> tempId 반환
     * -----------------------------------------------------
     */
    // 멤버정보 일괄 업로드 - memberNumber 중복 확인
    async findDuplicateMemberNumbers(groupId: number, memberNumbers: string[]) {
        return await this.prisma.member.findMany({
            where: {
                groupId,
                memberNumber: {
                    in: memberNumbers,
                },
            },
            select: {
                memberNumber: true,
            },
        });
    }

    // 멤버정보 일괄 업로드 - phone 중복 확인
    async findDuplicatePhones(groupId: number, phones: string[]) {
        return await this.prisma.member.findMany({
            where: {
                groupId,
                phone: {
                    in: phones,
                },
            },
            select: {
                phone: true,
            },
        });
    }

    // 멤버정보 일괄 업로드 - email 중복 확인
    async findDuplicateEmails(groupId: number, emails: string[]) {
        return await this.prisma.member.findMany({
            where: {
                groupId,
                email: {
                    in: emails,
                },
            },
            select: {
                email: true,
            },
        });
    }

    // 멤버정보 일괄 업로드 - 멤버정보 임시저장
    async tempSaveBulkMembers(membersData: CreateMemberDto[]) {
        return await this.prisma.member.createMany({
            data: membersData,
        });
    }

    // 멤버정보 일괄 업로드 - 임시저장된 멤버정보 memberNumber 조회 -> tempId 반환
    async findTempBulkMembers(memberNumbers: string[]) {
        return await this.prisma.member.findMany({
            where: {
                memberNumber: {
                    in: memberNumbers,
                },
            },
        });
    }

    /**
     * ------------------멤버정보 일괄 등록------------------
     * 1. 멤버정보 일괄 등록 - 임시저장된 멤버정보 tempId 조회
     * 2. 멤버정보 일괄 등록 - db에 멤버정보 등록
     * -----------------------------------------------------
     */

    // 멤버정보 일괄 등록 - 임시저장된 멤버정보 tempId 조회
    async findTempMembers(tempIds: number[]) {
        return await this.prisma.member.findMany({
            where: {
                id: {
                    in: tempIds,
                },
            },
        });
    }

    // 멤버정보 일괄 등록 - db에 멤버정보 등록
    async registerBulkMembers(newMembers: MemberData[], tempIds: number[]) {
        return await this.prisma.$transaction(async prisma => {
            const members = await prisma.member.createMany({
                data: newMembers,
            });

            await prisma.member.deleteMany({
                where: {
                    id: {
                        in: tempIds,
                    },
                },
            });

            return members;
        });
    }
}

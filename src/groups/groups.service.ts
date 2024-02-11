import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateGroupDto, CreateMemberDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "src/prisma.service";
import { Group } from "./entities/group.entity";
import * as dayjs from "dayjs";

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {}

    async createGroup(userId: number, createGroupDto: CreateGroupDto) {
        try {
            const isExist = await this.prisma.group.findUnique({
                where: { groupName: createGroupDto.groupName },
            });

            if (isExist) {
                throw new BadRequestException("동일한 그룹명이 존재합니다.");
            }

            // 트랜잭션: 그룹 생성 -> 멤버 생성
            const newGroup = await this.prisma.$transaction(async prisma => {
                const group = await prisma.group.create({
                    data: {
                        groupName: createGroupDto.groupName,
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
                        phone: user.phone,
                        email: user.email,
                        address1: user.address1,
                        address2: user.address2 || "",
                        role: "owner",
                    },
                });

                return group;
            });

            return newGroup;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 생성에 실패했습니다.");
        }
    }

    async checkGroupName(groupName: string): Promise<void> {
        try {
            const isExist = await this.prisma.group.findUnique({
                where: { groupName },
            });

            if (isExist) {
                throw new BadRequestException("동일한 그룹명이 존재합니다.");
            }

            return;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹명 중복확인에 실패했습니다.");
        }
    }

    async findAllGroup(): Promise<Group[]> {
        try {
            const groups = await this.prisma.group.findMany();

            console.log(groups);
            return groups;
        } catch (error) {
            console.error(error);
        }
    }

    async findOne(id: number): Promise<Group> {
        try {
            const group = await this.prisma.group.findUnique({
                where: { id: id },
            });

            if (!group) {
                throw new BadRequestException("존재하지 않는 그룹입니다.");
            }

            return group;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 조회에 실패했습니다.");
        }
    }

    async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
        try {
            const updatedGroup = await this.prisma.group.update({
                where: { id: id },
                data: {
                    groupName: updateGroupDto.groupName,
                },
            });

            console.log(updatedGroup, "1updatedGroup");
            return updatedGroup;
        } catch (error) {
            throw new InternalServerErrorException("그룹 수정에 실패했습니다.");
        }
    }

    async remove(id: number): Promise<Group> {
        try {
            const deletedGroup = await this.prisma.group.delete({
                where: { id: id },
            });

            if (!deletedGroup) {
                throw new BadRequestException("존재하지 않는 그룹입니다.");
            }

            return deletedGroup;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 삭제에 실패했습니다.");
        }
    }

    //멤버 개별 추가
    async addOneMember(groupId: number, createMemberDto: CreateMemberDto) {
        try {
            // 그룹에 이미 속해있는지 확인
            const isExist = await this.prisma.member.findMany({
                where: {
                    OR: [
                        { groupId, phone: createMemberDto.phone },
                        { groupId, email: createMemberDto.email },
                    ],
                },
            });

            // 만약 동일한 값이 존재한다면, isExist의 요소들을 error에 push
            const error = [];
            isExist.forEach(element => {
                if (element.phone === createMemberDto.phone) {
                    error.push("휴대전화");
                }
                if (element.email === createMemberDto.email) {
                    error.push("이메일");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(
                    `${error.join(", ")}의 값을 확인해주세요. 이미 동일한 값을 가진 멤버가 존재합니다.`,
                );
            }
            const newMember = await this.prisma.member.create({
                data: {
                    groupId: groupId,
                    userName: createMemberDto.userName,
                    phone: createMemberDto.phone,
                    email: createMemberDto.email,
                    address1: createMemberDto.address1,
                    address2: createMemberDto.address2 || "",
                    role: "member",
                },
            });

            return newMember;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("멤버 추가에 실패했습니다.");
        }
    }
}

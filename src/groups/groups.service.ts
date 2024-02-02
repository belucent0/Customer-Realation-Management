import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "src/prisma.service";
import { Group } from "./entities/group.entity";

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: number, createGroupDto: CreateGroupDto) {
        try {
            const isExist = await this.prisma.group.findMany({
                where: {
                    OR: [{ groupName: createGroupDto.groupName }],
                },
            });

            const error = [];
            isExist.forEach(element => {
                if (element.groupName === createGroupDto.groupName) {
                    error.push("그룹명");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(`${error.join(", ")}의 값을 변경해주세요. 이미 동일한 값을 사용 중입니다.`);
            }

            if (isExist.length === 0) {
                const newGroup = await this.prisma.group.create({
                    data: {
                        groupName: createGroupDto.groupName,
                        Member: {
                            create: {
                                userId: userId,
                                status: "owner",
                            },
                        },
                    },
                });

                return newGroup;
            }
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 생성에 실패했습니다.");
        }
    }

    async findAll(): Promise<Group[]> {
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
}

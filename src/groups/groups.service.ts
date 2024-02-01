import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "src/prisma.service";
import { Group } from "./entities/group.entity";

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createGroupDto: CreateGroupDto): Promise<Group> {
        try {
            const newGroup = await this.prisma.group.create({
                data: {
                    loginId: createGroupDto.loginId,
                    password: createGroupDto.password,
                    groupName: createGroupDto.groupName,
                    email: createGroupDto.email,
                    phone: createGroupDto.phone,
                },
            });

            if (!newGroup) {
                throw new InternalServerErrorException("그룹 생성에 실패했습니다.");
            }
            return newGroup;
        } catch (error) {
            throw error;
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
                    loginId: updateGroupDto.loginId,
                    password: updateGroupDto.password,
                    groupName: updateGroupDto.groupName,
                    email: updateGroupDto.email,
                    phone: updateGroupDto.phone,
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

            return deletedGroup;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 삭제에 실패했습니다.");
        }
    }
}

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
            // createGroupDto로 동일한 logindId, GroupName, email, phone이 존재하는지 확인
            const isExist = await this.prisma.group.findMany({
                where: {
                    OR: [
                        { loginId: createGroupDto.loginId },
                        { groupName: createGroupDto.groupName },
                        { email: createGroupDto.email },
                        { phone: createGroupDto.phone },
                    ],
                },
            });

            // 만약 동일한 값이 존재한다면, isExist의 요소들을 error에 push
            const error = [];
            isExist.forEach(element => {
                if (element.loginId === createGroupDto.loginId) {
                    error.push("아이디");
                }
                if (element.groupName === createGroupDto.groupName) {
                    error.push("그룹명");
                }
                if (element.email === createGroupDto.email) {
                    error.push("이메일");
                }
                if (element.phone === createGroupDto.phone) {
                    error.push("휴대전화");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(`${error.join(", ")}에서 이미 사용중인 값이 존재합니다. 값을 변경해주세요.`);
            }

            if (isExist.length === 0) {
                const newGroup = await this.prisma.group.create({
                    data: {
                        loginId: createGroupDto.loginId,
                        password: createGroupDto.password,
                        groupName: createGroupDto.groupName,
                        email: createGroupDto.email,
                        phone: createGroupDto.phone,
                    },
                });

                return newGroup;
            }
        } catch (error) {
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

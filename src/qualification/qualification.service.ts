import { BadRequestException, Injectable } from "@nestjs/common";
import { AddAttendeeDto, CreateOneActivityDto } from "./dto/create-qualification.dto";
import { QualificationRepository } from "./qualification.repository";
import { FindAllActivityDto, FindOneActivityDto } from "./dto/find-qualification.dto";
import { PaginatedResult } from "src/utils/paginator";
import { Activity, Attendee } from "@prisma/client";
import { GroupsRepository } from "src/groups/groups.repository";

@Injectable()
export class QualificationService {
    constructor(
        private readonly qualificationRepository: QualificationRepository,
        private readonly groupsRepository: GroupsRepository,
    ) {}

    // 행사 등록
    async createOneActivity(userId: number, createOneActivityDto: CreateOneActivityDto) {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, createOneActivityDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.createOneActivity(createOneActivityDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("createActivity error");
        }
    }

    // 행사 목록 조회
    async findActivities(userId: number, findAllActivityDto: FindAllActivityDto): Promise<PaginatedResult<Activity>> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, findAllActivityDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.findActivities(findAllActivityDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("행사 목록 조회에 실패했습니다.");
        }
    }

    // 행사 상세 조회
    async findOneActivity(userId: number, findOneActivityDto: FindOneActivityDto) {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, findOneActivityDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            const activityDetail = await this.qualificationRepository.findOneActivity(findOneActivityDto.activityId);

            if (!activityDetail) {
                throw new BadRequestException("해당 행사가 존재하지 않습니다.");
            }

            // 참석자 목록 조회
            const attendees = await this.qualificationRepository.findAttendees(findOneActivityDto.activityId);

            return {
                activity: activityDetail,
                attendees,
            };
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("행사 상세 조회에 실패했습니다.");
        }
    }

    // 행사 참석자 추가
    async addAttendee(userId: number, addAttendeeDto: AddAttendeeDto): Promise<Attendee> {
        try {
            // 권한 확인
            const memberRole = await this.groupsRepository.findMembersRole(userId, addAttendeeDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            // 그룹의 멤버인지 확인
            const member = await this.groupsRepository.findOneMember(addAttendeeDto.groupId, addAttendeeDto.memberNumber);

            if (!member) {
                throw new BadRequestException("그룹에 존재하지 않는 멤버입니다.");
            }

            // 기존 참석자인지 확인
            const attendee = await this.qualificationRepository.findOneAttendee(addAttendeeDto.activityId, member.id);

            if (attendee) {
                throw new BadRequestException("해당 멤버는 이미 참석자로 등록되어 있습니다.");
            }

            // 참석자 추가
            return await this.qualificationRepository.addAttendee(addAttendeeDto.activityId, member.id);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("행사 참석자 추가에 실패했습니다.");
        }
    }
}

import { BadRequestException, Injectable } from "@nestjs/common";
import { AddAttendeeDto, CreateOneActivityDto } from "./dto/create-qualification.dto";
import { QualificationRepository } from "./qualification.repository";
import { FindAllActivityDto } from "./dto/find-qualification.dto";
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

    // 행사 참석자 추가
    async addAttendee(userId: number, addAttendeeDto: AddAttendeeDto): Promise<Attendee> {
        try {
            // 권한 확인
            const memberRole = await this.groupsRepository.findMembersRole(userId, addAttendeeDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            // 해당 행사 조회
            const activity = await this.qualificationRepository.findOneActivity(addAttendeeDto.activityId);

            if (!activity) {
                throw new BadRequestException("해당 행사가 존재하지 않습니다.");
            }

            // 그룹 내 멤버인지 확인
            const member = await this.groupsRepository.findOneMember(addAttendeeDto.memberId, addAttendeeDto.groupId);

            if (!member) {
                throw new BadRequestException("해당 멤버는 이 그룹에 속해있지 않습니다.");
            }

            // 기존 참석자인지 확인
            const attendee = await this.qualificationRepository.findOneAttendee(memberRole.id, activity.id);

            if (attendee) {
                throw new BadRequestException("이미 참석자로 등록되어 있습니다.");
            }

            // 참석자 추가
            return await this.qualificationRepository.addAttendee(activity.id, memberRole.id);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("행사 참석자 추가에 실패했습니다.");
        }
    }
}

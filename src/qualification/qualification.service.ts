import { BadRequestException, Injectable } from "@nestjs/common";
import {
    AcquireQualificationDto,
    AddAttendeesDto,
    CreateOneActivityDto,
    CreateQualificationDto,
    RenewalCertificateDto,
} from "./dto/create-qualification.dto";
import { QualificationRepository } from "./qualification.repository";
import { FindAllActivityDto, FindOneActivityDto } from "./dto/find-qualification.dto";
import { PaginatedResult } from "src/utils/paginator";
import { Acquisition, Activity, Qualification, Renewal } from "@prisma/client";
import { GroupsRepository } from "src/groups/groups.repository";

@Injectable()
export class QualificationService {
    constructor(
        private readonly qualificationRepository: QualificationRepository,
        private readonly groupsRepository: GroupsRepository,
    ) {}

    // 자격 등록
    async createQualification(userId: number, createQualificationDto: CreateQualificationDto): Promise<Qualification> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, createQualificationDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.createQualification(createQualificationDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("자격 등록에 실패했습니다.");
        }
    }

    // 자격 취득 내역 생성
    async acquireQualification(userId: number, acquireQualificationDto: AcquireQualificationDto): Promise<Acquisition> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, acquireQualificationDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.acquireQualification(acquireQualificationDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("자격 취득 내역 생성에 실패했습니다.");
        }
    }

    // 자격 갱신 내역 생성
    async renewalCertificate(userId: number, renewalCertificateDto: RenewalCertificateDto): Promise<Renewal> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, renewalCertificateDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.renewalCertificate(renewalCertificateDto);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("자격 갱신 내역 생성에 실패했습니다.");
        }
    }

    // 자격 갱신 내역 조회
    async findRenewal(userId: number, acquisitionId: number): Promise<Renewal[]> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, acquisitionId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            return await this.qualificationRepository.findRenewal(acquisitionId);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("자격 갱신 내역 조회에 실패했습니다.");
        }
    }

    // 행사 등록
    async createOneActivity(userId: number, createOneActivityDto: CreateOneActivityDto): Promise<Activity> {
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
            throw new Error("행사 등록에 실패했습니다.");
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
    async findOneActivity(
        userId: number,
        findOneActivityDto: FindOneActivityDto,
    ): Promise<{
        activity: Activity;
        attendees: { id: number; Member: { memberNumber: string; userName: string; phone: string; email: string; grade: string; status: string } }[];
    }> {
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
            const attendees = await this.qualificationRepository.getAllAttendees(findOneActivityDto.activityId);

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

    // 행사 참석자 일괄 추가, 멤버 넘버들을 담은 배열을 받아서, 행사 참석자로 추가
    async addAttendees(userId: number, AddAttendeesDto: AddAttendeesDto): Promise<{ count: number }> {
        try {
            const memberRole = await this.groupsRepository.findMembersRole(userId, AddAttendeesDto.groupId);

            if (!memberRole || (memberRole.role !== "admin" && memberRole.role !== "owner")) {
                throw new BadRequestException("권한이 없습니다.");
            }

            // 그룹 내 멤버인지 확인
            const members = await this.groupsRepository.findOurMembers(AddAttendeesDto.groupId, AddAttendeesDto.memberIds);

            if (members.length !== AddAttendeesDto.memberIds.length) {
                throw new BadRequestException("그룹에 존재하지 않는 멤버를 선택하였습니다.");
            }

            // 참석자 여부 확인
            const foundAttendees = await this.qualificationRepository.findAttendees(AddAttendeesDto.activityId, AddAttendeesDto.memberIds);

            console.log(foundAttendees, "addedAttendees");
            if (foundAttendees.length > 0) {
                throw new BadRequestException(`이미 참석자인 멤버: ${foundAttendees.map(attendee => attendee.Member.userName).join(", ")}`);
            }

            // 참석자 추가
            return await this.qualificationRepository.addAttendees(AddAttendeesDto.activityId, AddAttendeesDto.memberIds);
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw new Error("행사 참석자 일괄 추가에 실패했습니다.");
        }
    }
}

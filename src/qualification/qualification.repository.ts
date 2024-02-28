import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as dayjs from "dayjs";
import { FindAllActivityDto } from "./dto/find-qualification.dto";
import { PaginatedResult } from "src/utils/paginator";
import { Acquisition, Activity, Qualification, Renewal } from "@prisma/client";
import { CreateOneActivityDto, CreateQualificationDto, AcquireQualificationDto, RenewalCertificateDto } from "./dto/create-qualification.dto";

@Injectable()
export class QualificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 자격 등록
    async createQualification({ groupId, title, renewalCycle }: CreateQualificationDto): Promise<Qualification> {
        return await this.prisma.qualification.create({
            data: {
                groupId,
                title,
                renewalCycle,
            },
        });
    }

    // 자격 취득 내역 생성
    async acquireQualification({ memberId, qualificationId, acquiredAt }: AcquireQualificationDto): Promise<Acquisition> {
        return await this.prisma.acquisition.create({
            data: {
                memberId,
                qualificationId,
                acquiredAt: dayjs(acquiredAt).toDate(),
            },
        });
    }

    // 자격 갱신 내역 생성
    async renewalCertificate({ acquisitionId, renewalAt, expiredAt }: RenewalCertificateDto): Promise<Renewal> {
        return await this.prisma.renewal.create({
            data: {
                acquisitionId,
                renewalAt: dayjs(renewalAt).toDate(),
                expiredAt: dayjs(expiredAt).toDate(),
            },
        });
    }

    // 자격 갱신 내역 조회
    async findRenewal(acquisitionId: number): Promise<Renewal[]> {
        return await this.prisma.renewal.findMany({
            where: {
                acquisitionId,
            },
        });
    }

    // 행사 등록
    async createOneActivity({ groupId, category, title, detail, place, meetingAt }: CreateOneActivityDto): Promise<Activity> {
        return await this.prisma.activity.create({
            data: {
                groupId,
                category,
                title,
                detail,
                place,
                meetingAt: dayjs(meetingAt).toDate(),
            },
        });
    }

    // 행사 목록 조회
    async findActivities({ page, take, groupId, startDate, endDate }: FindAllActivityDto): Promise<PaginatedResult<Activity>> {
        try {
            const [total, allActivity] = await Promise.all([
                this.prisma.activity.count({
                    where: {
                        groupId,
                        meetingAt: {
                            gte: dayjs(startDate).toDate(),
                            lte: dayjs(endDate).toDate(),
                        },
                    },
                }),
                this.prisma.activity.findMany({
                    where: {
                        groupId,
                        meetingAt: {
                            gte: dayjs(startDate).toDate(),
                            lte: dayjs(endDate).toDate(),
                        },
                    },
                    skip: (page - 1) * take,
                    take,
                }),
            ]);

            const currentPage = page;
            const lastPage = Math.ceil(total / take);
            return {
                data: allActivity,
                meta: { total, currentPage, lastPage, take },
            };
        } catch (error) {
            console.error(error);
            throw new Error("findAllActivity error");
        }
    }

    // 행사 상세 조회
    async findOneActivity(activityId: number) {
        return await this.prisma.activity.findUnique({
            where: {
                id: activityId,
            },
        });
    }

    // 행사 참석자 추가
    async addAttendee(activityId: number, memberId: number) {
        return await this.prisma.attendee.create({
            data: {
                activityId,
                memberId,
            },
        });
    }

    // 행사 참석자 일괄 추가
    async addAttendees(activityId: number, memberIds: number[]) {
        return await this.prisma.attendee.createMany({
            data: memberIds.map(memberId => ({
                activityId,
                memberId,
            })),
        });
    }

    // 참석자 목록 단순 조회
    async getAllAttendees(activityId: number) {
        return await this.prisma.attendee.findMany({
            where: {
                activityId,
            },

            select: {
                id: true,
                Member: {
                    select: {
                        memberNumber: true,
                        userName: true,
                        phone: true,
                        email: true,
                        grade: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                Member: {
                    userName: "asc",
                },
            },
        });
    }

    // 기존 참석자인지 확인
    async findOneAttendee(activityId: number, memberId: number) {
        return await this.prisma.attendee.findFirst({
            where: {
                memberId,
                activityId,
            },
        });
    }

    // 여러명을 동시에 기존 참석자인지 확인
    async findAttendees(activityId: number, memberIds: number[]) {
        console.log(memberIds, "memberIds");
        return await this.prisma.attendee.findMany({
            where: {
                memberId: {
                    in: memberIds,
                },
                activityId,
            },
            select: {
                Member: {
                    select: {
                        memberNumber: true,
                        userName: true,
                    },
                },
            },
        });
    }
}

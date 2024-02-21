import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as dayjs from "dayjs";
import { FindAllActivityDto } from "./dto/find-qualification.dto";
import { PaginatedResult } from "src/utils/paginator";
import { Activity } from "@prisma/client";
import { CreateOneActivityDto } from "./dto/create-qualification.dto";

@Injectable()
export class QualificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    // 행사 등록
    async createOneActivity({ groupId, category, title, detail, place, meetingAt }: CreateOneActivityDto) {
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

    // 참석자 목록 조회
    async findAttendees(activityId: number) {
        return await this.prisma.attendee.findMany({
            where: {
                activityId,
            },

            select: {
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
}

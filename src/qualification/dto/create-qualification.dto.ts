import { Transform } from "class-transformer";
import { IsInt, IsString } from "class-validator";

export class CreateQualificationDto {
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;
    title: string;

    @Transform(({ value }) => {
        return Number(value);
    })
    renewalCycle: number;
}

export class AcquireQualificationDto {
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    memberId: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    qualificationId: number;

    acquiredAt: Date;
    expiredAt: Date;

    status: string;
}

export class CreateOneActivityDto {
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;
    category: string;
    title: string;
    detail: string;
    place: string;
    meetingAt: Date;
}

export class AddAttendeesDto {
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    activityId: number;

    memberIds: number[];
}

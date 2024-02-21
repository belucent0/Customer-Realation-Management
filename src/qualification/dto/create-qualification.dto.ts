import { Transform } from "class-transformer";
import { IsInt, IsString } from "class-validator";

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

export class AddAttendeeDto {
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
    activityId: number;

    @IsString()
    memberNumber: string;
}

import { Transform } from "class-transformer";
import { IsInt } from "class-validator";

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
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    memberId: number;

    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    activityId: number;
}

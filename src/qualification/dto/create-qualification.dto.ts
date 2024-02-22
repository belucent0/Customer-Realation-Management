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

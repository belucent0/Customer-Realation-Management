import { Transform } from "class-transformer";
import { IsDateString, IsOptional } from "class-validator";

export class FindAllActivityDto {
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    page: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    take: number;

    @IsOptional()
    @IsDateString()
    startDate: Date;

    @IsOptional()
    @IsDateString()
    endDate: Date;
}

export class FindOneActivityDto {
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @Transform(({ value }) => {
        return Number(value);
    })
    activityId: number;
}

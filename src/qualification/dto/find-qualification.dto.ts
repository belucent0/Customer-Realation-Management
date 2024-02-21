import { Transform } from "class-transformer";
import { IsDateString, IsInt } from "class-validator";

export class FindAllActivityDto {
    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    groupId: number;

    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    page: number;

    @IsInt()
    @Transform(({ value }) => {
        return Number(value);
    })
    take: number;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;
}

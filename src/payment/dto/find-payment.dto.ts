import { Transform } from "class-transformer";
import { IsDate, IsDateString, IsInt, isDateString } from "class-validator";

export class FindAllPaymentsDto {
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

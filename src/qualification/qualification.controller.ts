import { Controller, Get, Post, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { QualificationService } from "./qualification.service";
import { AddAttendeeDto, CreateOneActivityDto } from "./dto/create-qualification.dto";
import { FindAllActivityDto } from "./dto/find-qualification.dto";
import { ResMessage } from "src/utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("qualification")
export class QualificationController {
    constructor(private readonly qualificationService: QualificationService) {}

    // 행사 등록
    @Post("activity")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("행사 추가 성공!")
    createOneActivity(@Req() req, @Body() createOneActivityDto: CreateOneActivityDto) {
        return this.qualificationService.createOneActivity(req.user.id, createOneActivityDto);
    }

    // 행사 목록 조회
    @Get("activity")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("행사 조회 성공!")
    findActivities(@Req() req, @Query() findAllActivityDto: FindAllActivityDto) {
        return this.qualificationService.findActivities(req.user.id, findAllActivityDto);
    }

    // 행사 참석자 추가
    @Post("activity/attendee")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("참석자 추가 성공!")
    addAttendee(@Req() req, @Query() addAttendeeDto: AddAttendeeDto) {
        return this.qualificationService.addAttendee(req.user.id, addAttendeeDto);
    }
}

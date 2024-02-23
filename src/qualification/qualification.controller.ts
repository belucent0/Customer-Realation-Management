import { Controller, Get, Post, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { QualificationService } from "./qualification.service";
import { AcquireQualificationDto, AddAttendeesDto, CreateOneActivityDto, CreateQualificationDto } from "./dto/create-qualification.dto";
import { FindAllActivityDto, FindOneActivityDto } from "./dto/find-qualification.dto";
import { ResMessage } from "src/utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("qualification")
export class QualificationController {
    constructor(private readonly qualificationService: QualificationService) {}

    //자격 등록
    @Post()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("자격 추가 성공!")
    createQualification(@Req() req, @Body() createQualificationDto: CreateQualificationDto) {
        return this.qualificationService.createQualification(req.user.id, createQualificationDto);
    }

    // 자격 취득 내역 생성
    @Post("acquisition")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("자격취득 내역 생성 성공!")
    acquireQualification(@Req() req, @Body() acquireQualificationDto: AcquireQualificationDto) {
        return this.qualificationService.acquireQualification(req.user.id, acquireQualificationDto);
    }

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

    // 행사 상세 조회
    @Get("activity/detail")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("행사 상세 조회 성공!")
    findOneActivity(@Req() req, @Query() findOneActivityDto: FindOneActivityDto) {
        return this.qualificationService.findOneActivity(req.user.id, findOneActivityDto);
    }

    // 행사 참석자 일괄 추가
    @Post("activity/attendees")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("참석자 일괄 추가 성공!")
    addAttendees(@Req() req, @Body() addAttendeesDto: AddAttendeesDto) {
        return this.qualificationService.addAttendees(req.user.id, addAttendeesDto);
    }
}

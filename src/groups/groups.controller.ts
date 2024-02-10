import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { CreateGroupDto, CreatePaymentDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { Group } from "@prisma/client";
import { ResMessage } from "utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("groups")
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    //그룹 생성
    @Post()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("그룹 생성 성공!")
    async createGroup(@Req() req, @Body(new ValidationPipe()) createGroupDto: CreateGroupDto): Promise<Group> {
        const userId = req.user.id;
        return await this.groupsService.createGroup(userId, createGroupDto);
    }

    //그룹명 중복확인
    @Post("check")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("사용 가능한 그룹명입니다.")
    async checkGroupName(@Body("groupName") groupName: string) {
        return this.groupsService.checkGroupName(groupName);
    }

    //그룹 목록 조회
    @Get()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("그룹 목록 조회 성공!")
    findAll() {
        return this.groupsService.findAllGroup();
    }

    //그룹 상세 조회
    @Get(":id")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("그룹 상세 조회 성공!")
    findOne(@Param("id", ParseIntPipe) id: number) {
        return this.groupsService.findOne(+id);
    }

    @Patch(":id")
    update(@Param("id", ParseIntPipe) id: number, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.update(+id, updateGroupDto);
    }

    @Delete(":id")
    remove(@Param("id", ParseIntPipe) id: number) {
        return this.groupsService.remove(+id);
    }
}

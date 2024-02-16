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
    Query,
    DefaultValuePipe,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { CreateGroupDto, CreateMemberDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { Group } from "@prisma/client";
import { ResMessage } from "src/utils/response-message.decorator";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "src/providers/file-upload.service";

@Controller("groups")
export class GroupsController {
    constructor(
        private readonly groupsService: GroupsService,
        private fileUploadService: FileUploadService,
    ) {}

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
    @Get(":groupId")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("그룹 상세 조회 성공!")
    findOne(@Param("groupId", ParseIntPipe) groupId: number) {
        return this.groupsService.findOne(+groupId);
    }

    @Patch(":groupId")
    update(@Param("groupId", ParseIntPipe) groupId: number, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.update(+groupId, updateGroupDto);
    }

    @Delete(":groupId")
    remove(@Param("groupId", ParseIntPipe) groupId: number) {
        return this.groupsService.remove(+groupId);
    }

    // 멤버 목록 조회
    @Get(":groupId/members")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("멤버 목록 조회 성공!")
    findAllMembers(
        @Req() req,
        @Param("groupId", ParseIntPipe) groupId: number,
        @Query("page", new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query("take", new DefaultValuePipe(10), ParseIntPipe) take: number,
    ) {
        const userId = req.user.id;
        return this.groupsService.findAllMembers(page, take, userId, groupId);
    }

    // 멤버 개별 등록
    @Post(":groupId/members")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("멤버 등록 성공!")
    addOneMember(@Param("groupId", ParseIntPipe) groupId: number, @Body() createMemberDto: CreateMemberDto) {
        return this.groupsService.addOneMember(groupId, createMemberDto);
    }

    // 멤버 정보 일괄 업로드
    @Post(":groupId/members/bulk")
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor("file"))
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("멤버 등록 성공!")
    async uploadBulkMembers(@Param("groupId", ParseIntPipe) groupId: number, @UploadedFile() file: Express.Multer.File) {
        // const fileName = await this.fileUploadService.uploadFile(file);

        const newMember = await this.groupsService.uploadBulkMembers(groupId, file);

        const result = await this.groupsService.validateBulkMembers(groupId, newMember);

        return result;
    }
}

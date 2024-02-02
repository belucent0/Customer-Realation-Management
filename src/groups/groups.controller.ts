import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ValidationPipe } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Controller("groups")
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Post()
    create(@Body(new ValidationPipe()) createGroupDto: CreateGroupDto) {
        const userId = 1;
        return this.groupsService.create(userId, createGroupDto);
    }

    @Get()
    findAll() {
        return this.groupsService.findAll();
    }

    @Get(":id")
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

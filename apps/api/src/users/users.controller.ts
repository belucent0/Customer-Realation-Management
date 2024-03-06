import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResMessage } from "src/utils/response-message.decorator";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResMessage("회원가입 성공!")
    createUser(@Body() createUserDto: CreateUserDto): Promise<{ loginId: string; userName: string }> {
        const newUser = this.usersService.createUser(createUserDto);
        return newUser;
    }
}

import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.createUser(createUserDto);
    }

    @Post("login")
    login(@Body() createUserDto: CreateUserDto) {
        return this.authService.login(createUserDto);
    }

    @Post("refresh")
    async refreshToken(@Req() req) {
        const refreshToken = req.headers["authorization"].split(" ")[1] as string;
        const userId = await this.authService.validateRefreshToken(refreshToken);

        if (!userId) {
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }

        const newAccessToken = await this.authService.generateAccessTokens(userId);
        return newAccessToken;
    }
}

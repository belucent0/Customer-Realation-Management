import { Body, Controller, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { ResMessage } from "utils/response-message.decorator";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //로그인
    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ResMessage("로그인 성공!")
    login(@Body() createUserDto: CreateUserDto) {
        return this.authService.login(createUserDto);
    }

    //로그아웃
    @Post("logout")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("로그아웃 성공!")
    async logout(@Req() req): Promise<false> {
        const userId = req.user.id;

        if (!userId) {
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }

        await this.authService.logout(userId);
        return false;
    }

    //토큰 재발급
    @Post("refresh")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("토큰 재발급 성공!")
    async refreshToken(@Req() req): Promise<string> {
        const refreshToken = req.headers["authorization"].split(" ")[1] as string;
        const userId = await this.authService.validateRefreshToken(refreshToken);

        if (!userId) {
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }

        const newAccessToken = await this.authService.generateAccessTokens(userId);
        return newAccessToken;
    }
}

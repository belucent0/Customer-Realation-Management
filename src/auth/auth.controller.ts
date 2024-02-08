import { Body, Controller, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { ResMessage } from "utils/response-message.decorator";
import { LoginDto } from "./dto/create-auth.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //로그인
    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ResMessage("로그인 성공!")
    login(@Req() req, @Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    //로그아웃
    @Post("logout")
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.OK)
    @ResMessage("로그아웃 성공!")
    async logout(@Req() req): Promise<false> {
        const userId = req.user.id;
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
        const newAccessToken = await this.authService.generateAccessTokens(refreshToken);
        return newAccessToken;
    }
}

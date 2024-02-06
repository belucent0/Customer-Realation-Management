import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { nanoid } from "nanoid";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {
        super({
            //클라이언트에서 보낸 토큰 검증
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("jwtSecret"),
        });
    }

    // 로그인
    async login(createUserDto: CreateUserDto): Promise<Omit<User, "password"> & { accessToken: string; refreshToken: string }> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    loginId: createUserDto.loginId,
                },
            });

            if (!user) {
                throw new BadRequestException("아이디를 확인해주세요.");
            }

            const isPasswordMatch = await bcrypt.compare(createUserDto.password, user.password);

            if (!isPasswordMatch) {
                throw new BadRequestException("비밀번호를 확인해주세요.");
            }

            //로그인 토큰 생성
            const accessPayload = { userId: user.id };
            const accessToken = await this.jwtService.sign(accessPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
            });

            const refreshPayload = { userId: user.id, tokenVersion: nanoid() };
            const refreshToken = await this.jwtService.sign(refreshPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("refreshTokenExpiresIn"),
            });

            await this.prisma.token.upsert({
                where: { userId: user.id },
                create: {
                    token: refreshToken,
                    tokenVer: refreshPayload.tokenVersion,
                    userId: user.id,
                },
                update: {
                    token: refreshToken,
                    tokenVer: refreshPayload.tokenVersion,
                },
            });

            const { password, ...result } = user;

            return {
                ...result,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("로그인에 실패했습니다.");
        }
    }

    //로그아웃
    async logout(userId: number): Promise<void> {
        try {
            // 토큰 버전항목에 있던 값을 삭제함
            await this.prisma.token.update({
                where: { userId },
                data: { tokenVer: "" },
            });

            return;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("로그아웃에 실패했습니다.");
        }
    }

    //액세스 토큰 발급
    async generateAccessTokens(userId: number): Promise<string> {
        const accessPayload = { userId };
        const accessToken = await this.jwtService.sign(accessPayload, {
            secret: this.configService.get<string>("jwtSecret"),
            expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
        });

        return accessToken;
    }

    //토큰 검증
    async validate(payload: any): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            throw new UnauthorizedException("인증 정보가 없습니다. 다시 로그인해주세요.");
        }

        return user;
    }

    //리프레시 토큰 검증
    async validateRefreshToken(refreshToken: string): Promise<number> {
        try {
            const { userId, tokenVersion } = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("jwtSecret"),
            });

            const tokenInfo = await this.prisma.token.findUnique({
                where: { userId },
            });

            if (!tokenInfo || tokenInfo.tokenVer !== tokenVersion) {
                throw new UnauthorizedException("토큰이 유효하지 않습니다.");
            }

            const user = await this.prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
            }

            return user.id;
        } catch (error) {
            console.error(error);
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }
    }
}

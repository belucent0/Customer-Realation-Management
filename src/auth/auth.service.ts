import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as dayjs from "dayjs";
import { LoginDto } from "./dto/create-auth.dto";

@Injectable()
export class AuthService extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true, // 토큰 만료 검사를 수동 진행
            secretOrKey: configService.get<string>("jwtSecret"),
        });
    }

    // 로그인
    async login(loginDto: LoginDto): Promise<Omit<User, "password"> & { accessToken: string; refreshToken: string }> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    loginId: loginDto.loginId,
                },
            });

            if (!user) {
                throw new BadRequestException("아이디를 확인해주세요.");
            }

            const isPasswordMatch = await bcrypt.compare(loginDto.password, user.password);

            if (!isPasswordMatch) {
                throw new BadRequestException("비밀번호를 확인해주세요.");
            }

            //로그인 토큰 생성
            const nowInKST = dayjs();
            const iatInKST = nowInKST.format();
            const expInKST = nowInKST.add(parseInt(this.configService.get<string>("refreshTokenExpiresIn")), "s").format();

            const accessPayload = { userId: user.id };
            const accessToken = await this.jwtService.sign(accessPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
            });

            const refreshPayload = { userId: user.id };
            const refreshToken = await this.jwtService.sign(refreshPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("refreshTokenExpiresIn"),
            });

            await this.prisma.token.create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    issuedAt: iatInKST,
                    expiresAt: expInKST,
                    isRevoked: 0,
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
            const token = await this.prisma.token.findMany({
                where: {
                    userId,
                    isRevoked: 0,
                },
            });

            if (!token) {
                throw new InternalServerErrorException("로그아웃에 실패했습니다.");
            }

            await this.prisma.token.updateMany({
                where: {
                    userId,
                },
                data: {
                    isRevoked: 1,
                },
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("로그아웃에 실패했습니다.");
        }
    }

    //토큰 검증
    async validate(payload: any): Promise<User> {
        try {
            if (!payload.userId) {
                throw new UnauthorizedException("인증 정보가 없습니다. 다시 로그인해주세요.");
            }

            if (dayjs(payload.exp).isAfter(dayjs())) {
                throw new UnauthorizedException("인증이 만료되었습니다. 다시 로그인해주세요.");
            }

            const user = await this.prisma.user.findUnique({
                where: {
                    id: payload.userId,
                },
            });

            if (!user) {
                throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
            }

            return user;
        } catch (error) {
            console.error(error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException("사용자 인증에 실패하였습니다. 다시 로그인해주세요.");
        }
    }

    //리프레시 토큰으로 액세스 토큰 재발급
    async generateAccessTokens(refreshToken: string): Promise<string> {
        try {
            const tokenInfo = await this.prisma.token.findFirst({
                where: {
                    token: refreshToken,
                    isRevoked: 0,
                },
            });

            if (!tokenInfo || tokenInfo.token !== refreshToken) {
                throw new UnauthorizedException("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
            }

            const accessPayload = { userId: tokenInfo.userId };
            const accessToken = await this.jwtService.sign(accessPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
            });

            return accessToken;
        } catch (error) {
            console.error(error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException("사용자 인증에 실패하였습니다. 다시 로그인해주세요.");
        }
    }
}

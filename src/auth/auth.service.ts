import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
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
            //클라이언트에서 보낸 토큰 검증
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
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
            const expInKST = nowInKST.add(await this.configService.get<number>("accessTokenExpiresIn"), "s").format();

            const accessPayload = { userId: user.id };
            const accessToken = await this.jwtService.sign(accessPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
            });

            const refreshPayload = { userId: user.id, iatInKST: iatInKST, expInKST };
            const refreshToken = await this.jwtService.sign(refreshPayload, {
                secret: this.configService.get<string>("jwtSecret"),
                expiresIn: this.configService.get<string>("refreshTokenExpiresIn"),
            });

            const abc1 = await this.jwtService.verify(accessToken, {
                secret: this.configService.get<string>("jwtSecret"),
            });
            console.log(abc1, "액세스 토큰 검증 완료", refreshPayload);

            // abc1.exp은 유닉스타임프이므로 이것을 dayjs로 변환하여 사용
            console.log(dayjs(abc1.exp * 1000).format(), "액세스 토큰 검증 완료", dayjs().format());
            const abc = await this.prisma.token.create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    issuedAt: refreshPayload.iatInKST,
                    expiresAt: refreshPayload.expInKST,
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
            const token = await this.prisma.token.findFirst({
                where: {
                    userId,
                    isRevoked: 0,
                },
            });

            if (!token) {
                throw new BadRequestException("로그아웃에 실패했습니다.");
            }

            await this.prisma.token.update({
                where: {
                    id: token.id,
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

    //액세스 토큰 재발급
    async generateAccessTokens(userId: number): Promise<string> {
        console.log(userId, "토큰 재발급 중");
        const accessPayload = { userId };
        const accessToken = await this.jwtService.sign(accessPayload, {
            secret: this.configService.get<string>("jwtSecret"),
            expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
        });

        return accessToken;
    }

    //토큰 검증
    async validate(payload: any): Promise<User> {
        console.log(dayjs(payload.expInKST).isBefore(dayjs()), "토큰 검증 중");
        console.log(dayjs(payload.expInKST).format(), "토큰 검증 중", dayjs().format());
        if (!payload.userId) {
            throw new UnauthorizedException("인증 정보가 없습니다. 다시 로그인해주세요.");
        }

        if (!payload.iatInKST || !payload.expInKST) {
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }

        if (dayjs(payload.expInKST).isBefore(dayjs())) {
            throw new UnauthorizedException("토큰이 만료되었습니다. 재발급해주세요");
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
        });

        console.log(payload);

        if (!user) {
            throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
        }

        return user;
    }

    //리프레시 토큰 검증
    async validateRefreshToken(refreshToken: string): Promise<number> {
        try {
            const { userId } = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("jwtSecret"),
            });

            const tokenInfo = await this.prisma.token.findFirst({
                where: {
                    token: refreshToken,
                },
            });

            if (!tokenInfo || tokenInfo.token !== refreshToken) {
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

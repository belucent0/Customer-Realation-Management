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

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const isExist = await this.prisma.user.findMany({
                where: {
                    OR: [
                        { loginId: createUserDto.loginId },
                        { userName: createUserDto.userName },
                        { email: createUserDto.email },
                        { phone: createUserDto.phone },
                    ],
                },
            });

            // 만약 동일한 값이 존재한다면, isExist의 요소들을 error에 push
            const error = [];
            isExist.forEach(element => {
                if (element.loginId === createUserDto.loginId) {
                    error.push("아이디");
                }
                if (element.userName === createUserDto.userName) {
                    error.push("이름");
                }
                if (element.email === createUserDto.email) {
                    error.push("이메일");
                }
                if (element.phone === createUserDto.phone) {
                    error.push("휴대전화");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(`${error.join(", ")}의 값을 변경해주세요. 이미 동일한 값을 사용 중입니다.`);
            }

            if (isExist.length === 0) {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

                const newUser = await this.prisma.user.create({
                    data: {
                        loginId: createUserDto.loginId,
                        password: hashedPassword,
                        userName: createUserDto.userName,
                        email: createUserDto.email,
                        phone: createUserDto.phone,
                    },
                });

                return newUser;
            }
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("회원 등록에 실패했습니다.");
        }
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

            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
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

    //액세스 토큰 발급
    async generateAccessTokens(userId: number) {
        const accessPayload = { userId };
        const accessToken = await this.jwtService.sign(accessPayload, {
            secret: this.configService.get<string>("jwtSecret"),
            expiresIn: this.configService.get<string>("accessTokenExpiresIn"),
        });

        return accessToken;
    }

    //토큰 검증
    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            throw new UnauthorizedException("인증 정보가 없습니다. 다시 로그인해주세요.");
        }

        return user;
    }

    //리프레시 토큰 검증
    async validateRefreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("jwtSecret"),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId },
            });

            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
            }

            return user.id;
        } catch (error) {
            console.error(error);
            throw new UnauthorizedException("토큰이 유효하지 않습니다. 다시 로그인해주세요.");
        }
    }
}

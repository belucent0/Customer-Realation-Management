import { BadRequestException, Injectable } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("jwtSecret"),
        });
    }
    //Passport가 JWT 해독 후 호출하는 메소드
    async validate(payload) {
        const { login_id } = payload;

        //JWT해독하기
        const user = await this.usersService.findOne(login_id);

        if (!user) {
            throw new BadRequestException("사용자 인증 정보가 없습니다.");
        }

        return user;
    }
}

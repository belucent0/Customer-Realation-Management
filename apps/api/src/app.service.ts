import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
    constructor(private configService: ConfigService) {}

    getHello(): string {
        const name = this.configService.get<string>("NAME");
        return `Hello ${name}!`;
    }
}

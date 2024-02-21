import { Injectable } from "@nestjs/common";
import { UpdateQualificationDto } from "./dto/update-qualification.dto";
import { PrismaService } from "src/prisma.service";
import { CreateActivityDto } from "./dto/create-qualification.dto";

@Injectable()
export class QualificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createActivity({ groupId, category, title, detail, place, meetingAt }: CreateActivityDto) {
        return await this.prisma.activity.create({
            data: {
                groupId,
                category,
                title,
                detail,
                place,
                meetingAt: "2021-10-10T00:00:00.000Z",
            },
        });
    }

    findAll() {
        return `This action returns all qualification`;
    }

    findOne(id: number) {
        return `This action returns a #${id} qualification`;
    }

    update(id: number, updateQualificationDto: UpdateQualificationDto) {
        return `This action updates a #${id} qualification`;
    }

    remove(id: number) {
        return `This action removes a #${id} qualification`;
    }
}

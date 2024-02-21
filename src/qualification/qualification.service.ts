import { Injectable } from "@nestjs/common";
import { CreateActivityDto, CreateQualificationDto } from "./dto/create-qualification.dto";
import { UpdateQualificationDto } from "./dto/update-qualification.dto";
import { QualificationRepository } from "./qualification.repository";

@Injectable()
export class QualificationService {
    constructor(private readonly qualificationRepository: QualificationRepository) {}

    async createActivity(createActivityDto: CreateActivityDto) {
        try {
            return await this.qualificationRepository.createActivity(createActivityDto);
        } catch (error) {
            console.error(error);
            throw new Error("createActivity error");
        }
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

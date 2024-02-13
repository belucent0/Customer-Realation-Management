import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { nanoid } from "nanoid";
import { Multer } from "multer";

@Injectable()
export class FileUploadService {
    private s3: S3;

    constructor() {
        this.s3 = new S3();
    }

    async uploadFile(file: Multer.File) {
        const fileName = `${nanoid()}_${file.originalname}`;
        const params = {
            Bucket: "my-crm-bucket",
            Key: fileName,
            Body: file.buffer,
        };

        await this.s3.upload(params).promise();

        return fileName;
    }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { nanoid } from "nanoid";

@Injectable()
export class FileUploadService {
    private s3Client: S3Client;

    constructor(private configService: ConfigService) {
        // AWS S3 클라이언트 인스턴스 생성
        this.s3Client = new S3Client({
            region: this.configService.get<string>("awsRegion"),
            credentials: {
                accessKeyId: this.configService.get<string>("awsAccessKeyId"),
                secretAccessKey: this.configService.get<string>("awsSecretAccessKey"),
            },
        });
    }

    async uploadFile(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("파일이 첨부되지 않았습니다.");
        }
        try {
            const folder = "devExcelFiles";
            const fileName = `${folder}/${nanoid()}_${file.originalname}`;
            const command = new PutObjectCommand({
                Bucket: this.configService.get<string>("awsS3BucketName"),
                Key: fileName,
                Body: file.buffer,
            });

            await this.s3Client.send(command);
            console.log("파일이 성공적으로 업로드되었습니다.");
            return fileName;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("파일 업로드 중 오류가 발생했습니다.");
        }
    }
}

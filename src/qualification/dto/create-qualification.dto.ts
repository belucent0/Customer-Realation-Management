export class CreateQualificationDto {}

export class CreateActivityDto {
    groupId: number;
    category: string;
    title: string;
    detail: string;
    place: string;
    meetingAt: Date;
}

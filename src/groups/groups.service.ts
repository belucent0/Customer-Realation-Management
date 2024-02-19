import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateGroupDto, CreateMemberDto, MemberData } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "src/prisma.service";
import { Group } from "./entities/group.entity";
import * as XLSX from "xlsx";
import * as dayjs from "dayjs";

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {}

    async createGroup(userId: number, createGroupDto: CreateGroupDto) {
        try {
            const isExistOwner = await this.prisma.member.findMany({
                where: { userId, role: "owner" },
            });

            if (isExistOwner.length > 1) {
                throw new BadRequestException("현재 플랜에서 2개 이상의 그룹을 생성할 수 없습니다.");
            }

            const isExist = await this.prisma.group.findUnique({
                where: { groupName: createGroupDto.groupName },
            });

            if (isExist) {
                throw new BadRequestException("동일한 그룹명이 존재합니다.");
            }

            // 트랜잭션: 그룹 생성 -> 멤버 생성
            const newGroup = await this.prisma.$transaction(async prisma => {
                const group = await prisma.group.create({
                    data: {
                        groupName: createGroupDto.groupName,
                    },
                });

                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                });

                await prisma.member.create({
                    data: {
                        userId: userId,
                        groupId: group.id,
                        userName: user.userName,
                        memberNumber: "00000",
                        phone: user.phone,
                        email: user.email,
                        postalCode: user.postalCode,
                        address1: user.address1,
                        address2: user.address2 || "",
                        role: "owner",
                        status: "active",
                    },
                });

                return group;
            });

            return newGroup;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 생성에 실패했습니다.");
        }
    }

    async checkGroupName(groupName: string): Promise<void> {
        try {
            const isExist = await this.prisma.group.findUnique({
                where: { groupName },
            });

            if (isExist) {
                throw new BadRequestException("동일한 그룹명이 존재합니다.");
            }

            return;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹명 중복확인에 실패했습니다.");
        }
    }

    async findAllGroup(): Promise<Group[]> {
        try {
            const groups = await this.prisma.group.findMany();

            console.log(groups);
            return groups;
        } catch (error) {
            console.error(error);
        }
    }

    async findOne(id: number): Promise<Group> {
        try {
            const group = await this.prisma.group.findUnique({
                where: { id: id },
            });

            if (!group) {
                throw new BadRequestException("존재하지 않는 그룹입니다.");
            }

            return group;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 조회에 실패했습니다.");
        }
    }

    async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
        try {
            const updatedGroup = await this.prisma.group.update({
                where: { id: id },
                data: {
                    groupName: updateGroupDto.groupName,
                },
            });

            console.log(updatedGroup, "1updatedGroup");
            return updatedGroup;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("그룹 수정에 실패했습니다.");
        }
    }

    async remove(id: number): Promise<Group> {
        try {
            const deletedGroup = await this.prisma.group.delete({
                where: { id: id },
            });

            if (!deletedGroup) {
                throw new BadRequestException("존재하지 않는 그룹입니다.");
            }

            return deletedGroup;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("그룹 삭제에 실패했습니다.");
        }
    }

    //멤버 개별 등록
    async addOneMember(groupId: number, createMemberDto: CreateMemberDto) {
        try {
            const isExist = await this.prisma.member.findMany({
                where: {
                    OR: [
                        { groupId, memberNumber: createMemberDto.memberNumber },
                        { groupId, phone: createMemberDto.phone },
                        { groupId, email: createMemberDto.email },
                    ],
                },
            });

            const error = [];
            isExist.forEach(element => {
                if (element.memberNumber === createMemberDto.memberNumber) {
                    error.push("회원고유번호");
                }
                if (element.phone === createMemberDto.phone) {
                    error.push("휴대전화");
                }
                if (element.email === createMemberDto.email) {
                    error.push("이메일");
                }
            });

            if (error.length > 0) {
                throw new BadRequestException(
                    `${error.join(", ")}의 값을 확인해주세요. 이미 동일한 값을 가진 멤버가 존재합니다.`,
                );
            }
            const newMember = await this.prisma.member.create({
                data: {
                    groupId: groupId,
                    userName: createMemberDto.userName,
                    memberNumber: createMemberDto.memberNumber,

                    phone: createMemberDto.phone,
                    email: createMemberDto.email,
                    postalCode: createMemberDto.postalCode || "00000",
                    address1: createMemberDto.address1,
                    address2: createMemberDto.address2 || "",
                    role: "member",
                },
            });

            return newMember;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("멤버 등록에 실패했습니다.");
        }
    }

    //멤버 목록 조회
    async findAllMembers(page: number, take: number, userId: number, groupId: number) {
        try {
            const isExist = await this.prisma.member.findFirst({
                where: { groupId, userId },
            });

            if (!isExist) {
                throw new BadRequestException("해당 그룹에 속해있지 않습니다.");
            }

            // role이 owner 혹은 admin인 멤버가 아니면 에러
            if (isExist.role !== "owner" && isExist.role !== "admin") {
                throw new BadRequestException("멤버 목록 조회 권한이 없습니다.");
            }

            const [members, total] = await Promise.all([
                await this.prisma.member.findMany({
                    where: { groupId },
                    take,
                    skip: (page - 1) * take,
                    orderBy: [{ userName: "asc" }, { createdAt: "asc" }],
                }),
                this.prisma.member.count({
                    where: { groupId },
                }),
            ]);
            const lastPage = Math.ceil(total / take);

            return { total, currentPage: page, lastPage, members };
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("멤버 조회에 실패했습니다.");
        }
    }

    // 멤버 정보 업로드 - 엑셀 파싱 및 컬럼명 확인
    async uploadBulkMembers(groupId: number, file: Express.Multer.File) {
        try {
            const group = await this.prisma.group.findUnique({
                where: { id: groupId },
            });

            if (!group) {
                throw new BadRequestException("존재하지 않는 그룹입니다.");
            }

            if (!file) {
                throw new BadRequestException("파일이 첨부되지 않았습니다.");
            }

            const workbook: XLSX.WorkBook = XLSX.read(file.buffer, { type: "buffer" }); //엑셀 파일을 버퍼로 읽어옴
            const sheetName = workbook.SheetNames[0];
            const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName]; //첫번쨰 Sheet 선택
            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 엑셀 데이터를 json으로 변환

            const excelFormatColums = [
                "회원고유번호",
                "이름",
                "가입일",
                "회원등급",
                "연락처",
                "이메일",
                "우편번호",
                "기본주소",
                "상세주소",
                "상태",
            ];
            const uploadColumns: string[] = (jsonData[0] as string[]).slice(0, excelFormatColums.length); // 업로드한 컬럼명을 가져옴

            if (excelFormatColums.length !== uploadColumns.length) {
                throw new BadRequestException("엑셀 파일의 컬럼 수가 일치하지 않습니다. 지정 양식 확인 후 다시 업로드 해주세요.");
            }

            const notMatchedColumns = uploadColumns.filter(uploadColumn => {
                return !excelFormatColums.some(requiredColumn => uploadColumn.includes(requiredColumn));
            });

            if (notMatchedColumns.length > 0) {
                throw new BadRequestException(
                    `${notMatchedColumns.join(", ")}의 컬럼명이 일치하지 않습니다. 지정 양식 확인 후 다시 업로드 해주세요.`,
                );
            }

            let uploadRows = jsonData.slice(1) as any[];

            const firstEmptyIndex = uploadRows.findIndex(row => row.length === 0);
            uploadRows = firstEmptyIndex === -1 ? uploadRows : uploadRows.slice(0, firstEmptyIndex);

            if (uploadRows.length > 1000) {
                throw new BadRequestException("업로드 오류 : 한 번에 1000개 이하의 행만 업로드할 수 있습니다.");
            }

            const newMembers = [];
            const requiredColumns = [
                "memberNumber",
                "userName",
                "joinedAt",
                "grade",
                "phone",
                "email",
                "postalCode",
                "address1",
                "address2",
                "status",
            ];

            for (const uploadRow of uploadRows) {
                const member = {};

                requiredColumns.forEach((column, index) => {
                    member[column] = uploadRow[index];
                });
                newMembers.push(member);
            }

            if (newMembers.length === 0) {
                throw new BadRequestException("업로드할 멤버가 존재하지 않습니다.");
            }

            return newMembers;
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("멤버 등록에 실패했습니다.");
        }
    }

    // 멤버 정보 일괄 업로드 - 멤버 정보 유효성 검사
    async validateBulkMembers(groupId: number, newMembers: MemberData[]) {
        console.log(newMembers[0].joinedAt, "newMembers");
        const allColumns = [
            { memberNumber: "회원고유번호" },
            { userName: "이름" },
            { joinedAt: "가입일" },
            { grade: "회원등급" },
            { phone: "연락처" },
            { email: "이메일" },
            { postalCode: "우편번호" },
            { address1: "기본주소" },
            { address2: "상세주소" },
            { status: "상태" },
        ];
        const essentailColumns = ["memberNumber", "userName", "phone", "email"];
        const stringColumns = ["userName", "joinedAt", "grade", "address1", "address2", "status"];

        const passedRows = [];
        const errorColumns = [];

        try {
            const duplicatedMemberNumbers = (
                await this.prisma.member.findMany({
                    where: {
                        groupId,
                        memberNumber: {
                            in: newMembers.map(member => member.memberNumber),
                        },
                    },
                    select: {
                        memberNumber: true,
                    },
                })
            ).map(member => member.memberNumber);

            const duplicatedPhoneNumbers = (
                await this.prisma.member.findMany({
                    where: {
                        groupId,
                        phone: {
                            in: newMembers.map(member => member.phone),
                        },
                    },
                    select: {
                        phone: true,
                    },
                })
            ).map(member => member.phone);

            const duplicatedEmails = (
                await this.prisma.member.findMany({
                    where: {
                        groupId,
                        email: {
                            in: newMembers.map(member => member.email),
                        },
                    },
                    select: {
                        email: true,
                    },
                })
            ).map(member => member.email);

            for (const [index, member] of newMembers.entries()) {
                let hasError = false;

                const duplicatedInExcel = newMembers.filter(
                    (row, idx) => idx !== index && row.memberNumber === member.memberNumber,
                );

                if (duplicatedInExcel.length > 0) {
                    const duplicateRows = duplicatedInExcel.map(row => newMembers.indexOf(row) + 2);
                    errorColumns.push(
                        `${index + 2}행-회원고유번호 중복: ${duplicatedInExcel[0].memberNumber}는 이미 ${duplicateRows.join(",")}행에서 기재했습니다.`,
                    );
                    hasError = true;
                }

                if (duplicatedMemberNumbers.includes(member.memberNumber)) {
                    errorColumns.push(
                        `${index + 2}행-회원고유번호 중복: ${member.memberNumber}는 이미 시스템에 등록된 회원고유번호입니다.`,
                    );
                    hasError = true;
                }

                // 연락처 중복
                if (duplicatedPhoneNumbers.includes(member.phone)) {
                    errorColumns.push(`${index + 2}행-연락처 중복: ${member.phone}는 이미 시스템에 등록된 연락처입니다.`);
                    hasError = true;
                }

                // 연락처 엑셀 내부간 중복
                const duplicatedPhoneInExcel = newMembers.filter((row, idx) => idx !== index && row.phone === member.phone);

                if (duplicatedPhoneInExcel.length > 0) {
                    const duplicateRows = duplicatedPhoneInExcel.map(row => newMembers.indexOf(row) + 2);
                    errorColumns.push(
                        `${index + 2}행-연락처 중복: ${duplicatedPhoneInExcel[0].phone}는 이미 ${duplicateRows.join(",")}행에서 기재했습니다.`,
                    );
                    hasError = true;
                }

                // 이메일 중복
                if (duplicatedEmails.includes(member.email)) {
                    errorColumns.push(`${index + 2}행-이메일 중복: ${member.email}는 이미 시스템에 등록된 이메일입니다.`);
                    hasError = true;
                }

                // 이메일 엑셀 내부간 중복
                const duplicatedEmailInExcel = newMembers.filter((row, idx) => idx !== index && row.email === member.email);

                if (duplicatedEmailInExcel.length > 0) {
                    const duplicateRows = duplicatedEmailInExcel.map(row => newMembers.indexOf(row) + 2);
                    errorColumns.push(
                        `${index + 2}행-이메일 중복: ${duplicatedEmailInExcel[0].email}는 이미 ${duplicateRows.join(",")}행에서 기재했습니다.`,
                    );
                    hasError = true;
                }

                //필수 항목 누락 체크
                const emptyColumns = essentailColumns.filter(column => !member[column]);
                if (emptyColumns.length > 0) {
                    emptyColumns.forEach(column => {
                        allColumns.forEach(columnName => {
                            if (columnName[column]) {
                                errorColumns.push(`${index + 2}행-${columnName[column]} 누락: 입력 필수 항목입니다.`);
                            }
                        });
                    });
                    hasError = true;
                }

                //문자열 타입 체크
                stringColumns.forEach(column => {
                    if (member[column] && typeof member[column] !== "string") {
                        errorColumns.push(
                            `${index + 2}행-${allColumns.find(col => col[column])[column]} 오류: 문자열로 입력해주세요.`,
                        );
                        hasError = true;
                    }
                });

                //이름 길이 체크
                if (member.userName && member.userName.length > 20) {
                    errorColumns.push(`${index + 2}행-이름 오류: 20자 이내로 입력해주세요.`);
                    hasError = true;
                }

                // 연락처 10자리 혹은 11자리 숫자 체크
                if (member.phone && !/^\d{10}$|^\d{11}$/.test(member.phone)) {
                    errorColumns.push(`${index + 2}행-연락처 오류: 10자리 혹은 11자리 숫자로 입력해주세요.`);
                    hasError = true;
                }

                // 이메일 형식 체크
                if (member.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(member.email)) {
                    errorColumns.push(`${index + 2}행-이메일 오류: 이메일 형식에 맞게 입력해주세요.`);
                    hasError = true;
                }

                //우편번호 5자리 혹은 6자리 숫자 체크
                if (member.postalCode && !/^\d{5}$|^\d{6}$/.test(member.postalCode)) {
                    errorColumns.push(`${index + 2}행-우편번호 오류: 5자리 혹은 6자리 숫자만 입력해주세요.`);
                    hasError = true;
                }

                // 기본주소 길이 체크
                if (member.address1 && member.address1.length > 100) {
                    errorColumns.push(`${index + 2}행-기본주소 오류: 100자 이하로 입력해주세요.`);
                    hasError = true;
                }

                // 상세주소 길이 체크
                if (member.address2 && member.address2.length > 100) {
                    errorColumns.push(`${index + 2}행-상세주소 오류: 100자 이하로 입력해주세요.`);
                    hasError = true;
                }

                if (!hasError) {
                    passedRows.push(member);
                }
            }

            if (errorColumns.length > 0) {
                return { passedRows: [], errorColumns };
            }

            const tempIds = await this.tempSaveBulkMembers(groupId, passedRows);

            return { tempIds, passedRows };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("멤버 정보 검증에 실패했습니다.");
        }
    }

    // 멤버 정보 일괄 업로드 - 임시 테이블 멤버 정보 저장
    async tempSaveBulkMembers(groupId: number, validatedMemberData: MemberData[]) {
        try {
            const membersData = validatedMemberData.map(member => ({
                groupId: groupId,
                memberNumber: member.memberNumber,
                userName: member.userName,
                joinedAt: dayjs(member.joinedAt).toISOString(),
                grade: member.grade,
                phone: member.phone,
                email: member.email,
                postalCode: member.postalCode || "00000",
                address1: member.address1,
                address2: member.address2 || "",
                status: member.status || "active",
            }));

            await this.prisma.tempMember.createMany({
                data: membersData,
            });

            const tempIds = (
                await this.prisma.tempMember.findMany({
                    where: {
                        memberNumber: {
                            in: membersData.map(member => member.memberNumber),
                        },
                    },
                    select: {
                        id: true,
                    },
                })
            ).map(member => member.id);

            return tempIds;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("멤버 등록에 실패했습니다.");
        }
    }

    // 멤버 정보 일괄 등록
    async registerBulkMembers(groupId: number, tempIds: number[]) {
        try {
            console.log(tempIds, "tempIds");
            const tempMembers = await this.prisma.tempMember.findMany({
                where: {
                    id: {
                        in: tempIds,
                    },
                },
            });

            console.log(tempMembers, "tempMembers");

            const newMembers = tempMembers.map(member => ({
                groupId: groupId,
                memberNumber: member.memberNumber,
                userName: member.userName,
                joinedAt: member.joinedAt,
                grade: member.grade,
                phone: member.phone,
                email: member.email,
                postalCode: member.postalCode,
                address1: member.address1,
                address2: member.address2,
                status: member.status,
            }));

            await this.prisma.member.createMany({
                data: newMembers,
            });

            await this.prisma.tempMember.deleteMany({
                where: {
                    id: {
                        in: tempIds,
                    },
                },
            });

            return newMembers;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("멤버 등록에 실패했습니다.");
        }
    }
}

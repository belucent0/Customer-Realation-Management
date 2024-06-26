"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContainer, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGroupAPI } from "../../../../apis";

export default function GroupFormPage() {
    const [groupName, setGroupName] = useState("");
    const [groupEngName, setGroupEngName] = useState("");

    const router = useRouter();

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault();

        try {
            const result = await createGroupAPI(groupName, groupEngName);

            if (result.status === "success") {
                alert(result.message);
                router.push("/groups");
                router.refresh();
            }

            if (result.statusCode === 400) {
                alert(result.message);
            }

            if (result.statusCode === 500) {
                alert("서버 요청에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error: any | Error) {
            console.error(error);
            alert("서버 요청에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <>
            <Card className="w-[450px]">
                <CardContainer className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-2xl">그룹 생성</CardTitle>
                        <CardDescription>생성할 그룹명을 입력해주세요.</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="groupName">그룹명</Label>
                                    <Input
                                        id="groupName"
                                        placeholder="생성할 그룹명을 입력해주세요."
                                        required
                                        type="text"
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value.trim())}
                                    />

                                    {/* <div className="flex justify-end">
                                        <Button type="submit">중복 확인</Button>
                                    </div> */}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="groupEngName">그룹 영문명</Label>
                                    <Input
                                        id="groupEngName"
                                        placeholder="생성할 그룹 영문명을 입력해주세요."
                                        required
                                        type="text"
                                        value={groupEngName}
                                        onChange={e => setGroupEngName(e.target.value.trim())}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="button" className="w-full" variant="outline">
                                <Link href="/groups">뒤로가기</Link>
                            </Button>
                            <div className="p-1" />
                            <Button type="submit" className="w-full">
                                생성하기
                            </Button>
                        </CardFooter>
                    </form>
                </CardContainer>
            </Card>
        </>
    );
}

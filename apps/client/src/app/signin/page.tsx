"use client";

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card, CardContainer } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function signInPage() {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSubmit = async (event: SyntheticEvent) => {
        console.log("로그인 시도");
        event.preventDefault();

        const res = await signIn("credentials", {
            loginId,
            password,
            redirect: false,
        });

        if (res?.error) {
            alert(res.error);
        }

        if (res?.ok) {
            router.push("/");
        }
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     credentials: "include",
        //     body: JSON.stringify({ loginId, password }),
        // });

        // const result = await response.json();

        // if (response.ok) {
        //     console.log("로그인 성공");
        //     console.log(result.data);

        //     // 토큰 조회 및 저장
        //     const token = result.data.accessToken;
        //     // 쿠키 저장
        //     document.cookie = `accessToken=${token}`;

        //     alert("로그인 성공");
        //     router.push("/");
        // } else {
        //     console.log("로그인 실패");
        //     alert(result.message);
        // }
    };

    return (
        <Card className="w-[450px]">
            <CardContainer>
                <CardHeader>
                    <CardTitle className="text-2xl">로그인</CardTitle>
                    <CardDescription>서비스 이용을 위해 아이디와 비밀번호를 입력해주세요.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="loginID">아이디</Label>
                            <Input
                                id="loginId"
                                placeholder="아이디를 입력하세요."
                                required
                                type="text"
                                value={loginId}
                                onChange={e => setLoginId(e.target.value)}
                            />
                        </div>
                        <div className="py-1" />
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                placeholder="8~15자리 영문+숫자+특수문자 조합"
                                required
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="py-2" />
                        <Button type="submit" className="w-full">
                            로그인
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <div className="flex-1" />
                    <Link href="/signUp">
                        <Label className="text-neutral-500 underline-offset-4 hover:underline">아이디 찾기</Label>
                    </Link>
                    <div className="mr-2" />
                    <Link href="/forgotPassword">
                        <Label className="text-neutral-500 underline-offset-4 hover:underline">비밀번호 찾기</Label>
                    </Link>
                </CardFooter>
            </CardContainer>
        </Card>
    );
}

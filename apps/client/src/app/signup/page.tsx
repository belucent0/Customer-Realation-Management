"use client";

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card, CardContainer } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

export default function signupPage() {
    const [loginId, setId] = useState("");
    const [password, setPassword] = useState("");
    const [checkingPassword, setCheckingPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const router = useRouter();

    const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault();

        if (password !== checkingPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            console.log("회원가입 시도");

            const response = await fetch(`${serverURL}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ loginId, password, userName, phone, email }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log(result.data);
                alert(result.message);
                router.push("/signin");
            } else {
                console.log(result);
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("회원가입에 실패했습니다.");
        }
    };

    return (
        <>
            <Card className="w-[450px]">
                <CardContainer className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-2xl">회원가입</CardTitle>
                        <CardDescription>서비스 사용을 위해 회원 정보를 입력하세요.</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loginID">아이디</Label>
                                    <Input
                                        id="loginID"
                                        placeholder="5~20자 사이의 영문+숫자 조합"
                                        required
                                        type="text"
                                        value={loginId}
                                        // value="example123"
                                        onChange={e => setId(e.target.value.trim())}
                                    />
                                    {/* <Button onClick={checkDuplicateId}>아이디 중복 확인</Button> */}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">비밀번호</Label>
                                    <Input
                                        id="password"
                                        placeholder="8~15자리 영문+숫자+특수문자 조합"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value.trim())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">비밀번호 확인</Label>
                                    <Input
                                        id="checkingPassword"
                                        placeholder="8~15자리 영문+숫자+특수문자 조합"
                                        required
                                        type="password"
                                        value={checkingPassword}
                                        onChange={e => setCheckingPassword(e.target.value.trim())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userName">이름</Label>
                                    <Input
                                        id="userName"
                                        placeholder="ex) 홍길동"
                                        required
                                        type="text"
                                        value={userName}
                                        onChange={e => setUserName(e.target.value.trim())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">휴대전화</Label>
                                    <Input
                                        id="phone"
                                        placeholder="'-'제외 숫자만"
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">이메일</Label>
                                    <Input
                                        id="email"
                                        placeholder="m@example.com"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value.trim())}
                                    />
                                </div>
                            </div>
                            {/* <div className="flex items-center space-x-2">
                                <Checkbox id="terms" />
                                <label
                                    className="py-5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    htmlFor="terms"
                                >
                                    이용 약관에 동의합니다.
                                </label>
                            </div> */}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">
                                가입하기
                            </Button>
                        </CardFooter>
                    </form>
                </CardContainer>
            </Card>
        </>
    );
}

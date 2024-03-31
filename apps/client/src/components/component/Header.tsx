"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Cat } from "lucide-react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

type props = {
    session: Session | null;
};

export const Header = ({ session }: props) => {
    const jwt = session?.accessToken;

    const pathname = useParams<{ groupEngName: string }>();

    const groupEngName = pathname?.groupEngName;

    return (
        <>
            <header className="sticky top-0 z-50 min-w-[500px] w-full flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
                <nav className="flex flex-row items-center justify-between text-sm md:text-sm font-sm w-full sm:gap-6">
                    {/* 창 축소시 네비바 각 항목이 잘리면 아래 gap-조정 */}
                    <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
                        <Link href={jwt ? "/groups" : "/"} className="flex items-center gap-2 mr-2 text-base md:text-lg md:mr-6 font-semibold ">
                            <Cat className="h-6 w-6" />
                            회원 관리
                            <span className="sr-only">Acme Inc</span>
                        </Link>

                        {/* 세션이 없으면 그룹x, 있으면 그룹o, groupEngName까지 있으면 그룹x */}
                        {!jwt ? null : (
                            <>
                                {!groupEngName && (
                                    <Link href={`/groups`} className="text-foreground transition-colors hover:text-foreground">
                                        그룹
                                    </Link>
                                )}
                            </>
                        )}

                        {/* 세션 있고 그룹 영문명이 있으면 다음 항목을 보여줌 */}
                        {jwt && groupEngName ? (
                            <>
                                <Link href={`/groups/${groupEngName}/member`} className="text-foreground transition-colors hover:text-foreground">
                                    회원
                                </Link>
                                <Link href={`/groups/${groupEngName}/activity`} className="text-foreground transition-colors hover:text-foreground">
                                    행사
                                </Link>
                                <Link href={`/groups/${groupEngName}/payment`} className="text-foreground transition-colors hover:text-foreground">
                                    회비
                                </Link>
                                <Link
                                    href={`/groups/${groupEngName}/qualification`}
                                    className="text-foreground transition-colors hover:text-foreground ml-auto"
                                >
                                    자격
                                </Link>
                            </>
                        ) : null}
                    </div>
                    <div className="flex gap-1 sm:gap-4 md:gap-6 ml-10">
                        {jwt ? (
                            <button
                                onClick={() => {
                                    signOut();
                                }}
                                className="text-foreground transition-colors hover:text-foreground"
                            >
                                로그아웃
                            </button>
                        ) : (
                            <a href="/signin" className="text-foreground transition-colors hover:text-foreground">
                                로그인
                            </a>
                        )}
                        {jwt ? (
                            <Link href="/settings" className="text-foreground transition-colors hover:text-foreground">
                                설정
                            </Link>
                        ) : (
                            <Link href="/signup" className="text-foreground transition-colors hover:text-foreground">
                                회원가입
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
};

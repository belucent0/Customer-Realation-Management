"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Cat } from "lucide-react";

type props = {
    session: Session | null;
};

export const Header = ({ session }: props) => {
    const jwt = session?.accessToken;

    return (
        <>
            <header className="sticky top-0 z-50 min-w-[500px] w-full flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
                <nav className="flex flex-row items-center justify-between text-sm md:text-sm font-sm w-full px-2 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/" className="flex items-center gap-2 mr-2 md:mr-6 text-lg font-semibold md:text-base">
                            <Cat className="h-6 w-6" />
                            <span className="sr-only">Acme Inc</span>
                        </Link>
                        <Link href="/groups" className="text-foreground transition-colors hover:text-foreground">
                            메인
                        </Link>
                        <Link href="/groups/member" className="text-foreground transition-colors hover:text-foreground">
                            멤버
                        </Link>
                        <Link href="/groups/member" className="text-foreground transition-colors hover:text-foreground">
                            모임
                        </Link>
                        <Link href="/groups/payment" className="text-foreground transition-colors hover:text-foreground">
                            회비
                        </Link>
                        <Link href="/groups/qualification" className="text-foreground transition-colors hover:text-foreground ml-auto">
                            자격
                        </Link>
                    </div>
                    <div className="flex gap-4 sm:gap-6 ml-10">
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
                            <Link href="/mypage" className="text-foreground transition-colors hover:text-foreground">
                                마이페이지
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

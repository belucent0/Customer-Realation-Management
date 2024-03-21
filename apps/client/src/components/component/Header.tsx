import { Session, getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";

export const Header = async () => {
    const session: Session | null = await getServerSession(authOptions);

    const jwt = session?.accessToken;

    return (
        <>
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link className="flex items-center justify-center" href="/">
                    <MountainIcon className="h-6 w-6" />
                    <span className="sr-only">Acme Inc</span>
                </Link>
                <nav className="flex justify-between w-full px-2 sm:gap-6">
                    <div className="flex gap-4 px-10 sm:gap-6">
                        <a href="/groups" className="text-sm font-medium hover:underline underline-offset-4">
                            그룹
                        </a>
                        <Link href="/groups" className="text-sm font-medium hover:underline underline-offset-4">
                            Pricing
                        </Link>
                    </div>

                    <div className="flex gap-4 sm:gap-6 ml-10">
                        {jwt ? (
                            <Link href="" className="text-sm font-medium hover:underline underline-offset-4">
                                로그아웃
                            </Link>
                        ) : (
                            <Link href="/signin" className="text-sm font-medium hover:underline underline-offset-4">
                                로그인
                            </Link>
                        )}
                        {jwt ? (
                            <Link href="/mypage" className="text-sm font-medium hover:underline underline-offset-4">
                                마이페이지
                            </Link>
                        ) : (
                            <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
                                회원가입
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
};

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    );
}

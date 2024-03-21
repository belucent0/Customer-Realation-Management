import { SessionProvider } from "next-auth/react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { Session, getServerSession } from "next-auth";

type Props = {
    children: React.ReactNode;
};

export const Layout = async ({ children }: Props) => {
    const session: Session | null = await getServerSession(authOptions);
    return (
        <>
            <Header session={session} />
            <div className="flex flex-col min-h-[100dvh]">
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">{children}</div>
            </div>
            <Footer />
        </>
    );
};

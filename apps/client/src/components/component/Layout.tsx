import { Footer } from "./Footer";
import { Header } from "./Header";

export const Layout = ({ children }: any) => {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-[100dvh]">
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">{children}</div>
            </div>
            <Footer />
        </>
    );
};

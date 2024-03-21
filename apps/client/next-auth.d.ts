import NextAuth from "next-auth";

declare module "next-auth" {
    export interface Session {
        user: {
            email?: string;
            password?: string;
            image?: string;
            role?: string;
        } & Session["user"];
        accessToken: string;
    }
    export interface User {
        loginId: string;
        userName: string;
        phone: string;
        email: string;
        accessToken: string;
    }
}

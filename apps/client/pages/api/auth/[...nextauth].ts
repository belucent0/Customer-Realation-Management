import { NextApiRequest, NextApiResponse } from "next";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {
                loginId: { label: "아이디", type: "loginId" },
                password: { label: "비밀번호", type: "password" },
            },

            //로그인시 실행
            async authorize(credentials: Record<"loginId" | "password", string> | undefined) {
                const { loginId, password } = credentials || {};

                try {
                    const loginResponse = async () => {
                        try {
                            const apiURL = process.env.NEXT_PUBLIC_API_URL;
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ loginId, password }),
                            });

                            const data = await res.json();
                            return data;
                        } catch (error) {
                            console.error(error);
                            throw new Error("로그인 서버 연결 실패");
                        }
                    };

                    console.log("===========================");
                    const result = await loginResponse();

                    console.log("---------------------------");
                    console.log(result, "result");

                    if (result && result.statusCode === 200) {
                        return result.data;
                    }

                    if (result && result.statusCode === 400) {
                        console.log(result.message);

                        throw new Error(result.message);
                    }

                    // if (result && result.status === "success") {
                    //     return result.data;
                    // }
                } catch (error: any | Error) {
                    throw new Error(error.message);
                }
            },
        }),
    ],

    // jwt 선택 + jwt 만료일
    session: {
        strategy: "jwt",
        maxAge: 1 * 60 * 60, //1시간
    },

    callbacks: {
        // jwt 형성시 실행되는 코드
        //user변수는 DB의 유저정보담겨있고 token.user에 정보 저장하면 jwt으로.
        jwt: async ({ token, user }) => {
            if (user) {
                token.user = {
                    email: user.email,
                    name: user.name,
                    // image: user.image,
                    // role: user.role,
                };
            }
            return token;
        },
        // 유저 세션이 조회될 때 마다 실행되는 코드
        session: async ({ session, token }) => {
            session.user = token.user as
                | {
                      email?: string;
                      passowrd?: string;
                      //   image?: string;
                      //   role?: string;
                  }
                | undefined;

            return session;
        },
    },

    // secret: process.env.OAuth_SECRET,
    // adapter: prisma
    pages: {
        signIn: "/signIn",
        error: "/",
        signOut: "/",
    },
};

const authHandler = NextAuth(authOptions);

export default async function handler(...params: [NextApiRequest, NextApiResponse]) {
    await authHandler(...params);
}

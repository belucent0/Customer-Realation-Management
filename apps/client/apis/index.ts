"use server";

//auth
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

// 비동기 방식으로 getServerSession 함수를 호출하여 세션 정보를 가져옵니다.
export const getSession = async () => {
    const session: Session | null = await getServerSession(authOptions);
    const jwt = session?.accessToken;
    return jwt;
};

export const getGroupsAPI = async () => {
    const jwt = await getSession();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
        },
    });

    return await response.json();
};

export const createGroupAPI = async (groupName: string) => {
    const jwt = await getSession();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ groupName }),
    });

    return await response.json();
};

"use client";

export default function LoginPage() {
    const host = process.env.HOST;
    return (
        <div>
            <h1>Login</h1>
            <form method="POST" action={`${host}/api/auth/login`}>
                <input name="loginId" type="text" placeholder="아이디" />
                <input name="password" type="password" placeholder="비밀번호" />
                <button type="submit">확인</button>
            </form>
        </div>
    );
}

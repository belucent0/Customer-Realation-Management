import { SetMetadata } from "@nestjs/common";

// 커스텀 데코레이터 셋팅
// @ResMessage("메시지 내용")
export function ResMessage(message: string) {
    return SetMetadata("response-message", message);
}

// export const ResMessage = (message: string) => SetMetadata("response-message", message);

package com.comma.global.util;
// global/util 패키지: 특정 도메인에 속하지 않는 공통 유틸 모음

import lombok.Getter;
// Lombok: getter 메서드를 자동 생성. getSuccess(), getData(), getMessage() 가 만들어진다.

@Getter
// 이 클래스의 모든 필드에 대해 get메서드를 자동 생성한다.
// setter는 일부러 없앴다 — 한 번 만든 응답 객체는 수정되면 안 되기 때문이다.
public class ApiResponse<T> {
// 제네릭 <T>: data 필드의 타입을 유연하게 받는다.
// ApiResponse<User>, ApiResponse<List<Place>> 처럼 어떤 타입이든 감쌀 수 있다.

    private final boolean success;
    // 요청 처리 성공 여부. true면 성공, false면 실패.
    // final: 한 번 설정하면 변경 불가.

    private final T data;
    // 실제 반환할 데이터. 실패 시 null.

    private final String message;
    // 사용자에게 보여줄 메시지. 성공이면 "처리완료", 실패면 "이메일이 이미 존재합니다" 등.

    private ApiResponse(boolean success, T data, String message) {
    // 생성자를 private으로 막았다. new ApiResponse()를 직접 쓰는 걸 금지하고,
    // 아래의 정적 메서드(ok, fail)를 통해서만 만들 수 있다.
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
    // 데이터와 메시지가 모두 있는 성공 응답을 만든다.
    // 예: ApiResponse.ok(user, "로그인 성공") → { success: true, data: user, message: "로그인 성공" }
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> ok(String message) {
    // 데이터 없이 메시지만 있는 성공 응답. 메서드 오버로딩.
    // 예: ApiResponse.ok("로그아웃 되었습니다.") → { success: true, data: null, message: "..." }
        return new ApiResponse<>(true, null, message);
    }

    public static <T> ApiResponse<T> fail(String message) {
    // 실패 응답. success: false, data: null.
    // 예: ApiResponse.fail("비밀번호가 틀렸습니다.") → { success: false, data: null, message: "..." }
        return new ApiResponse<>(false, null, message);
    }
}
